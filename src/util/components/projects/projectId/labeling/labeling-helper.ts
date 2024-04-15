import { LabelingVars, TokenLookup } from "@/src/types/components/projects/projectId/labeling/labeling";
import { LabelingTaskTaskType } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { ALL_USERS_USER_ID, GOLD_STAR_USER_ID } from "./labeling-main-component-helper";
import { canDeleteRla, filterRlaLabelCondition, getCreatedByName, getHoverGroupsOverviewTable, getLabelSourceOrder } from "./overview-table-helper";
import { InformationSourceReturnType, LabelSource } from "@/submodules/javascript-functions/enums/enums";
import { informationSourceTypeToString } from "@/submodules/javascript-functions/enums/enum-functions";
import { User } from "@/src/types/shared/general";
import { Attribute } from "@/src/types/components/projects/projectId/settings/data-schema";
import { UserRole } from "@/src/types/shared/sidebar";
import { UserManager } from "@/src/util/classes/labeling/user-manager";
import { CurrentSelection } from "@/src/reduxStore/states/pages/labeling";

export const FULL_RECORD_ID = "FULL_RECORD";
export const SWIM_LANE_SIZE_PX = 12;
export const DEFAULT_LABEL_COLOR = "yellow";

export function getDefaultLabelingVars(): LabelingVars {
    return {
        loading: true,
        loopAttributes: null,
        taskLookup: null
    }
}

export function getTaskTypeOrder(source: LabelingTaskTaskType): number {
    switch (source) {
        case LabelingTaskTaskType.MULTICLASS_CLASSIFICATION: return 3;
        case LabelingTaskTaskType.INFORMATION_EXTRACTION: return 1;
        case LabelingTaskTaskType.NOT_SET: return 2;
        default: return 4;
    }
}

export function buildLabelingRlaData(rlas: any, user: User, showHeuristicConfidence: boolean, userDisplayRole: UserRole): any[] {
    if (!rlas) return [];
    let result = Array(rlas.length);
    let i = 0;
    for (let e of rlas) {
        result[i++] = {
            hoverGroups: getHoverGroupsForLabeling(e),
            sourceTypeKey: e.sourceType,
            orderPos: getLabelSourceOrder(e.sourceType, e.informationSource?.type),
            labelId: e.labelingTaskLabelId,
            labelName: e.labelingTaskLabel.name,
            taskId: e.labelingTaskLabel.labelingTask.id,
            createdBy: e.isGoldStar ? GOLD_STAR_USER_ID : e.createdBy,
            createdByName: getCreatedByName(e),
            confidence: e.confidence,
            dataTip: getLabelDataTip(e),
            labelDisplay: getLabelForDisplay(e, showHeuristicConfidence),
            icon: getIcon(e),
            canBeDeleted: canDeleteRla(e, user, userDisplayRole),
            rla: e
        };
    }
    result.sort((a, b) => a.orderPos - b.orderPos || a.createdByName.localeCompare(b.createdByName) || a.labelName.localeCompare(b.labelName));
    return result;

}

export function getHoverGroupsForLabeling(data: any): any {
    const g = getHoverGroupsOverviewTable(data);
    // LAX_ = helper for additional group for highlighting in label view
    g.addGroup = "LAX_" + data.labelingTaskLabel.id;
    return g;
}


function getLabelDataTip(e: any): string {
    if (e.sourceType == LabelSource.INFORMATION_SOURCE) return informationSourceTypeToString(e.informationSource.type, false);
    else if (e.sourceType == LabelSource.WEAK_SUPERVISION) return "Weak supervision - click to use as manual label";
    else if (e.sourceType == LabelSource.MANUAL) return "Manual";
    return null;
}

