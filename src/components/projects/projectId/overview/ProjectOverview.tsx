import { selectProjectId } from '@/src/reduxStore/states/project';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProjectOverviewHeader from './ProjectOverviewHeader';
import { getEmptyProjectStats, postProcessLabelDistribution, postProcessingStats } from '@/src/util/components/projects/projectId/project-overview/project-overview-helper';
import ProjectOverviewCards from './ProjectOverviewCards';
import { ProjectStats } from '@/src/types/components/projects/projectId/project-overview/project-overview';
import style from '@/src/styles/components/projects/projectId/project-overview.module.css';
import { postProcessLabelingTasks, postProcessLabelingTasksSchema } from '@/src/util/components/projects/projectId/settings/labeling-tasks-helper';
import { selectLabelingTasksAll, setAllAttributes, setLabelingTasksAll } from '@/src/reduxStore/states/pages/settings';
import { setDataSlices } from '@/src/reduxStore/states/pages/data-browser';
import { selectOverviewFilters } from '@/src/reduxStore/states/tmp';
import LabelDistributionBarChart from './charts/LabelDistributionBarChart';
import { LabelDistribution } from '@/src/types/components/projects/projectId/project-overview/charts';
import { selectAllUsers, selectOrganizationId, setComments } from '@/src/reduxStore/states/general';
import { CommentType } from '@/src/types/shared/comments';
import { CommentDataManager } from '@/src/util/classes/comments';
import { useWebsocket } from '@/submodules/react-components/hooks/web-socket/useWebsocket';
import { getAllComments } from '@/src/services/base/comment';
import { getGeneralProjectStats, getLabelDistribution, getLabelingTasksByProjectId } from '@/src/services/base/project';
import { getAttributes } from '@/src/services/base/attribute';
import { getDataSlices } from '@/src/services/base/dataSlices';
import { Application, CurrentPage } from '@/submodules/react-components/hooks/web-socket/constants';

const PROJECT_STATS_INITIAL_STATE: ProjectStats = getEmptyProjectStats();

