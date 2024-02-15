import { ModalEnum } from '@/src/types/shared/modal'
import Modal from '../modal/Modal'
import NotificationCenter from './NotificationCenter'

export default function NotificationCenterModal() {
  return (
    <Modal modalName={ModalEnum.NOTIFICATION_CENTER}>
      <h1 className="mb-2 text-center text-lg font-bold text-gray-900">
        Notification center
      </h1>
      <NotificationCenter />
    </Modal>
  )
}
