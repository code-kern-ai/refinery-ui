import { openModal, setModalStates } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { useDispatch, useSelector } from "react-redux";
import { selectProjectId } from "@/src/reduxStore/states/project";
import CreateEvaluationSetModal from "./CreateEvaluationSetModal";
import { useEffect, useState } from "react";
import { getEvaluationSets } from "@/src/services/base/playground";
import { EvaluationSet } from "@/src/types/components/projects/projectId/settings/playground";
import { parseUTC } from "@/submodules/javascript-functions/date-parser";
import { getRecordByRecordId } from "@/src/services/base/project-setting";
import { postProcessRecordByRecordId } from "@/src/util/components/projects/projectId/settings/attribute-calculation-helper";
import ViewEvaluationSetsModal from "./ViewEvaluationSetsModal";

export function EvaluationSets() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const [evaluationSets, setEvaluationSets] = useState([]);

    useEffect(() => {
        if (!projectId) return;
        getEvaluationSets(projectId, (res) => {
            setEvaluationSets(res);
        });
    }, [projectId]);

    function recordByRecordId(recordId: string) {
        getRecordByRecordId(projectId, recordId, (res) => {
            dispatch(setModalStates(ModalEnum.VIEW_EVALUATION_SET, { record: postProcessRecordByRecordId(res) }));
        });
    }

    return <>
        {projectId != null && <div className="p-4 bg-gray-100 h-full flex-1 flex flex-col overflow-y-auto">
            <div className="text-lg leading-6 text-gray-900 font-medium w-full flex items-center">
                <div>
                    <label>Evaluation sets</label>
                    <div className="mt-1">
                        <div className="text-sm leading-5 font-normal text-gray-500 inline-block">You can create your evaluation sets and use them for creating evaluation groups.</div>
                    </div>
                </div>
                <button
                    className={`ml-auto bg-green-100 border border-green-400 text-green-700 text-xs font-semibold px-4 py-2 rounded-md cursor-pointer opacity-100 hover:bg-green-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                    onClick={() => dispatch(openModal(ModalEnum.EVALUATION_SET))}>Create evaluation set</button>
            </div >

            <table className="min-w-full divide-y divide-gray-300 border">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col"
                            className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                            Question</th>
                        <th scope="col"
                            className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                            Created At</th>
                        <th scope="col"
                            className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                            Created By</th>
                        <th scope="col"
                            className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                            Records</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {evaluationSets.map((set: EvaluationSet, index: number) => (
                        <tr key={set.id} className={index % 2 != 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="text-left px-3 py-2 text-sm text-gray-500 whitespace-nowrap">{set.question}</td>
                            <td className="text-center px-3 py-2 text-sm text-gray-500">{parseUTC(set.createdAt)}</td>
                            <td className="text-center px-3 py-2 text-sm text-gray-500">{set.createdBy}</td>
                            <td className="text-center px-3 py-2 text-sm text-gray-500">
                                <button onClick={() => {
                                    dispatch(setModalStates(ModalEnum.VIEW_EVALUATION_SET, { open: true, recordIdx: index }));
                                    recordByRecordId(set.recordIds[index]);
                                }} className="bg-white text-gray-700 text-xs font-semibold px-4 py-1 rounded border border-gray-300 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-block">
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>}
        <CreateEvaluationSetModal />
        <ViewEvaluationSetsModal />
    </>
}