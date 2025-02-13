import { openModal, setModalStates } from "@/src/reduxStore/states/modal";
import CreateEvaluationGroupModal from "./CreateEvaluationGroupModal";
import { ModalEnum } from "@/src/types/shared/modal";
import { useDispatch, useSelector } from "react-redux";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { useEffect, useState, useRef, useLayoutEffect, useCallback, useMemo } from "react";
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
    const [preparedValues, setPreparedValues] = useState(null);
    const [preparedHeaders, setPreparedHeaders] = useState(EVALUATION_GROUPS_TABLE_HEADER);
    const [selectedEvaluationGroups, setSelectedEvaluationGroups] = useState(new Set<string>());
    const isFetchingEvalGroups = useRef(false);
    const [checked, setChecked] = useState(false);
    const [indeterminate, setIndeterminate] = useState(false);
    const checkbox = useRef<any>(null);

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

    useLayoutEffect(() => {
        if (!selectedEvaluationGroups || !evaluationGroups) return;
        const isIndeterminate = selectedEvaluationGroups.size > 0 && selectedEvaluationGroups.size < evaluationGroups.length;
        setChecked(selectedEvaluationGroups.size > 0 && selectedEvaluationGroups.size === evaluationGroups.length);
        setIndeterminate(isIndeterminate);

        if (checkbox.current !== null) {
            checkbox.current.indeterminate = isIndeterminate;
        }
    }, [selectedEvaluationGroups, evaluationGroups]);

    useEffect(() => {
        if (!evaluationGroups) return;
        setPreparedValues(prepareTableBodyEvaluationGroups(evaluationGroups, selectedEvaluationGroups, setSelectedEvaluationGroups, usersDict, viewSetsModal));
    }, [evaluationGroups, selectedEvaluationGroups, setSelectedEvaluationGroups]);

    function viewSetsModal(groupId: string) {
        let setsArr = [];
        getEvaluationSetsByGroupId(projectId, groupId, (res) => {
            setsArr = res;
            dispatch(setModalStates(ModalEnum.VIEW_EVALUATION_GROUP, { open: true, sets: setsArr }));
        });
    }

    useEffect(() => {
        setPreparedHeaders(preparedHeaders.map((header) => {
            if (header.id === "checkboxes") {
                return { ...header, hasCheckboxes: true, checked: checked, onChange: toggleAll };
            }
            return header;
        }))
    }, [checked, evaluationGroups, selectedEvaluationGroups])

    const refetchEvaluationGroups = useCallback(() => {
        getEvaluationGroups(projectId, (res) => {
            setEvaluationGroups(res);
            setSelectedEvaluationGroups(new Set<string>());
        });
    }, [projectId]);

    function toggleAll() {
        if (checked || indeterminate) setSelectedEvaluationGroups(new Set<string>());
        else setSelectedEvaluationGroups(new Set<string>(evaluationGroups.map(x => x.id)));
        setChecked(!checked && !indeterminate)
        setIndeterminate(false)
    }

    return <>
        {projectId != null && <div className="p-4 bg-gray-100 h-full flex-1 flex flex-col overflow-y-auto">
            <div className="text-lg leading-6 text-gray-900 font-medium w-full flex items-center">
                <div>
                    <label>Evaluation groups</label>
                    <div className="mt-1 mb-3">
                        <div className="text-sm leading-5 font-normal text-gray-500 inline-block">You can create your evaluation groups and use them for creating evaluation runs.</div>
                    </div>
                </div>
                <button
                    className="ml-auto bg-green-100 border border-green-400 text-green-700 text-xs font-semibold px-4 py-2 rounded-md cursor-pointer opacity-100 hover:bg-green-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => dispatch(openModal(ModalEnum.EVALUATION_GROUP))}>Create evaluation group</button>
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
            {preparedHeaders && preparedValues && (evaluationGroups.length > 0 ?
                <KernTable
                    headers={preparedHeaders}
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