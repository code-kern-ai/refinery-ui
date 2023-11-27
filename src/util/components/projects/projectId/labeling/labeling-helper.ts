import { LabelingVars } from "@/src/types/components/projects/projectId/labeling/labeling";

export function getDefaultLabelingVars(): LabelingVars {
    return {
        loading: true,
        loopAttributes: null,
        taskLookup: null
    }
}