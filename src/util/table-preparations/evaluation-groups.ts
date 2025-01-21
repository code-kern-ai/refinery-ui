import { parseUTC } from "@/submodules/javascript-functions/date-parser";

export const EVALUATION_GROUPS_TABLE_HEADER = [{ column: "", id: "checkboxes", hasCheckboxes: true, checked: false }, { column: 'Name', id: 'name' }, { column: 'Created At', id: 'createdAt' }, { column: 'Created By', id: 'createdBy' }, { column: 'Evaluation sets', id: 'evaluationSets' }];

export function prepareTableBodyEvaluationGroups(evaluationGroups, selectedEvaluationGroups, setSelectedEvaluationGroups, usersDict, openModal) {
    let finalData = [];
    evaluationGroups.forEach((group) => {
        const currentRow = [
            {
                type: 'boolean',
                value: group.id,
                checked: selectedEvaluationGroups.has(group.id),
                valueChange: (e) => setSelectedEvaluationGroups(
                    e.target.checked ? prev => new Set(prev).add(group.id) : prev => {
                        const newGroup = new Set(prev);
                        newGroup.delete(group.id);
                        return newGroup;
                    }
                )
            },
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
                value: usersDict[group.createdBy]?.firstName + ' ' + usersDict[group.createdBy].lastName
            },
            {
                type: 'Component',
                component: 'ViewCell',
                onClick: () => openModal(group.id),
            }
        ];
        finalData.push(currentRow);
    });
    return finalData;
}