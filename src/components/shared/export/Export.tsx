import { openModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { Tooltip } from "@nextui-org/react";
import { IconDownload } from "@tabler/icons-react";
import { useDispatch } from "react-redux";
import ExportRecordsModal from "./ExportRecordsModal";
import { ExportProps } from "@/src/types/shared/export";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";

export default function Export(props: ExportProps) {
    const dispatch = useDispatch();
    return (<>
        <KernButton
            text="Download records"
            icon={IconDownload}
            onClick={() => dispatch(openModal(ModalEnum.EXPORT_RECORDS))}
            className="mr-1"
            tooltip={TOOLTIPS_DICT.GENERAL.DOWNLOAD_RECORDS}
            tooltipPlacement='bottom'
        />
        <ExportRecordsModal sessionId={props.sessionId} />
    </>)
}