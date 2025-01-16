import { openModal } from "@/src/reduxStore/states/modal";
import CreateExecutionModal from "./CreateExecutionModal";
import { ModalEnum } from "@/src/types/shared/modal";
import { useDispatch } from "react-redux";

export function ExecutionSets() {
    const dispatch = useDispatch();

    return <>
        <div>ExecutionSets</div>
        <button
            className={`ml-2 bg-green-100 border border-green-400 text-green-700 text-xs font-semibold px-4 py-2 rounded-md cursor-pointer opacity-100 hover:bg-green-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
            onClick={() => dispatch(openModal(ModalEnum.PLAYGROUND_EXECUTION))}>Create execution</button>
        <CreateExecutionModal />
    </>
}