import CryptedField from "@/src/components/shared/crypted-field/CryptedField";
import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import Modal from "@/src/components/shared/modal/Modal";
import { closeModal, selectModal } from "@/src/reduxStore/states/modal";
import { selectEmbeddings } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { getProjectSize, prepareProjectExport } from "@/src/services/base/project-setting";
import { downloadFile } from "@/src/services/base/s3-service";
import { useWebsocket } from "@/submodules/react-components/hooks/web-socket/useWebsocket";
import { getLastProjectExportCredentials } from '@/src/services/base/project';
import { DownloadState, ProjectSize } from "@/src/types/components/projects/projectId/settings/project-export";
import { ModalEnum } from "@/src/types/shared/modal";
import { postProcessingFormGroups } from "@/src/util/components/projects/projectId/settings/project-export-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { downloadByteDataNoStringify } from "@/submodules/javascript-functions/export";
import { formatBytes } from "@/submodules/javascript-functions/general";
import { Tooltip } from "@nextui-org/react";
import { IconDownload, IconInfoCircle } from "@tabler/icons-react";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { timer } from "rxjs";
import { Application, CurrentPage, CurrentPageSubKey } from "@/submodules/react-components/hooks/web-socket/constants";
import { selectOrganizationId } from "@/src/reduxStore/states/general";

