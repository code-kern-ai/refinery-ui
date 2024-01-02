import Modal from "@/src/components/shared/modal/Modal";
import { ModalEnum } from "@/src/types/shared/modal";

export default function WhySoLongModal() {
    return (<Modal modalName={ModalEnum.WHY_SO_LONG}>
        <h1 className="text-lg text-gray-900 mb-2">Why is this taking so long?</h1>
        <div className="text-sm text-gray-500 my-2">
            Zero shot modules take a lot of time. That&apos;s unfortunate but nothing problematic. However, if the test center takes longer than expected usually the reason is that
            the underlying models needs to be prepared. But fear not! This is a task that only needs to be done once.
        </div>
    </Modal>)
}