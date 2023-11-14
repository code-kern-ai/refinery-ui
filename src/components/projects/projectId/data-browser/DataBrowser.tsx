import { selectProject } from "@/src/reduxStore/states/project"
import { useDispatch, useSelector } from "react-redux"
import DataBrowserSidebar from "./DataBrowserSidebar";
import { useLazyQuery } from "@apollo/client";
import { DATA_SLICES, SEARCH_RECORDS_EXTENDED } from "@/src/services/gql/queries/data-browser";
import { useEffect, useState } from "react";
import { setDataSlices, setSearchRecordsExtended, setUsersMapCount } from "@/src/reduxStore/states/pages/data-browser";
import { postProcessDataSlices, postProcessRecordsExtended, postProcessUsersCount } from "@/src/util/components/projects/projectId/data-browser/data-browser-helper";
import { GET_ATTRIBUTES_BY_PROJECT_ID, GET_EMBEDDING_SCHEMA_BY_PROJECT_ID, GET_LABELING_TASKS_BY_PROJECT_ID } from "@/src/services/gql/queries/project-setting";
import { selectLabelingTasksAll, setAllAttributes, setAllEmbeddings, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { postProcessingAttributes } from "@/src/util/components/projects/projectId/settings/data-schema-helper";
import { postProcessLabelingTasks, postProcessLabelingTasksSchema } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { GET_ORGANIZATION_USERS_WITH_COUNT } from "@/src/services/gql/queries/organizations";
import { selectAllUsers } from "@/src/reduxStore/states/general";
import DataBrowserRecords from "./DataBrowserRecords";
import { postProcessingEmbeddings } from "@/src/util/components/projects/projectId/settings/embeddings-helper";

const SEARCH_REQUEST = { offset: 0, limit: 20 };

export default function DataBrowser() {
    const dispatch = useDispatch();
    const project = useSelector(selectProject);
    const users = useSelector(selectAllUsers);
    const labelingTasks = useSelector(selectLabelingTasksAll);

    const [searchRequest, setSearchRequest] = useState(SEARCH_REQUEST);

    const [refetchDataSlices] = useLazyQuery(DATA_SLICES, { fetchPolicy: 'network-only' });
    const [refetchAttributes] = useLazyQuery(GET_ATTRIBUTES_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchLabelingTasksByProjectId] = useLazyQuery(GET_LABELING_TASKS_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchUsersCount] = useLazyQuery(GET_ORGANIZATION_USERS_WITH_COUNT, { fetchPolicy: "no-cache" });
    const [refetchExtendedRecord] = useLazyQuery(SEARCH_RECORDS_EXTENDED, { fetchPolicy: "no-cache" });
    const [refetchEmbeddings] = useLazyQuery(GET_EMBEDDING_SCHEMA_BY_PROJECT_ID, { fetchPolicy: "network-only" });

    useEffect(() => {
        if (!project) return;
        if (!users) return;
        refetchDataSlices({ variables: { projectId: project.id } }).then((res) => {
            dispatch(setDataSlices(postProcessDataSlices(res.data.dataSlices)));
        });
        refetchAttributesAndProcess();
        refetchLabelingTasksAndProcess();
        refetchUsersCountAndProcess();
        refetchEmbeddingsAndPostProcess();
    }, [project, users]);

    useEffect(() => {
        if (!project) return;
        if (!labelingTasks) return;
        refetchExtendedSearchAndProcess();
    }, [project, labelingTasks]);

    function refetchAttributesAndProcess() {
        refetchAttributes({ variables: { projectId: project.id, stateFilter: ['ALL'] } }).then((res) => {
            dispatch(setAllAttributes(postProcessingAttributes(res.data['attributesByProjectId'])));
        });
    }

    function refetchLabelingTasksAndProcess() {
        refetchLabelingTasksByProjectId({ variables: { projectId: project.id } }).then((res) => {

            // if this is something we need to do every time before we set the redux store why doesn't the redux store handle it on it's own? (goes for pretty much all setter if i see it right)
            const labelingTasks = postProcessLabelingTasks(res['data']['projectByProjectId']['labelingTasks']['edges']);
            dispatch(setLabelingTasksAll(postProcessLabelingTasksSchema(labelingTasks)));
        });
    }

    function refetchUsersCountAndProcess() {
        refetchUsersCount({ variables: { projectId: project.id } }).then((res) => {
            dispatch(setUsersMapCount(postProcessUsersCount(res.data['allUsersWithRecordCount'], users)));
        });
    }

    function refetchExtendedSearchAndProcess() {
        // JSON.striginfy({}) could be either a default/const that is calculated once or a string
        refetchExtendedRecord({ variables: { projectId: project.id, filterData: JSON.stringify({}), offset: searchRequest.offset, limit: searchRequest.limit } }).then((res) => {
            dispatch(setSearchRecordsExtended(postProcessRecordsExtended(res.data['searchRecordsExtended'], labelingTasks)));
        });
    }

    function refetchEmbeddingsAndPostProcess() {
        refetchEmbeddings({ variables: { projectId: project.id } }).then((res) => {
            const embeddings = postProcessingEmbeddings(res.data['projectByProjectId']['embeddings']['edges'].map((e) => e['node']), []);
            dispatch(setAllEmbeddings(embeddings));
        });
    }

    return (<>
        {project && <div className="flex flex-row h-full">
            <DataBrowserSidebar />
            <DataBrowserRecords />
        </div>}
    </>)
}