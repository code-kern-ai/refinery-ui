import { selectModelsDownloaded, setModelsDownloaded } from "@/src/reduxStore/states/pages/models-downloaded";
import { ModelsDownloaded, ModelsDownloadedStatus } from "@/src/types/components/models-downloaded/models-downloaded";
import { Tooltip } from "@nextui-org/react";
import { IconAlertTriangleFilled, IconArrowLeft, IconBan, IconCheckbox, IconCircleCheckFilled, IconExternalLink, IconLoader, IconPlus, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import LoadingIcon from "../shared/loading/LoadingIcon";
import { openModal, setModalStates } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { selectIsAdmin, selectIsManaged, selectOrganizationId } from "@/src/reduxStore/states/general";
import { timer } from "rxjs";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import AddModelDownloadModal from "./AddModelDownloadModal";
import DeleteModelDownloadModal from "./DeleteModelDownloadModal";
import { useWebsocket } from "@/submodules/react-components/hooks/web-socket/useWebsocket";
import { getModelProviderInfo } from "@/src/services/base/project";
import { Application, CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";

export default function ModelsDownload() {
    const router = useRouter();
    const dispatch = useDispatch();

    const isManaged = useSelector(selectIsManaged);
    const isAdmin = useSelector(selectIsAdmin);
    const modelsDownloaded = useSelector(selectModelsDownloaded);

    useEffect(() => {
        refetchModels();
    }, []);

    function refetchModels() {
        getModelProviderInfo((res) => {
            dispatch(setModelsDownloaded(res.data['modelProviderInfo']));
        });
    }

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (msgParts[1] === 'model_provider_download' && msgParts[2] === 'started') {
            timer(2500).subscribe(() => refetchModels());

        } else if (msgParts[1] === 'model_provider_download' && msgParts[2] === 'finished') {
            timer(2500).subscribe(() => refetchModels());
        }
    }, []);

    const orgId = useSelector(selectOrganizationId);
    useWebsocket(orgId, Application.REFINERY, CurrentPage.MODELS_DOWNLOAD, handleWebsocketNotification);

    return (<div className="p-4 bg-gray-100 flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="flex flex-row items-center">
            <button onClick={() => router.back()} className="text-green-800 text-sm font-medium">
                <IconArrowLeft className="h-5 w-5 inline-block text-green-800" />
                <span className="leading-5">Go back</span>
            </button>
        </div>
        <div className="mt-4 text-lg leading-6 text-gray-900 font-medium inline-block">
            Downloaded models
        </div>
        <div className="mt-1">
            <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col"
                                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Name</th>
                                <th scope="col"
                                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Zero-shot</th>
                                <th scope="col"
                                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Revision</th>
                                <th scope="col"
                                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Link</th>
                                <th scope="col"
                                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Download date</th>
                                <th scope="col"
                                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Size</th>
                                <th scope="col"
                                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Status</th>
                                <th scope="col"
                                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {modelsDownloaded && modelsDownloaded.map((model: ModelsDownloaded, index: number) => (
                                <tr key={model.name} className={`${index % 2 != 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                    <td className="text-center px-3 py-2 text-sm text-gray-500">
                                        <span className="inline-block mr-2">{model.name}</span>
                                    </td>
                                    <td className="text-center px-3 py-2 text-sm text-gray-500">
                                        <div className="flex justify-center">
                                            {model.zeroShotPipeline ? <Tooltip content={TOOLTIPS_DICT.MODELS_DOWNLOAD.USED_ZS} color="invert" placement="top" className="cursor-auto">
                                                <IconCheckbox className="h-5 w-5"></IconCheckbox>
                                            </Tooltip> : <Tooltip content={TOOLTIPS_DICT.MODELS_DOWNLOAD.NOT_USED_ZS} color="invert" placement="top" className="cursor-auto">
                                                <IconBan className="h-5 w-5"></IconBan>
                                            </Tooltip>}
                                        </div>
                                    </td>
                                    <td className="text-center px-3 py-2 text-sm text-gray-500">
                                        {model.revision ? model.revision : '-'}
                                    </td>
                                    <td className="text-center px-3 py-2 text-sm text-gray-500">
                                        <div className="flex justify-center">
                                            {model.link && <a href={model.link} target="_blank">
                                                <IconExternalLink className="h-5 w-5" />
                                            </a>}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                        {model.date != '0' && (model.status === ModelsDownloadedStatus.FINISHED || model.status === ModelsDownloadedStatus.DOWNLOADING) ? model.parseDate : '-'}
                                        {model.status === ModelsDownloadedStatus.INITIALIZING && <>{model.date}</>}
                                    </td>
                                    <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                        {model.status === ModelsDownloadedStatus.FINISHED ? model.sizeFormatted : '-'}
                                    </td>
                                    <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                        <div className="flex justify-center">
                                            {model.status === ModelsDownloadedStatus.FINISHED && <Tooltip content={TOOLTIPS_DICT.GENERAL.SUCCESSFULLY_CREATED} color="invert" placement="top" className="cursor-auto">
                                                <IconCircleCheckFilled className="h-6 w-6 text-green-500" />
                                            </Tooltip>}
                                            {model.status === ModelsDownloadedStatus.FAILED && <Tooltip content={TOOLTIPS_DICT.GENERAL.ERROR} color="invert" placement="top" className="cursor-auto">
                                                <IconAlertTriangleFilled className="h-6 w-6 text-red-500" />
                                            </Tooltip>}
                                            {model.status === ModelsDownloadedStatus.DOWNLOADING && <Tooltip content={TOOLTIPS_DICT.GENERAL.DOWNLOADING} color="invert" placement="top" className="cursor-auto">
                                                <LoadingIcon />
                                            </Tooltip>}
                                            {model.status === ModelsDownloadedStatus.INITIALIZING && <Tooltip content={TOOLTIPS_DICT.GENERAL.INITIALIZING} color="invert" placement="top" className="cursor-auto">
                                                <IconLoader className="h-6 w-6 text-gray-500" />
                                            </Tooltip>}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                        {isAdmin && <IconTrash onClick={() => dispatch(setModalStates(ModalEnum.DELETE_MODEL_DOWNLOAD, { modelName: model.name, open: true }))}
                                            className="h-6 w-6 text-red-700 cursor-pointer" />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-1 align-top">
            <div>
                <button onClick={() => dispatch(openModal(ModalEnum.ADD_MODEL_DOWNLOAD))}
                    disabled={!isManaged}
                    className={`mr-1 inline-flex items-center px-2.5 py-2 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}>
                    <IconPlus className="h-4 w-4 mr-1" />
                    Add new model
                </button>
            </div>
        </div>
        <AddModelDownloadModal />
        <DeleteModelDownloadModal />
    </div>);
}