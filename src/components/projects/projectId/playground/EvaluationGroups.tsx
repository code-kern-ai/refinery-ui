import { openModal, setModalStates } from "@/src/reduxStore/states/modal";
import CreateEvaluationGroupModal from "./CreateEvaluationGroupModal";
import { ModalEnum } from "@/src/types/shared/modal";
import { useDispatch, useSelector } from "react-redux";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { useEffect, useState } from "react";
import { getEvaluationGroups, getEvaluationSetById } from "@/src/services/base/playground";
import { EvaluationGroup } from "@/src/types/components/projects/projectId/settings/playground";
import { parseUTC } from "@/submodules/javascript-functions/date-parser";
import ViewEvaluationGroupModal from "./ViewEvaluationGroupModal";

export function EvaluationGroups() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);

    const [evaluationGroups, setEvaluationGroups] = useState([]);

    useEffect(() => {
        if (!projectId) return;
        getEvaluationGroups(projectId, (res) => {
            setEvaluationGroups(res);
        });
    }, [projectId]);

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

            <table className="min-w-full divide-y divide-gray-300 border">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col"
                            className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                            Name</th>
                        <th scope="col"
                            className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                            Created At</th>
                        <th scope="col"
                            className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                            Created By</th>
                        <th scope="col"
                            className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                            Evaluation sets</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {evaluationGroups.map((group: EvaluationGroup, index: number) => (
                        <tr key={group.id} className={index % 2 != 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="text-left px-3 py-2 text-sm text-gray-500 whitespace-nowrap">{group.name}</td>
                            <td className="text-center px-3 py-2 text-sm text-gray-500">{parseUTC(group.createdAt)}</td>
                            <td className="text-center px-3 py-2 text-sm text-gray-500">{group.createdBy}</td>
                            <td className="text-center px-3 py-2 text-sm text-gray-500">
                                <button onClick={() => {
                                    getEvaluationSetById(projectId, group.evaluationSetIds[index], (res) => {
                                        dispatch(setModalStates(ModalEnum.VIEW_EVALUATION_GROUP, { open: true, set: res }));
                                    });
                                }} className="bg-white text-gray-700 text-xs font-semibold px-4 py-1 rounded border border-gray-300 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-block">
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>}
        <CreateEvaluationGroupModal />
        <ViewEvaluationGroupModal />
    </>
}