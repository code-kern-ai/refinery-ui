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
            <Modal modalName={ModalEnum.VIEW_EVALUATION_SET} className="md:max-w-4xl">
                <h1 className="text-lg text-gray-900 mb-2 text-center">Details</h1>
                <div className="flex flex-col">
                    <div className="text-left mb-1">{modalViewEvaluationSets.question}</div>
                    <div className="text-xs text-gray-600 self-start"><span>{modalViewEvaluationSets.records.length}</span> Records</div>
                    <div className={`overflow-y-auto max-height-modal text-sm text-gray-500 my-1 ${style.scrollableSize}`}>
                        {modalViewEvaluationSets.records.map((record, index) =>
                            <div key={index} className="flex flex-col gap-x-3 bg-white rounded-md border border-gray-300 py-2 px-3 my-1">
                                <RecordDisplay
                                    key={index}
                                    attributes={attributes}
                                    record={record} />
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </>}
    </>)
}