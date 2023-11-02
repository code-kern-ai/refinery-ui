import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import Modal from "@/src/components/shared/modal/Modal";
import ModalUpload from "@/src/components/shared/upload/ModalUpload";
import { openModal } from "@/src/reduxStore/states/modal";
import { selectProject } from "@/src/reduxStore/states/project";
import { setUploadFileType } from "@/src/reduxStore/states/upload";
import { PASTE_TERM } from "@/src/services/gql/mutations/lookup-lists";
import { EXPORT_LIST } from "@/src/services/gql/queries/lookup-lists";
import { LookupListOperationsProps } from "@/src/types/components/projects/projectId/lookup-lists";
import { DownloadState } from "@/src/types/components/projects/projectId/settings/project-export";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { UploadFileType } from "@/src/types/shared/upload";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { downloadByteData } from "@/submodules/javascript-functions/export";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { IconClipboard, IconClipboardOff, IconDownload, IconUpload } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { timer } from "rxjs";

const BASE_OPTIONS = { reloadOnFinish: true, closeModalOnClick: true, isModal: true, knowledgeBaseId: null };
const ACCEPT_BUTTON = { buttonCaption: 'Add', useButton: true, disabled: false };
const ABORT_BUTTON = { buttonCaption: 'Remove', useButton: true, disabled: false };

export default function LookupListOperations(props: LookupListOperationsProps) {
    const router = useRouter();
    const dispatch = useDispatch();

    const project = useSelector(selectProject);

    const [downloadMessage, setDownloadMessage] = useState<DownloadState>(DownloadState.NONE);
    const [uploadOptions, setUploadOptions] = useState(BASE_OPTIONS);
    const [inputSplit, setInputSplit] = useState("\\n");
    const [inputArea, setInputArea] = useState("");

    const [refetchExportList] = useLazyQuery(EXPORT_LIST);
    const [pasteLookupListMut] = useMutation(PASTE_TERM);

    const pasteLookupList = useCallback(() => {
        pasteLookupListMut({ variables: { projectId: project.id, knowledgeBaseId: router.query.lookupListId, values: inputArea, split: inputSplit, delete: false } }).then((res) => {
            setInputArea("");
        });
    }, [inputArea, inputSplit]);

    const removeLookupList = useCallback(() => {
        pasteLookupListMut({ variables: { projectId: project.id, knowledgeBaseId: router.query.lookupListId, values: inputArea, split: inputSplit, delete: true } }).then((res) => {
            setInputArea("");
        });
    }, [inputArea, inputSplit]);

    useEffect(() => {
        props.refetchWS();
    }, [pasteLookupList, removeLookupList]);

    useEffect(() => {
        setAcceptButton({ ...ACCEPT_BUTTON, emitFunction: pasteLookupList });
        setAbortButton({ ...ABORT_BUTTON, emitFunction: removeLookupList });
    }, [inputArea, inputSplit]);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);
    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    useEffect(() => {
        setUploadOptions({ ...BASE_OPTIONS, knowledgeBaseId: router.query.lookupListId });
    }, [router.query.lookupListId]);

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

        <ModalUpload uploadOptions={uploadOptions} />

        <Modal modalName={ModalEnum.PASTE_LOOKUP_LIST} acceptButton={acceptButton}>
            <h1 className="text-lg text-gray-900 mb-2 font-bold text-center">Paste your list</h1>
            <div className="grid justify-center items-center gap-x-2 gap-y-1 justify-items-start" style={{ gridTemplateColumns: 'max-content min-content' }}>
                <span>Split On</span>
                <input value={inputSplit} type="text" onInput={(e: any) => setInputSplit(e.target.value)}
                    className="h-8 w-10 border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
            </div>
            <div className="mt-3" style={{ maxHeight: '80vh' }}>
                <textarea value={inputArea} onInput={(e: any) => setInputArea(e.target.value)}
                    placeholder="Paste your values here. No need to check for duplication, we do that for you."
                    className="leading-4 p-4 h-72 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"></textarea>
            </div>
        </Modal>

        <Modal modalName={ModalEnum.REMOVE_LOOKUP_LIST} abortButton={abortButton}>
            <h1 className="text-lg text-gray-900 mb-2 font-bold text-center">Remove your list</h1>
            <div className="grid justify-center items-center gap-x-2 gap-y-1 justify-items-start" style={{ gridTemplateColumns: 'max-content min-content' }}>
                <span>Split On</span>
                <input value={inputSplit} type="text" onInput={(e: any) => setInputSplit(e.target.value)}
                    className="h-8 w-10 border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
            </div>
            <div className="mt-3" style={{ maxHeight: '80vh' }}>
                <textarea value={inputArea} onInput={(e: any) => setInputArea(e.target.value)}
                    placeholder="Paste your values here. No need to check for duplication, we do that for you."
                    className="leading-4 p-4 h-72 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"></textarea>
            </div>
        </Modal>
    </div>)
}