export const HEURISTICS_STATISTICS_TABLE_COLUMNS = [{ column: 'Label', id: 'label' }, { column: 'Est. Precision', id: 'precision' }, { column: 'Est. Recall', id: 'recall' }, { column: 'Coverage', id: 'coverage' }, { column: 'Hits', id: 'hits' }, { column: 'Conflicts', id: 'conflicts' }, { column: 'Overlaps', id: 'overlaps' }];

export function prepareTableBodyHeuristicStatistics(stats) {
    let finalData = [];
    stats.forEach((stat) => {
        const currentRow = [
            {
                type: 'Component',
                component: 'LabelCell',
                sourceContainer: stat
            },
            {
                type: 'text',
                value: stat.values.Precision
            },
            {
                type: 'text',
                value: stat.values.Recall
            },
            {
                type: 'text',
                value: stat.values.Coverage
            },
            {
                type: 'text',
                value: stat.values.TotalHits
            },
            {
                type: 'text',
                value: stat.values.Conflicts
            },
            {
                type: 'text',
                value: stat.values.Overlaps
            }
        ];
        finalData.push(currentRow);
    });
    return finalData;
}