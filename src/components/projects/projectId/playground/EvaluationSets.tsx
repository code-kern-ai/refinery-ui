import { openModal, setModalStates } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { useDispatch, useSelector } from "react-redux";
import { selectProjectId } from "@/src/reduxStore/states/project";
import CreateEvaluationSetModal from "./CreateEvaluationSetModal";
import { useEffect, useState, useCallback, useMemo } from "react";
import { getEvaluationSets } from "@/src/services/base/playground";
import { getRecordsBatch } from "@/src/services/base/project-setting";
import { postProcessRecordByRecordId } from "@/src/util/components/projects/projectId/settings/attribute-calculation-helper";
import ViewEvaluationSetsModal from "./ViewEvaluationSetsModal";
import DeleteEvaluationSetsModal from "./DeleteEvaluationSetsModal";
import KernTable from "@/submodules/react-components/components/kern-table/KernTable";
import { EVALUATION_SETS_TABLE_CONFIG, EVALUATION_SETS_TABLE_HEADER, prepareTableBodyEvaluationSets } from "@/src/util/table-preparations/evaluation-sets";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import { selectAllUsers } from "@/src/reduxStore/states/general";
import { arrayToDict } from "@/submodules/javascript-functions/general";
import useRefFor from "@/submodules/react-components/hooks/useRefFor";

export function EvaluationSets() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const users = useSelector(selectAllUsers);
    const usersDict = arrayToDict(users, 'id');

    const [evaluationSets, setEvaluationSets] = useState(null);
    const [checked, setChecked] = useState(false)
    const [selectedEvaluationSets, setSelectedEvaluationSets] = useState(new Set<string>());

    const projectIdRef = useRefFor(projectId);
    useEffect(() => {
        if (!projectIdRef.current) return;
        getEvaluationSets(projectIdRef.current, (res) => setEvaluationSets(res));
    }, []);

    const refetchEvaluationSets = useCallback(() => {
        getEvaluationSets(projectIdRef.current, (res) => {
            setEvaluationSets(res);
            setSelectedEvaluationSets(new Set<string>());
        });
    }, []);

    const toggleAll = useCallback(() => {
        if (!evaluationSets || evaluationSets.length === 0) return;
        if (checked) setSelectedEvaluationSets(new Set<string>());
        else setSelectedEvaluationSets(new Set<string>(evaluationSets.map(x => x.id)));
        setChecked(!checked);
    }, [checked, evaluationSets]);

    const viewEvalSetRecordsModal = useCallback((recordIds: any[], question) => {
        let recordsArr = [];
        getRecordsBatch(projectIdRef.current, { recordIds: recordIds }, (recordsBatch) => {
            recordsBatch.forEach((record) => {
                recordsArr = [...recordsArr, postProcessRecordByRecordId(record)];
            });
            dispatch(setModalStates(ModalEnum.VIEW_EVALUATION_SET, { open: true, records: recordsArr, question: question }));
        });
    }, []);

    const preparedValues = useMemo(() => {
        if (!evaluationSets) return null;
        return prepareTableBodyEvaluationSets(evaluationSets, selectedEvaluationSets, setSelectedEvaluationSets, usersDict, viewEvalSetRecordsModal);
    }, [evaluationSets, selectedEvaluationSets, setSelectedEvaluationSets, usersDict, viewEvalSetRecordsModal]);

    const finalHeaders = useMemo(() => {
        if (!selectedEvaluationSets || !evaluationSets) return;
        return EVALUATION_SETS_TABLE_HEADER.map((set) => {
            if (set.id === "checkboxes") return { ...set, checked: selectedEvaluationSets.size === evaluationSets.length, onChange: toggleAll };
            return set;
        });
    }, [selectedEvaluationSets, evaluationSets, toggleAll]);

    return <>
        {projectId != null && <div className="p-4 bg-gray-100 h-full flex-1 flex flex-col overflow-y-auto">
            <div className="text-lg leading-6 text-gray-900 font-medium w-full flex items-center">
                <div>
                    <label>Evaluation sets</label>
                    <div className="mt-1 mb-3">
                        <div className="text-sm leading-5 font-normal text-gray-500 inline-block">You can create your evaluation sets and use them for creating evaluation groups.</div>
                    </div>
                </div>
                <KernButton
                    text="Create evaluation set"
                    buttonColor="green"
                    onClick={() => dispatch(openModal(ModalEnum.EVALUATION_SET))}
                    className="ml-auto"
                />
                {selectedEvaluationSets.size > 0 &&
                    <div className='ml-2'>
                        <KernButton
                            text="Delete all selected"
                            buttonColor="red"
                            onClick={() => {
                                dispatch(setModalStates(ModalEnum.DELETE_EVALUATION_SET, { open: true, evaluationSetIds: Array.from(selectedEvaluationSets) }));
                            }}
                        />
                    </div>
                }
            </div >
            {finalHeaders && preparedValues && (
                evaluationSets.length > 0 ?
                    <KernTable
                        headers={finalHeaders}
                        values={preparedValues}
                        config={EVALUATION_SETS_TABLE_CONFIG}
                    /> :
                    <div className="text-sm inline-block font-normal text-gray-500 italic mt-3">
                        No evaluation sets available yet.
                    </div>
            )}
        </div>}
        <CreateEvaluationSetModal refetchEvaluationSets={refetchEvaluationSets} />
        <ViewEvaluationSetsModal />
        <DeleteEvaluationSetsModal refetchEvaluationSets={refetchEvaluationSets} />
    </>
}