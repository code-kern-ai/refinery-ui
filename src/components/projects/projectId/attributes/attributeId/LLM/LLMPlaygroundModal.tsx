import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import Modal from "@/src/components/shared/modal/Modal";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { selectModal } from "@/src/reduxStore/states/modal";
import { selectAttributes, selectAttributesDict } from "@/src/reduxStore/states/pages/settings";
import { IconHandClick, IconPlayCardStar, IconPlayerPlay, IconRefresh, IconTerminal } from "@tabler/icons-react";
import LLMResponseConfig from "../LLMResponseConfig";
import { AttributeState, LLMConfig } from "@/src/types/components/projects/projectId/settings/data-schema";
import useRefFor from "@/submodules/react-components/hooks/useRefFor";
import { updateAttribute } from "@/src/services/base/project-setting";
import { selectProjectId } from "@/src/reduxStore/states/project";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { searchRecordsExtended } from "@/src/services/base/data-browser";
import { generateRandomSeed } from "@/src/util/components/projects/projectId/data-browser/search-groups-helper";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import { DataTypeEnum } from "@/src/types/shared/general";
import { runAttributeLlmPlayground } from "@/src/services/base/attribute";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { TEMPLATE_EXAMPLES, TEMPLATE_OPTIONS } from "./llmTemplates";
import { LLM_PROVIDER_OPTIONS } from "@/src/util/components/projects/projectId/settings/attribute-calculation-helper";

const ACCEPT_BUTTON = { buttonCaption: "Use current values for attribute", useButton: true };
const DISPLAY_STATES = [AttributeState.AUTOMATICALLY_CREATED, AttributeState.UPLOADED, AttributeState.USABLE]

