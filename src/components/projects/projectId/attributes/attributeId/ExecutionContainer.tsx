import LoadingIcon from "@/submodules/react-components/components/LoadingIcon";
import { setModalStates } from "@/src/reduxStore/states/modal";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { ExecutionContainerProps, SampleRecord } from "@/src/types/components/projects/projectId/settings/attribute-calculation";
import { AttributeState } from "@/src/types/components/projects/projectId/settings/data-schema";
import { ModalEnum } from "@/src/types/shared/modal";
import { postProcessRecordByRecordId } from "@/src/util/components/projects/projectId/settings/attribute-calculation-helper";
import { Tooltip } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import ConfirmExecutionModal from "./ConfirmExecutionModal";
import ViewRecordDetailsModal from "./ViewRecordDetailsModal";
import { extendArrayElementsByUniqueId } from "@/submodules/javascript-functions/id-prep";
import { getRecordByRecordId } from "@/src/services/base/project-setting";
import { getSampleRecords } from "@/src/services/base/attribute";
import { DataTypeEnum } from "@/src/types/shared/general";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";

export default function ExecutionContainer(props: ExecutionContainerProps) {
    const projectId = useSelector(selectProjectId);
    const dispatch = useDispatch();


    const [requestedSomething, setRequestedSomething] = useState(false);
    const [runOn10HasError, setRunOn10HasError] = useState(false);
    const [sampleRecords, setSampleRecords] = useState<SampleRecord>(null);
    const [checkIfAtLeastRunning, setCheckIfAtLeastRunning] = useState(false);
    const [checkIfAtLeastQueued, setCheckIfAtLeastQueued] = useState(false);

    useEffect(() => {
        if (props.enableRunButton) {
            setRunOn10HasError(false);
            setRequestedSomething(false);
        }
    }, [props.enableRunButton]);

    function calculateUserAttributeSampleRecords() {
        if (requestedSomething) return;
        setRequestedSomething(true);
        getSampleRecords(projectId, props.currentAttribute.id, (res) => {
            const sampleRecordsFinal = { ...res };
            setRequestedSomething(false);
            props.setEnabledButton(false);
            setRunOn10HasError(sampleRecordsFinal.calculatedAttributes.length > 0 ? false : true);
            if (props.currentAttribute.dataType == 'EMBEDDING_LIST') {
                sampleRecordsFinal.calculatedAttributesList = sampleRecordsFinal.calculatedAttributes.map((record: string) => JSON.parse(record));
                sampleRecordsFinal.calculatedAttributesListDisplay = extendArrayElementsByUniqueId(sampleRecordsFinal.calculatedAttributesList);
            }
            sampleRecordsFinal.calculatedAttributesDisplay = extendArrayElementsByUniqueId(sampleRecordsFinal.calculatedAttributes);
            setSampleRecords(sampleRecordsFinal);
            props.refetchCurrentAttribute();
        });
    }

    function recordByRecordId(recordId: string) {
        getRecordByRecordId(projectId, recordId, (res) => {
            dispatch(setModalStates(ModalEnum.VIEW_RECORD_DETAILS, { record: postProcessRecordByRecordId(res) }));
        });
    }
    return (<div>
        <div className="mt-8 text-sm leading-5">
            <div className="text-gray-700 font-medium mr-2">
                Execution
            </div>

            <div className="flex items-center">
                <div className="text-gray-500 font-normal inline-flex flex-col gap-y-2 w-full">You can execute your attribute calculation
                    on all records, or test-run it on 10 examples (which are sampled randomly). Test results are
                    shown
                    below after computation.{
                        props.currentAttribute.dataType == DataTypeEnum.LLM_RESPONSE && <span className="italic">Note that LLM results are cached for the same set of settings to ensure that a critical error during the final execution doesn't lose the already calculated values</span>
                    }</div>
                {requestedSomething && <div className="inline-block">
                    <LoadingIcon color="indigo" />
                </div>}

                <KernButton
                    text='Run on 10'
                    buttonColor="indigo"
                    solidTheme={true}
                    textColor="white"
                    disabled={props.currentAttribute.state == AttributeState.USABLE || props.currentAttribute.state == AttributeState.RUNNING || requestedSomething || props.tokenizationProgress < 1 || props.checkUnsavedChanges}
                    onClick={calculateUserAttributeSampleRecords}
                    tooltip={TOOLTIPS_DICT.ATTRIBUTE_CALCULATION.EXECUTE_10_RECORDS}
                    className="ml-auto"
                />

                <KernButton
                    text='Run'
                    buttonColor="indigo"
                    solidTheme={true}
                    textColor="white"
                    disabled={props.currentAttribute.state == AttributeState.USABLE || props.currentAttribute.state == AttributeState.RUNNING || requestedSomething || checkIfAtLeastRunning || checkIfAtLeastQueued || props.tokenizationProgress < 1 || runOn10HasError || props.checkUnsavedChanges}
                    onClick={() => dispatch(setModalStates(ModalEnum.EXECUTE_ATTRIBUTE_CALCULATION, { open: true, requestedSomething: requestedSomething }))}
                    tooltip={props.currentAttribute.state == AttributeState.USABLE ? 'Attribute is already in use' : requestedSomething ? 'Test is running' : checkIfAtLeastRunning ? 'Another attribute is running' : checkIfAtLeastQueued ? 'Another attribute is queued for execution' : props.tokenizationProgress < 1 ? 'Tokenization is in progress' : runOn10HasError ? 'Run on 10 records has an error' : 'Execute the attribute on all records'}
                    className="ml-3"
                />
            </div>
        </div>

        {sampleRecords && sampleRecords.calculatedAttributesDisplay.length > 0 && <div className="mt-4 flex flex-col">
            <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        <div className="min-w-full border divide-y divide-gray-300">
                            {sampleRecords.calculatedAttributesDisplay.map((record: any, index: number) => (
                                <div key={record.id} className="divide-y divide-gray-200 bg-white">
                                    <div className="flex-shrink-0 border-b border-gray-200 shadow-sm flex justify-between items-center">
                                        <div className="flex items-center text-xs leading-5 text-gray-500 font-normal mx-4 my-3 text-justify">
                                            {String(record.value)}
                                        </div>
                                        <div className="flex items-center justify-center mr-5 ml-auto">
                                            <KernButton
                                                text="View"
                                                onClick={() => {
                                                    dispatch(setModalStates(ModalEnum.VIEW_RECORD_DETAILS, { open: true, recordIdx: index }));
                                                    recordByRecordId(sampleRecords.recordIds[index]);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div >}

        <ViewRecordDetailsModal currentAttribute={props.currentAttribute} sampleRecords={sampleRecords} />
        <ConfirmExecutionModal currentAttributeId={props.currentAttribute.id} />
    </div >)
}