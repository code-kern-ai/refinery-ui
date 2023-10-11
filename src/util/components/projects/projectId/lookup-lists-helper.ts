import { LookupList } from "@/src/types/components/projects/projectId/lookup-lists";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { asPythonVariable } from "@/submodules/javascript-functions/python-functions-parser";

export function postProcessLookupLists(lookupLists: LookupList) {
    const prepareLookupLists = jsonCopy(lookupLists);
    prepareLookupLists.forEach((lookupList: LookupList) => {
        lookupList.pythonVariable = asPythonVariable(lookupList.name);
    });
    return prepareLookupLists;
}