export default function LLMPlaygroundModal() {
    const projectId = useSelector(selectProjectId);
    const attributeDict = useSelector(selectAttributesDict);
    const attributes = useSelector(selectAttributes);
    const modal = useSelector(selectModal(ModalEnum.LLM_PLAYGROUND));
    const modalRef = useRefFor(modal);

    const [playgroundTestRunning, setPlaygroundTestRunning] = useState(false);
    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);
    const [fullLlmConfig, setFullLlmConfig] = useState<LLMConfig>(null);
    const fullLlmConfigRef = useRefFor(fullLlmConfig);

    const [recordData, setRecordData] = useState<any[]>(null);
    const recordDataRef = useRefFor(recordData);
    const [llmAnswer, setLlmAnswer] = useState<any>(null);

    const [inputRunningId, setInputRunningId] = useState('');
    const inputRunningIdRef = useRefFor(inputRunningId);

    const searchAndSetWithFilter = useCallback((filter) => {
        searchRecordsExtended(projectId, filter, 0, 1, (res) => {
            if (res && res.recordList) {
                if (res.recordList.length == 0) {
                    console.warn("No records found -> using random instead");
                    get1RandomRecords();
                    return;
                }
                const parsedData = res.recordList.map((record) => {
                    const parsed = JSON.parse(record.recordData);
                    return ({ ...parsed.data, id: parsed.id });
                });
                setRecordData(parsedData);
            }
        });
    }, [projectId]);

    const get1RandomRecords = useCallback(() => {
        const dummyFilter = [];
        dummyFilter.push(JSON.stringify({ ORDER_BY: ["RANDOM"], "ORDER_DIRECTION": [generateRandomSeed()] }));
        searchAndSetWithFilter(dummyFilter);
    }, [searchAndSetWithFilter]);

    const getByRunningId = useCallback(() => {
        if (inputRunningIdRef.current.length == 0) return;
        const dummyFilter = [];
        dummyFilter.push(JSON.stringify(
            { RELATION: "NONE", NEGATION: false, TARGET_TABLE: "RECORD", TARGET_COLUMN: "DATA", OPERATOR: "EQUAL", VALUES: ["running_id", Number(inputRunningIdRef.current)] }));
        searchAndSetWithFilter(dummyFilter);
    }, [searchAndSetWithFilter]);

    const testConfigurationForRecordId = useCallback(() => {
        if (!recordDataRef.current || recordDataRef.current?.length == 0) return;
        setPlaygroundTestRunning(true);
        const recordIds = recordDataRef.current.map((record) => record.id);
        runAttributeLlmPlayground(projectId, modalRef.current.attributeId, recordIds, fullLlmConfigRef.current, (res) => {
            let answer = ""
            for (const id of recordIds) answer += "Answer: " + (res[id] || "No answer found") + "\n";
            if (res["logs"]) answer += "\n---\nlogs:\n" + res["logs"].join("\n");
            setLlmAnswer(answer);
            setPlaygroundTestRunning(false);
        });
    }, []);

    useEffect(() => {
        if (!recordData || recordData?.length == 0) return;
        setInputRunningId(recordData[0].running_id);
    }, [recordData]);

    useEffect(() => {
        if (modal.open) {
            const config = jsonCopy(attributeDict[modal.attributeId]?.additionalConfig);
            config.llmConfig.apiKey = modal.apiKey;
            setFullLlmConfig(config);
            get1RandomRecords();
        } else {
            setRecordData(null);
            setLlmAnswer(null);
        }
    }, [modal.open]);


    const copyToAttributeValues = useCallback(() => {
        if (!fullLlmConfigRef.current || !modalRef.current) return;
        const config = { ...fullLlmConfigRef.current };
        updateAttribute(projectId, modalRef.current.attributeId, (res) => { }, null, null, null, null, null, config);
    }, []);

    useEffect(() => {
        if (!attributeDict || !modal?.attributeId) return;
        const attribute = attributeDict[modal.attributeId];
        if (attribute.state == AttributeState.USABLE) setAcceptButton({ ...acceptButton, useButton: false });
        else setAcceptButton({ ...acceptButton, emitFunction: copyToAttributeValues });
    }, [copyToAttributeValues, attributeDict, modal?.attributeId]);

    const recordKeys = useMemo(() => {
        if (!attributes) return [];
        return attributes.filter(a => DISPLAY_STATES.includes(a.state)).map(a => ({ name: a.name, dataType: a.dataType }));
    }, [attributes])

    return (<Modal modalName={ModalEnum.LLM_PLAYGROUND} acceptButton={acceptButton} className="ml-10 md:max-w-[calc(100vw-15rem)]">
        <div className="pl-2 pr-5 max-h-[calc(100vh-15rem)] overflow-y-auto">
            <div className="flex flex-row items-center justify-center">
                <span className="text-lg flex flex-row gap-x-2 text-gray-900 font-medium items-center">
                    LLM Playground <IconPlayCardStar className="h-6 w-6" />
                </span>
            </div>
            <div className="text-left">
                {recordData && <div className="">
                    <div className="flex flex-row gap-x-2 items-center">
                        <label className="block font-bold text-gray-900">Sample Record</label>
                        <KernButton icon={IconRefresh} text="Get Random" size="small" onClick={get1RandomRecords} />

                        <input
                            type="number"
                            value={inputRunningId}
                            onChange={(e) => setInputRunningId(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            onKeyDown={(e) => e.key === 'Enter' && getByRunningId()}
                            className="w-16 h-full text-right text-sm text-gray-900 border border-gray-200 rounded-lg align-top"
                        />
                        <KernButton icon={IconHandClick} text="Get by running_id" size="small" onClick={getByRunningId} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm max-h-52 overflow-y-auto" style={{ gridTemplateColumns: `max-content auto` }}>
                        {recordKeys.map((rk) => <Fragment key={rk.name}>
                            <label className="block font-bold text-gray-900">{rk.name}</label>
                            {recordData.map((record) => rk.dataType == DataTypeEnum.EMBEDDING_LIST ? <div key={record.running_id} className="flex flex-col divide-y divide-gray-200">
                                {record[rk.name].map((li, idx) => <span key={idx} className="text-gray-700">{li}</span>)}
                            </div> : <span key={record.running_id} className="text-gray-700">{record[rk.name]}</span>)}
                        </Fragment>)}
                    </div>
                </div>}
                <div className="my-2">
                    <KernDropdown
                        buttonName="Load config template"
                        options={TEMPLATE_OPTIONS}
                        dropdownWidth="w-52"
                        selectedOption={(option) => setFullLlmConfig(p => ({ ...p, ...TEMPLATE_EXAMPLES[option.value] }))}
                    />
                </div>
                {fullLlmConfig && <div className="mt-2 flex flex-row flex-nowrap w-full items-center gap-x-2">
                    <label className="block text-sm font-medium text-gray-900 whitespace-nowrap">Provider</label>
                    <KernDropdown
                        buttonName={fullLlmConfig?.llmIdentifier ?? 'Select LLM provider'}
                        options={LLM_PROVIDER_OPTIONS}
                        dropdownWidth="w-52"
                        selectedOption={(option) => setFullLlmConfig(p => ({ ...p, llmIdentifier: option }))}
                    /><label className="block text-sm font-medium text-gray-900 whitespace-nowrap">Api Key</label>

                    <input type="text" value={fullLlmConfig?.llmConfig.apiKey || ""} onInput={(e: any) => setFullLlmConfig(p => ({ ...p, llmConfig: { ...fullLlmConfig.llmConfig, apiKey: e.target.value } }))}
                        className="h-8 text-sm border-gray-300 rounded-md placeholder-italic w-full border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />

                </div>}
                <LLMResponseConfig attributeId={modal.attributeId} fullLlmConfig={fullLlmConfig} setFullLlmConfig={setFullLlmConfig} noPlayground keepConfigOpen />
                <div className="h-2"></div>
                <KernButton text="Test configuration" icon={IconPlayerPlay} size="small" onClick={testConfigurationForRecordId} loading={playgroundTestRunning} />
                {llmAnswer && <div className="border-b mb-10 border-gray-200 w-full align-top">
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
        </div>
    </Modal>
    )
}