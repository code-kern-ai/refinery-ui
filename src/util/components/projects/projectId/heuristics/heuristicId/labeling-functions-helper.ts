import { Attribute } from "@/src/types/components/projects/projectId/settings/data-schema";
import { Embedding } from "@/src/types/components/projects/projectId/settings/embeddings";
import { LabelingTask, LabelingTaskTaskType } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { InformationSourceType } from "@/submodules/javascript-functions/enums/enums";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { parseContainerLogsData } from "@/submodules/javascript-functions/logs-parser";
import { getColorStruct } from "../shared-helper";

export function embeddingRelevant(embedding: Embedding, attributes: Attribute[], labelingTasks: LabelingTask[], currentLabelingTaskId: string): boolean {
    if (!embedding) return false;
    const attributeType = attributes.find(a => a.id == embedding.attributeId)?.dataType;
    if (attributeType != 'TEXT') return false;
    const onlyAttribute = labelingTasks.find(lt => lt.id == currentLabelingTaskId)?.taskType == 'MULTICLASS_CLASSIFICATION';
    return (embedding.type == 'ON_ATTRIBUTE' && onlyAttribute) || (embedding.type != 'ON_ATTRIBUTE' && !onlyAttribute)
}

export function postProcessSampleRecordsFromBE(sampleRecords: any) {
    const prepareSampleRecords = jsonCopy(sampleRecords);
    prepareSampleRecords.records = prepareSampleRecords.records.map((record: any) => {
        return {
            calculatedLabels: record['calculatedLabels'],
            fullRecordData: record['fullRecordData'],
            recordId: record['recordId']
        }
    });
    prepareSampleRecords.containerLogs = parseContainerLogsData(prepareSampleRecords['containerLogs'], InformationSourceType.LABELING_FUNCTION)
    return prepareSampleRecords;
}

export function postProcessSampleRecords(sampleRecords: any, labelingTasks: LabelingTask[], currentLabelingTaskId: string) {
    const prepareSampleRecords = postProcessSampleRecordsFromBE(sampleRecords);
    prepareSampleRecords.records.forEach((record: any) => {
        record.fullRecordData = JSON.parse(record.fullRecordData);
        const taskType = labelingTasks.find(lt => lt.id == currentLabelingTaskId)?.taskType;
        if (taskType == LabelingTaskTaskType.MULTICLASS_CLASSIFICATION) {
            const label = record.calculatedLabels.length > 0 ? record.calculatedLabels[1] : '-';
            record.calculatedLabelsResult = {
                label: {
                    label: label,
                    color: getColorForLabel(label, labelingTasks, currentLabelingTaskId),
                    count: 1,
                    displayAmount: false
                }
            };
        } else {
            const resultDict = {};
            if (record.calculatedLabels.length > 0) {
                record.calculatedLabels.forEach(e => {
                    const label = getLabelFromExtractionResult(e);
                    if (!resultDict[label]) {
                        resultDict[label] = {
                            label: label,
                            color: getColorForLabel(label, labelingTasks, currentLabelingTaskId),
                            count: 0
                        };
                    }
                    resultDict[label].count++;
                });
                const displayAmount = Object.keys(resultDict).length > 1;
                for (const key in resultDict) {
                    resultDict[key].displayAmount = displayAmount || resultDict[key].count > 1;
                }
            } else {
                resultDict['-'] = {
                    label: '-',
                    color: getColorForLabel('-', labelingTasks, currentLabelingTaskId),
                    count: 1
                };
            }
            record.calculatedLabelsResult = resultDict;
        }
    });

    return prepareSampleRecords;
}

function getLabelFromExtractionResult(str: string) {
    const array = str.split('\'');
    return array.length == 1 ? array[0] : array[1];
}

function getColorForLabel(label: string, labelingTasks: LabelingTask[], currentLabelingTaskId: string) {
    const labelingTaskLabels = labelingTasks.find(lt => lt.id == currentLabelingTaskId).labels;
    const labelColor = labelingTaskLabels.find(el => el.name == label)?.color;
    return label != '-' && labelColor != undefined ? labelColor : getColorStruct('gray');
}
