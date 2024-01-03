import { DangerZoneProps } from "@/src/types/shared/danger-zone";
import { Tooltip } from "@nextui-org/react";
import { ModalEnum } from "@/src/types/shared/modal";
import { setModalStates } from "@/src/reduxStore/states/modal";
import { useDispatch } from "react-redux";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import DeleteElementModal from "./DeleteElementModal";


export default function DangerZone(props: DangerZoneProps) {
    const dispatch = useDispatch();

    return (<div className="mt-8 pb-4">
        <div className="text-gray-900 text-lg leading-6 font-medium">Danger zone</div>

        <div className="flex flex-row items-center">
            <div className="text-sm leading-5 font-normal mt-2 text-gray-500 inline-block">This action can not be reversed.
                Are you sure you want to delete this {props.elementType}?</div>

            <Tooltip content={TOOLTIPS_DICT.GENERAL.CANNOT_BE_REVERTED} placement="right" color="invert">
                <button onClick={() => dispatch(setModalStates(ModalEnum.DELETE_ELEMENT, { open: true, id: props.id }))}
                    className="bg-red-100 text-red-700 border border-red-400 text-xs font-semibold px-4 py-2 rounded-md cursor-pointer ml-6 h-9 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    Delete {props.name}
                </button>
            </Tooltip>
        </div>
        <DeleteElementModal id={props.id} name={props.name} elementType={props.elementType} />
    </div >)
}