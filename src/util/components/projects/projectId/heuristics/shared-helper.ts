import { percentRoundString } from "@/submodules/javascript-functions/general";

export function mapInformationSourceStatsGlobal(data) {
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
            'Precision': !data ? '-' : percentRoundString(getPrecision(data.true_positives, data.false_positives)),
            'Recall': !data ? '-' : getRecall(data.true_positives, data.false_negatives),
            Coverage: !data ? '-' : data.record_coverage,
            TotalHits: !data ? '-' : data.total_hits,
            Conflicts: !data ? '-' : data.source_conflicts,
            Overlaps: !data ? '-' : data.source_overlaps,
        },
    }
}

export function mapInformationSourceStats(edges) {
    if (edges.length) {
        return edges.map((wrapper) => {
            return convertStatData(wrapper['node'])
        })
    } else {
        return [convertStatData()];
    }
}

function convertStatData(data = null) {
    return {
        label: !data ? '-' : data['labelingTaskLabel']['name'],
        color: !data ? '-' : data['labelingTaskLabel']['color'],
        labelId: !data ? '-' : data['labelingTaskLabel']['id'],
        values: {
            'TruePositives': !data ? '-' : data['truePositives'],
            'FalsePositives': !data ? '-' : data['falsePositives'],
            'FalseNegatives': !data ? '-' : data['falseNegatives'],
            'Precision': !data ? '-' : getPrecision(data['truePositives'], data['falsePositives']),
            'Recall': !data ? '-' : getRecall(data['truePositives'], data['falseNegatives']),
            Coverage: !data ? '-' : data['recordCoverage'],
            TotalHits: !data ? '-' : data['totalHits'],
            Conflicts: !data ? '-' : data['sourceConflicts'],
            Overlaps: !data ? '-' : data['sourceOverlaps'],
        },
    }
}

export function getPrecision(tp: number, fp: number): number {
    if (tp + fp == 0) {
        return 0;
    } else {
        return tp / (tp + fp);
    }
}

export function getRecall(tp: number, fn: number): number {
    if (tp + fn == 0) {
        return 0;
    } else {
        return tp / (tp + fn);
    }
}