import { LabelSource } from "@/submodules/javascript-functions/enums/enums";
import { getColorStruct, mapInformationSourceStatsGlobal } from "./heuristics/shared-helper";

export const ACTIONS_DROPDOWN_OPTIONS = ['Select all', 'Deselect all', 'Delete selected'];

export function postProcessModelCallbacks(modelCallBack: string) {
    if (!modelCallBack) return [];
    return JSON.parse(modelCallBack).map((source) => {
        source.labelSource = LabelSource.INFORMATION_SOURCE;
        source.stats = mapInformationSourceStatsGlobal(source.stat_data);
        source.stats.forEach((stat) => {
            stat.color = getColorStruct(stat.color);
        });
        return source;
    });
}


