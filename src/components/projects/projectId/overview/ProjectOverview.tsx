import { selectProject } from '@/src/reduxStore/states/project';
import { WebSocketsService } from '@/src/services/base/web-sockets/WebSocketsService';
import { GET_GENERAL_PROJECT_STATS, GET_LABELING_TASKS_BY_PROJECT_ID } from '@/src/services/gql/queries/project';
import { CurrentPage } from '@/src/types/shared/general';
import { useLazyQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ProjectOverviewHeader from './ProjectOverviewHeader';
import { getEmptyProjectStats, postProcessingStats } from '@/src/util/components/projects/projectId/project-overview-helper';
import ProjectOverviewCards from './ProjectOverviewCards';
import { jsonCopy } from '@/submodules/javascript-functions/general';
import { ProjectStats } from '@/src/types/components/projects/projectId/overview';
import style from '@/src/styles/components/projects/projectId/project-overview.module.css';

const PROJECT_STATS_INITIAL_STATE: ProjectStats = getEmptyProjectStats();

export default function ProjectOverview() {
    const project = useSelector(selectProject);

    const [projectStats, setProjectStats] = useState<ProjectStats>(PROJECT_STATS_INITIAL_STATE);
    const [graphsHaveValues, setGraphsHaveValues] = useState<boolean>(false);

    const [refetchLabelingTasksByProjectId] = useLazyQuery(GET_LABELING_TASKS_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchProjectStats] = useLazyQuery(GET_GENERAL_PROJECT_STATS, { fetchPolicy: "no-cache" });

    useEffect(() => {
        getProjectStats();

        WebSocketsService.subscribeToNotification(CurrentPage.PROJECT_OVERVIEW, {
            whitelist: ['label_created', 'label_deleted', 'labeling_task_deleted', 'labeling_task_updated', 'labeling_task_created', 'weak_supervision_finished', 'data_slice_created', 'data_slice_updated', 'data_slice_deleted'],
            func: handleWebsocketNotification
        });
    }, [project]);

    function handleWebsocketNotification(msgParts: string[]) {

    }

    // TODO: Add labeling task id and data slice id to the query
    function getProjectStats() {
        if (!project) return;
        const projectStatsCopy = jsonCopy(projectStats);
        projectStatsCopy.generalLoading = true;
        projectStatsCopy.interAnnotatorLoading = true;
        setProjectStats(projectStatsCopy);
        refetchProjectStats({ variables: { projectId: project.id, labelingTaskId: "9ba4096a-96b8-433d-a3bf-0704c6bf3202", sliceId: null } }).then((res) => {
            setProjectStats(postProcessingStats(JSON.parse(res['data']['generalProjectStats'])));
        });
    }

    return (<div>
        {project != null && <div className="p-4 bg-gray-100 flex-1 flex flex-col min-h-full">
            <ProjectOverviewHeader />
            <ProjectOverviewCards projectStats={projectStats} />
            {graphsHaveValues ? (<div>
                {/* TODO: add graphs here */}
            </div>
            ) : (<div>
                <div className="mt-8 text-lg leading-6 text-gray-900 font-medium inline-block">
                    Monitoring
                </div>
                <div className="mt-1 text-sm leading-5 font-medium text-gray-700 block">Go to the settings page to add a
                    labeling task.</div>
                <div className={`mt-2 shadow w-full ${style.stats} bg-white place-content-center p-4`}>
                    <div className={`${style.statsTitle}`}>Add Labels to display charts</div>
                </div></div>)}
        </div>}
    </div>);
}