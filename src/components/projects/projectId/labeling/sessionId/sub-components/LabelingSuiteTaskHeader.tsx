import { selectLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { ComponentType } from "@/src/types/components/projects/projectId/labeling/settings";
import { LabelingSuiteTaskHeaderDisplayData } from "@/src/types/components/projects/projectId/labeling/task-header";
import { LabelingTaskTaskType } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { getHoverGroupsTaskOverview, setLabelsForDisplay } from "@/src/util/components/projects/projectId/labeling/task-header-helper";
import { arrayToDict, jsonCopy } from "@/submodules/javascript-functions/general";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from "@/src/styles/components/projects/projectId/labeling.module.css";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import QuickButtons from "./QuickButtons";
import HeaderDisplay from "./HeaderDisplay";
import { selectSettings, setHoverGroupDict, setSettings, updateSettings } from "@/src/reduxStore/states/pages/labeling";
import { LabelingPageParts } from "@/src/types/components/projects/projectId/labeling/labeling-main-component";

export default function LabelingSuiteTaskHeader() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const settings = useSelector(selectSettings);

    const [displayData, setDisplayData] = useState<LabelingSuiteTaskHeaderDisplayData[]>(null);

    useEffect(() => {
        if (!projectId) return;
        if (!labelingTasks) return;
        setDisplayData(prepareDataForDisplay(labelingTasks))
    }, [projectId, labelingTasks]);

    function prepareDataForDisplay(data: any[]): any {
        if (!data) return null;
        if (!settings) return null;
        const finalData = Array(data.length);
        let i = 0;
        const settingsCopy = jsonCopy(settings);
        for (const task of data) {
            const taskCopy = jsonCopy(task);
            if (!settingsCopy.task[projectId]) settingsCopy.task[projectId] = {};
            let taskSettings = settingsCopy.task[projectId][taskCopy.id];
            if (!taskSettings) {
                taskSettings = {};
                settingsCopy.task[projectId][taskCopy.id] = taskSettings;
            }
            taskCopy.labels.sort((a, b) => a.name.localeCompare(b.name));
            const labels = setLabelsForDisplay(taskCopy, taskSettings);
            let pos = task.taskType == LabelingTaskTaskType.INFORMATION_EXTRACTION ? 0 : 10000;
            pos += task.attribute ? task.attribute.relativePosition : 0;
            finalData[i++] = {
                id: task.id,
                name: task.name,
                hoverGroups: getHoverGroupsTaskOverview(task.name),
                orderPos: pos,
                settings: taskSettings,
                labels: labels,
                labelOrder: task.labels.map(l => l.id),//labels are sorted by name before
            };
            settingsCopy.task[projectId][taskCopy.id] = labels;
        }
        const settingsCopy2 = jsonCopy(settings);
        settingsCopy2.task[projectId] = settingsCopy.task[projectId];
        dispatch(setSettings(settingsCopy2));

        const labelIds = finalData.map(d => d.labelOrder).flat();
        const labels = arrayToDict(labelingTasks.map(t => t.labels).flat(), "id");
        for (const labelId of labelIds) {
            labels[labelId] = {
                [LabelingPageParts.TASK_HEADER]: false,
                [LabelingPageParts.OVERVIEW_TABLE]: false,
                [LabelingPageParts.TABLE_MODAL]: false,
                [LabelingPageParts.MANUAL]: false,
                [LabelingPageParts.WEAK_SUPERVISION]: false,
            }
        }
        dispatch(setHoverGroupDict(labels));

        finalData.sort((a, b) => a.orderPos - b.orderPos || a.name.localeCompare(b.name));
        return finalData;
    }

    function toggleIsCollapsed() {
        dispatch(updateSettings(ComponentType.TASK_HEADER, 'isCollapsed'))
    }

    return (<div id="base-dom-task-header" className="relative bg-white p-4">
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