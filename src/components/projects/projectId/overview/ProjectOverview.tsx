import { selectProject } from '@/src/reduxStore/states/project';
import { WebSocketsService } from '@/src/services/base/web-sockets/WebSocketsService';
import { GET_LABELING_TASKS_BY_PROJECT_ID } from '@/src/services/gql/queries/project';
import { CurrentPage } from '@/src/types/shared/general';
import { useLazyQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProjectOverviewHeader from './ProjectOverviewHeader';
import { prepareLabelingTasks } from '@/src/util/projects/project-overview-helper';
import ProjectOverviewCards from './ProjectOverviewCards';


export default function ProjectOverview() {
    const project = useSelector(selectProject);

    const [labelingTasks, setLabelingTasks] = useState([]);

    const [refetchLabelingTasksByProjectId] = useLazyQuery(GET_LABELING_TASKS_BY_PROJECT_ID, { fetchPolicy: "network-only" });

    useEffect(() => {
        refetchLabelingTasksByProjectId({ variables: { projectId: project.id } }).then((res) => {
            setLabelingTasks(prepareLabelingTasks(res.data['projectByProjectId']['labelingTasks']['edges']));
        });

        WebSocketsService.subscribeToNotification(CurrentPage.PROJECT_OVERVIEW, {
            whitelist: ['label_created', 'label_deleted', 'labeling_task_deleted', 'labeling_task_updated', 'labeling_task_created', 'weak_supervision_finished', 'data_slice_created', 'data_slice_updated', 'data_slice_deleted'],
            func: handleWebsocketNotification
        });
    }, []);

    function handleWebsocketNotification(msgParts: string[]) {

    }

    return (<div className="p-4 bg-gray-100 flex-1 flex flex-col min-h-full">
        <ProjectOverviewHeader />
        <ProjectOverviewCards />
    </div >)
}