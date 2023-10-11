import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import Modal from "@/src/components/shared/modal/Modal";
import { openModal, selectModal } from "@/src/reduxStore/states/modal";
import { selectProject } from "@/src/reduxStore/states/project";
import { CALCULATE_USER_ATTRIBUTE_SAMPLE_RECORDS } from "@/src/services/gql/queries/project";
import { ExecutionContainerProps, SampleRecord } from "@/src/types/components/projects/projectId/settings/attribute-calculation";
import { AttributeState } from "@/src/types/components/projects/projectId/settings/data-schema";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { useLazyQuery } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Accept', useButton: true };

export default function ExecutionContainer(props: ExecutionContainerProps) {
    const project = useSelector(selectProject);
    const dispatch = useDispatch();

    const modalExecuteAll = useSelector(selectModal(ModalEnum.EXECUTE_ATTRIBUTE_CALCULATION));

    const [requestedSomething, setRequestedSomething] = useState(false);
    const [runOn10HasError, setRunOn10HasError] = useState(false);
    const [sampleRecords, setSampleRecords] = useState<SampleRecord[]>(null);
    const [checkIfAtLeastRunning, setCheckIfAtLeastRunning] = useState(false);
    const [checkIfAtLeastQueued, setCheckIfAtLeastQueued] = useState(false);

    const [refetchSampleRecords] = useLazyQuery(CALCULATE_USER_ATTRIBUTE_SAMPLE_RECORDS, { fetchPolicy: 'no-cache' });

    const calculateUserAttributeAllRecords = useCallback(() => {

    }, [modalExecuteAll]);

    useEffect(() => {
        setAcceptButton({ ...ACCEPT_BUTTON, emitFunction: calculateUserAttributeAllRecords, disabled: requestedSomething });

    }, [modalExecuteAll]);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    function calculateUserAttributeSampleRecords() {
        if (requestedSomething) return;
        setRequestedSomething(true);
        refetchSampleRecords({ variables: { projectId: project.id, attributeId: props.currentAttribute.id } }).then((res) => {
            const sampleRecordsFinal = jsonCopy(res.data['calculateUserAttributeSampleRecords']);
            setRequestedSomething(false);
            setRunOn10HasError(sampleRecordsFinal.calculatedAttributes.length > 0 ? false : true);
            if (props.currentAttribute.dataType == 'EMBEDDING_LIST') {
                sampleRecordsFinal.calculatedAttributesList = sampleRecordsFinal.calculatedAttributes.map((record: string) => JSON.parse(record));
            }
            setSampleRecords(sampleRecordsFinal);
        }, (error) => {
            setRequestedSomething(false);
        })
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

                <Tooltip content="Execute the attribute on 10 records" color="invert" placement="left" className="ml-auto">
                    <button onClick={calculateUserAttributeSampleRecords} disabled={props.currentAttribute.state == AttributeState.USABLE || props.currentAttribute.state == AttributeState.RUNNING || requestedSomething}
                        className={`bg-white text-gray-700 text-xs font-semibold px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${(props.currentAttribute.state == AttributeState.USABLE || props.currentAttribute.state == AttributeState.RUNNING || requestedSomething) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'}`}>
                        Run on 10
                    </button>
                </Tooltip>

                <Tooltip color="invert" placement="left" content={props.currentAttribute.state == AttributeState.USABLE || props.currentAttribute.state == AttributeState.RUNNING ? 'Attribute is already in use' : requestedSomething ? 'Test is running' : checkIfAtLeastRunning ? 'Another attribute is running' : checkIfAtLeastQueued ? 'Another attribute is queued for execution' : props.tokenizationProgress < 1 ? 'Tokenization is in progress' : runOn10HasError ? 'Run on 10 records has an error' : 'Execute the attribute on all records'}>
                    <button onClick={() => dispatch(openModal(ModalEnum.EXECUTE_ATTRIBUTE_CALCULATION))}
                        disabled={props.currentAttribute.state == AttributeState.USABLE || props.currentAttribute.state == AttributeState.RUNNING || requestedSomething || checkIfAtLeastRunning || checkIfAtLeastQueued || props.tokenizationProgress < 1 || runOn10HasError}
                        className={`bg-indigo-700 text-white text-xs leading-4 font-semibold px-4 py-2 rounded-md cursor-pointer ml-3 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${props.currentAttribute.state == AttributeState.USABLE || props.currentAttribute.state == AttributeState.RUNNING || requestedSomething || checkIfAtLeastRunning || checkIfAtLeastQueued || props.tokenizationProgress < 1 || runOn10HasError ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}>
                        Run
                    </button>
                </Tooltip>
            </div>
        </div>
        <Modal modalName={ModalEnum.EXECUTE_ATTRIBUTE_CALCULATION} acceptButton={acceptButton}>
            <h1 className="text-lg text-gray-900 mb-2 text-center">Attribute calculation</h1>
            <div className="text-sm text-gray-500 my-2">
                This action calculates the attribute for all records.
                Be aware that calculated attributes are immutable.
                If you want to change the attribute calculation afterwards, you need to create a new
                attribute.
            </div>
        </Modal>

    </div>)
}