export default function ProjectSnapshotExportModal() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const modal = useSelector(selectModal(ModalEnum.PROJECT_SNAPSHOT));
    const embeddings = useSelector(selectEmbeddings);

    const [projectSize, setProjectSize] = useState(null);
    const [projectExportArray, setProjectExportArray] = useState<ProjectSize[]>(null);
    const [downloadSizeText, setDownloadSizeText] = useState('');
    const [projectExportCredentials, setProjectExportCredentials] = useState(null);
    const [downloadPrepareMessage, setDownloadPrepareMessage] = useState(null);
    const [key, setKey] = useState('');

    useEffect(() => {
        if (!modal || !modal.open) return;
        if (!projectId) return;
        requestProjectSize();
        requestProjectExportCredentials();

    }, [modal, projectId]);

    useEffect(() => {
        if (!projectExportArray) return;
        let downloadSize: number = 0;
        for (let i = 0; i < projectExportArray.length; i++) {
            if (projectExportArray[i].export) downloadSize += projectExportArray[i].sizeNumber;
        }
        setDownloadSizeText(downloadSize ? formatBytes(downloadSize, 2) : "O bytes");
    }, [projectExportArray]);

    function requestProjectSize() {
        getProjectSize(projectId, (res) => {
            setProjectSize(res.data['projectSize']);
            setProjectExportArray(postProcessingFormGroups(res.data['projectSize'], embeddings));
        });
    }

    function requestProjectExportCredentials() {
        getLastProjectExportCredentials(projectId, (res) => {
            const projectExportCredentials = res.data['lastProjectExportCredentials'];
            if (!projectExportCredentials) setProjectExportCredentials(null);
            else {
                const credentials = JSON.parse(projectExportCredentials);
                const parts = credentials.objectName.split('/');
                credentials.downloadFileName = parts[parts.length - 1];
                setProjectExportCredentials(credentials);
            }
        });
    }

    function prepareDownload() {
        if (downloadPrepareMessage == DownloadState.PREPARATION || downloadPrepareMessage == DownloadState.DOWNLOAD) return;
        setDownloadPrepareMessage(DownloadState.PREPARATION);
        const exportOptions = buildJsonExportOptions();
        let keyToSend = key;
        if (!keyToSend) keyToSend = null;
        prepareProjectExport(projectId, { exportOptions: exportOptions, key: keyToSend }, (res) => {
            setProjectExportCredentials(null);
        });
    }

    function buildJsonExportOptions() {
        let toReturn = {}
        const values = projectExportArray;
        for (const element of values) {
            if (element.export) toReturn[element.name] = true;
        }
        return JSON.stringify(toReturn)
    }

    function exportViaFile() {
        if (!projectExportCredentials) return;
        setDownloadPrepareMessage(DownloadState.DOWNLOAD);
        const fileName = projectExportCredentials.downloadFileName;
        downloadFile(projectExportCredentials, false).subscribe((data) => {
            downloadByteDataNoStringify(data, fileName);
            timer(5000).subscribe(
                () => (setDownloadPrepareMessage(DownloadState.NONE))
            );
        });
    }

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (msgParts[1] == 'project_export') {
            setDownloadPrepareMessage(DownloadState.NONE);
            requestProjectExportCredentials();
        }
    }, []);

    const orgId = useSelector(selectOrganizationId);
    useWebsocket(orgId, Application.REFINERY, CurrentPage.PROJECT_SETTINGS, handleWebsocketNotification, projectId, CurrentPageSubKey.SNAPSHOT_EXPORT);

    return (<Modal modalName={ModalEnum.PROJECT_SNAPSHOT} hasOwnButtons={true}>
        <div className="text-lg leading-6 text-gray-900 font-medium text-center">
            Project export </div>
        <div className="mt-1 text-sm leading-5 font-medium text-gray-700">See the size of each
            export item.</div>
        <div className="flex flex-col">
            {projectSize ? <div>
                <form>
                    <div className="grid items-center p-2 gap-x-4" style={{ gridTemplateColumns: 'auto 25px auto auto' }}>
                        <div className="flex">
                            <span className="card-title mb-0 label-text">Name</span>
                        </div>
                        <div></div>
                        <div className="flex">
                            <span className="card-title mb-0 label-text">Size estimate</span>
                        </div>
                        <div className="flex flex-row justify-center items-center gap-2">
                            <span className="card-title mb-0 label-text">Export</span>
                        </div>
                        {projectExportArray.map((item: ProjectSize, index: number) => (<Fragment key={item.name}>
                            <div className="contents" >
                                <div className="flex">
                                    <p className={`break-words cursor-default capitalize-first ${item.moveRight ? 'ml-4' : null}`}>{item.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-items-center">
                                {item.desc && <Tooltip content={item.desc} color="invert" placement="top" className="cursor-auto">
                                    <IconInfoCircle className="h-6 w-6 text-gray-900" />
                                </Tooltip>}
                            </div>
                            <div className="flex">{item.sizeReadable}</div>
                            <div className="flex justify-center">
                                <div className="form-control">
                                    <label className="card-title mb-0 cursor-pointer label p-0">
                                        <input type="checkbox" className="cursor-pointer" checked={item.export} onChange={(e: any) => {
                                            const tmpArray = [...projectExportArray];
                                            tmpArray[index].export = e.target.checked;
                                            setProjectExportArray(tmpArray);
                                        }} />
                                    </label>
                                </div>
                            </div>
                        </Fragment>
                        ))}
                    </div>
                </form>
            </div> : <div className="flex flex-col items-center justify-items-center mb-8 mt-4">
                <LoadingIcon />
            </div>}
        </div>
        {projectSize && <div className="mt-4" style={{ borderTop: '1px solid #ddd' }}>
            <div></div>
            <div className="my-2 mr-2 flex flex-row flex-nowrap justify-end">
                <span className="card-title mb-0 label-text">Final size estimate:</span>
                <span className="card-title mb-0 label-text ml-2">{downloadSizeText}</span>
            </div>
            <CryptedField label="Encrypt zip file with password" keyChange={(key: string) => setKey(key)} />
        </div>}

        <div className="flex mt-6 justify-end">
            {projectExportCredentials && projectExportCredentials.downloadFileName && <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.LATEST_SNAPSHOT} color="invert">
                <button onClick={exportViaFile} className="bg-white text-gray-700 text-xs font-semibold mr-4 px-4 py-2 rounded-md border border-gray-300 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <IconDownload className="mr-1 h-5 w-5 inline-block" />
                    {projectExportCredentials.downloadFileName}
                </button>
            </Tooltip>}
            <button onClick={prepareDownload}
                disabled={downloadPrepareMessage == DownloadState.PREPARATION || downloadPrepareMessage == DownloadState.DOWNLOAD}
                className={`bg-green-100 flex items-center mr-4 text-green-700 border border-green-400 text-xs font-semibold px-4 rounded-md cursor-pointer hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                type="submit">
                Prepare download
                {downloadPrepareMessage == DownloadState.PREPARATION && <span className="ml-2"><LoadingIcon color="green" /></span>}
            </button>
            <button onClick={() => dispatch(closeModal(ModalEnum.PROJECT_SNAPSHOT))}
                className="bg-white text-gray-700 text-xs font-semibold px-4 py-2 rounded border border-gray-300 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Close
            </button>
        </div>

    </Modal>)
}
