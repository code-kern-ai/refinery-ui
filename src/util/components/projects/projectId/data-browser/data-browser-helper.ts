import { ColumnData, DataSlice } from "@/src/types/components/projects/projectId/data-browser/data-browser";
import { LabelingTask } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { User } from "@/src/types/shared/general";
import { buildFullLink } from "@/src/util/shared/link-parser-helper";
import { dateAsUTCDate } from "@/submodules/javascript-functions/date-parser";
import { informationSourceTypeToString, labelSourceToString, sliceTypeToString } from "@/submodules/javascript-functions/enums/enum-functions";
import { LabelSource, Slice } from "@/submodules/javascript-functions/enums/enums";
import { jsonCopy, tryParseJSON } from "@/submodules/javascript-functions/general";
import { getAttributeType } from "./search-operators-helper";

export function postProcessDataSlices(dataSlices: DataSlice[]) {
    const prepareDataSlices = jsonCopy(dataSlices);
    prepareDataSlices.forEach(slice => {
        slice.displayName = slice.sliceType != Slice.STATIC_OUTLIER ? slice.name : parseUTC(slice.createdAt, true);
        slice.color = getColorStruct(slice.sliceType);
    });
    return prepareDataSlices;
}

export function getColorStruct(sliceType: Slice) {
    const color = getColorForSliceType(sliceType)
    return {
        name: color,
        textColor: 'text-' + color + '-700',
        fillColor: 'fill-' + color + '-100',
    }
}

function getColorForSliceType(sliceType: Slice) {
    switch (sliceType) {
        case Slice.STATIC_OUTLIER:
            return 'green';
        case Slice.STATIC_DEFAULT:
            return 'orange';
        case Slice.DYNAMIC_DEFAULT:
            return 'blue';
    }
}

export function updateSliceInfoHelper(slice: DataSlice, projectId: string, users: User[]) {
    let sliceInfo = {};
    if (slice.sliceType == Slice.STATIC_OUTLIER) {
        sliceInfo["Name"] = parseUTC(slice.createdAt);
    } else {
        sliceInfo["Name"] = slice.name;
        sliceInfo["Created at"] = parseUTC(slice.createdAt);
    }
    sliceInfo["Created by"] = "Unknown";

    const findById = users.find(user => user.id == slice.createdBy);
    if (findById) { sliceInfo["Created by"] = findById.firstName + " " + findById.lastName };
    sliceInfo["Type"] = sliceTypeToString(slice.sliceType);

    for (let key in slice.info) {
        sliceInfo[key] = slice.info[key];
    }
    if (slice.sliceType == Slice.STATIC_DEFAULT) {
        sliceInfo["Link"] = "/projects/" + projectId + "/labeling/" + slice.id;
        sliceInfo["Link"] = buildFullLink("/projects/" + projectId + "/labeling/" + slice.id);
    }
    return sliceInfo;
}

export function postProcessUsersCount(usersCount: any, users: User[], currentUser: User) {
    const usersMapCount = {}
    users.forEach((user, index) => {
        let sum = 0;
        const userCountFind = usersCount.find(e => e.user.id == user.id);
        if (!userCountFind) return;
        const prepareUsersCount = { ...userCountFind };
        prepareUsersCount.counts = JSON.parse(prepareUsersCount.counts);
        const userCopy = { ...user };
        if (prepareUsersCount.counts) prepareUsersCount.counts.forEach(e => {
            sum += e.count;
            e.source = labelSourceToString(e.source_type);
        });
        userCopy.countSum = sum;
        userCopy.counts = prepareUsersCount.counts;
        if (userCopy.countSum > 0 || userCopy.id == currentUser.id) {
            usersMapCount[userCopy.id] = userCopy;
        }
    });
    return usersMapCount;
}

export const DATA_BROWSER_TABLE_COLUMN_HEADERS: ColumnData[] = [
    { field: 'type', displayName: 'Type', order: 1 },
    { field: 'task', displayName: 'Task', order: 2 },
    { field: 'label', displayName: 'Label', order: 3 },
    { field: 'amount', displayName: 'Amount', order: 4 },
    { field: 'confidenceAvg', displayName: 'Avg.confidence', order: 5 }
]

export function postProcessRecordsExtended(searchRecordsExtended, labelingTasks: LabelingTask[]) {
    const prepareRecordsExtended = { ...searchRecordsExtended };
    const recordList = prepareRecordsExtended.recordList.map((record, index) => {
        const recordData = JSON.parse(record.recordData);
        recordData.rla_aggregation = parseRecordData(recordData, labelingTasks);
        return recordData;
    });
    prepareRecordsExtended.recordList = recordList;
    return prepareRecordsExtended;
}

