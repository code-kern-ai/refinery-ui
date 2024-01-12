import { selectProjectId } from '@/src/reduxStore/states/project';
import { WebSocketsService } from '@/src/services/base/web-sockets/WebSocketsService';
import { CurrentPage } from '@/src/types/shared/general';
import { useLazyQuery } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProjectOverviewHeader from './ProjectOverviewHeader';
import { getEmptyProjectStats, postProcessConfusionMatrix, postProcessLabelDistribution, postProcessingStats } from '@/src/util/components/projects/projectId/project-overview/project-overview-helper';
import ProjectOverviewCards from './ProjectOverviewCards';
import { ProjectStats } from '@/src/types/components/projects/projectId/project-overview/project-overview';
import style from '@/src/styles/components/projects/projectId/project-overview.module.css';
import { unsubscribeWSOnDestroy } from '@/src/services/base/web-sockets/web-sockets-helper';
import { useRouter } from 'next/router';
import { GET_CONFIDENCE_DISTRIBUTION, GET_CONFUSION_MATRIX, GET_GENERAL_PROJECT_STATS, GET_INTER_ANNOTATOR_BY_PROJECT_ID, GET_LABEL_DISTRIBUTION, IS_RATS_TOKENIZAION_STILL_RUNNING } from '@/src/services/gql/queries/project-overview';
import { GET_ATTRIBUTES_BY_PROJECT_ID, GET_LABELING_TASKS_BY_PROJECT_ID } from '@/src/services/gql/queries/project-setting';
import { postProcessLabelingTasks, postProcessLabelingTasksSchema } from '@/src/util/components/projects/projectId/settings/labeling-tasks-helper';
import { selectLabelingTasksAll, setAllAttributes, setLabelingTasksAll } from '@/src/reduxStore/states/pages/settings';
import { DATA_SLICES } from '@/src/services/gql/queries/data-browser';
import { selectStaticSlices, setDataSlices } from '@/src/reduxStore/states/pages/data-browser';
import { selectOverviewFilters, setOverviewFilters } from '@/src/reduxStore/states/tmp';
import { DisplayGraphs } from '@/submodules/javascript-functions/enums/enums';
import LabelDistributionBarChart from './charts/LabelDistributionBarChart';
import { LabelDistribution } from '@/src/types/components/projects/projectId/project-overview/charts';
import ConfidenceDistributionBarChart from './charts/ConfidenceDistributionBarChart';
import { LabelingTaskTaskType } from '@/src/types/components/projects/projectId/settings/labeling-tasks';
import ConfusionMatrixBarChart from './charts/ConfusionMatrixBarChart';
import LoadingIcon from '@/src/components/shared/loading/LoadingIcon';
import { addUserName, parseOverviewSettingsToDict } from '@/src/util/components/projects/projectId/project-overview/charts-helper';
import InterAnnotatorBarChart from './charts/InterAnnotatorBarChart';
import { selectAllUsers, selectIsManaged, setComments } from '@/src/reduxStore/states/general';
import { IconUsers } from '@tabler/icons-react';
import { CommentType } from '@/src/types/shared/comments';
import { REQUEST_COMMENTS } from '@/src/services/gql/queries/projects';
import { CommentDataManager } from '@/src/util/classes/comments';

const PROJECT_STATS_INITIAL_STATE: ProjectStats = getEmptyProjectStats();

