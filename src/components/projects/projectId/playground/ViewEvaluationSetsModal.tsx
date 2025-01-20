import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { useSelector } from "react-redux";
import style from '@/src/styles/components/projects/projectId/attribute-calculation.module.css';
import { RecordDisplay } from "@/src/components/shared/record-display/RecordDisplay";
import { selectVisibleAttributesHeuristics } from "@/src/reduxStore/states/pages/settings";

export default function ViewEvaluationSetsModal() {
    const modalViewEvaluationSets = useSelector(selectModal(ModalEnum.VIEW_EVALUATION_SET));
    const attributes = useSelector(selectVisibleAttributesHeuristics);

    return (<>
        {modalViewEvaluationSets.open && modalViewEvaluationSets.records && <>
            <Modal modalName={ModalEnum.VIEW_EVALUATION_SET}>
                <h1 className="text-lg text-gray-900 mb-2 text-center">View details</h1>

                <div className={`overflow-y-auto max-height-modal text-sm text-gray-500 my-2 ${style.scrollableSize}`}>
                    {modalViewEvaluationSets.records.map((record, index) => {
                        return <RecordDisplay
                            key={index}
                            attributes={attributes}
                            record={record} />
                    })}
                </div>
            </Modal>
        </>}
    </>)
}