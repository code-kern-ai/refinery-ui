import { ModalEnum } from "@/src/types/shared/modal";
import CreateEvaluationRunModal from "./CreateEvaluationRunModal";
import { openModal, setModalStates } from "@/src/reduxStore/states/modal";
import { useDispatch, useSelector } from "react-redux";
import { selectProjectId } from "@/src/reduxStore/states/project";
import KernTable from "@/submodules/react-components/components/kern-table/KernTable";
import { EVALUATION_RUN_TABLE_CONFIG, EVALUATION_RUN_TABLE_HEADER, prepareTableBodyEvaluationRun } from "@/src/util/table-preparations/evaluation-runs";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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

    const [preparedValues, setPreparedValues] = useState(null);
    const [evaluationRuns, setEvaluationRuns] = useState(null);
    const [evaluationGroups, setEvaluationGroups] = useState([]);
    const [evaluationDict, setEvaluationDict] = useState(null);
    const [embeddingsDict, setEmbeddingsDict] = useState(null);
    const [refetchTrigger, setRefetchTrigger] = useState(false)
    const [preparedHeaders, setPreparedHeaders] = useState(EVALUATION_RUN_TABLE_HEADER);
    const [selectedEvaluationRuns, setSelectedEvaluationRuns] = useState(new Set<string>());
    const [checked, setChecked] = useState(false);
    const [indeterminate, setIndeterminate] = useState(false);
    const checkbox = useRef<any>(null);

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

    useLayoutEffect(() => {
        if (!selectedEvaluationRuns || !evaluationRuns) return;
        const isIndeterminate = selectedEvaluationRuns.size > 0 && selectedEvaluationRuns.size < evaluationRuns.length;
        setChecked(selectedEvaluationRuns.size > 0 && selectedEvaluationRuns.size === evaluationRuns.length);
        setIndeterminate(isIndeterminate);

        if (checkbox.current !== null) {
            checkbox.current.indeterminate = isIndeterminate;
        }
    }, [selectedEvaluationRuns, evaluationRuns]);

    useEffect(() => {
        if (!evaluationRuns || !evaluationDict || !embeddingsDict) return;
        setPreparedValues(prepareTableBodyEvaluationRun(evaluationRuns, usersDict, embeddingsDict, evaluationDict, navigateToDetails, selectedEvaluationRuns, setSelectedEvaluationRuns));
    }, [evaluationRuns, evaluationDict, embeddingsDict, selectedEvaluationRuns, setSelectedEvaluationRuns]);

    useEffect(() => {
        setPreparedHeaders(preparedHeaders.map((header) => {
            if (header.id === "checkboxes") {
                return { ...header, hasCheckboxes: true, checked: checked, onChange: toggleAll };
            }
            return header;
        }))
    }, [checked, evaluationGroups, selectedEvaluationRuns])

    const refetchEvaluationRuns = useCallback(() => {
        getEvaluationRuns(projectId, (res) => {
            setEvaluationRuns(res);
            setSelectedEvaluationRuns(new Set<string>());
        });
    }, [projectId]);

    function toggleAll() {
        if (checked || indeterminate) setSelectedEvaluationRuns(new Set<string>());
        else setSelectedEvaluationRuns(new Set<string>(evaluationRuns.map(x => x.id)));
        setChecked(!checked && !indeterminate)
        setIndeterminate(false)
    }

    function navigateToDetails(evaluationRunId: string) {
        router.push(`/projects/${projectId}/playground/${evaluationRunId}`);
    }

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
            {preparedHeaders && preparedValues && (evaluationRuns.length > 0 ?
                <KernTable
                    headers={preparedHeaders}
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