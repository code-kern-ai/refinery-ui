import { openModal, setModalStates } from "@/src/reduxStore/states/modal";
import CreateEvaluationGroupModal from "./CreateEvaluationGroupModal";
import { ModalEnum } from "@/src/types/shared/modal";
import { useDispatch, useSelector } from "react-redux";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { getEvaluationGroups, getEvaluationSetsByGroupId } from "@/src/services/base/playground";
import ViewEvaluationGroupModal from "./ViewEvaluationGroupModal";
import KernTable from "@/submodules/react-components/components/kern-table/KernTable";
import { EVALUATION_GROUPS_TABLE_CONFIG, EVALUATION_GROUPS_TABLE_HEADER, prepareTableBodyEvaluationGroups } from "@/src/util/table-preparations/evaluation-groups";
import { selectAllUsers } from "@/src/reduxStore/states/general";
import { arrayToDict } from "@/submodules/javascript-functions/general";
import DeleteEvaluationGroupsModal from "./DeleteEvaluationGroupsModal";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";

export function EvaluationGroups() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const users = useSelector(selectAllUsers);

    const [evaluationGroups, setEvaluationGroups] = useState(null);
    const [selectedEvaluationGroups, setSelectedEvaluationGroups] = useState(new Set<string>());
    const isFetchingEvalGroups = useRef(false);
    const [checked, setChecked] = useState(false);

    const usersDict = useMemo(() => arrayToDict(users, 'id'), [users]);

    useEffect(() => {
        if (!projectId) return;
        if (isFetchingEvalGroups.current) return;
        isFetchingEvalGroups.current = true
        getEvaluationGroups(projectId, (res) => {
            setEvaluationGroups(res);
            isFetchingEvalGroups.current = false
        });
    }, [projectId]);

    const refetchEvaluationGroups = useCallback(() => {
        getEvaluationGroups(projectId, (res) => {
            setEvaluationGroups(res);
            setSelectedEvaluationGroups(new Set<string>());
        });
    }, [projectId]);

    const toggleAll = useCallback(() => {
        if (!evaluationGroups || evaluationGroups.length === 0) return;
        if (checked) setSelectedEvaluationGroups(new Set<string>());
        else setSelectedEvaluationGroups(new Set<string>(evaluationGroups.map(x => x.id)));
        setChecked(!checked);
    }, [checked, evaluationGroups]);

    const viewSetsModal = useCallback((groupId: string) => {
        let setsArr = [];
        getEvaluationSetsByGroupId(projectId, groupId, (res) => {
            setsArr = res;
            dispatch(setModalStates(ModalEnum.VIEW_EVALUATION_GROUP, { open: true, sets: setsArr }));
        });
    }, [projectId]);

    const preparedValues = useMemo(() => {
        if (!evaluationGroups) return null;
        return prepareTableBodyEvaluationGroups(evaluationGroups, selectedEvaluationGroups, setSelectedEvaluationGroups, usersDict, viewSetsModal);
    }, [evaluationGroups, selectedEvaluationGroups, setSelectedEvaluationGroups, usersDict]);

    const finalHeaders = useMemo(() => EVALUATION_GROUPS_TABLE_HEADER.map((group) => {
        if (!selectedEvaluationGroups || !evaluationGroups) return;
        if (group.id === "checkboxes") return { ...group, checked: selectedEvaluationGroups.size === evaluationGroups.length, onChange: toggleAll };
        return group;
    }), [selectedEvaluationGroups, evaluationGroups]);

    return <>
        {projectId != null && <div className="p-4 bg-gray-100 h-full flex-1 flex flex-col overflow-y-auto">
            <div className="text-lg leading-6 text-gray-900 font-medium w-full flex items-center">
                <div>
                    <label>Evaluation groups</label>
                    <div className="mt-1 mb-3">
                        <div className="text-sm leading-5 font-normal text-gray-500 inline-block">You can create your evaluation groups and use them for creating evaluation runs.</div>
                    </div>
                </div>
                <KernButton
                    text="Create evaluation group"
                    buttonColor="green"
                    onClick={() => dispatch(openModal(ModalEnum.EVALUATION_GROUP))}
                    className="ml-auto"
                />
                {selectedEvaluationGroups.size > 0 &&
                    <div className='ml-2'>
                        <KernButton
                            text="Delete all selected"
                            buttonColor="red"
                            onClick={() => {
                                dispatch(setModalStates(ModalEnum.DELETE_EVALUATION_GROUP, { open: true, evaluationGroupIds: Array.from(selectedEvaluationGroups) }));
                            }}
                        />
                    </div>
                }
            </div>
            {finalHeaders && preparedValues && (evaluationGroups.length > 0 ?
                <KernTable
                    headers={finalHeaders}
                    values={preparedValues}
                    config={EVALUATION_GROUPS_TABLE_CONFIG}
                />
                :
                <div className="text-sm inline-block font-normal text-gray-500 italic mt-3">
                    No evaluation groups available yet.
                </div>
            )}
        </div>}
        <CreateEvaluationGroupModal refetchEvaluationGroups={refetchEvaluationGroups} />
        <ViewEvaluationGroupModal />
        <DeleteEvaluationGroupsModal refetchEvaluationGroups={refetchEvaluationGroups} />
    </>
}