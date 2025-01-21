import { parseUTC } from "@/submodules/javascript-functions/date-parser";

export const EVALUATION_SETS_TABLE_HEADER = [{ column: "", id: "checkboxes", hasCheckboxes: true, checked: false }, { column: 'Question', id: 'question' }, { column: 'Created At', id: 'createdAt' }, { column: 'Created By', id: 'createdBy' }, { column: 'Records', id: 'records' }, { column: "View", id: 'viewRecords' }];
const MAX_QUESTION_SHOW = 100;
export function prepareTableBodyEvaluationSets(evaluationSets, selectedEvaluationSets, setSelectedEvaluationSets, usersDict, openModal) {
    let finalData = [];
    evaluationSets.forEach((set) => {
        const currentRow = [
            {
                type: 'boolean',
                value: set.id,
                checked: selectedEvaluationSets.has(set.id),
                valueChange: (e) => setSelectedEvaluationSets(
                    e.target.checked ? prev => new Set(prev).add(set.id) : prev => {
                        const newSet = new Set(prev);
                        newSet.delete(set.id);
                        return newSet;
                    }
                )
            },
            {
                type: 'text',
                value: set.question.length > MAX_QUESTION_SHOW ? set.question.slice(0, MAX_QUESTION_SHOW) + '...' : set.question
            },
            {
                type: 'text',
                value: parseUTC(set.createdAt)
            },
            {
                type: 'text',
                value: usersDict[set.createdBy]?.firstName + ' ' + usersDict[set.createdBy]?.lastName
            },
            {
                type: 'text',
                value: Number(set.recordIds?.length)
            },
            {
                type: 'Component',
                component: 'ViewCell',
                onClick: () => openModal(set.recordIds),
            },
        ];
        finalData.push(currentRow);
    });
    return finalData;
}