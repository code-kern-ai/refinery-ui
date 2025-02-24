import LoadingIcon from "@/submodules/react-components/components/LoadingIcon";
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
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";

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
            const downloadContent = JSON.parse(res);
            downloadByteData(downloadContent, 'lookup_list.json');
            const timerTime = Math.max(2000, res.length * 0.0001);
            timer(timerTime).subscribe(() => setDownloadMessage(DownloadState.NONE));
        });
    }

    return (<div className="w-full">
        <div className="float-right">
            <div className="inline-flex">
                <KernButton
                    text="Upload terms"
                    onClick={() => {
                        dispatch(openModal(ModalEnum.MODAL_UPLOAD));
                        dispatch(setUploadFileType(UploadFileType.KNOWLEDGE_BASE));
                    }}
                    className="mr-3"
                    tooltip={TOOLTIPS_DICT.LOOKUP_LISTS_DETAILS.UPLOAD_LOOKUP_LIST}
                    tooltipPlacement="bottom"
                    icon={IconUpload}
                    iconColor="gray"
                />
            </div>
            <div className="inline-flex">
                <KernButton
                    text="Download list"
                    onClick={requestFileExport}
                    className="mr-3"
                    tooltip={TOOLTIPS_DICT.LOOKUP_LISTS_DETAILS.DOWNLOAD_LOOKUP_LIST}
                    tooltipPlacement="bottom"
                    icon={IconDownload}
                    iconColor="gray"
                />
            </div>
            <div className="inline-flex">
                <KernButton
                    text="Paste terms"
                    onClick={() => dispatch(openModal(ModalEnum.PASTE_LOOKUP_LIST))}
                    className="mr-3"
                    tooltip={TOOLTIPS_DICT.LOOKUP_LISTS_DETAILS.PASTE_LOOKUP_LIST}
                    tooltipPlacement="bottom"
                    icon={IconClipboard}
                    iconColor="gray"
                />
            </div>
            <div className="inline-flex">
                <KernButton
                    text="Remove terms"
                    onClick={() => dispatch(openModal(ModalEnum.REMOVE_LOOKUP_LIST))}
                    className="mr-3"
                    tooltip={TOOLTIPS_DICT.LOOKUP_LISTS_DETAILS.DELETE_LOOKUP_LIST}
                    tooltipPlacement="bottom"
                    icon={IconClipboardOff}
                    buttonColor="red"
                    iconColor="red"
                />
            </div>
        </div>

        <ModalUpload uploadOptions={uploadOptions} closeModalEvent={props.refetchTerms} />
        <PasteLookupListModal />
        <RemoveLookupListModal />
    </div>)
}