export function parseRecordData(element, labelingTasks: LabelingTask[]) {
    if (element.rla_data) {
        element.rla_aggregation = {};
        for (const rlaLine of element.rla_data) {
            const rlaAggParts = getRlaAggregationKeyParts(rlaLine, labelingTasks);
            if (!element.rla_aggregation.hasOwnProperty(rlaAggParts.key)) {
                element.rla_aggregation[rlaAggParts.key] = {
                    type: rlaAggParts.type,
                    task: rlaAggParts.taskName,
                    label: rlaAggParts.labelName,
                    color: rlaAggParts.labelColor,
                    amount: 0,
                    confidence: [],
                    confidenceAvg: "",
                    //manual, weak supervision & specific information sources are "related"
                    isWSRelated: !(rlaLine.source_type == LabelSource.INFORMATION_SOURCE && !rlaLine.weak_supervision_id),
                    id: rlaAggParts.key
                };
            }
            element.rla_aggregation[rlaAggParts.key].amount++;
            if (rlaLine.confidence != null && (rlaLine.source_type == LabelSource.WEAK_SUPERVISION || rlaLine.source_type == LabelSource.MODEL_CALLBACK)) {
                element.rla_aggregation[rlaAggParts.key].confidence.push(rlaLine.confidence);
            }
        }
        let countWsRelated = 0;
        for (const key in element.rla_aggregation) {
            if (element.rla_aggregation[key].isWSRelated) countWsRelated++;
            if (element.rla_aggregation[key].confidence.length == 0) continue;
            let sum = 0;
            for (const confidence of element.rla_aggregation[key].confidence) sum += confidence;
            element.rla_aggregation[key].confidenceAvg = Math.round((sum / element.rla_aggregation[key].confidence.length) * 10000) / 100 + "%";
            element.rla_aggregation[key].id = key;
        }
        const len = Object.keys(element.rla_aggregation).length;
        if (len && len != countWsRelated) {
            if ((len - countWsRelated) == 1) element.wsHint = "1 element isn't visible because of your config settings";
            else element.wsHint = (len - countWsRelated) + " elements aren't visible because of your config settings";
        }
        else element.wsHint = "";
    }
    return element.rla_aggregation;
}

export function getRlaAggregationKeyParts(rlaLine, labelingTasks: LabelingTask[]) {
    let parts = getTaskAndLabelNameFromLabelId(rlaLine.labeling_task_label_id, labelingTasks);
    if (rlaLine.source_type == LabelSource.INFORMATION_SOURCE) {
        parts.type = getInformationSourceTextById(rlaLine.source_id, labelingTasks);
    }
    else if (rlaLine.source_type == LabelSource.MANUAL && rlaLine.is_gold_star) {
        parts.type = labelSourceToString(rlaLine.source_type) + " gold ⭐";
    }
    else {
        parts.type = labelSourceToString(rlaLine.source_type);
    }

    parts.key = parts.type + "_" + parts.taskName + "_" + parts.labelName;
    return parts;
}

export function getTaskAndLabelNameFromLabelId(labelId: string, labelingTasks: LabelingTask[]): any {
    for (const labelingTask of labelingTasks) {
        for (const label of labelingTask.labels) {
            if (label.id == labelId) return { taskName: labelingTask.name, labelName: label.name, labelColor: label.color };
        }
    }
    return { taskName: "UNKNOWN", labelName: "UNKNOWN", labelColor: "UNKNOWN" };
}

export function getInformationSourceTextById(sourceId: string, labelingTasks: LabelingTask[]) {
    for (const labelingTask of labelingTasks) {
        for (const source of labelingTask.informationSources) {
            if (sourceId == source.id) return informationSourceTypeToString(source.type, true) + ": " + source.name;
        }
    }
    return "UNKNOWN";
}

export function postProcessRecordComments(comments: any) {
    if (!comments) return;
    const recordComments = {};
    comments.forEach(e => {
        if (!recordComments[e.record_id]) recordComments[e.record_id] = [];
        recordComments[e.record_id].push(e);
    });
    return recordComments;
}

function parseUTC(utc: string, forOutlier: boolean = false) {
    const utcDate = dateAsUTCDate(new Date(utc));
    if (forOutlier) return utcDate.toLocaleString().replace(", ", "\n");
    else return utcDate.toLocaleString();
}

export function postProcessUniqueValues(uniqueValues: any, attributesSortOrder: any) {
    const uniqueValuesDict = uniqueValues;
    for (let key in uniqueValuesDict) {
        const attributeType = getAttributeType(attributesSortOrder, key);
        if (attributeType == 'TEXT') {
            delete uniqueValuesDict[key];
        }
    }
    return uniqueValuesDict;
}

export function getActiveNegateGroupColor(group) {
    if (!group['active']) return null;
    if (group['negate']) return '#ef4444'
    return '#2563eb';
}