import { selectHeuristic, setActiveHeuristics } from "@/src/reduxStore/states/pages/heuristics";
import { selectLabelingTasksAll, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { WebSocketsService } from "@/src/services/base/web-sockets/WebSocketsService";
import { GET_HEURISTICS_BY_ID } from "@/src/services/gql/queries/heuristics";
import { GET_LABELING_TASKS_BY_PROJECT_ID } from "@/src/services/gql/queries/project-setting";
import { CurrentPage } from "@/src/types/shared/general";
import { postProcessLabelingTasks, postProcessLabelingTasksSchema } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import HeuristicsLayout from "../shared/HeuristicsLayout";
import { selectAllUsers, selectAnnotators, setComments } from "@/src/reduxStore/states/general";
import DangerZone from "@/src/components/shared/danger-zone/DangerZone";
import { DangerZoneEnum } from "@/src/types/shared/danger-zone";
import HeuristicStatistics from "../shared/HeuristicStatistics";
import CrowdLabelerSettings from "./CrowdLabelerSettings";
import { postProcessCrowdLabeler } from "@/src/util/components/projects/projectId/heuristics/heuristicId/crowd-labeler-helper";
import { selectDataSlicesAll, setDataSlices } from "@/src/reduxStore/states/pages/data-browser";
import { DATA_SLICES } from "@/src/services/gql/queries/data-browser";
import { unsubscribeWSOnDestroy } from "@/src/services/base/web-sockets/web-sockets-helper";
import { REQUEST_COMMENTS } from "@/src/services/gql/queries/projects";
import { CommentDataManager } from "@/src/util/classes/comments";
import { CommentType } from "@/src/types/shared/comments";


export default function CrowdLabeler() {
    const dispatch = useDispatch();
    const router = useRouter();

    const projectId = useSelector(selectProjectId);
    const currentHeuristic = useSelector(selectHeuristic);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const annotators = useSelector(selectAnnotators);
    const dataSlices = useSelector(selectDataSlicesAll);
    const allUsers = useSelector(selectAllUsers);

    const [refetchCurrentHeuristic] = useLazyQuery(GET_HEURISTICS_BY_ID, { fetchPolicy: "network-only" });
    const [refetchLabelingTasksByProjectId] = useLazyQuery(GET_LABELING_TASKS_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchDataSlicesMut] = useLazyQuery(DATA_SLICES, { fetchPolicy: 'network-only' });
    const [refetchComments] = useLazyQuery(REQUEST_COMMENTS, { fetchPolicy: "no-cache" });

    useEffect(unsubscribeWSOnDestroy(router, [CurrentPage.HEURISTICS, CurrentPage.LABELING_FUNCTION, CurrentPage.ACTIVE_LEARNING, CurrentPage.CROWD_LABELER, CurrentPage.ZERO_SHOT, CurrentPage.COMMENTS], projectId), []);

    useEffect(() => {
        if (!projectId) return;
        if (!router.query.heuristicId) return;
        refetchLabelingTasksAndProcess();
        refetchDataSlicesMut({ variables: { projectId: projectId, sliceType: "STATIC_DEFAULT" } }).then((res) => {
            dispatch(setDataSlices(res.data.dataSlices));
        });
    }, [projectId, router.query.heuristicId]);

    useEffect(() => {
        if (!projectId) return;
        if (!labelingTasks) return;
        refetchCurrentHeuristicAndProcess();
    }, [labelingTasks]);

    useEffect(() => {
        if (!currentHeuristic) return;
        WebSocketsService.subscribeToNotification(CurrentPage.CROWD_LABELER, {
            projectId: projectId,
            whitelist: ['labeling_task_updated', 'labeling_task_created', 'label_created', 'label_deleted', 'labeling_task_deleted', 'information_source_deleted', 'information_source_updated', 'model_callback_update_statistics'],
            func: handleWebsocketNotification
        });
    }, [currentHeuristic]);

    useEffect(() => {
        if (!projectId || allUsers.length == 0) return;
        setUpCommentsRequests();
    }, [allUsers, projectId]);

    function setUpCommentsRequests() {
        const requests = [];
        requests.push({ commentType: CommentType.ATTRIBUTE, projectId: projectId });
        requests.push({ commentType: CommentType.LABELING_TASK, projectId: projectId });
        requests.push({ commentType: CommentType.HEURISTIC, projectId: projectId });
        requests.push({ commentType: CommentType.DATA_SLICE, projectId: projectId });
        requests.push({ commentType: CommentType.LABEL, projectId: projectId });
        CommentDataManager.unregisterCommentRequests(CurrentPage.CROWD_LABELER);
        CommentDataManager.registerCommentRequests(CurrentPage.CROWD_LABELER, requests);
        const requestJsonString = CommentDataManager.buildRequestJSON();
        refetchComments({ variables: { requested: requestJsonString } }).then((res) => {
            CommentDataManager.parseCommentData(JSON.parse(res.data['getAllComments']));
            CommentDataManager.parseToCurrentData(allUsers);
            dispatch(setComments(CommentDataManager.currentDataOrder));
        });
    }

    function refetchCurrentHeuristicAndProcess() {
        refetchCurrentHeuristic({ variables: { projectId: projectId, informationSourceId: router.query.heuristicId } }).then((res) => {
            dispatch(setActiveHeuristics(postProcessCrowdLabeler(res['data']['informationSourceBySourceId'], labelingTasks)));
        });
    }

    function refetchLabelingTasksAndProcess() {
        refetchLabelingTasksByProjectId({ variables: { projectId: projectId } }).then((res) => {
            const labelingTasks = postProcessLabelingTasks(res['data']['projectByProjectId']['labelingTasks']['edges']);
            dispatch(setLabelingTasksAll(postProcessLabelingTasksSchema(labelingTasks)));
        });
    }

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (!currentHeuristic) return;
        if (['labeling_task_updated', 'labeling_task_created', 'label_created', 'label_deleted'].includes(msgParts[1])) {
            refetchLabelingTasksAndProcess();
        } else if ('labeling_task_deleted' == msgParts[1]) {
            alert('Parent labeling task was deleted!');
            router.push(`/projects/${projectId}/heuristics`);
        } else if ('information_source_deleted' == msgParts[1]) {
            alert('Information source was deleted!');
            router.push(`/projects/${projectId}/heuristics`);
        } else if (['information_source_updated', 'model_callback_update_statistics'].includes(msgParts[1])) {
            if (currentHeuristic.id == msgParts[2]) {
                refetchCurrentHeuristicAndProcess();
            }
        }
    }, [currentHeuristic]);

    useEffect(() => {
        if (!projectId) return;
        WebSocketsService.updateFunctionPointer(projectId, CurrentPage.CROWD_LABELER, handleWebsocketNotification)
    }, [handleWebsocketNotification, projectId]);

    return (<HeuristicsLayout>
        {currentHeuristic && <div>
            {annotators.length == 0 || dataSlices.length == 0 ? (
                <>
                    <div className="overflow-hidden bg-white">
                        <div className="relative py-8 pr-4">
                            <div className="absolute top-0 bottom-0 left-3/4 hidden w-screen bg-gray-50 lg:block"></div>
                            <div className="mx-auto max-w-prose text-base lg:grid lg:max-w-none lg:grid-cols-2 lg:gap-8">
                                <div>
                                    <h2 className="text-lg font-semibold text-indigo-600">Integrating crowd labelers</h2>
                                    <h3 className="mt-2 text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
                                        How it works</h3>
                                </div>
                            </div>
                            <div className="pl-4 mt-8 lg:grid lg:grid-cols-2 lg:gap-8 max-w-7xl">
                                <div className="relative lg:col-start-2 lg:row-start-1">
                                    <svg className="absolute top-0 right-0 -mt-20 -mr-20 hidden lg:block" width="404"
                                        height="384" fill="none" viewBox="0 0 404 384" aria-hidden="true">
                                        <defs>
                                            <pattern id="de316486-4a29-4312-bdfc-fbce2132a2c1" x="0" y="0" width="20"
                                                height="20" patternUnits="userSpaceOnUse">
                                                <rect x="0" y="0" width="4" height="4" className="text-gray-200"
                                                    fill="currentColor" />
                                            </pattern>
                                        </defs>
                                        <rect width="404" height="384" fill="url(#de316486-4a29-4312-bdfc-fbce2132a2c1)" />
                                    </svg>
                                    <div className="relative mx-auto max-w-prose text-base lg:max-w-none">
                                        <figure>
                                            <div className="aspect-w-12 aspect-h-7 lg:aspect-none">
                                                <img className="rounded-lg object-cover object-center shadow-lg"
                                                    src="https://images.unsplash.com/photo-1618004912476-29818d81ae2e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1664&q=80"
                                                    alt="Whitney leaning against a railing on a downtown street"
                                                    width="1184" height="1376" />
                                            </div>
                                        </figure>
                                    </div>
                                </div>
                                <div className="mt-8 lg:mt-0">
                                    <div className="max-w-prose text-base lg:max-w-none">
                                        <p className="text-lg text-gray-500">You can create slice-specific annotation tasks for
                                            your annotators. If you have no annotators yet, you can reach out to the
                                            support, so we can add some to your organization.</p>
                                    </div>
                                    <div
                                        className="prose prose-indigo mt-5 text-gray-500 lg:col-start-1 lg:row-start-1 lg:max-w-none">
                                        <p>Annotators will receive an annotator/slice-specific URL, which shows them records
                                            of the respective data slice. They can label through this slice, but their
                                            labels won&apos;t be set as your manual reference labels. Instead, their output will
                                            be considered a heuristic just like a labeling function.</p>
                                        <p>To get started, please ensure the following:</p>
                                        <ul role="list">
                                            <li>Create static data slices that you want to have labeled manually. These can
                                                be e.g. records with low weak supervision confidence.</li>
                                            <li>Contact the support on how many annotators you require. We will create those
                                                slots for you.</li>
                                            <li>Revisit this page afterwards. You will be able to configure the heuristic.
                                            </li>
                                        </ul>
                                        <p>You can then either send the link to an annotator you want to work with, or let
                                            us manage that.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div></>
            ) : (<>
                <CrowdLabelerSettings />
                <HeuristicStatistics />
            </>)}
            <DangerZone elementType={DangerZoneEnum.CROWD_LABELER} id={currentHeuristic.id} name={currentHeuristic.name} />
        </div>}
    </HeuristicsLayout>)
}