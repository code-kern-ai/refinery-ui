import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { useSelector } from "react-redux";

export default function RecordCommentsModal() {
    const modalComments = useSelector(selectModal(ModalEnum.RECORD_COMMENTS));

    return (<Modal modalName={ModalEnum.RECORD_COMMENTS}>
        <h1 className="text-lg text-gray-900 mb-2 text-center">Record comments</h1>
        {modalComments && modalComments.commentsData && modalComments.commentsData.map((comment, index) => (
            <div className="break-words">
                <div className="flex flex-grow justify-between gap-8">
                    <p style={{ minWidth: '100px' }} className="font-bold">Comment {index + 1}</p>
                    <p className="text-gray-500">{comment.comment}</p>
                </div></div>
        ))}
    </Modal>
    );
}