import { EvaluationRunState } from "@/src/types/components/projects/projectId/settings/playground";
import { parseUTC } from "@/submodules/javascript-functions/date-parser";

export const EVALUATION_RUN_TABLE_HEADER = [{ column: "", id: "checkboxes", hasCheckboxes: true, checked: false }, { column: "Embedding", id: "embedding" }, { column: "Evaluation group", id: "evaluationGroup" }, { column: 'Created At', id: 'createdAt' }, { column: 'Created By', id: 'createdBy' }, { column: "State", id: "state" }, { column: "Run details", id: "runDetails" }];


export function prepareTableBodyEvaluationRun(evaluationRuns, usersDict, embeddingsDict, evaluationGroupsDict, navigateToDetails, selectedEvaluationRuns, setSelectedEvaluationRuns) {
    let finalData = [];
    evaluationRuns.forEach((run) => {
        const currentRow = [
            {
                type: 'boolean',
                value: run.id,
                checked: selectedEvaluationRuns.has(run.id),
                valueChange: (e) => setSelectedEvaluationRuns(
                    e.target.checked ? prev => new Set(prev).add(run.id) : prev => {
                        const newRUn = new Set(prev);
                        newRUn.delete(run.id);
                        return newRUn;
                    }
                )
            },
            {
                type: 'text',
                value: embeddingsDict[run.embeddingId]?.name
            },
            {
                type: 'text',
                value: evaluationGroupsDict[run.evaluationGroupId]?.name
            },
            {
                type: 'text',
                value: parseUTC(run.createdAt)
            },
            {
                type: 'text',
                value: usersDict[run.createdBy]?.firstName + ' ' + usersDict[run.createdBy]?.lastName
            },
            {
                type: 'Component',
                component: 'EvaluationRunStateCell',
                value: run.state
            },
            {
                type: 'Component',
                component: 'EvaluationRunDetailsCell',
                onClick: () => navigateToDetails(run.id),
                disabled: run.state !== EvaluationRunState.SUCCESS
            }

        ];
        finalData.push(currentRow);
    });
    return finalData;
}