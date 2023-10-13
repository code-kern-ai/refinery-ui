import { removeModelDownloadByName, selectModelsDownloaded, setModelsDownloaded } from "@/src/reduxStore/states/pages/models-downloaded";
import { GET_MODEL_PROVIDER_INFO } from "@/src/services/gql/queries/projects";
import { ModelsDownloaded, ModelsDownloadedStatus } from "@/src/types/components/models-downloaded/models-downloaded";
import { postProcessingModelsDownload, postProcessingZeroShotEncoders } from "@/src/util/components/models-downloaded/models-downloaded-helper";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { IconAlertTriangleFilled, IconArrowLeft, IconBan, IconCheckbox, IconCircleCheckFilled, IconExternalLink, IconLoader, IconPlus, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LoadingIcon from "../shared/loading/LoadingIcon";
import { openModal, selectModal, setModalStates } from "@/src/reduxStore/states/modal";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import Modal from "../shared/modal/Modal";
import { MODEL_PROVIDER_DELETE_MODEL, MODEL_PROVIDER_DOWNLOAD_MODEL } from "@/src/services/gql/mutations/projects";
import { selectIsManaged } from "@/src/reduxStore/states/general";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { GET_RECOMMENDED_ENCODERS_FOR_EMBEDDINGS, GET_ZERO_SHOT_RECOMMENDATIONS } from "@/src/services/gql/queries/project";
import { selectRecommendedEncodersAll } from "@/src/reduxStore/states/pages/settings";
import { WebSocketsService } from "@/src/services/base/web-sockets/WebSocketsService";
import { CurrentPage } from "@/src/types/shared/general";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { dateAsUTCDate } from "@/submodules/javascript-functions/date-parser";
import { timer } from "rxjs";
import { unsubscribeWSOnDestroy } from "@/src/services/base/web-sockets/web-sockets-helper";

const ABORT_BUTTON = { buttonCaption: 'Delete', useButton: true, disabled: false };
const ACCEPT_BUTTON = { buttonCaption: 'Accept', useButton: true };

export default function ModelsDownload() {
    const router = useRouter();
    const dispatch = useDispatch();

    const isManaged = useSelector(selectIsManaged);
    const modelsDownloaded = useSelector(selectModelsDownloaded);
    const modalDeleteModel = useSelector(selectModal(ModalEnum.DELETE_MODEL_DOWNLOAD));
    const modalAddModel = useSelector(selectModal(ModalEnum.ADD_MODEL_DOWNLOAD));
    const encoders = useSelector(selectRecommendedEncodersAll);

    const [modelsList, setModelsList] = useState<string[]>([]);
    const [modelName, setModelName] = useState<string>('');

    const [refetchModelsDownload] = useLazyQuery(GET_MODEL_PROVIDER_INFO, { fetchPolicy: 'network-only', nextFetchPolicy: 'cache-first' });
    const [deleteModelDownload] = useMutation(MODEL_PROVIDER_DELETE_MODEL);
    const [refetchZeroShotRecommendations] = useLazyQuery(GET_ZERO_SHOT_RECOMMENDATIONS, { fetchPolicy: 'network-only', nextFetchPolicy: 'cache-first' });
    const [refetchRecommendedEncoders] = useLazyQuery(GET_RECOMMENDED_ENCODERS_FOR_EMBEDDINGS, { fetchPolicy: 'network-only', nextFetchPolicy: 'cache-first' });
    const [downloadModelMut] = useMutation(MODEL_PROVIDER_DOWNLOAD_MODEL);

    useEffect(unsubscribeWSOnDestroy(router, [CurrentPage.MODELS_DOWNLOAD]), []);

    useEffect(() => {
        refetchModels();
        refetchZeroShotRecommendations().then((resZeroShot) => {
            if (encoders.length > 0) {
                setModelsList(postProcessingZeroShotEncoders(JSON.parse(resZeroShot.data['zeroShotRecommendations']), encoders));
            } else {
                refetchRecommendedEncoders().then((resEncoders) => {
                    setModelsList(postProcessingZeroShotEncoders(JSON.parse(resZeroShot.data['zeroShotRecommendations']), resEncoders.data['recommendedEncoders']));
                });
            }
        });
        WebSocketsService.subscribeToNotification(CurrentPage.MODELS_DOWNLOAD, {
            whitelist: ['model_provider_download'],
            func: handleWebsocketNotification
        })
    }, []);

    const deleteModel = useCallback(() => {
        deleteModelDownload({ variables: { modelName: modalDeleteModel.modelName } }).then(() => {
            dispatch(removeModelDownloadByName(modalDeleteModel.modelName));
        });
    }, [modalDeleteModel]);

    const addModel = useCallback(() => {
        downloadModelMut({ variables: { modelName: modalAddModel.modelName } }).then((res) => {
            const downloadedModelsCopy = jsonCopy(modelsDownloaded);
            downloadedModelsCopy.push({
                "name": modalAddModel.modelName,
                "date": dateAsUTCDate(new Date()).toLocaleString(),
                "status": "initializing"
            });
            dispatch(setModelsDownloaded(downloadedModelsCopy));
        });
    }, [modalAddModel]);

    useEffect(() => {
        const checkIfModelExists = modelsDownloaded.find((model: ModelsDownloaded) => model.name === modelName);
        setAbortButton({ ...abortButton, emitFunction: deleteModel });
        setAcceptButton({ ...acceptButton, emitFunction: addModel, disabled: modelName === '' || checkIfModelExists !== undefined });
    }, [modalDeleteModel, modalAddModel]);

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);
    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);


    function refetchModels() {
        refetchModelsDownload().then((res) => {
            dispatch(setModelsDownloaded(postProcessingModelsDownload(res.data['modelProviderInfo'])));
        });
    }

    function handleWebsocketNotification(msgParts: string[]) {
        if (msgParts[1] === 'model_provider_download' && msgParts[2] === 'started') {
            timer(2500).subscribe(() => refetchModels());

        } else if (msgParts[1] === 'model_provider_download' && msgParts[2] === 'finished') {
            timer(2500).subscribe(() => refetchModels())
        }
    }

    // TODO: add the hover box and the colors after the dropdown review is done
    return (<div className="p-4 bg-gray-100 h-screen overflow-y-auto flex-1 flex flex-col">
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
                                    <td className="text-center px-3 py-2 text-sm text-gray-500 flex justify-center">
                                        {model.zeroShotPipeline ? <Tooltip content="Can be used for zero-shot" color="invert" placement="top">
                                            <IconCheckbox className="h-5 w-5"></IconCheckbox>
                                        </Tooltip> : <Tooltip content="Cannot be used for zero-shot" color="invert" placement="top">
                                            <IconBan className="h-5 w-5"></IconBan>
                                        </Tooltip>}
                                    </td>
                                    <td className="text-center px-3 py-2 text-sm text-gray-500">
                                        {model.revision ? model.revision : '-'}
                                    </td>
                                    <td className="text-center px-3 py-2 text-sm text-gray-500 flex justify-center">
                                        {model.link && <a href={model.link} target="_blank">
                                            <IconExternalLink className="h-5 w-5" />
                                        </a>}
                                    </td>
                                    <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                        {model.date != '0' && (model.status === ModelsDownloadedStatus.FINISHED || model.status === ModelsDownloadedStatus.DOWNLOADING) ? model.parseDate : '-'}
                                        {model.status === ModelsDownloadedStatus.INITIALIZING && <>{model.date}</>}
                                    </td>
                                    <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                        {model.status === ModelsDownloadedStatus.FINISHED ? model.sizeFormatted : '-'}
                                    </td>
                                    <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500 justify-center flex">
                                        {model.status === ModelsDownloadedStatus.FINISHED && <Tooltip content="Successfully created" color="invert" placement="top">
                                            <IconCircleCheckFilled className="h-6 w-6 text-green-500" />
                                        </Tooltip>}
                                        {model.status === ModelsDownloadedStatus.FAILED && <Tooltip content="Model ran into errors" color="invert" placement="top">
                                            <IconAlertTriangleFilled className="h-6 w-6 text-red-500" />
                                        </Tooltip>}
                                        {model.status === ModelsDownloadedStatus.DOWNLOADING && <Tooltip content="Model is downloading" color="invert" placement="top">
                                            <LoadingIcon />
                                        </Tooltip>}
                                        {model.status === ModelsDownloadedStatus.INITIALIZING && <Tooltip content="Model is initializing" color="invert" placement="top">
                                            <IconLoader className="h-6 w-6 text-gray-500" />
                                        </Tooltip>}
                                    </td>
                                    <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                        <IconTrash onClick={() => dispatch(setModalStates(ModalEnum.DELETE_MODEL_DOWNLOAD, { modelName: model.name, open: true }))}
                                            className="h-6 w-6 text-red-700 cursor-pointer" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-1 align-top">
                <div>
                    <button onClick={() => dispatch(openModal(ModalEnum.ADD_MODEL_DOWNLOAD))}
                        className={`mr-1 inline-flex items-center px-2.5 py-2 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer ${!isManaged ? 'pointer-events-none cursor-not-allowed opacity-50' : ''}`}>
                        <IconPlus className="h-4 w-4 mr-1" />
                        Add new model
                    </button>
                </div>
            </div>
        </div>

        <Modal modalName={ModalEnum.DELETE_MODEL_DOWNLOAD} abortButton={abortButton}>
            <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
                Warning </div>
            <p className="mt-2 text-gray-500 text-sm">Are you sure you want to delete this embedding?</p>
            <p className="text-gray-500 text-sm">This will delete all data associated with it!</p>
        </Modal>

        <Modal modalName={ModalEnum.ADD_MODEL_DOWNLOAD} acceptButton={acceptButton}>
            <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
                Add new model</div>
            <form className="mt-3">
                <div className="grid grid-cols-2 gap-2 items-center" style={{ gridTemplateColumns: 'max-content auto' }}>
                    <Tooltip content="Name of your Hugging Face model" placement="right" color="invert">
                        <span className="card-title mb-0 label-text flex"><span className="cursor-help underline filtersUnderline">Name</span></span>
                    </Tooltip>
                    <Dropdown options={modelsList.map((model: any) => model.configString)} hasSearchBar={true} selectedOption={(option: string) => {
                        dispatch(setModalStates(ModalEnum.ADD_MODEL_DOWNLOAD, { modelName: option, open: true }));
                        setModelName(option);
                    }} />
                </div>
            </form>
        </Modal>
    </div>);
}