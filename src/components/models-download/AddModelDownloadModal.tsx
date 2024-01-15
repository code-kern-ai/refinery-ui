import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import Modal from "../shared/modal/Modal";
import { Tooltip } from "@nextui-org/react";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { selectModal, setModalStates } from "@/src/reduxStore/states/modal";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@apollo/client";
import { MODEL_PROVIDER_DOWNLOAD_MODEL } from "@/src/services/gql/mutations/projects";
import { useCallback, useEffect, useState } from "react";
import { dateAsUTCDate } from "@/submodules/javascript-functions/date-parser";
import { extentModelsDownloaded, selectModelsDownloaded } from "@/src/reduxStore/states/pages/models-downloaded";
import { ModelsDownloaded, ModelsDownloadedStatus } from "@/src/types/components/models-downloaded/models-downloaded";
import { CacheEnum, selectCachedValue } from "@/src/reduxStore/states/cachedValues";
import Dropdown2 from "@/submodules/react-components/components/Dropdown2";

const ACCEPT_BUTTON = { buttonCaption: 'Accept', useButton: true };

export default function AddModelDownloadModal() {
    const dispatch = useDispatch();

    const modalAddModel = useSelector(selectModal(ModalEnum.ADD_MODEL_DOWNLOAD));
    const modelsDownloaded = useSelector(selectModelsDownloaded);
    const modelsList = useSelector(selectCachedValue(CacheEnum.MODELS_LIST));

    const [modelName, setModelName] = useState('');
    const [colorDownloadedModels, setColorDownloadedModels] = useState<boolean[]>([]);
    const [hoverBoxList, setHoverBoxList] = useState<any[]>([]);
    const [lineSeparatorIndex, setLineSeparatorIndex] = useState(-1);

    useEffect(() => {
        if (!modelsDownloaded || !modelsList) return;
        const colorDownloadedModels = modelsList.map((model: any) => {
            const checkIfModelExists = modelsDownloaded.find((modelDownloaded: ModelsDownloaded) => modelDownloaded.name === model.configString);
            return checkIfModelExists !== undefined;
        });
        setColorDownloadedModels(colorDownloadedModels);
        const hoverBoxList = modelsList.map((model: any, index: number) => {
            if (model.description) return model.description;
            else return {
                avgTime: model.avgTime,
                base: model.base,
                size: model.size,
            }
        });
        setHoverBoxList(hoverBoxList);
        setLineSeparatorIndex(modelsList.findIndex((model: any) => !model.description));
    }, [modelsDownloaded, modelsList]);

    const [downloadModelMut] = useMutation(MODEL_PROVIDER_DOWNLOAD_MODEL);

    const addModel = useCallback(() => {
        downloadModelMut({ variables: { modelName: modelName } }).then((res) => {
            const newModel = {
                "name": modelName,
                "date": dateAsUTCDate(new Date()).toLocaleString(),
                "status": ModelsDownloadedStatus.INITIALIZING
            };
            dispatch(extentModelsDownloaded(newModel));
        });
    }, [modelName]);

    useEffect(() => {
        if (!modelsDownloaded) return;
        const checkIfModelExists = modelsDownloaded.find((model: ModelsDownloaded) => model.name === modelName);
        setAcceptButton({ ...acceptButton, emitFunction: addModel, disabled: modelName === '' || checkIfModelExists !== undefined });
    }, [modelsDownloaded, addModel, modalAddModel]);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    return (<Modal modalName={ModalEnum.ADD_MODEL_DOWNLOAD} acceptButton={acceptButton}>
        <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
            Add new model</div>
        <form className="mt-3">
            <div className="grid grid-cols-2 gap-2 items-center" style={{ gridTemplateColumns: 'max-content auto' }}>
                <Tooltip content={TOOLTIPS_DICT.MODELS_DOWNLOAD.MODEL} placement="right" color="invert">
                    <span className="card-title mb-0 label-text flex"><span className="cursor-help underline filtersUnderline">Name</span></span>
                </Tooltip>
                <Dropdown2 options={modelsList && modelsList} useDifferentTextColor={colorDownloadedModels} differentTextColor="green" valuePropertyPath="configString"
                    hasSearchBar={true} dropdownItemsClasses="max-h-96 overflow-y-auto"
                    selectedOption={(option: string) => {
                        setModelName(option);
                    }} optionsHaveHoverBox={true} hoverBoxList={hoverBoxList} lineSeparatorIndex={lineSeparatorIndex} />
            </div>
        </form>
    </Modal>)
}