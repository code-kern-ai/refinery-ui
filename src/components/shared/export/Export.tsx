import { openModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { useDispatch } from "react-redux";
import ExportRecordsModal from "./ExportRecordsModal";
import { ExportProps } from "@/src/types/shared/export";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import { MemoIconDownload } from "@/submodules/react-components/components/kern-icons/icons";

export default function Export(props: ExportProps) {
    const dispatch = useDispatch();
    return (<>
        <KernButton
            text="Download records"
            icon={MemoIconDownload}
            onClick={() => dispatch(openModal(ModalEnum.EXPORT_RECORDS))}
            className="mr-1"
            tooltip={TOOLTIPS_DICT.GENERAL.DOWNLOAD_RECORDS}
            tooltipPlacement='bottom'
        />
        <ExportRecordsModal sessionId={props.sessionId} />
    </>)
}