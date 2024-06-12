import { selectProjectId } from "@/src/reduxStore/states/project"
import { useDispatch, useSelector } from "react-redux"
import DataBrowserSidebar from "./DataBrowserSidebar";
import { useCallback, useEffect, useState } from "react";
import { expandRecordList, selectActiveSearchParams, selectActiveSlice, selectConfiguration, selectFullSearchStore, selectRecords, setActiveDataSlice, setDataSlices, setRecordComments, setSearchRecordsExtended, setUniqueValuesDict, setUsersMapCount, updateAdditionalDataState } from "@/src/reduxStore/states/pages/data-browser";
import { postProcessRecordsExtended, postProcessUniqueValues, postProcessUsersCount } from "@/src/util/components/projects/projectId/data-browser/data-browser-helper";
import { selectAttributes, selectLabelingTasksAll, setAllAttributes, setAllEmbeddings, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { postProcessLabelingTasks, postProcessLabelingTasksSchema } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { selectAllUsers, selectOrganizationId, selectUser, setComments } from "@/src/reduxStore/states/general";
import DataBrowserRecords from "./DataBrowserRecords";
import { postProcessingEmbeddings } from "@/src/util/components/projects/projectId/settings/embeddings-helper";
import { CommentType } from "@/src/types/shared/comments";
import { CommentDataManager } from "@/src/util/classes/comments";
import { useWebsocket } from "@/submodules/react-components/hooks/web-socket/useWebsocket";
import { getAllComments } from "@/src/services/base/comment";
import { getAttributes } from "@/src/services/base/attribute";
import { getDataSlices, getUniqueValuesByAttributes } from "@/src/services/base/dataSlices";
import { getLabelingTasksByProjectId } from "@/src/services/base/project";
import { getRecordComments, getRecordsByStaticSlice, searchRecordsExtended } from "@/src/services/base/data-browser";
import { getAllUsersWithRecordCount } from "@/src/services/base/organization";
import { getEmbeddings } from "@/src/services/base/embedding";
import { parseFilterToExtended } from "@/src/util/components/projects/projectId/data-browser/filter-parser-helper";
import { SearchGroup, Slice } from "@/submodules/javascript-functions/enums/enums";
import { Application, CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";

const SEARCH_REQUEST = { offset: 0, limit: 20 };

export default function DataBrowser() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const users = useSelector(selectAllUsers);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const attributes = useSelector(selectAttributes);
    const user = useSelector(selectUser);
    const recordList = useSelector(selectRecords).recordList;
    const activeSearchParams = useSelector(selectActiveSearchParams);
    const configuration = useSelector(selectConfiguration);
    const fullSearchStore = useSelector(selectFullSearchStore);
    const fullCount = useSelector(selectRecords).fullCount;
    const activeSlice = useSelector(selectActiveSlice);

    const [searchRequest, setSearchRequest] = useState(SEARCH_REQUEST);

    useEffect(() => {
        if (!projectId) return;
        if (!users || !user) return;
        refetchDataSlicesAndProcess();
        refetchAttributesAndProcess();
        refetchLabelingTasksAndProcess();
        refetchUsersCountAndProcess();
        refetchEmbeddingsAndPostProcess();
        refetchUniqueValuesAndProcess();
    }, [projectId, users, user]);

    useEffect(() => {
        if (!projectId || !labelingTasks || !recordList) return;
        refetchRecordCommentsAndProcess(recordList);
    }, [projectId, labelingTasks, recordList]);

    useEffect(() => {
        if (!projectId || !labelingTasks || !attributes) return;
        if (!searchRequest) return;
        if (searchRequest.offset == 0 || searchRequest.offset > fullCount) return;
        if (activeSlice && activeSlice.sliceType == Slice.STATIC_DEFAULT) {
            getRecordsByStaticSlice(projectId, activeSlice.id, {
                offset: searchRequest.offset, limit: searchRequest.limit
            }, (res) => {
                dispatch(expandRecordList(postProcessRecordsExtended(res.data['recordsByStaticSlice'], labelingTasks)));
            });
        } else {
            const filterData = parseFilterToExtended(activeSearchParams, attributes, configuration, labelingTasks, user, fullSearchStore[SearchGroup.DRILL_DOWN])
            searchRecordsExtended(projectId, filterData, searchRequest.offset, searchRequest.limit, (res) => {
                const parsedRecordData = postProcessRecordsExtended(res.data['searchRecordsExtended'], labelingTasks);
                dispatch(expandRecordList(parsedRecordData));
                refetchRecordCommentsAndProcess(parsedRecordData.recordList);
            });
        }
    }, [searchRequest, activeSearchParams, projectId, attributes, configuration, labelingTasks, user, fullSearchStore]);

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
        getAllComments(requestJsonString, (res) => {
            CommentDataManager.parseCommentData(res.data['getAllComments']);
            CommentDataManager.parseToCurrentData(users);
            dispatch(setComments(CommentDataManager.currentDataOrder));
        });
    }

    function refetchDataSlicesAndProcess(dataSliceId?: string) {
        getDataSlices(projectId, null, (res) => {
            dispatch(setDataSlices(res.data.dataSlices));
            if (dataSliceId) {
                const findSlice = res.data.dataSlices.find((slice) => slice.id == dataSliceId);
                if (findSlice) dispatch(setActiveDataSlice(findSlice));
            }
        });
    }

    function refetchAttributesAndProcess() {
        getAttributes(projectId, ['ALL'], (res) => {
            dispatch(setAllAttributes(res.data['attributesByProjectId']));
        });
    }

    function refetchLabelingTasksAndProcess() {
        getLabelingTasksByProjectId(projectId, (res) => {
            const labelingTasks = postProcessLabelingTasks(res['data']['projectByProjectId']['labelingTasks']['edges']);
            dispatch(setLabelingTasksAll(postProcessLabelingTasksSchema(labelingTasks)));
        });
    }

    function refetchUsersCountAndProcess() {
        getAllUsersWithRecordCount(projectId, (res) => {
            dispatch(setUsersMapCount(postProcessUsersCount(res.data['allUsersWithRecordCount'], users, user)));
        });
    }

    function refetchEmbeddingsAndPostProcess() {
        getEmbeddings(projectId, (res) => {
            const embeddings = postProcessingEmbeddings(res.data['projectByProjectId']['embeddings']['edges'].map((e) => e['node']), []);
            dispatch(setAllEmbeddings(embeddings));
        });
    }

    function refetchRecordCommentsAndProcess(parsedRecordData: any) {
        const currentRecordIds = parsedRecordData?.map((record) => record.id);
        if (!currentRecordIds || currentRecordIds.length == 0) return;
        getRecordComments(projectId, currentRecordIds, (res) => {
            dispatch(setRecordComments(res.data['recordComments']));
        });
    }

    function getNextRecords() {
        setSearchRequest({ offset: searchRequest.offset + searchRequest.limit, limit: searchRequest.limit });
    }

    function refetchUniqueValuesAndProcess() {
        getUniqueValuesByAttributes(projectId, (res) => {
            dispatch(setUniqueValuesDict(postProcessUniqueValues(res.data['uniqueValuesByAttributes'], attributes)));
        });
    }

    const setSearchRequestToInit = useCallback(() => {
        setSearchRequest(SEARCH_REQUEST);
    }, []);

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (['data_slice_created', 'data_slice_updated', 'data_slice_deleted'].includes(msgParts[1])) {
            refetchDataSlicesAndProcess(msgParts[2]);
            if (msgParts[1] == 'data_slice_deleted') {
                dispatch(updateAdditionalDataState('displayOutdatedWarning', false));
                dispatch(updateAdditionalDataState('clearFullSearch', true));
            }
        } else if (['label_created', 'label_deleted', 'labeling_task_deleted', 'labeling_task_updated', 'labeling_task_created', 'information_source_created', 'information_source_updated', 'information_source_deleted'].includes(msgParts[1])) {
            refetchLabelingTasksAndProcess();
        } else if (['calculate_attribute', 'attributes_updated'].includes(msgParts[1])) {
            refetchAttributesAndProcess();
        } else if ((msgParts[1] == 'embedding' && msgParts[3] == "state" && msgParts[4] == "FINISHED") || msgParts[1] == 'embedding_deleted') {
            refetchEmbeddingsAndPostProcess();
        }
    }, [projectId]);

    const orgId = useSelector(selectOrganizationId);
    useWebsocket(orgId, Application.REFINERY, CurrentPage.DATA_BROWSER, handleWebsocketNotification, projectId);

    return (<>
        {projectId && <div className="flex flex-row h-full">
            <DataBrowserSidebar />
            <DataBrowserRecords refetchNextRecords={getNextRecords} clearSearchRequest={setSearchRequestToInit} />
        </div>}
    </>)
}
