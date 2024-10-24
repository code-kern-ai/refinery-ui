import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import ModalUpload from "@/src/components/shared/upload/ModalUpload";
import { openModal } from "@/src/reduxStore/states/modal";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { setUploadFileType } from "@/src/reduxStore/states/upload";
import { LookupListOperationsProps } from "@/src/types/components/projects/projectId/lookup-lists";
import { DownloadState } from "@/src/types/components/projects/projectId/settings/project-export";
import { ModalEnum } from "@/src/types/shared/modal";
import { UploadFileType } from "@/src/types/shared/upload";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { downloadByteData } from "@/submodules/javascript-functions/export";
import { Tooltip } from "@nextui-org/react";
import { IconClipboard, IconClipboardOff, IconDownload, IconUpload } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { timer } from "rxjs";
import PasteLookupListModal from "./PasteLookupListModal";
import RemoveLookupListModal from "./RemoveLookupListModal";
import { getExportLookupList } from "@/src/services/base/lookup-lists";

const BASE_OPTIONS = { reloadOnFinish: true, closeModalOnClick: true, isModal: true, knowledgeBaseId: null };

export default function LookupListOperations(props: LookupListOperationsProps) {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);

    const [downloadMessage, setDownloadMessage] = useState<DownloadState>(DownloadState.NONE);
    const [uploadOptions, setUploadOptions] = useState(BASE_OPTIONS);

    useEffect(() => {
        setUploadOptions({ ...BASE_OPTIONS, knowledgeBaseId: router.query.lookupListId });
    }, [router.query.lookupListId]);

    function requestFileExport(): void {
        setDownloadMessage(DownloadState.PREPARATION);
        getExportLookupList(projectId, router.query.lookupListId, (res) => {
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
                    <button onClick={() => {
                        dispatch(openModal(ModalEnum.MODAL_UPLOAD));
                        dispatch(setUploadFileType(UploadFileType.KNOWLEDGE_BASE));
                    }} className="ml-3 mr-1 inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
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
                        Paste terms
                    </button>
                </Tooltip>
            </div>
            <div className="inline-flex">
                <Tooltip content={TOOLTIPS_DICT.LOOKUP_LISTS_DETAILS.DELETE_LOOKUP_LIST} color="invert" placement="bottom" className="inline-flex">
                    <button onClick={() => dispatch(openModal(ModalEnum.REMOVE_LOOKUP_LIST))}
                        className="ml-2 mr-1 inline-flex items-center px-4 py-2 border border-red-400 shadow-sm text-xs font-semibold rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer">
                        <IconClipboardOff className="h-4 w-4 mr-1" />
                        Remove terms
                    </button>
                </Tooltip>
            </div>

        </div>

        <ModalUpload uploadOptions={uploadOptions} closeModalEvent={props.refetchTerms} />
        <PasteLookupListModal />
        <RemoveLookupListModal />
    </div>)
}