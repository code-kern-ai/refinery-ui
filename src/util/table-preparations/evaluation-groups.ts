import { parseUTC } from "@/submodules/javascript-functions/date-parser";

export const EVALUATION_GROUPS_TABLE_HEADER = [{ column: 'Name', id: 'name' }, { column: 'Created At', id: 'createdAt' }, { column: 'Created By', id: 'createdBy' }, { column: 'Evaluation sets', id: 'evaluationSets' }];

export function prepareTableBodyEvaluationGroups(evaluationGroups, openModal) {
    let finalData = [];
    evaluationGroups.forEach((group) => {
        const currentRow = [
            {
                type: 'text',
                value: group.name
            },
            {
                type: 'text',
                value: parseUTC(group.createdAt)
            },
            {
                type: 'text',
                value: group.createdBy
            },
            {
                type: 'Component',
                component: 'ViewCell',
                onClick: () => openModal(group.evaluationSetIds),
            }
        ];
        finalData.push(currentRow);
    });
    return finalData;
}