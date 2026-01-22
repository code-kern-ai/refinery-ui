import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { useSelector } from "react-redux";
import style from '@/src/styles/components/projects/projectId/attribute-calculation.module.css';
import { ViewRecordDetailsModalProps } from "@/src/types/components/projects/projectId/settings/attribute-calculation";
import { useMemo } from "react";

export default function ViewRecordDetailsDataBlockColumnModal(props: ViewRecordDetailsModalProps) {
    const modalViewRecordDetails = useSelector(selectModal(ModalEnum.VIEW_RECORD_DETAILS_DATA_BLOCK_COLUMN));
    const displayValue = useMemo(() => {
        if (!props.sampleRecords || !modalViewRecordDetails.open) return null;
        return props.sampleRecords[modalViewRecordDetails.recordIdx].value;
    }, [props.sampleRecords, modalViewRecordDetails.open]);

    return (<>
        {modalViewRecordDetails.open && props.sampleRecords && <>
            <Modal modalName={ModalEnum.VIEW_RECORD_DETAILS_DATA_BLOCK_COLUMN} className="md:max-w-5xl">
                <h1 className="text-lg text-gray-900 mb-2 text-center">View details</h1>

                <div className={`overflow-y-auto max-height-modal text-sm text-gray-500 my-2 ${style.scrollableSize}`}>
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