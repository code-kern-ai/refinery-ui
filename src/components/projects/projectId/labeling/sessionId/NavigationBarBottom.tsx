import { selectUser } from "@/src/reduxStore/states/general";
import { openModal, setModalStates } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { UserRole } from "@/src/types/shared/sidebar";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { Tooltip } from "@nextui-org/react";
import { IconTrash } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import DeleteRecordModal from "./DeleteRecordModal";

export default function NavigationBarBottom() {
    const dispatch = useDispatch();

    const user = useSelector(selectUser);

    function toggleAutoNextRecord() { }

    return (<>
        {user && <div className="w-full px-4 border-gray-200 border-t h-16">
            <div className="relative flex-shrink-0 bg-white shadow-sm flex justify-between items-center h-full">
                <div className="flex flex-row flex-nowrap items-center">
                    <div className="flex justify-center overflow-visible">
                        {user.role == UserRole.ENGINEER && <Tooltip content={TOOLTIPS_DICT.LABELING.DELETE_CURRENT_RECORD} color="invert" placement="top">
                            <button onClick={() => dispatch(setModalStates(ModalEnum.DELETE_RECORD, { open: true, recordId: '' }))}
                                className="bg-red-100 text-red-700 border border-red-400 text-xs font-semibold mr-3 px-4 py-2 rounded-md flex hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                <IconTrash className="mr-2" size={16} />
                                Delete record
                            </button>
                        </Tooltip>}
                    </div>
                    <div className="flex justify-center overflow-visible items-center cursor-pointer" onClick={toggleAutoNextRecord}>

                    </div>
                </div>
            </div>
            <DeleteRecordModal />
        </div>}
    </>)
}