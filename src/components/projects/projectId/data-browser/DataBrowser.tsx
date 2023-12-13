import { selectProjectId } from "@/src/reduxStore/states/project"
import { useDispatch, useSelector } from "react-redux"
import DataBrowserSidebar from "./DataBrowserSidebar";
import { useLazyQuery } from "@apollo/client";
import { DATA_SLICES, GET_RECORD_COMMENTS, SEARCH_RECORDS_EXTENDED } from "@/src/services/gql/queries/data-browser";
import { useCallback, useEffect, useState } from "react";
import { expandRecordList, setDataSlices, setRecordComments, setSearchRecordsExtended, setUsersMapCount, updateAdditionalDataState } from "@/src/reduxStore/states/pages/data-browser";
import { postProcessDataSlices, postProcessRecordComments, postProcessRecordsExtended, postProcessUsersCount } from "@/src/util/components/projects/projectId/data-browser/data-browser-helper";
import { GET_ATTRIBUTES_BY_PROJECT_ID, GET_EMBEDDING_SCHEMA_BY_PROJECT_ID, GET_LABELING_TASKS_BY_PROJECT_ID } from "@/src/services/gql/queries/project-setting";
import { selectLabelingTasksAll, setAllAttributes, setAllEmbeddings, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { postProcessingAttributes } from "@/src/util/components/projects/projectId/settings/data-schema-helper";
import { postProcessLabelingTasks, postProcessLabelingTasksSchema } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { GET_ORGANIZATION_USERS_WITH_COUNT } from "@/src/services/gql/queries/organizations";
import { selectAllUsers, setComments } from "@/src/reduxStore/states/general";
import DataBrowserRecords from "./DataBrowserRecords";
import { postProcessingEmbeddings } from "@/src/util/components/projects/projectId/settings/embeddings-helper";
import { WebSocketsService } from "@/src/services/base/web-sockets/WebSocketsService";
import { CurrentPage } from "@/src/types/shared/general";
import { CommentType } from "@/src/types/shared/comments";
import { CommentDataManager } from "@/src/util/classes/comments";
import { REQUEST_COMMENTS } from "@/src/services/gql/queries/projects";

const SEARCH_REQUEST = { offset: 0, limit: 20 };

export default function DataBrowser() {
    const dispatch = useDispatch();
    const projectId = useSelector(selectProjectId);
    const users = useSelector(selectAllUsers);
    const labelingTasks = useSelector(selectLabelingTasksAll);

    const [searchRequest, setSearchRequest] = useState(SEARCH_REQUEST);
    const [clearFullSearch, setClearFullSearch] = useState(false);

    const [refetchDataSlices] = useLazyQuery(DATA_SLICES, { fetchPolicy: 'network-only' });
    const [refetchAttributes] = useLazyQuery(GET_ATTRIBUTES_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchLabelingTasksByProjectId] = useLazyQuery(GET_LABELING_TASKS_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchUsersCount] = useLazyQuery(GET_ORGANIZATION_USERS_WITH_COUNT, { fetchPolicy: "no-cache" });
    const [refetchExtendedRecord] = useLazyQuery(SEARCH_RECORDS_EXTENDED, { fetchPolicy: "no-cache" });
    const [refetchEmbeddings] = useLazyQuery(GET_EMBEDDING_SCHEMA_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchRecordComments] = useLazyQuery(GET_RECORD_COMMENTS, { fetchPolicy: "no-cache" });
    const [refetchComments] = useLazyQuery(REQUEST_COMMENTS, { fetchPolicy: "no-cache" });

    useEffect(() => {
        if (!projectId) return;
        if (!users) return;
        refetchDataSlicesAndProcess();
        refetchAttributesAndProcess();
        refetchLabelingTasksAndProcess();
        refetchUsersCountAndProcess();
        refetchEmbeddingsAndPostProcess();
        WebSocketsService.subscribeToNotification(CurrentPage.DATA_BROWSER, {
            projectId: projectId,
            whitelist: ['data_slice_created', 'data_slice_updated', 'data_slice_deleted', 'label_created', 'label_deleted', 'labeling_task_deleted', 'labeling_task_updated', 'labeling_task_created', 'information_source_created', 'information_source_updated', 'information_source_deleted', 'attributes_updated', 'calculate_attribute', 'embedding', 'embedding_deleted'],
            func: handleWebsocketNotification
        });
    }, [projectId, users]);

    useEffect(() => {
        if (!projectId) return;
        if (!labelingTasks) return;
        refetchExtendedSearchAndProcess();
    }, [projectId, labelingTasks]);

    useEffect(() => {
        if (!projectId) return;
        if (!searchRequest) return;
        if (searchRequest.offset == 0) return;
        refetchExtendedRecord({ variables: { projectId: projectId, filterData: JSON.stringify({}), offset: searchRequest.offset, limit: searchRequest.limit } }).then((res) => {
            const parsedRecordData = postProcessRecordsExtended(res.data['searchRecordsExtended'], labelingTasks);
            dispatch(expandRecordList(parsedRecordData));
            refetchRecordCommentsAndProcess(parsedRecordData.recordList);
        });
    }, [searchRequest]);

    useEffect(() => {
        if (!projectId || users.length == 0) return;
        setUpCommentsRequests();
    }, [users, projectId]);

    function setUpCommentsRequests() {
        const requests = [];
        requests.push({ commentType: CommentType.ATTRIBUTE, projectId: projectId });
        requests.push({ commentType: CommentType.LABELING_TASK, projectId: projectId });
        requests.push({ commentType: CommentType.DATA_SLICE, projectId: projectId });
        requests.push({ commentType: CommentType.HEURISTIC, projectId: projectId });
        requests.push({ commentType: CommentType.EMBEDDING, projectId: projectId });
        requests.push({ commentType: CommentType.LABEL, projectId: projectId });
        CommentDataManager.unregisterCommentRequests(CurrentPage.DATA_BROWSER);
        CommentDataManager.registerCommentRequests(CurrentPage.DATA_BROWSER, requests);
        const requestJsonString = CommentDataManager.buildRequestJSON();
        refetchComments({ variables: { requested: requestJsonString } }).then((res) => {
            CommentDataManager.parseCommentData(JSON.parse(res.data['getAllComments']));
            CommentDataManager.parseToCurrentData(users);
            dispatch(setComments(CommentDataManager.currentDataOrder));
        });
    }

    function refetchDataSlicesAndProcess() {
        refetchDataSlices({ variables: { projectId: projectId } }).then((res) => {
            dispatch(setDataSlices(postProcessDataSlices(res.data.dataSlices)));
        });
    }

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

    function refetchUsersCountAndProcess() {
        refetchUsersCount({ variables: { projectId: projectId } }).then((res) => {
            dispatch(setUsersMapCount(postProcessUsersCount(res.data['allUsersWithRecordCount'], users)));
        });
    }

    function refetchExtendedSearchAndProcess() {
        refetchExtendedRecord({ variables: { projectId: projectId, filterData: JSON.stringify({}), offset: searchRequest.offset, limit: searchRequest.limit } }).then((res) => {
            const parsedRecordData = postProcessRecordsExtended(res.data['searchRecordsExtended'], labelingTasks);
            dispatch(setSearchRecordsExtended(parsedRecordData));
            refetchRecordCommentsAndProcess(parsedRecordData.recordList);
        });
    }

    function refetchEmbeddingsAndPostProcess() {
        refetchEmbeddings({ variables: { projectId: projectId } }).then((res) => {
            const embeddings = postProcessingEmbeddings(res.data['projectByProjectId']['embeddings']['edges'].map((e) => e['node']), []);
            dispatch(setAllEmbeddings(embeddings));
        });
    }

    function refetchRecordCommentsAndProcess(parsedRecordData: any) {
        const currentRecordIds = parsedRecordData?.map((record) => record.id);
        if (!currentRecordIds || currentRecordIds.length == 0) return;
        refetchRecordComments({ variables: { projectId: projectId, recordIds: currentRecordIds } }).then((res) => {
            dispatch(setRecordComments(postProcessRecordComments(res.data['recordComments'])));
        });
    }

    function getNextRecords() {
        setSearchRequest({ offset: searchRequest.offset + searchRequest.limit, limit: searchRequest.limit });
    }

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (['data_slice_created', 'data_slice_updated', 'data_slice_deleted'].includes(msgParts[1])) {
            refetchDataSlicesAndProcess();
        } else if (['label_created', 'label_deleted', 'labeling_task_deleted', 'labeling_task_updated', 'labeling_task_created', 'information_source_created', 'information_source_updated', 'information_source_deleted'].includes(msgParts[1])) {
            refetchLabelingTasksAndProcess();
        } else if (['calculate_attribute', 'attributes_updated'].includes(msgParts[1])) {
            refetchAttributesAndProcess();
        } else if ((msgParts[1] == 'embedding' && msgParts[3] == "state" && msgParts[4] == "FINISHED") || msgParts[1] == 'embedding_deleted') {
            refetchEmbeddingsAndPostProcess();
        }
    }, [projectId]);

    useEffect(() => {
        if (!projectId) return;
        WebSocketsService.updateFunctionPointer(projectId, CurrentPage.DATA_BROWSER, handleWebsocketNotification)
    }, [handleWebsocketNotification, projectId]);

    return (<>
        {projectId && <div className="flex flex-row h-full">
            <DataBrowserSidebar clearFullSearch={clearFullSearch} />
            <DataBrowserRecords clearFullSearch={(val) => setClearFullSearch(val)} refetchNextRecords={getNextRecords} />
        </div>}
    </>)
}