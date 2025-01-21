import { ModalEnum } from "@/src/types/shared/modal";
import CreateEvaluationRunModal from "./CreateEvaluationRunModal";
import { openModal } from "@/src/reduxStore/states/modal";
import { useDispatch, useSelector } from "react-redux";
import { selectProjectId } from "@/src/reduxStore/states/project";
import KernTable from "@/submodules/react-components/components/kern-table/KernTable";
import { EVALUATION_RUN_TABLE_HEADER, prepareTableBodyEvaluationRun } from "@/src/util/table-preparations/evaluation-runs";
import { useEffect, useState } from "react";
import { getEvaluationGroups, getEvaluationRuns } from "@/src/services/base/playground";
import { selectAllUsers } from "@/src/reduxStore/states/general";
import { arrayToDict } from "@/submodules/javascript-functions/general";
import { selectOnAttributeEmbeddings } from "@/src/reduxStore/states/pages/settings";
import { useRouter } from "next/router";

export default function EvaluationRuns() {
    const dispatch = useDispatch();
    const router = useRouter();

    const projectId = useSelector(selectProjectId);
    const users = useSelector(selectAllUsers);
    const usersDict = arrayToDict(users, 'id');
    const onAttributeEmbeddings = useSelector(selectOnAttributeEmbeddings);

    const [preparedValues, setPreparedValues] = useState([]);
    const [evaluationRuns, setEvaluationRuns] = useState([]);
    const [evaluationGroups, setEvaluationGroups] = useState([]);
    const [evaluationDict, setEvaluationDict] = useState(null);
    const [embeddingsDict, setEmbeddingsDict] = useState(null);

    useEffect(() => {
        if (!projectId) return;
        getEvaluationRuns(projectId, (res) => {
            setEvaluationRuns(res);
        });
        getEvaluationGroups(projectId, (res) => {
            setEvaluationGroups(res);
            setEvaluationDict(arrayToDict(res, 'id'));
        });
    }, [projectId]);

    useEffect(() => {
        if (!onAttributeEmbeddings || onAttributeEmbeddings.length == 0) return;
        setEmbeddingsDict(arrayToDict(onAttributeEmbeddings, 'id'));
    }, [onAttributeEmbeddings]);

    useEffect(() => {
        if (!evaluationRuns || !evaluationDict || !embeddingsDict) return;
        setPreparedValues(prepareTableBodyEvaluationRun(evaluationRuns, usersDict, embeddingsDict, evaluationDict, navigateToDetails));
    }, [evaluationRuns, evaluationDict, embeddingsDict]);

    function navigateToDetails(evaluationRunId: string) {
        router.push(`/projects/${projectId}/playground/${evaluationRunId}`);
    }

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
            <KernTable
                headers={EVALUATION_RUN_TABLE_HEADER}
                values={preparedValues}
                config={{
                    addBorder: true
                }}
            />
        </div>}
        <CreateEvaluationRunModal evaluationGroups={evaluationGroups} />
    </>
}