import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { useSelector } from "react-redux";

export default function UserInfoModal() {
    const modalUserInfo = useSelector(selectModal(ModalEnum.USER_INFO));

    return (<Modal modalName={ModalEnum.USER_INFO}>
        <h1 className="text-lg text-gray-900 mb-2 text-center">Info</h1>
        {modalUserInfo && modalUserInfo.userInfo && <div className="flex-grow items-center flex flex-col mb-2">
            <div className="mb-4">{modalUserInfo.userInfo.mail}</div>
            {!modalUserInfo.userInfo.countSum && <div className="text-gray-500 italic"> No labels associated with this user.</div>}
            <div className="grid gap-x-4 gap-y-2" style={{ gridTemplateColumns: 'max-content max-content' }}>
                {modalUserInfo.userInfo.counts && modalUserInfo.userInfo.counts.map((pair) => (<div key={pair.source} className="contents">
                    <div className="text-base text-gray-900 font-semibold">{pair.source}</div>
                    <div className="text-base text-gray-500 font-normal">{pair.count + ' record' + (pair.count > 1 ? 's' : '')}</div>
                </div>))}
                {modalUserInfo.userInfo.counts > 1 && <div className="contents">
                    <div className="text-base text-gray-900 font-semibold mt-2">Sum</div>
                    <div className="text-base text-gray-500 font-normal mt-2">{modalUserInfo.userInfo.countSum + ' record' + (modalUserInfo.userInfo.countSum > 1 ? 's' : '')}</div>
                </div>}
            </div>
        </div>}
    </Modal>)
}