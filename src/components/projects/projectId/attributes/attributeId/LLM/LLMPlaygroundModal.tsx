import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import Modal from "@/src/components/shared/modal/Modal";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectModal } from "@/src/reduxStore/states/modal";
import { selectAttributes, selectAttributesDict, updateAttributeById } from "@/src/reduxStore/states/pages/settings";
import { IconPlayCardStar, IconPlayerPlay, IconRefresh, IconTerminal } from "@tabler/icons-react";
import LLMResponseConfig from "../LLMResponseConfig";
import { LLMConfig } from "@/src/types/components/projects/projectId/settings/data-schema";
import useRefFor from "@/submodules/react-components/hooks/useRefFor";
import { updateAttribute } from "@/src/services/base/project-setting";
import { selectProjectId } from "@/src/reduxStore/states/project";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { LLM_PROVIDER_OPTIONS } from "../AttributeCalculations";
import { searchRecordsExtended } from "@/src/services/base/data-browser";
import { generateRandomSeed } from "@/src/util/components/projects/projectId/data-browser/search-groups-helper";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";

const ACCEPT_BUTTON = { buttonCaption: "Use current values for attribute", useButton: true };

export default function LLMPlaygroundModal() {
    const projectId = useSelector(selectProjectId);
    const attributeDict = useSelector(selectAttributesDict);
    const modal = useSelector(selectModal(ModalEnum.LLM_PLAYGROUND));
    const modalRef = useRefFor(modal);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);
    const [fullLlmConfig, setFullLlmConfig] = useState<LLMConfig>(null);
    const fullLlmConfigRef = useRefFor(fullLlmConfig);

    const [recordData, setRecordData] = useState<any[]>(null);
    const [llmAnswer, setLlmAnswer] = useState<any>(null);

    const get1RandomRecords = useCallback(() => {
        const dummyFilter = [];
        dummyFilter.push(JSON.stringify({ ORDER_BY: ["RANDOM"], "ORDER_DIRECTION": [generateRandomSeed()] }));
        searchRecordsExtended(projectId, dummyFilter, 0, 1, (res) => {
            if (res && res.recordList) {
                const parsedData = res.recordList.map((record) => JSON.parse(record.recordData)?.data);
                setRecordData(parsedData);
            }
        });
    }, []);

    useEffect(() => {
        if (!modal.open) return;
        setFullLlmConfig(attributeDict[modal.attributeId]?.additionalConfig);
        get1RandomRecords();
    }, [modal.open]);


    const copyToAttributeValues = useCallback(() => {
        if (!fullLlmConfigRef.current || !modalRef.current) return;
        const attributeNew = { ...attributeDict[modalRef.current.attributeId] };
        attributeNew.additionalConfig = { ...fullLlmConfigRef.current };
        updateAttribute(projectId, modalRef.current.attributeId, (res) => { }, null, null, null, null, null, attributeNew.additionalConfig);
    }, []);

    useEffect(() => {
        setAcceptButton({ ...acceptButton, emitFunction: copyToAttributeValues });
    }, [copyToAttributeValues]);

    const recordKeys = useMemo(() => {
        if (!recordData) return [];
        return Object.keys(recordData[0]);
    }, [recordData])

    return (<Modal modalName={ModalEnum.LLM_PLAYGROUND} acceptButton={acceptButton} modalWidth="ml-10 w-full max-w-[calc(100vw-15rem)]">
        <div className="flex flex-row items-center justify-center">
            <span className="text-lg flex flex-row gap-x-2 text-gray-900 font-medium items-center">
                LLM Playground <IconPlayCardStar className="h-6 w-6" />
            </span>
        </div>
        <div className="text-left">
            {recordData && <div>
                <div className="flex flex-row gap-x-2">
                    <label className="block font-bold text-gray-900">Sample Record</label>
                    <KernButton icon={IconRefresh} size="small" onClick={get1RandomRecords} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm" style={{ gridTemplateColumns: `max-content auto` }}>
                    {recordKeys.map((key) => <Fragment key={key}>
                        <label className="block font-bold text-gray-900">{key}</label>
                        {recordData.map((record) => <span key={record.running_id} className="text-gray-700">{record[key]}</span>)}
                    </Fragment>)}
                </div>
            </div>}

            {fullLlmConfig && <div className="mt-2 flex flex-row flex-nowrap w-full items-center gap-x-2">
                <label className="block text-sm font-medium text-gray-900 whitespace-nowrap">Provider</label>
                <KernDropdown
                    buttonName={fullLlmConfig?.llmIdentifier ?? 'Select LLM provider'}
                    options={LLM_PROVIDER_OPTIONS}
                    dropdownWidth="w-52"
                    selectedOption={(option) => setFullLlmConfig(p => ({ ...p, llmIdentifier: option }))}
                />
            </div>}
            <LLMResponseConfig attributeId={modal.attributeId} fullLlmConfig={fullLlmConfig} setFullLlmConfig={setFullLlmConfig} noPlayground keepConfigOpen />
            <div className="h-2"></div>
            <KernButton text="Test configuration" icon={IconPlayerPlay} size="small" onClick={get1RandomRecords} />
            {llmAnswer && <div className="border-b border-gray-200 w-full align-top">
                <div className="flex gap-x-2">
                    <div className='py-2'>
                        <div className='flex items-center justify-center bg-white h-6 w-6 rounded-lg border border-gray-300'>
                            <IconTerminal className='h-4 w-4 text-gray-500' />
                        </div>
                    </div>
                    <div className='text-sm font-mono text-gray-900 text-center leading-10'>LLM Answer</div>
                </div>
                <div className='w-full pb-2 text-sm text-gray-700'>
                    <div className="relative z-0">
                        <textarea
                            value={llmAnswer}
                            rows={4}
                            disabled
                            className="bg-slate-50 font-mono w-full text-sm text-gray-700 border border-transparent rounded-lg align-top"
                        />
                    </div>
                </div>
            </div>}
        </div>
    </Modal>
    )
}