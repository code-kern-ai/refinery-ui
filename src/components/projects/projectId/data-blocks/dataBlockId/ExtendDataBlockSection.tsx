import { openModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import { MemoIconPlus } from "@/submodules/react-components/components/kern-icons/icons";
import KernTable from "@/submodules/react-components/components/kern-table/KernTable";
import { useDispatch } from "react-redux";
import CreateNewDataBlockColumn from "./CreateNewDataBlockColumn";

export default function ExtendDataBlockSection() {
    const dispatch = useDispatch();
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
            <KernTable headers={[{ column: "Column", id: "column" }]} values={[]} />

            <CreateNewDataBlockColumn />
        </div>
    );
}