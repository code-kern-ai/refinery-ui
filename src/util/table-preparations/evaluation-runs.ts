import { EvaluationRun } from "@/src/types/components/projects/projectId/settings/playground";
import { parseUTC } from "@/submodules/javascript-functions/date-parser";
import { toTableColumnCheckbox, toTableColumnComponent, toTableColumnText } from "@/submodules/react-components/helpers/kern-table-helper";
import { EvaluationRunState } from "@/submodules/react-components/types/evaluationRun";
import { Dispatch } from "react";

export const EVALUATION_RUN_TABLE_HEADER = [
    { column: "", id: "checkboxes", hasCheckboxes: true, checked: false },
    { column: "Embedding", id: "embedding" },
    { column: "Evaluation group", id: "evaluationGroup" },
    { column: 'Created At', id: 'createdAt' },
    { column: 'Created By', id: 'createdBy' },
    { column: "State", id: "state" },
    { column: "Run details", id: "runDetails" }];

export const EVALUATION_RUN_TABLE_CONFIG = { addBorder: true };

export function prepareTableBodyEvaluationRun(evaluationRuns: EvaluationRun[], usersDict: { [key: string]: any }, embeddingsDict: { [key: string]: any }, evaluationGroupsDict: { [group: string]: any }, navigateToDetails: (runId: string) => void, selectedEvaluationRuns: Set<string>, setSelectedEvaluationRuns: Dispatch<React.SetStateAction<Set<string>>>) {

    if (!evaluationRuns || evaluationRuns.length === 0) return [];

    return evaluationRuns.map((run) => [
        toTableColumnCheckbox(selectedEvaluationRuns.has(run.id), () => setSelectedEvaluationRuns(prev => {
            const newSet = new Set(prev);
            newSet.has(run.id) ? newSet.delete(run.id) : newSet.add(run.id);
            return newSet;
        })),
        toTableColumnText(embeddingsDict[run.embeddingId]?.name),
        toTableColumnText(evaluationGroupsDict[run.evaluationGroupId]?.name),
        toTableColumnText(parseUTC(run.createdAt)),
        toTableColumnText(`${usersDict[run.createdBy]?.firstName} ${usersDict[run.createdBy]?.lastName}`),
        toTableColumnComponent('EvaluationRunStateCell', undefined, { value: run.state }),
        toTableColumnComponent('EvaluationRunDetailsCell', undefined, {
            onClick: () => navigateToDetails(run.id),
            disabled: run.state !== EvaluationRunState.SUCCESS
        })
    ]);
}