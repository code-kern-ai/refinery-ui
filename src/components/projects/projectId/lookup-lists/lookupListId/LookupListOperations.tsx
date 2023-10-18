import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import Modal from "@/src/components/shared/modal/Modal";
import Upload from "@/src/components/shared/upload/Upload";
import { openModal } from "@/src/reduxStore/states/modal";
import { selectProject } from "@/src/reduxStore/states/project";
import { EXPORT_LIST } from "@/src/services/gql/queries/lookup-lists";
import { DownloadState } from "@/src/types/components/projects/projectId/settings/project-export";
import { ModalEnum } from "@/src/types/shared/modal";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-contants";
import { downloadByteData } from "@/submodules/javascript-functions/export";
import { useLazyQuery } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { IconClipboard, IconClipboardOff, IconDownload, IconUpload } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { timer } from "rxjs";

export default function LookupListOperations() {
    const router = useRouter();
    const dispatch = useDispatch();

    const project = useSelector(selectProject);

    const [downloadMessage, setDownloadMessage] = useState<DownloadState>(DownloadState.NONE);

    const [refetchExportList] = useLazyQuery(EXPORT_LIST)

    function requestFileExport(): void {
        setDownloadMessage(DownloadState.PREPARATION);
        refetchExportList({ variables: { projectId: project.id, listId: router.query.lookupListId } }).then((res) => {
            setDownloadMessage(DownloadState.DOWNLOAD);
            const downloadContent = JSON.parse(res.data['exportKnowledgeBase']);
            downloadByteData(downloadContent, 'lookup_list.json');
            const timerTime = Math.max(2000, res.data['exportKnowledgeBase'].length * 0.0001);
            timer(timerTime).subscribe(() => setDownloadMessage(DownloadState.NONE));
        });
    }

    return (<div className="w-full">
        <div className="float-right">
            <div className="inline-flex">
                <Tooltip content={TOOLTIPS_DICT.LOOKUP_LISTS_DETAILS.UPLOAD_LOOKUP_LIST} color="invert" placement="bottom">
                    <button onClick={() => dispatch(openModal(ModalEnum.UPLOAD_LOOKUP_LIST))}
                        className="ml-3 mr-1 inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                        <IconUpload className="h-4 w-4 mr-1" />
                        Upload terms
                    </button>
                </Tooltip>
            </div>
            <div className="inline-flex">
                <Tooltip content={TOOLTIPS_DICT.LOOKUP_LISTS_DETAILS.DOWNLOAD_LOOKUP_LIST} color="invert" placement="bottom" className="inline-flex">
                    <button onClick={requestFileExport}
                        className="ml-3 mr-1 inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                        <IconDownload className="h-4 w-4 mr-1" />
                        Download list
                        {downloadMessage == DownloadState.PREPARATION || downloadMessage == DownloadState.DOWNLOAD && <span className="ml-2 inline-flex items-center rounded text-xs font-medium bg-gray-100 text-gray-800">
                            <LoadingIcon color="gray" size="xs" /></span>}
                    </button>
                </Tooltip>
            </div>
            <div className="inline-flex">
                <Tooltip content={TOOLTIPS_DICT.LOOKUP_LISTS_DETAILS.PASTE_LOOKUP_LIST} color="invert" placement="bottom" className="inline-flex">
                    <button onClick={() => dispatch(openModal(ModalEnum.PASTE_LOOKUP_LIST))}
                        className="ml-3 mr-1 inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                        <IconClipboard className="h-4 w-4 mr-1" />
                        Paste list
                    </button>
                </Tooltip>
            </div>
            <div className="inline-flex">
                <Tooltip content={TOOLTIPS_DICT.LOOKUP_LISTS_DETAILS.DELETE_LOOKUP_LIST} color="invert" placement="bottom" className="inline-flex">
                    <button onClick={() => dispatch(openModal(ModalEnum.REMOVE_LOOKUP_LIST))}
                        className="ml-2 mr-1 inline-flex items-center px-4 py-2 border border-red-400 shadow-sm text-xs font-semibold rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer">
                        <IconClipboardOff className="h-4 w-4 mr-1" />
                        Remove list
                    </button>
                </Tooltip>
            </div>

        </div>

        <Modal modalName={ModalEnum.UPLOAD_LOOKUP_LIST}>

        </Modal>
        <Modal modalName={ModalEnum.PASTE_LOOKUP_LIST}>

        </Modal>
        <Modal modalName={ModalEnum.REMOVE_LOOKUP_LIST}>

        </Modal>
    </div>)
}