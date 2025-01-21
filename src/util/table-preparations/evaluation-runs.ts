import { EvaluationRunState } from "@/src/types/components/projects/projectId/settings/playground";
import { parseUTC } from "@/submodules/javascript-functions/date-parser";

export const EVALUATION_RUN_TABLE_HEADER = [{ column: "Embedding", id: "embedding" }, { column: "Evaluation group", id: "evaluationGroup" }, { column: 'Created At', id: 'createdAt' }, { column: 'Created By', id: 'createdBy' }, { column: "State", id: "state" }, { column: "Run details", id: "runDetails" }];


export function prepareTableBodyEvaluationRun(evaluationRuns, usersDict, embeddingsDict, evaluationGroupsDict, navigateToDetails) {
    let finalData = [];
    evaluationRuns.forEach((run) => {
        const currentRow = [
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
                component: 'ViewCell',
                onClick: () => navigateToDetails(run.id),
                disabled: run.state !== EvaluationRunState.SUCCESS
            }

        ];
        finalData.push(currentRow);
    });
    return finalData;
}