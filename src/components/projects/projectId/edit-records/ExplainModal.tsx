import Modal from "@/src/components/shared/modal/Modal";
import { closeModal, selectModal } from "@/src/reduxStore/states/modal";
import { ExplainModalProps } from "@/src/types/components/projects/projectId/edit-records";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { IconAlertTriangleFilled, IconInfoCircleFilled } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const BACK_BUTTON = { buttonCaption: 'Close and never show again', useButton: true, disabled: false };

export default function ExplainModal(props: ExplainModalProps) {
    const dispatch = useDispatch();
    const explainModal = useSelector(selectModal(ModalEnum.EXPLAIN_EDIT_RECORDS));

    const [backButton, setBackButton] = useState<ModalButton>(BACK_BUTTON);

    const closeModalAndNeverShowAgain = useCallback(() => {
        localStorage.setItem("ERhideExplainModal", "X");
        const erdDataCopy = { ...props.erdData };
        erdDataCopy.modals.hideExplainModal = true;
        props.setErdData(erdDataCopy);
        dispatch(closeModal(ModalEnum.EXPLAIN_EDIT_RECORDS));
    }, []);

    useEffect(() => {
        setBackButton({ ...backButton, emitFunction: closeModalAndNeverShowAgain });
    }, [explainModal]);

    return (<Modal modalName={ModalEnum.EXPLAIN_EDIT_RECORDS} backButton={backButton}>
        <h1 className="text-lg text-gray-900 mb-2 text-center">Warning
            <IconAlertTriangleFilled className="inline-block text-yellow-400" />
        </h1>
        <div className="text-sm text-gray-700 flex flex-col gap-y-2 my-2 font-medium">
            <div>Changing records directly should only be done in edge cases! </div>
            <div>This changes your data without the change being reproducible.</div>
        </div>
        <h1 className="text-lg text-gray-900 text-center inline-flex items-center gap-x-1">Info
            <IconInfoCircleFilled className="inline-block text-blue-400" />
        </h1>
        <div className="text-sm text-gray-700 flex flex-col gap-y-2 my-2 font-medium">
            <div>Currently your changes are only <b>cached</b>. This means they aren't persisted/updated yet.</div>
            <div>To persist the changes you need to <b>Synchronize with DB</b>. </div>
            <div>Note that this will rerun tokenization & embedding calculation for changed records.</div>
            <div>Further, already set labels for information extraction will be removed.</div>
            <div>Attribute calculation, Weak Supervision and Heuristics are <b>NOT</b> rerun.</div>
        </div>
    </Modal>)
}