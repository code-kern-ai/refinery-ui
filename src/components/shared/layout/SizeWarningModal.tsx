import { ModalEnum } from "@/src/types/shared/modal";
import Modal from "../modal/Modal";
import { useDispatch } from "react-redux";
import { closeModal } from "@/src/reduxStore/states/modal";


export default function SizeWarningModal(props: { minWidth: number }) {
    const dispatch = useDispatch();

    return (<Modal modalName={ModalEnum.SIZE_WARNING} hasOwnButtons={true}>
        <div className="flex flex-row justify-center text-lg leading-6 text-gray-900 font-medium mb-2">Information </div>

        <div className="mt-3 flex flex-row justify-between">
            <div className="flex flex-row-reverse justify-start text-sm text-left">
                The application is designed for certain screen sizes (&gt; {props.minWidth}px width). If you continue, the application is provided with a global scrollbar.
            </div>
        </div>
        <div className="mt-5 flex justify-end">
            <button className={`ml-2 bg-green-100 border border-green-400 text-green-700 text-xs font-semibold px-4 py-2 rounded-md cursor-pointer opacity-100 hover:bg-green-200 focus:outline-none`}
                onClick={() => dispatch(closeModal(ModalEnum.SIZE_WARNING))}>Continue</button>
        </div>
    </Modal>)
}