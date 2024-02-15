import Modal from '@/src/components/shared/modal/Modal'
import { selectModal } from '@/src/reduxStore/states/modal'
import { ModalEnum } from '@/src/types/shared/modal'
import { useSelector } from 'react-redux'

export default function UserInfoModal() {
  const modalUserInfo = useSelector(selectModal(ModalEnum.USER_INFO))

  return (
    <Modal modalName={ModalEnum.USER_INFO}>
      <h1 className="mb-2 text-center text-lg text-gray-900">Info</h1>
      {modalUserInfo && modalUserInfo.userInfo && (
        <div className="mb-2 flex flex-grow flex-col items-center">
          <div className="mb-4">{modalUserInfo.userInfo.mail}</div>
          {!modalUserInfo.userInfo.countSum && (
            <div className="mb-2 italic text-gray-500">
              {' '}
              No labels associated with this user.
            </div>
          )}
          <div
            className="grid gap-x-4 gap-y-2"
            style={{ gridTemplateColumns: 'max-content max-content' }}
          >
            {modalUserInfo.userInfo.counts &&
              modalUserInfo.userInfo.counts.map((pair) => (
                <div key={pair.source} className="contents">
                  <div className="text-base font-semibold text-gray-900">
                    {pair.source}
                  </div>
                  <div className="text-base font-normal text-gray-500">
                    {pair.count + ' record' + (pair.count > 1 ? 's' : '')}
                  </div>
                </div>
              ))}
            {modalUserInfo.userInfo.counts > 1 && (
              <div className="contents">
                <div className="mt-2 text-base font-semibold text-gray-900">
                  Sum
                </div>
                <div className="mt-2 text-base font-normal text-gray-500">
                  {modalUserInfo.userInfo.countSum +
                    ' record' +
                    (modalUserInfo.userInfo.countSum > 1 ? 's' : '')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