function getLabelForDisplay(e: any, showHeuristicConfidence: boolean): string {
    let final = e.labelingTaskLabel.name;
    if (e.sourceType == LabelSource.WEAK_SUPERVISION && e.confidence != null) {
        final += " - " + Math.round((e.confidence + Number.EPSILON) * 10000) / 100 + '%';
    } else if (showHeuristicConfidence && e.sourceType == LabelSource.INFORMATION_SOURCE && e.confidence != null) {
        final += " - " + Math.round((e.confidence + Number.EPSILON) * 10000) / 100 + '%';
    }
    return final;
}

function getIcon(e: any): string {
    if (e.sourceType == LabelSource.INFORMATION_SOURCE) return e.informationSource.type;
    else if (e.sourceType != LabelSource.MANUAL) return e.sourceType;
    return null;
}

export function filterRlaDataForLabeling(data: any[], settings, projectId, rlaKey?: string): any[] {
    let filtered = data;
    if (rlaKey) filtered = filtered.filter(entry => filterRlaLabelCondition(entry[rlaKey], settings, projectId));
    else filtered = filtered.filter(rla => filterRlaLabelCondition(rla, settings, projectId));

    return filtered;
}

export function getFirstFitPos(takenPositions: any, start: number, end: number, swimLaneExtractionDisplay: boolean): number {
    if (swimLaneExtractionDisplay) return -1;
    let pos = 1;
    while (!checkFit(takenPositions, start, end, pos)) pos++;
    return pos;
}

function checkFit(takenPositions: any, start: number, end: number, pos: number): boolean {
    for (let i = start; i <= end; i++) {
        if (takenPositions[i] && takenPositions[i].rlaArray.find(e => e.orderPos == pos)) return false;
    }
    return true;
}

export function getOrderLookupItem(rla: any): any {
    return {
        sourceType: rla.sourceType,
        isType: rla.informationSource?.type,
        createdBy: rla.sourceType == LabelSource.INFORMATION_SOURCE ? rla.informationSource.name : rla.createdBy,
        taskName: rla.labelingTaskLabel.labelingTask.name,
        labelName: rla.labelingTaskLabel.name,
    };
}

export function getOrderLookupSort(a: any, b: any): number {
    const aOrder = getLabelSourceOrder(a.sourceType, a.isType);
    const bOrder = getLabelSourceOrder(b.sourceType, b.isType);
    if (aOrder != bOrder) return aOrder - bOrder;

    const order = ["taskName", "createdBy", "labelName"];
    for (const key of order) {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
    }
    return 0;
}

export function findOrderPosItem(orderPosElement: any, compareItem: any): boolean {
    for (const key in compareItem) {
        if (orderPosElement[key] != compareItem[key]) return false;
    }
    return true;
}

export function collectSelectionData(attributeId: string, currentSelection: CurrentSelection, attributes: Attribute[], recordRequests: any): any {
    if (!currentSelection) return null;
    let startIdx = currentSelection.tokenStart;
    let endIdx = currentSelection.tokenEnd;
    const tokenData = getTokenData(attributeId, attributes, recordRequests);
    if (!tokenData) return null;
    if (startIdx == -1 || endIdx == -1) return null;
    const value = tokenData.raw.substring(
        tokenData.token[startIdx].posStart,
        tokenData.token[endIdx].posEnd
    )
    return { startIdx: startIdx, endIdx: endIdx, value: value };
}

export function getTokenData(attributeId: string, attributes: Attribute[], recordRequests: any): any {
    if (!attributes) return null;
    if (attributeId == FULL_RECORD_ID) return null;
    for (const att of recordRequests.token.attributes) {
        if (att.attributeId == attributeId) return att;
    }
    return null;
}


