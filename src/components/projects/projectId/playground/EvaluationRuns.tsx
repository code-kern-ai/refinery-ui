import { ModalEnum } from "@/src/types/shared/modal";
import CreateEvaluationRunModal from "./CreateEvaluationRunModal";
import { openModal } from "@/src/reduxStore/states/modal";
import { useDispatch, useSelector } from "react-redux";
import { selectProjectId } from "@/src/reduxStore/states/project";

export default function EvaluationRuns() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);

    return <>
        {projectId != null && <div className="p-4 bg-gray-100 h-full flex-1 flex flex-col overflow-y-auto">
            <div className="text-lg leading-6 text-gray-900 font-medium w-full flex items-center">
                <div>
                    <label>Evaluation runs</label>
                    <div className="mt-1">
                        <div className="text-sm leading-5 font-normal text-gray-500 inline-block">You can create your evaluation runs.</div>
                    </div>
                </div>
                <button
                    className={`ml-auto bg-green-100 border border-green-400 text-green-700 text-xs font-semibold px-4 py-2 rounded-md cursor-pointer opacity-100 hover:bg-green-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                    onClick={() => dispatch(openModal(ModalEnum.EVALUATION_RUN))}>Create evaluation run</button>
            </div >
            {/* <KernTable
                   headers={EVALUATION_GROUPS_TABLE_HEADER}
                   values={preparedValues}
                   config={{
                       addBorder: true
                   }}
               /> */}
        </div>}
        <CreateEvaluationRunModal />
    </>
}