import { ModalEnum } from "@/src/types/shared/modal";
import Modal from "../modal/Modal";
import NotificationCenter from "./NotificationCenter";


export default function NotificationCenterModal() {
    return (<Modal modalName={ModalEnum.NOTIFICATION_CENTER}>
        <h1 className="text-lg text-gray-900 mb-2 font-medium text-center">Notification center</h1>
        <NotificationCenter />
    </Modal>)
}