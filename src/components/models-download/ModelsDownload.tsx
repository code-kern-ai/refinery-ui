import { selectModelsDownloaded, setModelsDownloaded } from "@/src/reduxStore/states/pages/models-downloaded";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openModal, setModalStates } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { selectIsAdmin, selectOrganizationId } from "@/src/reduxStore/states/general";
import { timer } from "rxjs";
import AddModelDownloadModal from "./AddModelDownloadModal";
import DeleteModelDownloadModal from "./DeleteModelDownloadModal";
import { useWebsocket } from "@/submodules/react-components/hooks/web-socket/useWebsocket";
import { getModelProviderInfo } from "@/src/services/base/project";
import { Application, CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";
import { MODELS_DOWNLOAD_TABLE_COLUMNS, prepareTableBodyModelsDownload } from "@/src/util/table-preparations/models-download";
import KernTable from "@/submodules/react-components/components/kern-table/KernTable";
import ButtonAsText from "@/submodules/react-components/components/kern-button/ButtonAsText";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import { MemoIconArrowLeft, MemoIconPlus } from "@/submodules/react-components/components/kern-icons/icons";

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
            dispatch(setModelsDownloaded(res));
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

    const openCreateModal = useCallback(() => {
        dispatch(openModal(ModalEnum.ADD_MODEL_DOWNLOAD));
    }, []);

    return (<div className="p-4 bg-gray-100 flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="flex flex-row items-center">
            <ButtonAsText
                text="Go back"
                onClick={() => router.back()}
                color="green"
                iconLeft={MemoIconArrowLeft}
                iconColor="green"
            />
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
                <KernButton
                    text="Add new model"
                    icon={MemoIconPlus}
                    onClick={openCreateModal}
                />
            </div>
        </div>
        <AddModelDownloadModal />
        <DeleteModelDownloadModal />
    </div>);
}