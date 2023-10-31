import { Heuristic } from "@/src/types/components/projects/projectId/heuristics/heuristics";
import { InformationSourceType, LabelSource } from "@/submodules/javascript-functions/enums/enums";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { mapInformationSourceStats } from "../shared-helper";
import { dateAsUTCDate, timeDiffCalc } from "@/submodules/javascript-functions/date-parser";
import { LabelingTask, LabelingTaskTaskType } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { getPythonClassRegExMatch, getPythonFunctionRegExMatch } from "@/submodules/javascript-functions/python-functions-parser";
import { parseContainerLogsData } from "@/submodules/javascript-functions/logs-parser";

export function postProcessCurrentHeuristic(heuristic: Heuristic, labelingTasks: LabelingTask[]): Heuristic {
    const prepareHeuristic = jsonCopy(heuristic);
    prepareHeuristic.labelSource = LabelSource.INFORMATION_SOURCE;
    prepareHeuristic.informationSourceType = InformationSourceType[heuristic['type']];
    prepareHeuristic.selected = heuristic['isSelected'];
    prepareHeuristic.stats = mapInformationSourceStats(heuristic['sourceStatistics']['edges']);
    prepareHeuristic.lastTask = heuristic['lastPayload'];
    const labelingTask = labelingTasks.find(a => a.id == heuristic.labelingTaskId);
    prepareHeuristic.labelingTaskName = labelingTask.name;
    prepareHeuristic.labels = labelingTask.labels;

    if (prepareHeuristic.lastTask) {
        const task = jsonCopy(prepareHeuristic.lastTask);
        if (task.createdAt && task.finishedAt) {
            task.durationText = timeDiffCalc(dateAsUTCDate(new Date(task.createdAt)), dateAsUTCDate(new Date(task.finishedAt)));
        }
        prepareHeuristic.state = heuristic['lastPayload']['state'];
        prepareHeuristic.lastTask = task;
    }
    if (prepareHeuristic.informationSourceType == InformationSourceType.LABELING_FUNCTION) {
        const regMatch = getPythonFunctionRegExMatch(prepareHeuristic.sourceCode);
        if (regMatch[2] !== prepareHeuristic.name) {
            prepareHeuristic.sourceCodeToDisplay = prepareHeuristic.sourceCode.replace(regMatch[2], prepareHeuristic.name);
        }
    } else if (prepareHeuristic.informationSourceType == InformationSourceType.ACTIVE_LEARNING) {
        const regMatch = getPythonClassRegExMatch(prepareHeuristic.sourceCode);
        if (regMatch[2] !== prepareHeuristic.name) {
            prepareHeuristic.sourceCodeToDisplay = prepareHeuristic.sourceCode.replace(getClassLine(null, labelingTasks, heuristic.labelingTaskId), getClassLine(prepareHeuristic.name, labelingTasks, heuristic.labelingTaskId));
        }
    }

    return prepareHeuristic;
}

export function getClassLine(className: string = null, labelingTasks: LabelingTask[], currentLabelingTaskId: string): string {
    const taskType = labelingTasks.find(a => a.id == currentLabelingTaskId).taskType;
    if (!className) className = taskType == LabelingTaskTaskType.INFORMATION_EXTRACTION ? 'ATLExtractor' : 'ATLClassifier';
    className += taskType == LabelingTaskTaskType.INFORMATION_EXTRACTION ? '(LearningExtractor):' : '(LearningClassifier):';
    return 'class ' + className;
}

export function postProcessLastTaskLogs(lastTask: any) {
    if (!lastTask) return null;
    const payload = jsonCopy(lastTask);
    payload.logs = parseContainerLogsData(payload.logs, payload.informationSource.type);
    return payload.logs;
}