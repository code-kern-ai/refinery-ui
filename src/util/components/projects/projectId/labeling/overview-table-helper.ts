import { TableDisplayData } from "@/src/types/components/projects/projectId/labeling/overview-table";
import { HoverGroupTarget } from "@/src/types/components/projects/projectId/labeling/task-header";
import { User } from "@/src/types/shared/general";
import { UserRole } from "@/src/types/shared/sidebar";
import { informationSourceTypeToString, labelSourceToString } from "@/submodules/javascript-functions/enums/enum-functions";
import { InformationSourceType, LabelSource } from "@/submodules/javascript-functions/enums/enums";
import { ALL_USERS_USER_ID, GOLD_STAR_USER_ID, getDefaultTaskOverviewLabelSettings } from "./labeling-main-component-helper";
import { LabelingSuiteTaskHeaderLabelSettings } from "@/src/types/components/projects/projectId/labeling/settings";
import { jsonCopy } from "@/submodules/javascript-functions/general";

export function rlasHaveHeuristicData(rlas): boolean {
    if (!rlas) return false;
    for (const el of rlas) {
        if (el.sourceType == LabelSource.INFORMATION_SOURCE) return true;
    }
    return false;
}

export function buildOverviewTableDisplayArray(rlas, user: User, userDisplayRole): TableDisplayData[] {
    if (!rlas) return [];
    let result = Array(rlas.length);
    let i = 0;
    for (let e of rlas) {
        result[i++] = {
            hoverGroups: getHoverGroupsOverviewTable(e),
            orderPos: getLabelSourceOrder(e.sourceType, e.informationSource?.type),
            orderPosSec: getOrderPos(e),
            sourceType: getSourceTypeText(e),
            sourceTypeKey: e.sourceType,
            taskName: e.labelingTaskLabel.labelingTask.name,
            taskId: e.labelingTaskLabel.labelingTask.id,
            createdBy: getCreatedByName(e),
            label: getLabelData(e),
            canBeDeleted: canDeleteRla(e, user, userDisplayRole),
            rla: e,
            user: e.user,
            shouldHighlightOn: getShouldHighlightOn(e),
        };
    }
    result.sort((a, b) => a.orderPos - b.orderPos || a.orderPosSec - b.orderPosSec || a.createdBy.localeCompare(b.createdBy) || a.label.name.localeCompare(b.label.name));
    return result;
}

export function getHoverGroupsOverviewTable(data: any): any {
    const all: any = {
        task: "TA_" + data.labelingTaskLabel.labelingTask.name, //names are unique
        type: "TY_" + (data.sourceType == LabelSource.INFORMATION_SOURCE ? informationSourceTypeToString(data.informationSource.type, false) : labelSourceToString(data.sourceType)),
        label: "LA_" + data.labelingTaskLabel.id,
        createdBy: "CR_" + (data.sourceType == LabelSource.INFORMATION_SOURCE ? data.informationSource.name : data.user.id),
        rlaId: "ID_" + data.id,
    }
    return {
        type: getHoverGroupFor(HoverGroupTarget.TYPE, all) + ",TYPE",
        task: getHoverGroupFor(HoverGroupTarget.TASK, all) + ",TASK",
        label: getHoverGroupFor(HoverGroupTarget.LABEL, all) + ",LABEL",
        labelClass: getHoverClassLabel(data.sourceType),
        createdBy: getHoverGroupFor(HoverGroupTarget.CREATED_BY, all) + ",CR",
        rlaId: getHoverGroupFor(HoverGroupTarget.RLA_ID, all) + ",RLA",
    }
}

export function getHoverGroupFor(first: HoverGroupTarget, all: any): string {

    let finalString = all[first];
    for (let key in all) {
        if (key == first) continue;
        finalString += "," + all[key];
    }
    return finalString;
}

export function getHoverClassLabel(type: LabelSource): string {
    switch (type) {
        case LabelSource.MANUAL:
            return "label-overlay-manual";
        case LabelSource.INFORMATION_SOURCE:
            return "label-overlay-heuristic";
        case LabelSource.WEAK_SUPERVISION:
            return "label-overlay-weak-supervision";
        default:
            return "";
    }
}

export function getLabelSourceOrder(source: LabelSource, isType?: InformationSourceType): number {
    switch (source) {
        case LabelSource.MANUAL: return 0;
        case LabelSource.WEAK_SUPERVISION: return 1;
        case LabelSource.INFORMATION_SOURCE:
            switch (isType) {
                case InformationSourceType.LABELING_FUNCTION: return 30;
                case InformationSourceType.ACTIVE_LEARNING: return 31;
                case InformationSourceType.PRE_COMPUTED: return 32;
                default: return 35;
            }
        default: return 9999;
    }
}

