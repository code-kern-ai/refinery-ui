import { EvaluationSet } from "@/src/types/components/projects/projectId/settings/playground";
import { parseUTC } from "@/submodules/javascript-functions/date-parser";
import { toTableColumnCheckbox, toTableColumnComponent, toTableColumnText } from "@/submodules/react-components/helpers/kern-table-helper";
import { Dispatch } from "react";

export const EVALUATION_SETS_TABLE_HEADER = [
    { column: "", id: "checkboxes", hasCheckboxes: true, checked: false },
    { column: 'Question', id: 'question' },
    { column: 'Created At', id: 'createdAt' },
    { column: 'Created By', id: 'createdBy' },
    { column: 'Records', id: 'records' },
    { column: "View", id: 'viewRecords' }];

export const EVALUATION_SETS_TABLE_CONFIG = { addBorder: true };
const MAX_QUESTION_SHOW = 100;

export function prepareTableBodyEvaluationSets(evaluationSets: EvaluationSet[], selectedEvaluationSets: Set<string>, setSelectedEvaluationSets: Dispatch<React.SetStateAction<Set<string>>>, usersDict: { [key: string]: any }, openModal: (setId: string[], question: string) => void) {

    if (!evaluationSets || evaluationSets.length === 0) return [];

    return evaluationSets.map((set) => [
        toTableColumnCheckbox(selectedEvaluationSets.has(set.id), () => setSelectedEvaluationSets(prev => {
            const newSet = new Set(prev);
            newSet.has(set.id) ? newSet.delete(set.id) : newSet.add(set.id);
            return newSet;
        })),
        toTableColumnText(set.question.length > MAX_QUESTION_SHOW ? set.question.slice(0, MAX_QUESTION_SHOW) + '...' : set.question),
        toTableColumnText(parseUTC(set.createdAt)),
        toTableColumnText(`${usersDict[set.createdBy]?.firstName} ${usersDict[set.createdBy]?.lastName}`),
        toTableColumnText(String(set.recordIds?.length)),
        toTableColumnComponent('ViewCell', undefined, { onClick: () => openModal(set.recordIds, set.question) })
    ]);
}