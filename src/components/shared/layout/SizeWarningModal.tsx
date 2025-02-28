import { ModalEnum } from "@/src/types/shared/modal";
import Modal from "../modal/Modal";
import { useDispatch } from "react-redux";
import { closeModal } from "@/src/reduxStore/states/modal";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";


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
            <KernButton
                text="Continue"
                onClick={() => dispatch(closeModal(ModalEnum.SIZE_WARNING))}
                buttonColor="green"
            />
        </div>
    </Modal>)
}