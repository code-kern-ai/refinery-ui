import Modal from "@/src/components/shared/modal/Modal";
import { ModalEnum } from "@/src/types/shared/modal";

export default function SyncRecordsModal() {
    return (<Modal modalName={ModalEnum.SYNC_RECORDS}>
        Test
    </Modal>)
}