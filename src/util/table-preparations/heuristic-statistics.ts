import { toTableColumnComponent, toTableColumnText } from "@/submodules/react-components/helpers/kern-table-helper";

export const HEURISTICS_STATISTICS_TABLE_COLUMNS = [
    { column: 'Label', id: 'label' },
    { column: 'Est. Precision', id: 'precision', tooltip: 'True positives / (True positives + False positives)\nfor the reference data you labeled' },
    { column: 'Est. Recall', id: 'recall', tooltip: 'True positives / (True positives + False negatives)\nfor the reference data you labeled' },
    { column: 'Coverage', id: 'coverage', tooltip: 'How many records does this\nheuristic generally hit?' },
    { column: 'Hits', id: 'hits', tooltip: 'How many spans are hit\nby this heuristic?' },
    { column: 'Conflicts', id: 'conflicts', tooltip: 'On how many records (or spans)\ndoes this heuristic create conflicting\nexpressions to other heuristics?' },
    { column: 'Overlaps', id: 'overlaps', tooltip: 'On how many records (or spans)\ndoes this heuristic create overlapping\nexpressions to other heuristics?' }];

export function prepareTableBodyHeuristicStatistics(stats) {

    if (!stats || stats.length === 0) return [];

    return stats.map(stat => [
        toTableColumnComponent('LabelCell', undefined, { sourceContainer: stat }),
        toTableColumnText(stat.values.Precision),
        toTableColumnText(stat.values.Recall),
        toTableColumnText(stat.values.Coverage),
        toTableColumnText(stat.values.TotalHits),
        toTableColumnText(stat.values.Conflicts),
        toTableColumnText(stat.values.Overlaps),
    ])

}