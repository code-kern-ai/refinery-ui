import { parseUTC } from "@/submodules/javascript-functions/date-parser";

export const EVALUATION_SETS_TABLE_HEADER = [{ column: 'Question', id: 'question' }, { column: 'Created At', id: 'createdAt' }, { column: 'Created By', id: 'createdBy' }, { column: 'Records', id: 'records' }];

export function prepareTableBodyEvaluationSets(evaluationSets, usersDict, openModal) {
    let finalData = [];
    evaluationSets.forEach((set) => {
        const currentRow = [
            {
                type: 'text',
                value: set.question
            },
            {
                type: 'text',
                value: parseUTC(set.createdAt)
            },
            {
                type: 'text',
                value: usersDict[set.createdBy].firstName + ' ' + usersDict[set.createdBy].lastName
            },
            {
                type: 'Component',
                component: 'ViewCell',
                onClick: () => openModal(set.recordIds),
            }
        ];
        finalData.push(currentRow);
    });
    return finalData;
}