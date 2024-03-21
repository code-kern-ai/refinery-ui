import { selectProjectId } from "@/src/reduxStore/states/project";
import { useDispatch, useSelector } from "react-redux";
import style from '@/src/styles/components/projects/projectId/heuristics/heuristics.module.css';
import { useCallback, useEffect, useState } from "react";
import { selectEmbeddings, selectUsableNonTextAttributes, setAllAttributes, setAllEmbeddings, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { CurrentPage } from "@/src/types/shared/general";
import { LabelingTask } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { GET_EMBEDDING_SCHEMA_BY_PROJECT_ID, GET_LABELING_TASKS_BY_PROJECT_ID } from "@/src/services/gql/queries/project-setting";
import { useLazyQuery } from "@apollo/client";
import { postProcessLabelingTasks, postProcessLabelingTasksSchema } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { postProcessHeuristics } from "@/src/util/components/projects/projectId/heuristics/heuristics-helper";
import { GET_HEURISTICS_OVERVIEW_DATA } from "@/src/services/gql/queries/heuristics";
import { selectHeuristicsAll, setAllHeuristics } from "@/src/reduxStore/states/pages/heuristics";
import GridCards from "@/src/components/shared/grid-cards/GridCards";
import HeuristicsHeader from "./HeuristicsHeader";
import AddLabelingFunctionModal from "./modals/AddLabelingFunctionModal";
import AddActiveLeanerModal from "./modals/AddActiveLearnerModal";
import AddZeroShotModal from "./modals/AddZeroShotModal";
import AddCrowdLabelerModal from "./modals/AddCrowdLabelerModal";
import { postProcessingEmbeddings } from "@/src/util/components/projects/projectId/settings/embeddings-helper";
import { CommentType } from "@/src/types/shared/comments";
import { CommentDataManager } from "@/src/util/classes/comments";
import { selectAllUsers, setBricksIntegrator, setComments } from "@/src/reduxStore/states/general";
import { getEmptyBricksIntegratorConfig } from "@/src/util/shared/bricks-integrator-helper";
import { useWebsocket } from "@/src/services/base/web-sockets/useWebsocket";
import { getAllComments } from "@/src/services/base/comment";
import { getAttributes } from "@/src/services/base/attribute";

export function HeuristicsOverview() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const heuristics = useSelector(selectHeuristicsAll);
    const embeddings = useSelector(selectEmbeddings);
    const attributes = useSelector(selectUsableNonTextAttributes);
    const allUsers = useSelector(selectAllUsers);

    const [filteredList, setFilteredList] = useState([]);

    const [refetchLabelingTasksByProjectId] = useLazyQuery(GET_LABELING_TASKS_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchHeuristics] = useLazyQuery(GET_HEURISTICS_OVERVIEW_DATA, { fetchPolicy: "network-only" });
    const [refetchEmbeddings] = useLazyQuery(GET_EMBEDDING_SCHEMA_BY_PROJECT_ID, { fetchPolicy: "no-cache" });

    useEffect(() => {
        if (!projectId || !embeddings || !attributes) return;
        refetchLabelingTasksAndProcess();
        refetchHeuristicsAndProcess();
        refetchEmbeddingsAndProcess();
        if (attributes.length == 0) {
            getAttributes(projectId, ['ALL'], (res) => {
                dispatch(setAllAttributes(res.data['attributesByProjectId']));
            });
        }
        dispatch(setBricksIntegrator(getEmptyBricksIntegratorConfig()));
    }, [projectId]);

    useEffect(() => {
        if (!projectId || allUsers.length == 0) return;
        setUpCommentsRequests();
    }, [allUsers, projectId]);

    function setUpCommentsRequests() {
        const requests = [];
        requests.push({ commentType: CommentType.ATTRIBUTE, projectId: projectId });
        requests.push({ commentType: CommentType.LABELING_TASK, projectId: projectId });
        requests.push({ commentType: CommentType.HEURISTIC, projectId: projectId });
        requests.push({ commentType: CommentType.EMBEDDING, projectId: projectId });
        requests.push({ commentType: CommentType.LABEL, projectId: projectId });
        CommentDataManager.unregisterCommentRequests(CurrentPage.HEURISTICS);
        CommentDataManager.registerCommentRequests(CurrentPage.HEURISTICS, requests);
        const requestJsonString = CommentDataManager.buildRequestJSON();
        getAllComments(requestJsonString, (res) => {
            CommentDataManager.parseCommentData(res.data['getAllComments']);
            CommentDataManager.parseToCurrentData(allUsers);
            dispatch(setComments(CommentDataManager.currentDataOrder));
        });
    }

    function refetchLabelingTasksAndProcess() {
        refetchLabelingTasksByProjectId({ variables: { projectId: projectId } }).then((res) => {
            const labelingTasks = postProcessLabelingTasks(res['data']['projectByProjectId']['labelingTasks']['edges']);
            dispatch(setLabelingTasksAll(postProcessLabelingTasksSchema(labelingTasks)));
        });
    }

    function refetchHeuristicsAndProcess() {
        refetchHeuristics({ variables: { projectId: projectId } }).then((res) => {
            const heuristics = postProcessHeuristics(res['data']['informationSourcesOverviewData'], projectId);
            dispatch(setAllHeuristics(heuristics));
            setFilteredList(heuristics);
        });
    }

    function refetchEmbeddingsAndProcess() {
        refetchEmbeddings({ variables: { projectId: projectId } }).then((res) => {
            const embeddingsFinal = postProcessingEmbeddings(res.data['projectByProjectId']['embeddings']['edges'].map((e) => e['node']), []);
            dispatch(setAllEmbeddings(embeddingsFinal));
        });
    }

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (['labeling_task_updated', 'labeling_task_created'].includes(msgParts[1])) {
            refetchLabelingTasksAndProcess();
        } else if ('labeling_task_deleted' == msgParts[1]) {
            refetchLabelingTasksAndProcess();
            refetchHeuristicsAndProcess();
        } else if (['information_source_created', 'information_source_updated', 'information_source_deleted', 'payload_finished', 'payload_failed', 'payload_created', 'payload_update_statistics', 'weak_supervision_started', 'weak_supervision_finished'].includes(msgParts[1])) {
            refetchHeuristicsAndProcess();
        } else if (msgParts[1] == 'embedding_deleted' || (msgParts[1] == 'embedding' && msgParts[3] == 'state')) {
            refetchEmbeddingsAndProcess();
        }
    }, [projectId]);

    useWebsocket(CurrentPage.HEURISTICS, handleWebsocketNotification, projectId);

    return (projectId && <div className="p-4 bg-gray-100 h-full flex-1 flex flex-col">
        <div className="w-full h-full -mr-4">
            <HeuristicsHeader refetch={refetchHeuristicsAndProcess}
                filterList={(labelingTask: LabelingTask) => setFilteredList(labelingTask != null ? heuristics.filter((heuristic) => heuristic.labelingTaskId === labelingTask.id) : heuristics)} />

            {heuristics && heuristics.length == 0 ? (
                <div>
                    <div className="text-gray-500 font-normal mt-8">
                        <p className="text-xl leading-7">Seems like your project has no heuristic yet.</p>
                        <p className="text-base mt-3 leading-6">You can create one from the button New heuristic in the bar
                            above. Also, we got some quick-links from our <a href="https://docs.kern.ai/"
                                target="_blank"><span className="underline cursor-pointer">documentation</span></a>, if you want
                            to dive deeper.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
                        <div>
                            <div className="text-gray-900 text-xl leading-7 font-semibold">What are heuristics?</div>
                            <div className="text-gray-500 text-base leading-6 font-normal mt-3">Think of the as noisy, imperfect
                                label signals. They can be labeling functions, active learning models or something else that
                                you can integrate. The general interface is that they have some record as input and produce
                                some label-related output (e.g. the label name for classification tasks).</div>
                            <div
                                className="text-green-800 hover:text-green-500 text-base leading-6 font-semibold mt-3 cursor-pointer">
                                <a href="https://docs.kern.ai/refinery/heuristics#labeling-functions" target="_blank">Read
                                    about labeling functions</a>
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-900 text-xl leading-7 font-semibold">How to use templates</div>
                            <div className="text-gray-500 text-base leading-6 font-normal mt-3">You don&apos;t need to re-invent the
                                wheel in some cases, as labeling functions often share some of their structure. We have a
                                public GitHub repository containing some template functions, so you can look into this.
                            </div>
                            <div
                                className="text-green-800 hover:text-green-500 text-base leading-6 font-semibold mt-3 cursor-pointer">
                                <a href="https://github.com/code-kern-ai/template-functions" target="_blank">See template
                                    functions</a>
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-900 text-xl leading-7 font-semibold">Applying active learning</div>
                            <div className="text-gray-500 text-base leading-6 font-normal mt-3">As you label data manually (and
                                build embeddings), you can make great use of active learning to build implicit heuristics.
                                They are straightforward to be implemented, as we autogenerate the coding for it. Still, you
                                can dive deeper into their mechanics in our docs.</div>
                            <div
                                className="text-green-800 hover:text-green-500 text-base leading-6 font-semibold mt-3 cursor-pointer">
                                <a href="https://docs.kern.ai/refinery/heuristics#active-learners" target="_blank">Read
                                    about active learning</a>
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-900 text-xl leading-7 font-semibold">Starting with zero-shot</div>
                            <div className="text-gray-500 text-base leading-6 font-normal mt-3">Zero-shot models are really
                                great heuristics, as they infer predictions from the label names (and some context). You
                                might want to use them for your project, but be aware that pulling them can require some
                                time, since they contain enormous amounts of parameters.</div>
                            <div
                                className="text-green-800 hover:text-green-500 text-base leading-6 font-semibold mt-3 cursor-pointer">
                                <a href="https://docs.kern.ai/refinery/heuristics#zero-shot-classifiers"
                                    target="_blank">Read
                                    about zero-shot</a>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (<>
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 150px)' }}>
                    <div className={`mt-8 ${filteredList.length > 3 ? style.flexContainer : 'grid gap-6 grid-cols-3'}`}>
                        {heuristics.length > 0 && filteredList.length == 0 && <span className="text-gray-500 text-base leading-6 font-normal mt-4">No heuristics for this labeling task</span>}
                        <GridCards filteredList={filteredList} refetch={refetchHeuristicsAndProcess} setFilteredList={setFilteredList} />
                    </div>
                </div>
            </>)}

            <AddLabelingFunctionModal />
            <AddActiveLeanerModal />
            <AddZeroShotModal />
            <AddCrowdLabelerModal />
        </div >
    </div >)
}