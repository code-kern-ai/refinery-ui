import { selectHeuristic, setActiveHeuristics } from "@/src/reduxStore/states/pages/heuristics";
import { selectLabelingTasksAll, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProject } from "@/src/reduxStore/states/project";
import { WebSocketsService } from "@/src/services/base/web-sockets/WebSocketsService";
import { GET_HEURISTICS_BY_ID } from "@/src/services/gql/queries/heuristics";
import { GET_LABELING_TASKS_BY_PROJECT_ID } from "@/src/services/gql/queries/project-setting";
import { CurrentPage } from "@/src/types/shared/general";
import { postProcessCurrentHeuristic } from "@/src/util/components/projects/projectId/heuristics/heuristicId/heuristics-details-helper";
import { postProcessLabelingTasks, postProcessLabelingTasksSchema } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import HeuristicsLayout from "../shared/HeuristicsLayout";
import { selectAnnotators } from "@/src/reduxStore/states/general";
import DangerZone from "@/src/components/shared/danger-zone/DangerZone";
import { DangerZoneEnum } from "@/src/types/shared/danger-zone";

export default function CrowdLabeler() {
    const dispatch = useDispatch();
    const router = useRouter();

    const project = useSelector(selectProject);
    const currentHeuristic = useSelector(selectHeuristic);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const annotators = useSelector(selectAnnotators);

    const [refetchCurrentHeuristic] = useLazyQuery(GET_HEURISTICS_BY_ID, { fetchPolicy: "network-only" });
    const [refetchLabelingTasksByProjectId] = useLazyQuery(GET_LABELING_TASKS_BY_PROJECT_ID, { fetchPolicy: "network-only" });

    useEffect(() => {
        if (!project) return;
        if (!router.query.heuristicId) return;
        refetchLabelingTasksAndProcess();
    }, [project, router.query.heuristicId]);

    useEffect(() => {
        if (!project) return;
        if (!labelingTasks) return;
        refetchCurrentHeuristicAndProcess();
    }, [labelingTasks]);

    useEffect(() => {
        if (!currentHeuristic) return;
        WebSocketsService.subscribeToNotification(CurrentPage.CROWD_LABELER, {
            projectId: project.id,
            whitelist: ['labeling_task_updated', 'labeling_task_created', 'label_created', 'label_deleted', 'labeling_task_deleted', 'information_source_deleted', 'information_source_updated', 'model_callback_update_statistics', 'payload_progress', 'payload_finished', 'payload_failed', 'payload_created'],
            func: handleWebsocketNotification
        });
    }, [currentHeuristic]);

    function refetchCurrentHeuristicAndProcess() {
        refetchCurrentHeuristic({ variables: { projectId: project.id, informationSourceId: router.query.heuristicId } }).then((res) => {
            dispatch(setActiveHeuristics(postProcessCurrentHeuristic(res['data']['informationSourceBySourceId'], labelingTasks)));
        });
    }

    function refetchLabelingTasksAndProcess() {
        refetchLabelingTasksByProjectId({ variables: { projectId: project.id } }).then((res) => {
            const labelingTasks = postProcessLabelingTasks(res['data']['projectByProjectId']['labelingTasks']['edges']);
            dispatch(setLabelingTasksAll(postProcessLabelingTasksSchema(labelingTasks)));
        });
    }


    function handleWebsocketNotification(msgParts: string[]) {

    }

    return (<HeuristicsLayout>
        {currentHeuristic && <div>
            {annotators.length == 0 ? (
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
                                            labels won't be set as your manual reference labels. Instead, their output will
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
            ) : (<></>)}
            <DangerZone elementType={DangerZoneEnum.CROWD_LABELER} id={currentHeuristic.id} name={currentHeuristic.name} />
        </div>}
    </HeuristicsLayout>)
}