import { DataBlockColumn } from "@/src/types/components/projects/projectId/data-blocks/data-blocks";
import { toTableColumnText } from "@/submodules/react-components/helpers/kern-table-helper";

export const DATA_BLOCKS_COLUMNS_TABLE_COLUMNS = [
    { column: 'Name', id: 'name' },
    { column: 'Type', id: 'type' },
];

export function prepareTableBodyDataBlocksColumns(dataBlocksColumns: DataBlockColumn[]) {
    if (!dataBlocksColumns || dataBlocksColumns.length === 0) return [];

    return dataBlocksColumns.map(dataBlockColumn => [
        toTableColumnText(dataBlockColumn.name),
        toTableColumnText(dataBlockColumn.dataType)
    ]);
}