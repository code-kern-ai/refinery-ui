import { ModalEnum } from "@/src/types/shared/modal";
import CreateEvaluationRunModal from "./CreateEvaluationRunModal";
import { openModal, setModalStates } from "@/src/reduxStore/states/modal";
import { useDispatch, useSelector } from "react-redux";
import { selectProjectId } from "@/src/reduxStore/states/project";
import KernTable from "@/submodules/react-components/components/kern-table/KernTable";
import { EVALUATION_RUN_TABLE_CONFIG, EVALUATION_RUN_TABLE_HEADER, prepareTableBodyEvaluationRun } from "@/src/util/table-preparations/evaluation-runs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getEvaluationGroups, getEvaluationRuns } from "@/src/services/base/playground";
import { selectAllUsers } from "@/src/reduxStore/states/general";
import { arrayToDict } from "@/submodules/javascript-functions/general";
import { selectOnAttributeEmbeddings } from "@/src/reduxStore/states/pages/settings";
import { useRouter } from "next/router";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import DeleteEvaluationRunsModal from "./DeleteEvaluationRunsModal";

export default function EvaluationRuns() {
    const dispatch = useDispatch();
    const router = useRouter();

    const projectId = useSelector(selectProjectId);
    const users = useSelector(selectAllUsers);
    const usersDict = arrayToDict(users, 'id');
    const onAttributeEmbeddings = useSelector(selectOnAttributeEmbeddings);

    const [evaluationRuns, setEvaluationRuns] = useState(null);
    const [evaluationGroups, setEvaluationGroups] = useState([]);
    const [evaluationDict, setEvaluationDict] = useState(null);
    const [embeddingsDict, setEmbeddingsDict] = useState(null);
    const [refetchTrigger, setRefetchTrigger] = useState(false)
    const [selectedEvaluationRuns, setSelectedEvaluationRuns] = useState(new Set<string>());
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (!projectId) return;
        getEvaluationRuns(projectId, (res) => {
            setEvaluationRuns(res);
        });
        getEvaluationGroups(projectId, (res) => {
            setEvaluationGroups(res);
            setEvaluationDict(arrayToDict(res, 'id'));
        });
    }, [projectId, refetchTrigger]);

    useEffect(() => {
        if (!onAttributeEmbeddings || onAttributeEmbeddings.length == 0) return;
        setEmbeddingsDict(arrayToDict(onAttributeEmbeddings, 'id'));
    }, [onAttributeEmbeddings]);

    const refetchEvaluationRuns = useCallback(() => {
        getEvaluationRuns(projectId, (res) => {
            setEvaluationRuns(res);
            setSelectedEvaluationRuns(new Set<string>());
        });
    }, [projectId]);

    const navigateToDetails = useCallback((evaluationRunId: string) => {
        router.push(`/projects/${projectId}/playground/${evaluationRunId}`);
    }, [projectId]);

    const toggleAll = useCallback(() => {
        if (!evaluationRuns || evaluationRuns.length === 0) return;
        if (checked) setSelectedEvaluationRuns(new Set<string>());
        else setSelectedEvaluationRuns(new Set<string>(evaluationRuns.map(x => x.id)));
        setChecked(!checked);
    }, [checked, evaluationRuns]);


    const preparedValues = useMemo(() => {
        if (!evaluationRuns) return null;
        return prepareTableBodyEvaluationRun(evaluationRuns, usersDict, embeddingsDict, evaluationDict, navigateToDetails, selectedEvaluationRuns, setSelectedEvaluationRuns);
    }, [evaluationRuns, usersDict, embeddingsDict, evaluationDict, selectedEvaluationRuns, setSelectedEvaluationRuns]);

    const finalHeaders = useMemo(() => EVALUATION_RUN_TABLE_HEADER.map((run) => {
        if (!selectedEvaluationRuns || !evaluationRuns) return;
        if (run.id === "checkboxes") return { ...run, checked: selectedEvaluationRuns.size === evaluationRuns.length, onChange: toggleAll };
        return run;
    }), [selectedEvaluationRuns, evaluationRuns]);

    return <>
        {projectId != null && <div className="p-4 bg-gray-100 h-full flex-1 flex flex-col overflow-y-auto">
            <div className="text-lg leading-6 text-gray-900 font-medium w-full flex items-center">
                <div>
                    <label>Evaluation runs</label>
                    <div className="mt-1 mb-3">
                        <div className="text-sm leading-5 font-normal text-gray-500 inline-block">You can create your evaluation runs.</div>
                    </div>
                </div>
                <KernButton
                    text="Run evaluation"
                    buttonColor="green"
                    onClick={() => dispatch(openModal(ModalEnum.EVALUATION_RUN))}
                    className="ml-auto"
                />
                {selectedEvaluationRuns.size > 0 &&
                    <div className='ml-2'>
                        <KernButton
                            text="Delete all selected"
                            buttonColor="red"
                            onClick={() => {
                                dispatch(setModalStates(ModalEnum.DELETE_EVALUATION_RUN, { open: true, evaluationRunIds: Array.from(selectedEvaluationRuns) }));
                            }}
                        />
                    </div>
                }
            </div >
            {finalHeaders && preparedValues && (evaluationRuns.length > 0 ?
                <KernTable
                    headers={finalHeaders}
                    values={preparedValues}
                    config={EVALUATION_RUN_TABLE_CONFIG}
                /> :
                <div className="text-sm inline-block font-normal text-gray-500 italic mt-3">
                    No evaluation runs available yet.
                </div>
            )}
        </div>}
        <CreateEvaluationRunModal evaluationGroups={evaluationGroups} setRefetchTrigger={setRefetchTrigger} />
        <DeleteEvaluationRunsModal refetchEvaluationRuns={refetchEvaluationRuns} />
    </>
}