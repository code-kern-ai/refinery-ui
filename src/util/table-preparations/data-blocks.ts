import { DataBlockColumn } from "@/src/types/components/projects/projectId/data-blocks/data-blocks";
import { toTableColumnComponent, toTableColumnText } from "@/submodules/react-components/helpers/kern-table-helper";

export const DATA_BLOCKS_COLUMNS_TABLE_COLUMNS = [
    { column: 'Column Name', id: 'columnName' },
    { column: 'Column Data Type', id: 'columnDataType' },
    { column: 'State', id: 'state' },
    { column: 'Details', id: 'details' },
];

export function prepareTableBodyDataBlocksColumns(dataBlocksColumns: DataBlockColumn[], onClickDetails: (dataBlockColumnId: string) => void) {
    if (!dataBlocksColumns || dataBlocksColumns.length === 0) return [];

    return dataBlocksColumns.map(dataBlockColumn => [
        toTableColumnText(dataBlockColumn.columnName),
        toTableColumnText(dataBlockColumn.columnDataType),
        toTableColumnText(dataBlockColumn.state),
        toTableColumnComponent('DataBlockColumnDetailsCell', undefined, { userCreated: dataBlockColumn.userCreated, onClick: () => onClickDetails(dataBlockColumn.id) })
    ]);
}