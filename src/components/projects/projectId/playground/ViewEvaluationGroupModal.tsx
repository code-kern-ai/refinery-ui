import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { useSelector } from "react-redux";
import style from '@/src/styles/components/projects/projectId/attribute-calculation.module.css';


export default function ViewEvaluationGroupModal() {
    const modalViewEvaluationGroup = useSelector(selectModal(ModalEnum.VIEW_EVALUATION_GROUP));

    return (<>
        {modalViewEvaluationGroup.open && modalViewEvaluationGroup.sets && <>
            <Modal modalName={ModalEnum.VIEW_EVALUATION_GROUP}>
                <h1 className="text-lg text-gray-900 mb-2 text-center">View details</h1>

                <div className={`overflow-y-auto max-height-modal text-sm text-gray-500 my-2 ${style.scrollableSize}`}>
                    {modalViewEvaluationGroup.sets.map((set, index) => {
                        return <div key={index}>Question: {set.question}</div>
                    })}
                </div>
            </Modal>
        </>}
    </>)
}