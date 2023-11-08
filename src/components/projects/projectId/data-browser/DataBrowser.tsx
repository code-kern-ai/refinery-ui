import { selectProject } from "@/src/reduxStore/states/project"
import { useDispatch, useSelector } from "react-redux"
import DataBrowserSidebar from "./DataBrowserSidebar";
import { useLazyQuery } from "@apollo/client";
import { DATA_SLICES } from "@/src/services/gql/queries/data-slices";
import { useEffect } from "react";
import { setDataSlices, setUsersMapCount } from "@/src/reduxStore/states/pages/data-browser";
import { postProcessDataSlices, postProcessUsersCount } from "@/src/util/components/projects/projectId/data-browser/data-browser-helper";
import { GET_ATTRIBUTES_BY_PROJECT_ID, GET_LABELING_TASKS_BY_PROJECT_ID } from "@/src/services/gql/queries/project-setting";
import { setAllAttributes, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { postProcessingAttributes } from "@/src/util/components/projects/projectId/settings/data-schema-helper";
import { postProcessLabelingTasks, postProcessLabelingTasksSchema } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { GET_ORGANIZATION_USERS_WITH_COUNT } from "@/src/services/gql/queries/organizations";
import { selectAllUsers } from "@/src/reduxStore/states/general";

export default function DataBrowser() {
    const dispatch = useDispatch();
    const project = useSelector(selectProject);
    const users = useSelector(selectAllUsers);

    const [refetchDataSlices] = useLazyQuery(DATA_SLICES, { fetchPolicy: 'network-only' });
    const [refetchAttributes] = useLazyQuery(GET_ATTRIBUTES_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchLabelingTasksByProjectId] = useLazyQuery(GET_LABELING_TASKS_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchUsersCount] = useLazyQuery(GET_ORGANIZATION_USERS_WITH_COUNT, { fetchPolicy: "no-cache" });

    useEffect(() => {
        if (!project) return;
        if (!users) return;
        refetchDataSlices({ variables: { projectId: project.id } }).then((res) => {
            dispatch(setDataSlices(postProcessDataSlices(res.data.dataSlices)));
        });
        refetchAttributesAndProcess();
        refetchLabelingTasksAndProcess();
        refetchUsersCountAndProcess();
    }, [project, users]);

    function refetchAttributesAndProcess() {
        refetchAttributes({ variables: { projectId: project.id, stateFilter: ['ALL'] } }).then((res) => {
            dispatch(setAllAttributes(postProcessingAttributes(res.data['attributesByProjectId'])));
        });
    }

    function refetchLabelingTasksAndProcess() {
        refetchLabelingTasksByProjectId({ variables: { projectId: project.id } }).then((res) => {
            const labelingTasks = postProcessLabelingTasks(res['data']['projectByProjectId']['labelingTasks']['edges']);
            dispatch(setLabelingTasksAll(postProcessLabelingTasksSchema(labelingTasks)));
        });
    }

    function refetchUsersCountAndProcess() {
        refetchUsersCount({ variables: { projectId: project.id } }).then((res) => {
            dispatch(setUsersMapCount(postProcessUsersCount(res.data['allUsersWithRecordCount'], users)));
        });
    }

    return (<>
        {project && <div className="flex flex-row h-full">
            <DataBrowserSidebar />
        </div>}
    </>)
}