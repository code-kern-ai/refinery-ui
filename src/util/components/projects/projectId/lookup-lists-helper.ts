import { LookupList, Term } from "@/src/types/components/projects/projectId/lookup-lists";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { asPythonVariable } from "@/submodules/javascript-functions/python-functions-parser";

export const ACTIONS_DROPDOWN_OPTIONS = ['Select all', 'Deselect all', 'Delete selected'];
export const TERMS_DROPDOWN_OPTIONS = ['Edit term', 'Remove term', 'Blacklist term'];
export const BLACKLISTED_TERMS_DROPDOWN_OPTIONS = ['Remove term', 'Whitelist term'];

export function postProcessLookupLists(lookupLists: LookupList[]) {
    const prepareLookupLists = jsonCopy(lookupLists);
    prepareLookupLists.forEach((lookupList: LookupList) => {
        lookupList.pythonVariable = asPythonVariable(lookupList.name);
    });
    return prepareLookupLists;
}

export function postProcessLookupList(lookupList: LookupList) {
    const prepareLookupList = jsonCopy(lookupList);
    prepareLookupList.pythonVariable = asPythonVariable(lookupList.name);
    return prepareLookupList;
}

export function postProcessTerms(terms: Term[]) {
    let prepareTerms = jsonCopy(terms);
    if (prepareTerms?.length > 100) {
        prepareTerms = terms.slice(0, 100);
    }
    return prepareTerms.sort((a, b) => a.value.localeCompare(b.value));
}

export function isTermUnique(termName: string, terms: Term[]): boolean {
    for (const t of terms) {
        if (t.value == termName) return false;
    }
    return true;
}