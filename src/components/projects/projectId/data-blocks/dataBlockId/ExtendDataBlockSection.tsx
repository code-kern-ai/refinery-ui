import { openModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import { MemoIconPlus } from "@/submodules/react-components/components/kern-icons/icons";
import KernTable from "@/submodules/react-components/components/kern-table/KernTable";
import { useDispatch, useSelector } from "react-redux";
import CreateNewDataBlockColumn from "./CreateNewDataBlockColumn";
import { useCallback, useMemo } from "react";
import { selectDataBlock, selectDataBlockColumns } from "@/src/reduxStore/states/pages/data-blocks";
import { DATA_BLOCKS_COLUMNS_TABLE_COLUMNS, prepareTableBodyDataBlocksColumns } from "@/src/util/table-preparations/data-blocks";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { useRouter } from "next/router";
import { CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";
import { setCurrentPage } from "@/src/reduxStore/states/general";

export default function ExtendDataBlockSection() {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const dataBlockId = useSelector(selectDataBlock).id;
    const dataBlocksColumns = useSelector(selectDataBlockColumns);

    const onClickDetails = useCallback((dataBlockColumnId: string) => {
        dispatch(setCurrentPage(CurrentPage.DATA_BLOCKS_COLUMNS));
        router.push(`/projects/${projectId}/data-blocks/${dataBlockId}/${dataBlockColumnId}`);
    }, [projectId, dataBlockId]);

    const preparedValues = useMemo(() => {
        return prepareTableBodyDataBlocksColumns(dataBlocksColumns, onClickDetails)
    }, [dataBlocksColumns]);

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