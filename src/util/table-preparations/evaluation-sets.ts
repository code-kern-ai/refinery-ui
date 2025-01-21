import { parseUTC } from "@/submodules/javascript-functions/date-parser";

export const EVALUATION_SETS_TABLE_HEADER = [{ column: "", id: "checkboxes", hasCheckboxes: true, checked: false }, { column: 'Question', id: 'question' }, { column: 'Created At', id: 'createdAt' }, { column: 'Created By', id: 'createdBy' }, { column: 'Records', id: 'records' }];

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
                value: set.question
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
                type: 'Component',
                component: 'ViewCell',
                onClick: () => openModal(set.recordIds),
            }
        ];
        finalData.push(currentRow);
    });
    return finalData;
}