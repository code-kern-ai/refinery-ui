import { selectProjectId } from '@/src/reduxStore/states/project';
import { WebSocketsService } from '@/src/services/base/web-sockets/WebSocketsService';
import { CurrentPage } from '@/src/types/shared/general';
import { useLazyQuery } from '@apollo/client';
import { use, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProjectOverviewHeader from './ProjectOverviewHeader';
import { getEmptyProjectStats, postProcessLabelDistribution, postProcessingStats } from '@/src/util/components/projects/projectId/project-overview/project-overview-helper';
import ProjectOverviewCards from './ProjectOverviewCards';
import { jsonCopy } from '@/submodules/javascript-functions/general';
import { ProjectStats } from '@/src/types/components/projects/projectId/project-overview/project-overview';
import style from '@/src/styles/components/projects/projectId/project-overview.module.css';
import { unsubscribeWSOnDestroy } from '@/src/services/base/web-sockets/web-sockets-helper';
import { useRouter } from 'next/router';
import { GET_GENERAL_PROJECT_STATS, GET_LABEL_DISTRIBUTION } from '@/src/services/gql/queries/project-overview';
import { GET_ATTRIBUTES_BY_PROJECT_ID, GET_LABELING_TASKS_BY_PROJECT_ID } from '@/src/services/gql/queries/project-setting';
import { postProcessLabelingTasks, postProcessLabelingTasksSchema } from '@/src/util/components/projects/projectId/settings/labeling-tasks-helper';
import { selectLabelingTasksAll, setAllAttributes, setLabelingTasksAll } from '@/src/reduxStore/states/pages/settings';
import { postProcessingAttributes } from '@/src/util/components/projects/projectId/settings/data-schema-helper';
import { DATA_SLICES } from '@/src/services/gql/queries/data-browser';
import { selectDataSlices, setDataSlices } from '@/src/reduxStore/states/pages/data-browser';
import { postProcessDataSlices } from '@/src/util/components/projects/projectId/data-browser/data-browser-helper';
import { selectOverviewFilters } from '@/src/reduxStore/states/tmp';
import { DisplayGraphs } from '@/submodules/javascript-functions/enums/enums';
import LabelDistributionBarChart from './charts/LabelDistributionBarChart';
import { LabelDistribution } from '@/src/types/components/projects/projectId/project-overview/charts';

const PROJECT_STATS_INITIAL_STATE: ProjectStats = getEmptyProjectStats();

export default function ProjectOverview() {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const dataSlices = useSelector(selectDataSlices);
    const overviewFilters = useSelector(selectOverviewFilters);

    const [projectStats, setProjectStats] = useState<ProjectStats>(PROJECT_STATS_INITIAL_STATE);
    const [graphsHaveValues, setGraphsHaveValues] = useState<boolean>(false);
    const [labelDistribution, setLabelDistribution] = useState<LabelDistribution[]>([]);

    const [refetchProjectStats] = useLazyQuery(GET_GENERAL_PROJECT_STATS, { fetchPolicy: "no-cache" });
    const [refetchLabelingTasksByProjectId] = useLazyQuery(GET_LABELING_TASKS_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchAttributes] = useLazyQuery(GET_ATTRIBUTES_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchDataSlices] = useLazyQuery(DATA_SLICES, { fetchPolicy: 'network-only' });
    const [refetchLabelDistribution] = useLazyQuery(GET_LABEL_DISTRIBUTION, { fetchPolicy: "no-cache" });

    useEffect(unsubscribeWSOnDestroy(router, [CurrentPage.PROJECT_OVERVIEW]), []);

    useEffect(() => {
        if (!projectId) return;
        refetchAttributesAndProcess();
        refetchLabelingTasksAndProcess();
        refetchDataSlicesAndProcess();
        WebSocketsService.subscribeToNotification(CurrentPage.PROJECT_OVERVIEW, {
            projectId: projectId,
            whitelist: ['label_created', 'label_deleted', 'labeling_task_deleted', 'labeling_task_updated', 'labeling_task_created', 'weak_supervision_finished', 'data_slice_created', 'data_slice_updated', 'data_slice_deleted'],
            func: handleWebsocketNotification
        });
    }, [projectId]);


    useEffect(() => {
        if (!projectId || !labelingTasks) return;
        getProjectStats();
    }, [projectId, labelingTasks]);

    useEffect(() => {
        if (!overviewFilters) return;
        getLabelDistributions();
    }, [overviewFilters]);

    useEffect(() => {
        if (!labelDistribution) return;
        setGraphsHaveValues(labelDistribution?.length > 0);
    }, [labelDistribution]);

    function refetchAttributesAndProcess() {
        refetchAttributes({ variables: { projectId: projectId, stateFilter: ['ALL'] } }).then((res) => {
            dispatch(setAllAttributes(postProcessingAttributes(res.data['attributesByProjectId'])));
        });
    }

    function refetchLabelingTasksAndProcess() {
        refetchLabelingTasksByProjectId({ variables: { projectId: projectId } }).then((res) => {
            const labelingTasks = postProcessLabelingTasks(res['data']['projectByProjectId']['labelingTasks']['edges']);
            dispatch(setLabelingTasksAll(postProcessLabelingTasksSchema(labelingTasks)));
        });
    }

    function refetchDataSlicesAndProcess() {
        refetchDataSlices({ variables: { projectId: projectId } }).then((res) => {
            dispatch(setDataSlices(postProcessDataSlices(res.data.dataSlices)));
        });
    }

    function getLabelDistributions() {
        const labelingTaskId = labelingTasks.find((labelingTask) => labelingTask.name === overviewFilters.labelingTask)?.id;
        const dataSliceFindId = dataSlices.find((dataSlice) => dataSlice.name === overviewFilters.dataSlice)?.id;
        const dataSliceId = dataSliceFindId == "@@NO_SLICE@@" ? null : dataSliceFindId;
        refetchLabelDistribution({ variables: { projectId: projectId, labelingTaskId: labelingTaskId, sliceId: dataSliceId } }).then((res) => {
            setLabelDistribution(postProcessLabelDistribution(res['data']['labelDistribution']));
        });
    }

    function getProjectStats() {
        const projectStatsCopy = jsonCopy(projectStats);
        projectStatsCopy.generalLoading = true;
        projectStatsCopy.interAnnotatorLoading = true;
        setProjectStats(projectStatsCopy);
        refetchProjectStats({ variables: { projectId: projectId, labelingTaskId: labelingTasks[0].id, sliceId: null } }).then((res) => {
            setProjectStats(postProcessingStats(JSON.parse(res['data']['generalProjectStats'])));
        });
    }

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {

    }, []);

    useEffect(() => {
        if (!projectId) return;
        WebSocketsService.updateFunctionPointer(projectId, CurrentPage.PROJECT_OVERVIEW, handleWebsocketNotification)
    }, [handleWebsocketNotification, projectId]);

    return (<div>
        {projectId != null && <div className="p-4 bg-gray-100 flex-1 flex flex-col min-h-full">
            <ProjectOverviewHeader />
            <ProjectOverviewCards projectStats={projectStats} />
            {graphsHaveValues ? (<div>
                {(overviewFilters.graphTypeEnum == DisplayGraphs.ALL || overviewFilters.graphTypeEnum == DisplayGraphs.LABEL_DISTRIBUTION) && <div className="mt-8 grid w-full">
                    <div className="text-lg leading-6 text-gray-900 font-medium inline-block">
                        Label distribution
                    </div>
                    <div className="mt-1 text-sm leading-5 font-medium text-gray-700 inline-block">See the distribution of your
                        manually labeled and weakly supervised records.</div>
                    <div className="mt-2 w-full h-full shadow stats bg-white grid place-items-center flex-grow">
                        {labelDistribution && <div className="h-full w-full p-5">
                            <LabelDistributionBarChart dataInput={labelDistribution} />
                        </div>}
                    </div>
                </div>}

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