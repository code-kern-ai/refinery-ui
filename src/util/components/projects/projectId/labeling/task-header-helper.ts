import { LabelingSuiteSettings } from "@/src/types/components/projects/projectId/labeling/settings";
import { HoverGroupTarget, LabelingSuiteTaskHeaderLabelDisplayData, QuickButtonConfig } from "@/src/types/components/projects/projectId/labeling/task-header";
import { SettingManager } from "@/src/util/classes/labeling/settings-manager";

export function getQuickButtonConfig(): QuickButtonConfig {
    return {
        showManual: ['bg-green-200', 'bg-gray-200', 'bg-gray-200', 'bg-gray-200'],
        showWeakSupervision: ['bg-gray-200', 'bg-green-200', 'bg-gray-200', 'bg-gray-200'],
        showModel: ['bg-gray-200', 'bg-gray-200', 'bg-green-200', 'bg-gray-200'],
        showHeuristics: ['bg-gray-200', 'bg-gray-200', 'bg-gray-200', 'bg-green-200'],
        all: ['bg-green-200', 'bg-green-200', 'bg-green-200', 'bg-green-200'],
        nothing: ['bg-white', 'bg-white', 'bg-white', 'bg-white'],
        default: ['bg-green-200', 'bg-green-200', 'bg-white', 'bg-white'],
    }
}

export function setLabelsForDisplay(task: any, settings: any) {
    const labels = {};
    const taskSettings = settings[task.id];
    for (const label of task.labels) {
        if (!taskSettings) return;
        let labelSettings = taskSettings[label.id];
        if (!labelSettings) {
            labelSettings = SettingManager.getDefaultTaskOverviewLabelSettings();
            taskSettings[label.id] = labelSettings;
        }
        const data: LabelingSuiteTaskHeaderLabelDisplayData = {
            id: label.id,
            taskId: task.id,
            name: label.name,
            hoverGroups: getHoverGroupsTaskOverview(task.name, label.id),
            hotkey: label.hotkey,
            color: label.color
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
