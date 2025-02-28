import { DangerZoneProps } from "@/src/types/shared/danger-zone";
import { Tooltip } from "@nextui-org/react";
import { ModalEnum } from "@/src/types/shared/modal";
import { setModalStates } from "@/src/reduxStore/states/modal";
import { useDispatch } from "react-redux";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import DeleteElementModal from "./DeleteElementModal";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";


export default function DangerZone(props: DangerZoneProps) {
    const dispatch = useDispatch();

    return (<div className="mt-8 pb-4">
        <div className="text-gray-900 text-lg leading-6 font-medium">Danger zone</div>

        <div className="flex flex-row items-center gap-x-3">
            <div className="text-sm leading-5 font-normal mt-2 text-gray-500 inline-block">This action can not be reversed.
                Are you sure you want to delete this {props.elementType}?</div>

            <KernButton
                tooltip={TOOLTIPS_DICT.GENERAL.CANNOT_BE_REVERTED}
                text={`Delete ${props.name}`}
                onClick={() => dispatch(setModalStates(ModalEnum.DELETE_ELEMENT, { open: true, id: props.id }))}
                buttonColor="red"
                tooltipPlacement="right"
            />
        </div>
        <DeleteElementModal id={props.id} name={props.name} elementType={props.elementType} />
    </div >)
}