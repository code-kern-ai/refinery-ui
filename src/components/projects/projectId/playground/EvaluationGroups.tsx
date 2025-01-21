import { openModal, setModalStates } from "@/src/reduxStore/states/modal";
import CreateEvaluationGroupModal from "./CreateEvaluationGroupModal";
import { ModalEnum } from "@/src/types/shared/modal";
import { useDispatch, useSelector } from "react-redux";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { useEffect, useState } from "react";
import { getEvaluationGroups, getEvaluationSetById } from "@/src/services/base/playground";
import ViewEvaluationGroupModal from "./ViewEvaluationGroupModal";
import KernTable from "@/submodules/react-components/components/kern-table/KernTable";
import { EVALUATION_GROUPS_TABLE_HEADER, prepareTableBodyEvaluationGroups } from "@/src/util/table-preparations/evaluation-groups";
import { selectAllUsers } from "@/src/reduxStore/states/general";
import { arrayToDict } from "@/submodules/javascript-functions/general";

export function EvaluationGroups() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const users = useSelector(selectAllUsers);
    const usersDict = arrayToDict(users, 'id');

    const [evaluationGroups, setEvaluationGroups] = useState([]);
    const [preparedValues, setPreparedValues] = useState([]);

    useEffect(() => {
        if (!projectId) return;
        getEvaluationGroups(projectId, (res) => {
            setEvaluationGroups(res);
        });
    }, [projectId]);

    useEffect(() => {
        if (!evaluationGroups) return;
        setPreparedValues(prepareTableBodyEvaluationGroups(evaluationGroups, usersDict, viewSetsModal));
    }, [evaluationGroups]);

    function viewSetsModal(setIds: string[]) {
        let setsArr = [];
        setIds.forEach((setId) => {
            getEvaluationSetById(projectId, setId, (res) => {
                setsArr = [...setsArr, res];
                dispatch(setModalStates(ModalEnum.VIEW_EVALUATION_GROUP, { open: true, sets: setsArr }));
            });
        });
    }

    return <>
        {projectId != null && <div className="p-4 bg-gray-100 h-full flex-1 flex flex-col overflow-y-auto">
            <div className="text-lg leading-6 text-gray-900 font-medium w-full flex items-center">
                <div>
                    <label>Evaluation groups</label>
                    <div className="mt-1">
                        <div className="text-sm leading-5 font-normal text-gray-500 inline-block">You can create your evaluation groups and use them for creating evaluation runs.</div>
                    </div>
                </div>
                <button
                    className={`ml-auto bg-green-100 border border-green-400 text-green-700 text-xs font-semibold px-4 py-2 rounded-md cursor-pointer opacity-100 hover:bg-green-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                    onClick={() => dispatch(openModal(ModalEnum.EVALUATION_GROUP))}>Create evaluation group</button>
            </div >
            <KernTable
                headers={EVALUATION_GROUPS_TABLE_HEADER}
                values={preparedValues}
                config={{
                    addBorder: true
                }}
            />
        </div>}
        <CreateEvaluationGroupModal />
        <ViewEvaluationGroupModal />
    </>
}