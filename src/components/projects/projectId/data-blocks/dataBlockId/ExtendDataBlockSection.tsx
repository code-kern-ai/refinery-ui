import { openModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import { MemoIconPlus } from "@/submodules/react-components/components/kern-icons/icons";
import KernTable from "@/submodules/react-components/components/kern-table/KernTable";
import { useDispatch, useSelector } from "react-redux";
import CreateNewDataBlockColumn from "./CreateNewDataBlockColumn";
import { useMemo } from "react";
import { selectDataBlockColumns } from "@/src/reduxStore/states/pages/data-blocks";
import { DATA_BLOCKS_COLUMNS_TABLE_COLUMNS, prepareTableBodyDataBlocksColumns } from "@/src/util/table-preparations/data-blocks";

export default function ExtendDataBlockSection() {
    const dispatch = useDispatch();
    const dataBlocksColumns = useSelector(selectDataBlockColumns);
    const preparedValues = useMemo(() => prepareTableBodyDataBlocksColumns(dataBlocksColumns), [dataBlocksColumns]);

    return (
        <div className="mt-8">
            <h1 className="text-lg font-medium text-gray-900">Extend Data Block</h1>
            <p className="text-sm text-gray-500">Extend the data block to include more data.</p>
            <div className="my-3">
                <KernButton
                    text="Add new column"
                    onClick={() => dispatch(openModal(ModalEnum.CREATE_DATA_BLOCK_COLUMN))}
                    icon={MemoIconPlus}
                />
            </div>
            <KernTable
                headers={DATA_BLOCKS_COLUMNS_TABLE_COLUMNS}
                values={preparedValues}
                config={{
                    addBorder: true,
                }} />

            <CreateNewDataBlockColumn />
        </div>
    );
}