export function getGoldInfoForTask(task: any, user: User, fullRlaData: any, displayUserId: string, userDisplayRole: UserRole): { can: boolean, is: boolean } {
    if (user && user.role != UserRole.ENGINEER && userDisplayRole != UserRole.ENGINEER) return { can: false, is: false };
    if (displayUserId == ALL_USERS_USER_ID) return { can: false, is: false };
    if (task.task.taskType == LabelingTaskTaskType.NOT_USEABLE) return { can: false, is: false };
    const taskRlaData = fullRlaData.filter(x => x.sourceTypeKey == LabelSource.MANUAL && x.taskId == task.task.id);
    const goldRlas = taskRlaData.filter(x => x.rla.isGoldStar);
    if (displayUserId == GOLD_STAR_USER_ID) return { can: goldRlas.length > 0, is: goldRlas.length > 0 };

    const userRlas = taskRlaData.filter(x => x.createdBy == displayUserId && !x.rla.isGoldStar);
    if (userRlas.length == 0) return { can: false, is: false };
    const otherRlas = taskRlaData.filter(x => x.createdBy != displayUserId && !x.rla.isGoldStar);

    const allOtherGroups = otherRlas.reduce((f, c) => {
        if (!f[c.createdBy]) f[c.createdBy] = [];
        f[c.createdBy].push(c);
        return f;
    }, {});
    let allMatch = true;
    for (const key in allOtherGroups) {
        const group = allOtherGroups[key];
        if (!allRlasMatch(userRlas, group)) {
            allMatch = false;
            break;
        }
    }
    return { can: !allMatch, is: goldRlas.length > 0 && allRlasMatch(goldRlas, userRlas) }
}
function allRlasMatch(groupA: any[], groupB: any[]): boolean {
    if (groupA.length != groupB.length) return false;
    for (let i = 0; i < groupA.length; i++) {
        const found = groupB.find(x => rlaIsEqual(x.rla, groupA[i].rla));
        if (!found) return false;
    }
    return true;
}


function rlaIsEqual(rlaA: any, rlaB: any): boolean {
    if (rlaA.sourceType != rlaB.sourceType) return false;
    if (rlaA.returnType != rlaB.returnType) return false;
    if (rlaA.labelingTaskLabelId != rlaB.labelingTaskLabelId) return false;
    if (rlaA.returnType == InformationSourceReturnType.YIELD && (rlaA.tokenStartIdx != rlaB.tokenStartIdx || rlaA.tokenEndIdx != rlaB.tokenEndIdx)) return false;

    return true;
}

export function parseSelectionData(): any[] {
    let selection = window.getSelection();
    if (selection.type !== 'Range' && selection.type !== 'Caret') return [false];

    const startElement = getSelectionElement(selection, true);
    const endElement = getSelectionElement(selection, false);
    if (!startElement || !endElement) return [false];
    let attributeIdStart: any = startElement.getAttribute('data-attributeid');
    let attributeIdEnd: any = endElement.getAttribute('data-attributeid');

    if (attributeIdStart == null || attributeIdEnd == null || attributeIdStart != attributeIdEnd) return [false];
    let tokenStart: any = startElement.getAttribute('data-tokenidx');
    let tokenEnd: any = endElement.getAttribute('data-tokenidx');
    if (tokenStart == null || tokenEnd == null) return [false];
    tokenStart = Number(tokenStart);
    tokenEnd = Number(tokenEnd);
    if (tokenStart > tokenEnd) {
        let tmp = tokenStart;
        tokenStart = tokenEnd;
        tokenEnd = tmp;
    }

    return [true, attributeIdStart, tokenStart, tokenEnd, startElement];
}

function getSelectionElement(selection: Selection, start: boolean, maxSteps: number = 5): HTMLElement {
    let element = start ? selection.anchorNode : selection.focusNode;
    let steps = 0;
    while (steps < maxSteps) {
        if (element instanceof HTMLElement && element.getAttribute('data-tokenidx') != null) return element;
        element = element.parentElement;
        steps++;
    }
    return null;
}


export function checkCanEditLabels(user: User, userDisplayRole: UserRole, displayUserId: string): boolean {
    if (user.role != userDisplayRole) return false;
    return (displayUserId == GOLD_STAR_USER_ID && userDisplayRole == UserRole.ENGINEER)
        || (displayUserId == ALL_USERS_USER_ID && userDisplayRole == UserRole.ENGINEER)
        || displayUserId == user.id;
}