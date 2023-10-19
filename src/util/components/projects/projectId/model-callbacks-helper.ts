import { LabelSource } from "@/submodules/javascript-functions/enums/enums";

export const ACTIONS_DROPDOWN_OPTIONS = ['Select all', 'Deselect all', 'Delete selected'];

export function postProcessModelCallbacks(modelCallBack: any) {
    if (!modelCallBack) return [];
    return JSON.parse(modelCallBack).map((source) => {
        source.labelSource = LabelSource.INFORMATION_SOURCE;
        source.stats = mapInformationSourceStatsGlobal(source.stat_data);
        return source;
    });
}

function mapInformationSourceStatsGlobal(data) {
    if (data?.length) {
        return data.map((wrapper) => {
            return convertStatDataGlobal(wrapper)
        })
    } else {
        return [convertStatDataGlobal()];
    }
}
function convertStatDataGlobal(data = null) {
    return {
        label: !data ? '-' : data.label,
        color: !data ? '-' : data.color,
        labelId: !data ? '-' : data.labelId,
        values: {
            'TruePositives': !data ? '-' : data.true_positives,
            'FalsePositives': !data ? '-' : data.false_positives,
            'FalseNegatives': !data ? '-' : data.false_negatives,
            'Precision': !data ? '-' : getPrecision(data.true_positives, data.false_positives),
            'Recall': !data ? '-' : getRecall(data.true_positives, data.false_negatives),
            Coverage: !data ? '-' : data.record_coverage,
            TotalHits: !data ? '-' : data.total_hits,
            Conflicts: !data ? '-' : data.source_conflicts,
            Overlaps: !data ? '-' : data.source_overlaps,
        },
    }
}

function getPrecision(tp: number, fp: number): number {
    if (tp + fp == 0) {
        return 0;
    } else {
        return tp / (tp + fp);
    }
}

function getRecall(tp: number, fn: number): number {
    if (tp + fn == 0) {
        return 0;
    } else {
        return tp / (tp + fn);
    }
}
