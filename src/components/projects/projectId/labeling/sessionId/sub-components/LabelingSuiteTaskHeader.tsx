import { selectLabelingTasksAll, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { GET_LABELING_TASKS_BY_PROJECT_ID } from "@/src/services/gql/queries/project-setting";
import { ComponentType } from "@/src/types/components/projects/projectId/labeling/settings";
import { LabelingSuiteTaskHeaderDisplayData } from "@/src/types/components/projects/projectId/labeling/task-header";
import { LabelingTaskTaskType } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { SettingManager } from "@/src/util/classes/labeling/settings-manager";
import { getHoverGroupsTaskOverview, setLabelsForDisplay } from "@/src/util/components/projects/projectId/labeling/task-header-helper";
import { postProcessLabelingTasks, postProcessLabelingTasksSchema } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from "@/src/styles/components/projects/projectId/labeling.module.css";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import QuickButtons from "./QuickButtons";
import HeaderDisplay from "./HeaderDisplay";
import { selectSettings, updateSettings } from "@/src/reduxStore/states/pages/labeling";

export default function LabelingSuiteTaskHeader() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const settings = useSelector(selectSettings);

    const [displayData, setDisplayData] = useState<LabelingSuiteTaskHeaderDisplayData[]>(null);

    const [refetchLabelingTasksByProjectId] = useLazyQuery(GET_LABELING_TASKS_BY_PROJECT_ID, { fetchPolicy: "network-only" });

    useEffect(() => {
        if (!projectId) return;
        refetchLabelingTasksAndProcess();
    }, [projectId]);

    useEffect(() => {
        if (!projectId) return;
        if (!labelingTasks) return;
        setDisplayData(prepareDataForDisplay(labelingTasks))
    }, [projectId, labelingTasks]);

    function refetchLabelingTasksAndProcess() {
        refetchLabelingTasksByProjectId({ variables: { projectId: projectId } }).then((res) => {
            const labelingTasks = postProcessLabelingTasks(res['data']['projectByProjectId']['labelingTasks']['edges']);
            dispatch(setLabelingTasksAll(postProcessLabelingTasksSchema(labelingTasks)))
        });
    }

    function prepareDataForDisplay(data: any[]): any {
        if (!data) return null;
        if (!settings) return null;
        const finalData = Array(data.length);
        let i = 0;
        for (const task of data) {
            const taskCopy = jsonCopy(task);
            let taskSettings = settings?.task[projectId][task.id];
            if (!taskSettings) {
                taskSettings = {};
                const settingsConfCopy = { ...settings };
                settingsConfCopy.task[projectId][task.id] = taskSettings;
                dispatch(updateSettings(ComponentType.LABELING, 'task', settingsConfCopy.task))
            }
            taskCopy.labels.sort((a, b) => a.name.localeCompare(b.name));
            const labels = setLabelsForDisplay(taskCopy, settings.task[projectId]);
            let pos = taskCopy.taskType == LabelingTaskTaskType.INFORMATION_EXTRACTION ? 0 : 10000;
            pos += taskCopy.attribute ? taskCopy.attribute.relativePosition : 0;
            finalData[i++] = {
                id: taskCopy.id,
                name: taskCopy.name,
                hoverGroups: getHoverGroupsTaskOverview(taskCopy.name),
                orderPos: pos,
                settings: taskSettings,
                labels: labels,
                labelOrder: task.labels.map(l => l.id),//labels are sorted by name before
            };
        }

        finalData.sort((a, b) => a.orderPos - b.orderPos || a.name.localeCompare(b.name));
        return finalData;
    }

    function toggleIsCollapsed() {
        dispatch(updateSettings(ComponentType.TASK_HEADER, 'isCollapsed'))
    }

    return (<div className="relative bg-white p-4">
        {displayData && displayData.length > 0 ? (<>
            <div className={`absolute top-4 right-4 p-2 cursor-pointer ${settings.task.isCollapsed ? style.rotateTransform : null}`} onClick={toggleIsCollapsed}>
                <IconLayoutNavbarCollapse size={24} stroke={2} />
            </div>
            {settings.task.isCollapsed ? (<div className="flex flex-row flex-wrap gap-x-2">
                <QuickButtons />
            </div>) : (<HeaderDisplay displayData={displayData} />)}
        </>) : (<p className="text-gray-500">No labeling tasks in project</p>)}
    </div>)
}