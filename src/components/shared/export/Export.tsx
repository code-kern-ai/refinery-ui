import { openModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { Tooltip } from "@nextui-org/react";
import { IconDownload } from "@tabler/icons-react";
import { useDispatch } from "react-redux";
import ExportRecordsModal from "./ExportRecordsModal";
import { ExportProps } from "@/src/types/shared/export";

export default function Export(props: ExportProps) {
    const dispatch = useDispatch();
    return (<>
        <Tooltip content={TOOLTIPS_DICT.GENERAL.DOWNLOAD_RECORDS} color="invert" placement="bottom">
            <button onClick={() => dispatch(openModal(ModalEnum.EXPORT_RECORDS))}
                className="mr-1 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                <IconDownload className="h-5 w-5 inline-block mr-1" />
                Download records
            </button>
        </Tooltip>
        <ExportRecordsModal sessionId={props.sessionId} />
    </>)
}