export default function ProjectOverview() {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const dataSlices = useSelector(selectStaticSlices);
    const overviewFilters = useSelector(selectOverviewFilters);
    const isManaged = useSelector(selectIsManaged);
    const allUsers = useSelector(selectAllUsers);

    const [projectStats, setProjectStats] = useState<ProjectStats>(PROJECT_STATS_INITIAL_STATE);
    const [graphsHaveValues, setGraphsHaveValues] = useState<boolean>(false);
    const [labelDistribution, setLabelDistribution] = useState<LabelDistribution[]>([]);
    const [confidenceDistribution, setConfidenceDistribution] = useState<any[]>([]);
    const [confusionMatrix, setConfusionMatrix] = useState<any[]>([]);
    const [displayConfusion, setDisplayConfusion] = useState<boolean>(false);
    const [interAnnotatorFormGroup, setInterAnnotatorFormGroup] = useState<any>({});
    const [interAnnotatorMatrix, setInterAnnotatorMatrix] = useState<any>([[]]);
    const [goldUserRequested, setGoldUserRequested] = useState<boolean>(false);

    const [refetchProjectStats] = useLazyQuery(GET_GENERAL_PROJECT_STATS, { fetchPolicy: "no-cache" });
    const [refetchLabelingTasksByProjectId] = useLazyQuery(GET_LABELING_TASKS_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchAttributes] = useLazyQuery(GET_ATTRIBUTES_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchDataSlices] = useLazyQuery(DATA_SLICES, { fetchPolicy: 'network-only' });
    const [refetchLabelDistribution] = useLazyQuery(GET_LABEL_DISTRIBUTION, { fetchPolicy: "no-cache" });
    const [refetchConfidenceDistribution] = useLazyQuery(GET_CONFIDENCE_DISTRIBUTION, { fetchPolicy: "no-cache" });
    const [refetchConfusionMatrix] = useLazyQuery(GET_CONFUSION_MATRIX, { fetchPolicy: "no-cache" });
    const [refetchRatsTokenization] = useLazyQuery(IS_RATS_TOKENIZAION_STILL_RUNNING, { fetchPolicy: "no-cache" });
    const [refetchInterAnnotator] = useLazyQuery(GET_INTER_ANNOTATOR_BY_PROJECT_ID, { fetchPolicy: "no-cache" });
    const [refetchComments] = useLazyQuery(REQUEST_COMMENTS, { fetchPolicy: "no-cache" });

    useEffect(unsubscribeWSOnDestroy(router, [CurrentPage.PROJECT_OVERVIEW]), []);

    useEffect(() => {
        if (!projectId) return;
        refetchAttributesAndProcess();
        refetchLabelingTasksAndProcess();
        refetchDataSlicesAndProcess();
        prepareInterAnnotator();
        WebSocketsService.subscribeToNotification(CurrentPage.PROJECT_OVERVIEW, {
            projectId: projectId,
            whitelist: ['label_created', 'label_deleted', 'labeling_task_deleted', 'labeling_task_updated', 'labeling_task_created', 'weak_supervision_finished', 'data_slice_created', 'data_slice_updated', 'data_slice_deleted'],
            func: handleWebsocketNotification
        });
    }, [projectId]);

    useEffect(() => {
        if (!projectId || allUsers.length == 0) return;
        setUpCommentsRequests();
    }, [allUsers, projectId]);

    useEffect(() => {
        if (!overviewFilters || !projectId || !labelingTasks || !overviewFilters.labelingTask) return;
        setDisplayNERConfusion();
        getLabelDistributions();
        getConfidenceDistributions();
        getConfusionMatrix();
        getInterAnnotatorMatrix();
        getProjectStats();
        saveSettingsToLocalStorage();
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
        refetchComments({ variables: { requested: requestJsonString } }).then((res) => {
            CommentDataManager.parseCommentData(JSON.parse(res.data['getAllComments']));
            CommentDataManager.parseToCurrentData(allUsers);
            dispatch(setComments(CommentDataManager.currentDataOrder));
        });
    }

    function prepareInterAnnotator() {
        const overviewFiltersCopy = { ...overviewFilters };
        const interAnnotatorFinal = {
            goldUser: true,
            allUsers: false,
            dataSlice: "@@NO_SLICE@@",
        };
        let tmp = localStorage.getItem("projectOverviewData");
        if (tmp) {
            let parsedValues = JSON.parse(tmp);
            if (!parsedValues[projectId]) return;
            else parsedValues = parsedValues[projectId];

            if (parsedValues["interAnnotatorAllUsers"] != undefined) interAnnotatorFinal.allUsers = parsedValues["interAnnotatorAllUsers"];
            if (parsedValues["interAnnotatorGoldUser"] != undefined) interAnnotatorFinal.goldUser = parsedValues["interAnnotatorGoldUser"];
            if (parsedValues["interAnnotatorDataSlice"]) interAnnotatorFinal.dataSlice = parsedValues["interAnnotatorDataSlice"];
            if (parsedValues["labelingTasksTarget"]) overviewFiltersCopy.targetAttribute = parsedValues["labelingTasksTarget"];
            if (parsedValues["labelingTasks"]) overviewFiltersCopy.labelingTask = parsedValues["labelingTask"];
            if (parsedValues["displayGraphs"]) overviewFiltersCopy.graphTypeEnum = parsedValues["graphTypeEnum"];
            if (parsedValues["dataSlice"]) overviewFiltersCopy.dataSlice = parsedValues["dataSlice"];
        }
        setInterAnnotatorFormGroup(interAnnotatorFinal);
        dispatch(setOverviewFilters(overviewFiltersCopy));
    }

    function refetchAttributesAndProcess() {
        refetchAttributes({ variables: { projectId: projectId, stateFilter: ['ALL'] } }).then((res) => {
            dispatch(setAllAttributes(res.data['attributesByProjectId']));
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
            dispatch(setDataSlices(res.data.dataSlices));
        });
    }

    function setDisplayNERConfusion() {
        const labelingTaskTaskType = labelingTasks.find((labelingTask) => labelingTask.name === overviewFilters.labelingTask)?.taskType;
        if (labelingTaskTaskType != LabelingTaskTaskType.INFORMATION_EXTRACTION) {
            setDisplayConfusion(true);
        } else {
            refetchRatsTokenization({ variables: { projectId: projectId } }).then((res) => {
                const resFinal = res['data']['isRatsTokenizationStillRunning'];
                setDisplayConfusion(!resFinal);
            });
        }
    }

    function getLabelDistributions() {
        const labelingTaskId = labelingTasks.find((labelingTask) => labelingTask.name === overviewFilters.labelingTask)?.id;
        const dataSliceFindId = dataSlices.find((dataSlice) => dataSlice.name === overviewFilters.dataSlice)?.id;
        const dataSliceId = dataSliceFindId == "@@NO_SLICE@@" ? null : dataSliceFindId;
        refetchLabelDistribution({ variables: { projectId: projectId, labelingTaskId: labelingTaskId, sliceId: dataSliceId } }).then((res) => {
            setLabelDistribution(postProcessLabelDistribution(res['data']['labelDistribution']));
        });
    }

    function getConfidenceDistributions() {
        const labelingTaskId = labelingTasks.find((labelingTask) => labelingTask.name === overviewFilters.labelingTask)?.id;
        const dataSliceFindId = dataSlices.find((dataSlice) => dataSlice.name === overviewFilters.dataSlice)?.id;
        const dataSliceId = dataSliceFindId == "@@NO_SLICE@@" ? null : dataSliceFindId;
        refetchConfidenceDistribution({ variables: { projectId: projectId, labelingTaskId: labelingTaskId, sliceId: dataSliceId } }).then((res) => {
            setConfidenceDistribution(JSON.parse(res['data']['confidenceDistribution']));
        });
    }

    function getConfusionMatrix() {
        const labelingTaskId = labelingTasks.find((labelingTask) => labelingTask.name === overviewFilters.labelingTask)?.id;
        const dataSliceFindId = dataSlices.find((dataSlice) => dataSlice.name === overviewFilters.dataSlice)?.id;
        const dataSliceId = dataSliceFindId == "@@NO_SLICE@@" ? null : dataSliceFindId;
        refetchConfusionMatrix({ variables: { projectId: projectId, labelingTaskId: labelingTaskId, sliceId: dataSliceId } }).then((res) => {
            if (res['data'] == null) return;
            setConfusionMatrix(postProcessConfusionMatrix(res['data']['confusionMatrix']));
        });
    }

    function getInterAnnotatorMatrix() {
        let values = interAnnotatorFormGroup;
        values.dataSlice = values.dataSlice == "@@NO_SLICE@@" ? null : values.dataSlice;
        const labelingTaskId = labelingTasks.find((labelingTask) => labelingTask.name === overviewFilters.labelingTask)?.id;
        refetchInterAnnotator({ variables: { projectId: projectId, labelingTaskId: labelingTaskId, includeGoldStar: values.goldUser, includeAllOrgUser: values.allUsers, onlyOnStaticSlice: values.dataSlice } }).then((res) => {
            if (res['data'] == null) return;
            const matrix = res['data']['interAnnotatorMatrix'];
            const matrixCopy = { ...matrix };
            matrixCopy.allUsers = addUserName(matrixCopy.allUsers);
            setInterAnnotatorMatrix(matrixCopy);
        });
        setGoldUserRequested(values.goldUser);
    }

    function saveSettingsToLocalStorage() {
        let currentData = JSON.parse(localStorage.getItem("projectOverviewData"));
        if (!currentData) currentData = {};
        currentData[projectId] = parseOverviewSettingsToDict(interAnnotatorFormGroup, overviewFilters);
        localStorage.setItem('projectOverviewData', JSON.stringify(currentData));
    }

    function getProjectStats() {
        const projectStatsCopy = { ...projectStats };
        projectStatsCopy.generalLoading = true;
        projectStatsCopy.interAnnotatorLoading = true;
        setProjectStats(projectStatsCopy);
        const labelingTaskId = labelingTasks.find((labelingTask) => labelingTask.name === overviewFilters.labelingTask)?.id;
        const dataSliceFindId = dataSlices.find((dataSlice) => dataSlice.name === overviewFilters.dataSlice)?.id;
        const dataSliceId = dataSliceFindId == "@@NO_SLICE@@" ? null : dataSliceFindId;
        refetchProjectStats({ variables: { projectId: projectId, labelingTaskId: labelingTaskId, sliceId: dataSliceId } }).then((res) => {
            if (res['data'] == null) return;
            setProjectStats(postProcessingStats(JSON.parse(res['data']['generalProjectStats'])));
        });
    }

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (['label_created', 'label_deleted', 'labeling_task_deleted', 'labeling_task_updated', 'labeling_task_created', 'weak_supervision_finished'].includes(msgParts[1])) {
            refetchLabelingTasksAndProcess();
        } else if (['data_slice_created', 'data_slice_updated', 'data_slice_deleted'].includes(msgParts[1])) {
            refetchDataSlicesAndProcess();
        }
    }, []);

    useEffect(() => {
        if (!projectId) return;
        WebSocketsService.updateFunctionPointer(projectId, CurrentPage.PROJECT_OVERVIEW, handleWebsocketNotification)
    }, [handleWebsocketNotification, projectId]);

    return (<div>
        {projectId != null && <div className="pt-4 px-4 pb-20 bg-gray-100 flex-1 flex flex-col min-h-full h-screen overflow-y-auto">
            <ProjectOverviewHeader />
            <ProjectOverviewCards projectStats={projectStats} />
            {graphsHaveValues ? (<div>
                {(overviewFilters.graphType.value == DisplayGraphs.ALL || overviewFilters.graphType.value == DisplayGraphs.LABEL_DISTRIBUTION) && <div className="mt-8 grid w-full">
                    <div className="text-lg leading-6 text-gray-900 font-medium inline-block">Label distribution</div>
                    <div className="mt-1 text-sm leading-5 font-medium text-gray-700 inline-block">See the distribution of your manually labeled and weakly supervised records.</div>
                    <div className={`mt-2 w-full h-full shadow ${style.stats} bg-white grid place-items-center flex-grow`}>
                        {labelDistribution && <div className="h-full w-full p-5">
                            <LabelDistributionBarChart dataInput={labelDistribution} />
                        </div>}
                    </div>
                </div>}

                {(overviewFilters.graphType.value == DisplayGraphs.ALL || overviewFilters.graphType.value == DisplayGraphs.CONFIDENCE_DISTRIBUTION) && <div className="mt-8 grid w-full">
                    <div className="text-lg leading-6 text-gray-900 font-medium inline-block">Confidence distribution</div>
                    <div className="mt-1 text-sm leading-5 font-medium text-gray-700 inline-block">See the confidence distribution of your weakly supervised records.</div>
                    <div className={`mt-2 w-full h-full shadow ${style.stats} bg-white grid place-items-center flex-grow`}>
                        {confidenceDistribution && <div className="h-full w-full p-5">
                            <ConfidenceDistributionBarChart dataInput={confidenceDistribution} />
                        </div>}
                    </div>
                </div>}

                {(overviewFilters.graphType.value == DisplayGraphs.ALL || overviewFilters.graphType.value == DisplayGraphs.CONFUSION_MATRIX) && <div className="mt-8 grid w-full">
                    <div className="text-lg leading-6 text-gray-900 font-medium inline-block">Confusion matrix</div>
                    <div className="mt-1 text-sm leading-5 font-medium text-gray-700 inline-block">See how often your manually labeled and weakly supervised records agree or disagree.</div>
                    <div className={`mt-2 w-full h-full shadow ${style.stats} bg-white grid place-items-center flex-grow`}>
                        {confusionMatrix && displayConfusion ? (<ConfusionMatrixBarChart dataInput={confusionMatrix} />) : (<>
                            {displayConfusion ? (<div className={`flex items-center mb-3 ${style.statsTitle}`} style={{ height: '50px' }}>
                                <LoadingIcon />
                            </div>) : (<div className={`flex items-center ${style.statsTitle}`} style={{ height: '50px' }}>Tokenization is still running</div>)}
                        </>)}
                    </div>
                </div>}

                {((overviewFilters.graphType.value == DisplayGraphs.ALL || overviewFilters.graphType.value == DisplayGraphs.INTER_ANNOTATOR) && isManaged) && <div className="mt-8 grid w-full">
                    <div className="text-lg leading-6 text-gray-900 font-medium inline-block">Inter annotator agreement</div>
                    <div className="mt-1 text-sm leading-5 font-medium text-gray-700 inline-block">See how users agree or disagree on redundantely labeled records.</div>
                    {interAnnotatorMatrix && <div>
                        {interAnnotatorMatrix.countNames > (1 + (goldUserRequested ? 1 : 0)) ? (
                            <div className={`mt-2 w-full h-full shadow ${style.stats} bg-white grid place-items-center flex-grow`}>
                                {interAnnotatorMatrix && <div className="h-full w-full p-5">
                                    <InterAnnotatorBarChart dataInput={interAnnotatorMatrix} />
                                </div>}
                            </div>
                        ) : (<div className="mt-2">
                            {/* Intentionally commented */}
                            {/* {!isManaged && <div className="overflow-hidden h-80 rounded-lg bg-indigo-700 shadow-xl lg:grid lg:grid-cols-2 lg:gap-4">
                                <div className="px-6 pt-10 pb-12 sm:px-12 sm:pt-12 lg:py-12 lg:pr-0 xl:py-16 xl:px-16">
                                    <div className="lg:self-center">
                                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                            <span className="block">Do you require multi-user analytics?</span>
                                        </h2>
                                        <p className="mt-4 text-lg leading-6 text-indigo-200">Our open-source <span
                                            className="font-dmMono">refinery</span> comes with a managed multi-user
                                            version in
                                            the cloud, as well as an enterprise solution for on-premises deployment.
                                        </p>
                                        <a onClick={() => router.push('/users')}
                                            className="mt-8 cursor-pointer inline-flex items-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-indigo-600 shadow hover:bg-indigo-50">See
                                            our options</a>
                                    </div>
                                </div>
                                <div>
                                    <img src="https://images.unsplash.com/photo-1576502202167-791eca35a78d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2081&q=80"
                                        alt="App screenshot" />
                                </div>
                            </div>} */}
                            {isManaged && <div className={`mt-2 shadow ${style.stats} bg-white grid place-items-center flex-grow w-full h-full p-5`}>
                                <div className="text-center">
                                    <IconUsers size={48} className="mx-auto text-gray-400" />
                                    <h2 className="mt-2 text-lg font-medium text-gray-900">Label more data</h2>
                                    <p className="mt-1 text-sm text-gray-500">None of your records are labeled redundantely yet.</p>
                                </div>
                            </div>}
                        </div>)}
                    </div>}

                </div>}
            </div>
            ) : (<div>
                <div className="mt-8 text-lg leading-6 text-gray-900 font-medium inline-block">Monitoring</div>
                <div className="mt-1 text-sm leading-5 font-medium text-gray-700 block">Go to the settings page to add a labeling task.</div>
                <div className={`mt-2 shadow w-full ${style.stats} bg-white place-content-center p-4`}>
                    <div className={`${style.statsTitle}`}>Add Labels to display charts</div>
                </div></div>)}
        </div>}
    </div >);
}