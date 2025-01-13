import { selectModelsDownloaded, setModelsDownloaded } from "@/src/reduxStore/states/pages/models-downloaded";
import { Tooltip } from "@nextui-org/react";
import { IconAlertTriangleFilled, IconArrowLeft, IconCircleCheckFilled, IconExternalLink, IconLoader, IconPlus, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LoadingIcon from "../../../submodules/react-components/components/LoadingIcon";
import { openModal, setModalStates } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { selectIsAdmin, selectOrganizationId } from "@/src/reduxStore/states/general";
import { timer } from "rxjs";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import AddModelDownloadModal from "./AddModelDownloadModal";
import DeleteModelDownloadModal from "./DeleteModelDownloadModal";
import { useWebsocket } from "@/submodules/react-components/hooks/web-socket/useWebsocket";
import { getModelProviderInfo } from "@/src/services/base/project";
import { Application, CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";
import { MODELS_DOWNLOAD_TABLE_COLUMNS, prepareTableBodyModelsDownload } from "@/src/util/table-preparations/models-download";
import KernTable from "@/submodules/react-components/components/kern-table/KernTable";

export default function ModelsDownload() {
    const router = useRouter();
    const dispatch = useDispatch();
    const isAdmin = useSelector(selectIsAdmin);
    const modelsDownloaded = useSelector(selectModelsDownloaded);

    const [preparedValues, setPreparedValues] = useState([]);

    useEffect(() => {
        refetchModels();
    }, []);

    useEffect(() => {
        if (!modelsDownloaded) return;
        setPreparedValues(prepareTableBodyModelsDownload(modelsDownloaded, openDeleteModal, isAdmin));
    }, [modelsDownloaded]);

    function openDeleteModal(model) {
        dispatch(setModalStates(ModalEnum.DELETE_MODEL_DOWNLOAD, { modelName: model.name, open: true }));
    }

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
                    <KernTable
                        headers={MODELS_DOWNLOAD_TABLE_COLUMNS}
                        values={preparedValues}
                    />
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-1 align-top">
            <div>
                <button onClick={() => dispatch(openModal(ModalEnum.ADD_MODEL_DOWNLOAD))}
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