export default function ProjectOverview() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const overviewFilters = useSelector(selectOverviewFilters);
    const allUsers = useSelector(selectAllUsers);

    const [projectStats, setProjectStats] = useState<ProjectStats>(PROJECT_STATS_INITIAL_STATE);
    const [graphsHaveValues, setGraphsHaveValues] = useState<boolean>(false);
    const [labelDistribution, setLabelDistribution] = useState<LabelDistribution[]>([]);

    useEffect(() => {
        if (!projectId) return;
        refetchAttributesAndProcess();
        refetchLabelingTasksAndProcess();
        refetchDataSlicesAndProcess();
    }, [projectId]);

    useEffect(() => {
        if (!projectId || allUsers.length == 0) return;
        setUpCommentsRequests();
    }, [allUsers, projectId]);

    useEffect(() => {
        if (!overviewFilters || !projectId || !labelingTasks || !overviewFilters.labelingTask) return;
        getLabelDistributions();
        getProjectStats();
    }, [overviewFilters, projectId, labelingTasks]);

    useEffect(() => {
        if (!labelDistribution) return;
        setGraphsHaveValues(labelDistribution?.length > 0);
    }, [labelDistribution]);


    function setUpCommentsRequests() {
        const requests = [];
        requests.push({ commentType: CommentType.ATTRIBUTE, projectId: projectId });
        requests.push({ commentType: CommentType.LABELING_TASK, projectId: projectId });
        requests.push({ commentType: CommentType.DATA_SLICE, projectId: projectId });
        requests.push({ commentType: CommentType.LABEL, projectId: projectId });
        CommentDataManager.unregisterCommentRequests(CurrentPage.PROJECT_OVERVIEW);
        CommentDataManager.registerCommentRequests(CurrentPage.PROJECT_OVERVIEW, requests);
        const requestJsonString = CommentDataManager.buildRequestJSON();
        getAllComments(requestJsonString, (res) => {
            CommentDataManager.parseCommentData(res.data['getAllComments']);
            CommentDataManager.parseToCurrentData(allUsers);
            dispatch(setComments(CommentDataManager.currentDataOrder));
        });
    }
    function refetchAttributesAndProcess() {
        getAttributes(projectId, ['ALL'], (res) => {
            dispatch(setAllAttributes(res));
        });
    }

    function refetchLabelingTasksAndProcess() {
        getLabelingTasksByProjectId(projectId, (res) => {
            const labelingTasks = postProcessLabelingTasks(res);
            dispatch(setLabelingTasksAll(postProcessLabelingTasksSchema(labelingTasks)));
        });
    }

    function refetchDataSlicesAndProcess() {
        getDataSlices(projectId, null, (res) => {
            dispatch(setDataSlices(res));
        });
    }

    function getLabelDistributions() {
        const labelingTaskId = overviewFilters.labelingTask?.id;
        const dataSliceFindId = overviewFilters.dataSlice?.id;
        const dataSliceId = dataSliceFindId == "@@NO_SLICE@@" ? null : dataSliceFindId;
        getLabelDistribution(projectId, labelingTaskId, dataSliceId, (res) => {
            setLabelDistribution(postProcessLabelDistribution(res, false));
        });
    }

    function getProjectStats() {
        const projectStatsCopy = { ...projectStats };
        projectStatsCopy.generalLoading = true;
        setProjectStats(projectStatsCopy);
        const labelingTaskId = overviewFilters.labelingTask?.id;
        const dataSliceFindId = overviewFilters.dataSlice?.id;
        const dataSliceId = dataSliceFindId == "@@NO_SLICE@@" ? null : dataSliceFindId;

        getGeneralProjectStats(projectId, labelingTaskId, dataSliceId, (res) => {
            if (res['data'] == null) return;
            setProjectStats(postProcessingStats(res));
        });
    }

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (!projectId) return;
        if (['label_created', 'label_deleted', 'labeling_task_deleted', 'labeling_task_updated', 'labeling_task_created', 'weak_supervision_finished'].includes(msgParts[1])) {
            refetchLabelingTasksAndProcess();
        } else if (['data_slice_created', 'data_slice_updated', 'data_slice_deleted'].includes(msgParts[1])) {
            refetchDataSlicesAndProcess();
        }
    }, [projectId]);


    const orgId = useSelector(selectOrganizationId);
    useWebsocket(orgId, Application.REFINERY, CurrentPage.PROJECT_OVERVIEW, handleWebsocketNotification, projectId);

    return (<div>
        {projectId != null && <div className="pt-4 px-4 pb-10 bg-gray-100 flex-1 flex flex-col min-h-full h-[calc(100vh-4rem)] overflow-y-auto">
            <ProjectOverviewHeader />
            <ProjectOverviewCards projectStats={projectStats} />
            {graphsHaveValues ? (<div>
                <div className="mt-8 grid w-full">
                    <div className="text-lg leading-6 text-gray-900 font-medium inline-block">Label distribution</div>
                    <div className="mt-1 text-sm leading-5 font-medium text-gray-700 inline-block">See the distribution of your manually labeled and weakly supervised records.</div>
                    <div className={`mt-2 w-full h-full shadow ${style.stats} bg-white grid place-items-center flex-grow`}>
                        {labelDistribution && <div className="h-full w-full p-5">
                            <LabelDistributionBarChart dataInput={labelDistribution} />
                        </div>}
                    </div>
                </div>


            </div>
            ) : (<div>
                <div className="mt-8 text-lg leading-6 text-gray-900 font-medium inline-block">Monitoring</div>
                <div className="mt-1 text-sm leading-5 font-medium text-gray-700 block">Go to the settings page to add a labeling task.</div>
                <div className={`mt-2 shadow w-full ${style.stats} bg-white place-content-center p-4`}>
                    <div className={`${style.statsTitle}`}>Add Labels to display chart</div>
                </div></div>)}
        </div>}
    </div >);
}