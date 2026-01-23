import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { useSelector } from "react-redux";
import style from '@/src/styles/components/projects/projectId/attribute-calculation.module.css';
import { RecordDisplay } from "@/src/components/shared/record-display/RecordDisplay";
import { ViewRecordDetailsModalProps } from "@/src/types/components/projects/projectId/settings/attribute-calculation";
import { selectVisibleAttributesHeuristics } from "@/src/reduxStore/states/pages/settings";
import { useMemo } from "react";

export default function ViewRecordDetailsModal(props: ViewRecordDetailsModalProps) {
    const modalViewRecordDetails = useSelector(selectModal(ModalEnum.VIEW_RECORD_DETAILS));
    const attributes = useSelector(selectVisibleAttributesHeuristics);

    const displayValue = useMemo(() => {
        if (!props.sampleRecords || !modalViewRecordDetails.open) return null;
        return Array.isArray(props.sampleRecords[modalViewRecordDetails.recordIdx].calculatedValue.value)
            ? JSON.stringify(props.sampleRecords[modalViewRecordDetails.recordIdx].calculatedValue.value)
            : String(props.sampleRecords[modalViewRecordDetails.recordIdx].calculatedValue.value);
    }, [props.sampleRecords, modalViewRecordDetails.recordIdx, modalViewRecordDetails.open]);

    console.log(modalViewRecordDetails.record)
    console.log(props.sampleRecords)

    return (<>
        {modalViewRecordDetails.open && modalViewRecordDetails.record && props.sampleRecords && <>
            <Modal modalName={ModalEnum.VIEW_RECORD_DETAILS} className="md:max-w-5xl">
                <h1 className="text-lg text-gray-900 mb-2 text-center">View details</h1>

                <div className={`overflow-y-auto max-height-modal text-sm text-gray-500 my-2 ${style.scrollableSize}`}>
                    <RecordDisplay
                        attributes={attributes}
                        record={modalViewRecordDetails.record} />
                    <div className="text-sm leading-5 text-left text-gray-900 font-medium">Calculated value</div>
                    <div className="text-sm leading-5 text-left text-gray-500 font-normal whitespace-pre-line">
                        <div className="flex flex-col gap-y-2 divide-y">
                            {displayValue}
                        </div>
                    </div>
                </div>
            </Modal>
        </>}
    </>)
}