export function getOrderPos(e: any): number {
    let pos = e.labelingTaskLabel.labelingTask.attribute?.relativePosition * 1000;
    if (!pos) pos = 100000;
    pos += e.tokenStartIdx;
    return pos;
}

export function getSourceTypeText(e: any): string {
    if (e.sourceType == LabelSource.INFORMATION_SOURCE) return informationSourceTypeToString(e.informationSource.type, false);
    let final = labelSourceToString(e.sourceType);
    if (e.isGoldStar) final += ' gold ⭐';
    return final;
}

export function getCreatedByName(e: any): string {
    if (e.sourceType == LabelSource.INFORMATION_SOURCE) return e.informationSource.name;
    if (!e.createdBy || e.createdBy == "NULL") return '-';
    else if (!e.user?.firstName) return 'Unknown User ID';
    else {
        return e.user.firstName + ' ' + e.user.lastName;
    }
}

export function getLabelData(e: any): any {
    let value = e.value;
    if (value) value = '(' + value + ')';
    const color = e.labelingTaskLabel.color
    return {
        name: e.labelingTaskLabel.name,
        id: e.labelingTaskLabel.id,
        value: value,
        backgroundColor: 'bg-' + color + '-100',
        textColor: 'text-' + color + '-700',
        borderColor: 'border-' + color + '-400',
    }
}

export function canDeleteRla(rla, user, userDisplayRole): boolean {
    if (rla.sourceType != LabelSource.MANUAL) return false;
    if (user.role != userDisplayRole && userDisplayRole != UserRole.ENGINEER) return false;
    if (rla.isGoldStar) return true;
    return rla.createdBy == user.id;
}

export function getEmptyHeaderHover() {
    //holds dummy group as first element to not use a main group
    return {
        class: 'bg-gray-200 font-semibold',
        typeCollection: ['Type'],
        taskCollection: ['Task'],
        labelCollection: ['Label'],
        createdByCollection: ['Created by'],
        rlaCollection: ['RLA ID'],
    }
}

export function filterRlaDataForUser(rlaData: any[], user: User, displayUserId: string, userDisplayRole: UserRole, rlaKey?: string,): any[] {
    if (rlaKey) return rlaData.filter(entry => filterRlaCondition(entry[rlaKey], user, displayUserId, userDisplayRole));
    return rlaData.filter(rla => filterRlaCondition(rla, user, displayUserId, userDisplayRole));
}

export function filterRlaCondition(rla, user, displayUserId, userDisplayRole): boolean {
    if (user.role != UserRole.ENGINEER || userDisplayRole != UserRole.ENGINEER) return rla.sourceType == LabelSource.MANUAL && rla.createdBy == displayUserId;
    if (rla.sourceType != LabelSource.MANUAL) return true;
    if (displayUserId == ALL_USERS_USER_ID) return true;
    if (!!rla.isGoldStar) return displayUserId == GOLD_STAR_USER_ID;
    return rla.createdBy == displayUserId;
}

export function filterRlaLabelCondition(rla: any, settings, projectId): boolean {
    const taskId = rla.labelingTaskLabel.labelingTask.id;
    let taskSettings = settings.task[projectId][taskId];
    if (!taskSettings) {
        taskSettings = {};
        const settingsCopy = jsonCopy(settings);
        settingsCopy.task[projectId][taskId] = taskSettings;
    }
    let rlaSettings: LabelingSuiteTaskHeaderLabelSettings = taskSettings[rla.labelingTaskLabelId];
    if (!rlaSettings) {
        rlaSettings = getDefaultTaskOverviewLabelSettings();
        taskSettings[rla.labelingTaskLabelId] = rlaSettings;
    }
    switch (rla.sourceType) {
        case LabelSource.MANUAL:
            return rlaSettings.showManual;
        case LabelSource.INFORMATION_SOURCE:
            return rlaSettings.showHeuristics;
        case LabelSource.WEAK_SUPERVISION:
            return rlaSettings.showWeakSupervision;
        default:
            console.log("unknown source type in setting rla filter", rla)
            return false;
    }
}

export function getShouldHighlightOn(rla: any): string[] {
    const createdBy = rla.sourceType == LabelSource.INFORMATION_SOURCE ? rla.informationSource.name : rla.user.firstName + ' ' + rla.user.lastName;
    return [rla.id, rla.labelingTaskLabel.id, rla.sourceType, rla.labelingTaskLabel.labelingTask.id, createdBy]
}