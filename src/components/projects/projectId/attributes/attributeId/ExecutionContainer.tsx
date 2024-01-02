import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import { setModalStates } from "@/src/reduxStore/states/modal";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { CALCULATE_USER_ATTRIBUTE_SAMPLE_RECORDS, GET_RECORD_BY_RECORD_ID } from "@/src/services/gql/queries/project-setting";
import { ExecutionContainerProps, SampleRecord } from "@/src/types/components/projects/projectId/settings/attribute-calculation";
import { AttributeState } from "@/src/types/components/projects/projectId/settings/data-schema";
import { ModalEnum } from "@/src/types/shared/modal";
import { postProcessRecordByRecordId } from "@/src/util/components/projects/projectId/settings/attribute-calculation-helper";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { useLazyQuery } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import ConfirmExecutionModal from "./ConfirmExecutionModal";
import ViewRecordDetailsModal from "./ViewRecordDetailsModal";
import { extendArrayElementsByUniqueId } from "@/submodules/javascript-functions/id-prep";

export default function ExecutionContainer(props: ExecutionContainerProps) {
    const projectId = useSelector(selectProjectId);
    const dispatch = useDispatch();


    const [requestedSomething, setRequestedSomething] = useState(false);
    const [runOn10HasError, setRunOn10HasError] = useState(false);
    const [sampleRecords, setSampleRecords] = useState<SampleRecord>(null);
    const [checkIfAtLeastRunning, setCheckIfAtLeastRunning] = useState(false);
    const [checkIfAtLeastQueued, setCheckIfAtLeastQueued] = useState(false);

    const [refetchSampleRecords] = useLazyQuery(CALCULATE_USER_ATTRIBUTE_SAMPLE_RECORDS, { fetchPolicy: 'no-cache' });
    const [refetchRecordByRecordId] = useLazyQuery(GET_RECORD_BY_RECORD_ID, { fetchPolicy: 'no-cache' });

    function calculateUserAttributeSampleRecords() {
        if (requestedSomething) return;
        setRequestedSomething(true);
        refetchSampleRecords({ variables: { projectId: projectId, attributeId: props.currentAttribute.id } }).then((res) => {
            const sampleRecordsFinal = { ...res.data['calculateUserAttributeSampleRecords'] };
            setRequestedSomething(false);
            setRunOn10HasError(sampleRecordsFinal.calculatedAttributes.length > 0 ? false : true);
            if (props.currentAttribute.dataType == 'EMBEDDING_LIST') {
                sampleRecordsFinal.calculatedAttributesList = sampleRecordsFinal.calculatedAttributes.map((record: string) => JSON.parse(record));
                sampleRecordsFinal.calculatedAttributesListDisplay = extendArrayElementsByUniqueId(sampleRecordsFinal.calculatedAttributesList);
            }
            sampleRecordsFinal.calculatedAttributesDisplay = extendArrayElementsByUniqueId(sampleRecordsFinal.calculatedAttributes);
            setSampleRecords(sampleRecordsFinal);
            props.refetchCurrentAttribute();
        }, () => {
            setRequestedSomething(false);
        })
    }

    function recordByRecordId(recordId: string) {
        refetchRecordByRecordId({ variables: { projectId: projectId, recordId: recordId } }).then((res) => {
            dispatch(setModalStates(ModalEnum.VIEW_RECORD_DETAILS, { record: postProcessRecordByRecordId(res.data['recordByRecordId']) }));
        });
    }

    return (<div>
        <div className="mt-8 text-sm leading-5">
            <div className="text-gray-700 font-medium mr-2">
                Execution
            </div>

            <div className="flex items-center">
                <div className="text-gray-500 font-normal">You can execute your attribute calculation
                    on all records, or test-run it on 10 examples (which are sampled randomly). Test results are
                    shown
                    below after computation.</div>
                {requestedSomething && <div className="inline-block">
                    <LoadingIcon color="indigo" />
                </div>}

                <Tooltip content={TOOLTIPS_DICT.ATTRIBUTE_CALCULATION.EXECUTE_10_RECORDS} color="invert" placement="left" className="ml-auto">
                    <button onClick={calculateUserAttributeSampleRecords} disabled={props.currentAttribute.state == AttributeState.USABLE || props.currentAttribute.state == AttributeState.RUNNING || requestedSomething}
                        className={`bg-white text-gray-700 text-xs font-semibold px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}>
                        Run on 10
                    </button>
                </Tooltip>

                <Tooltip color="invert" placement="left" content={props.currentAttribute.state == AttributeState.USABLE || props.currentAttribute.state == AttributeState.RUNNING ? 'Attribute is already in use' : requestedSomething ? 'Test is running' : checkIfAtLeastRunning ? 'Another attribute is running' : checkIfAtLeastQueued ? 'Another attribute is queued for execution' : props.tokenizationProgress < 1 ? 'Tokenization is in progress' : runOn10HasError ? 'Run on 10 records has an error' : 'Execute the attribute on all records'}>
                    <button onClick={() => dispatch(setModalStates(ModalEnum.EXECUTE_ATTRIBUTE_CALCULATION, { open: true, requestedSomething: requestedSomething }))}
                        disabled={props.currentAttribute.state == AttributeState.USABLE || props.currentAttribute.state == AttributeState.RUNNING || requestedSomething || checkIfAtLeastRunning || checkIfAtLeastQueued || props.tokenizationProgress < 1 || runOn10HasError}
                        className={`bg-indigo-700 text-white text-xs leading-4 font-semibold px-4 py-2 rounded-md cursor-pointer ml-3 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}>
                        Run
                    </button>
                </Tooltip>
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
                                            {record.value}
                                        </div>
                                        <div className="flex items-center justify-center mr-5 ml-auto">
                                            <button onClick={() => {
                                                dispatch(setModalStates(ModalEnum.VIEW_RECORD_DETAILS, { open: true, recordIdx: index }));
                                                recordByRecordId(sampleRecords.recordIds[index]);
                                            }} className="bg-white text-gray-700 text-xs font-semibold px-4 py-1 rounded border border-gray-300 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-block">
                                                View
                                            </button>
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