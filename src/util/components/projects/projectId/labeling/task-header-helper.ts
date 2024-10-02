import { HoverGroupTarget, LabelingSuiteTaskHeaderLabelDisplayData, QuickButtonConfig } from "@/src/types/components/projects/projectId/labeling/task-header";
import { getDefaultTaskOverviewLabelSettings } from "./labeling-main-component-helper";
import { jsonCopy } from "@/submodules/javascript-functions/general";

export function getQuickButtonConfig(): QuickButtonConfig {
    return {
        showManual: ['bg-green-200', 'bg-gray-200', 'bg-gray-200', 'bg-gray-200'],
        showWeakSupervision: ['bg-gray-200', 'bg-green-200', 'bg-gray-200', 'bg-gray-200'],
        showHeuristics: ['bg-gray-200', 'bg-gray-200', 'bg-gray-200', 'bg-green-200'],
        all: ['bg-green-200', 'bg-green-200', 'bg-green-200', 'bg-green-200'],
        nothing: ['bg-white', 'bg-white', 'bg-white', 'bg-white'],
        default: ['bg-green-200', 'bg-green-200', 'bg-white', 'bg-white'],
    }
}

export function setLabelsForDisplay(task: any, settings: any) {
    const labels = {};
    const settingsCopy = jsonCopy(settings);
    for (const label of task.labels) {
        let taskSettings = settingsCopy[task.id];
        if (!taskSettings) {
            const labelSettings = getDefaultTaskOverviewLabelSettings();
            taskSettings = { ...taskSettings, [label.id]: labelSettings }
        } else {
            let labelSettings = taskSettings[label.id];
            if (!labelSettings) {
                labelSettings = getDefaultTaskOverviewLabelSettings();
                taskSettings = { ...taskSettings, [label.id]: labelSettings }
            }
        }
        const data: LabelingSuiteTaskHeaderLabelDisplayData = {
            id: label.id,
            taskId: task.id,
            name: label.name,
            hoverGroups: getHoverGroupsTaskOverview(task.name, label.id),
            hotkey: label.hotkey,
            color: label.color,
            showHeuristics: taskSettings[label.id].showHeuristics,
            showManual: taskSettings[label.id].showManual,
            showWeakSupervision: taskSettings[label.id].showWeakSupervision,
        }
        labels[label.id] = data;
    }
    return labels;
}

export function getHoverGroupsTaskOverview(taskName: string, labelId?: string): any {
    const all: any = {
        task: "TA_" + taskName, //names are unique
    }
    if (labelId) {
        all.label = "LA_" + labelId;
        all.label += ",LAX_" + labelId; // helper for additional group for highlighting in label view
        return getHoverGroupFor(HoverGroupTarget.LABEL, all);
    }
    return getHoverGroupFor(HoverGroupTarget.TASK, all);
}

export function getHoverGroupFor(first: HoverGroupTarget, all: any): string {

    let finalString = all[first];
    for (let key in all) {
        if (key == first) continue;
        finalString += "," + all[key];
    }
    return finalString;
}
