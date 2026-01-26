import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { useDispatch, useSelector } from "react-redux";
import style from '@/src/styles/components/projects/projectId/attribute-calculation.module.css';
import { ViewRecordDetailsModalProps } from "@/src/types/components/projects/projectId/settings/attribute-calculation";
import { useEffect, useMemo } from "react";
import { RecordDisplay } from "@/src/components/shared/record-display/RecordDisplay";
import { selectVisibleAttributesHeuristics, setAllAttributes } from "@/src/reduxStore/states/pages/settings";
import { getAttributes } from "@/src/services/base/attribute";
import { selectProjectId } from "@/src/reduxStore/states/project";

export default function ViewRecordDetailsDataBlockColumnModal(props: ViewRecordDetailsModalProps) {
    const dispatch = useDispatch();
    const modalViewRecordDetails = useSelector(selectModal(ModalEnum.VIEW_RECORD_DETAILS_DATA_BLOCK_COLUMN));
    const projectId = useSelector(selectProjectId);
    const attributes = useSelector(selectVisibleAttributesHeuristics);

    useEffect(() => {
        if (attributes.length > 0) return;
        getAttributes(projectId, ['ALL'], (res) => {
            dispatch(setAllAttributes(res));
        });
    }, [attributes])

    const displayValue = useMemo(() => {
        if (!props.sampleRecords || !modalViewRecordDetails.open) return null;
        return Array.isArray(props.sampleRecords[modalViewRecordDetails.recordIdx].calculatedValue.value)
            ? JSON.stringify(props.sampleRecords[modalViewRecordDetails.recordIdx].calculatedValue.value)
            : String(props.sampleRecords[modalViewRecordDetails.recordIdx].calculatedValue.value);
    }, [props.sampleRecords, modalViewRecordDetails.recordIdx, modalViewRecordDetails.open]);

    return (<>
        {modalViewRecordDetails.open && props.sampleRecords && modalViewRecordDetails.record && <>
            <Modal modalName={ModalEnum.VIEW_RECORD_DETAILS_DATA_BLOCK_COLUMN} className="md:max-w-3xl">
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