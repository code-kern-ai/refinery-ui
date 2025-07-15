import { EvaluationGroup } from "@/src/types/components/projects/projectId/settings/playground";
import { parseUTC } from "@/submodules/javascript-functions/date-parser";
import { toTableColumnCheckbox, toTableColumnComponent, toTableColumnText } from "@/submodules/react-components/helpers/kern-table-helper";
import { Dispatch } from "react";

export const EVALUATION_GROUPS_TABLE_HEADER = [
    { column: "", id: "checkboxes", hasCheckboxes: true, checked: false },
    { column: 'Name', id: 'name' },
    { column: 'Created At', id: 'createdAt' },
    { column: 'Created By', id: 'createdBy' },
    { column: 'Evaluation sets', id: 'evaluationSets' }];

export const EVALUATION_GROUPS_TABLE_CONFIG = { addBorder: true };

export function prepareTableBodyEvaluationGroups(evaluationGroups: EvaluationGroup[], selectedEvaluationGroups: Set<string>, setSelectedEvaluationGroups: Dispatch<React.SetStateAction<Set<string>>>, usersDict: { [key: string]: any }, openModal: (groupId: string) => void) {

    if (!evaluationGroups || evaluationGroups.length === 0) return [];

    return evaluationGroups.map((group) => [
        toTableColumnCheckbox(selectedEvaluationGroups.has(group.id), () => setSelectedEvaluationGroups(prev => {
            const newSet = new Set(prev);
            newSet.has(group.id) ? newSet.delete(group.id) : newSet.add(group.id);
            return newSet;
        })),
        toTableColumnText(group.name),
        toTableColumnText(parseUTC(group.createdAt)),
        toTableColumnText(`${usersDict[group.createdBy]?.firstName} ${usersDict[group.createdBy]?.lastName}`),
        toTableColumnComponent('ViewCell', undefined, { onClick: () => openModal(group.id) })
    ]);
}