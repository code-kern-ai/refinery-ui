import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import Modal from "../shared/modal/Modal";
import { Tooltip } from "@nextui-org/react";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { selectModal, setModalStates } from "@/src/reduxStore/states/modal";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { dateAsUTCDate } from "@/submodules/javascript-functions/date-parser";
import { extentModelsDownloaded, selectModelsDownloaded } from "@/src/reduxStore/states/pages/models-downloaded";
import { ModelsDownloaded, ModelsDownloadedStatus } from "@/src/types/components/models-downloaded/models-downloaded";
import { CacheEnum, selectCachedValue } from "@/src/reduxStore/states/cachedValues";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { modelProviderDownloadModel } from "@/src/services/base/misc";
import { PlatformType } from "@/src/types/components/projects/projectId/settings/embeddings";

const ACCEPT_BUTTON = { buttonCaption: 'Accept', useButton: true };

export default function AddModelDownloadModal() {
    const dispatch = useDispatch();

    const modalAddModel = useSelector(selectModal(ModalEnum.ADD_MODEL_DOWNLOAD));
    const modelsDownloaded = useSelector(selectModelsDownloaded);
    const modelsList = useSelector(selectCachedValue(CacheEnum.MODELS_LIST));

    const [modelName, setModelName] = useState('');
    const [colorDownloadedModels, setColorDownloadedModels] = useState<boolean[]>([]);
    const [hoverBoxList, setHoverBoxList] = useState<any[]>([]);
    const [filteredList, setFilteredList] = useState<any[]>(null);

    useEffect(() => {
        if (!modelsList) return;
        setFilteredList(modelsList.filter((model: any) => model.platform !== PlatformType.OPEN_AI));
    }, [modelsList]);

    useEffect(() => {
        if (!modelsDownloaded || !filteredList) return;
        const colorDownloadedModels = filteredList.map((model: any) => {
            const checkIfModelExists = modelsDownloaded.find((modelDownloaded: ModelsDownloaded) => modelDownloaded.name === model.configString);
            return checkIfModelExists !== undefined;
        });
        setColorDownloadedModels(colorDownloadedModels);
        const hoverBoxList = filteredList.map((model: any, index: number) => {
            if (model.description) return model.description;
            else return {
                avgTime: model.avgTime,
                base: model.base,
                size: model.size,
            }
        });
        setHoverBoxList(hoverBoxList);
    }, [modelsDownloaded, filteredList, modalAddModel, modelsList, modelName]);

    const addModel = useCallback(() => {
        modelProviderDownloadModel(modelName, (res) => {
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
                <KernDropdown options={filteredList && filteredList} useDifferentTextColor={colorDownloadedModels} differentTextColor="green" valuePropertyPath="configString"
                    hasSearchBar={true} dropdownItemsClasses="max-h-96 overflow-y-auto" ignoreDisabledForSearch={true}
                    selectedOption={(option: any) => {
                        setModelName(option.configString);
                    }} optionsHaveHoverBox={true} hoverBoxList={hoverBoxList}
                    searchTextTyped={(option: any) => setModelName(option)}
                    filteredOptions={(option) => {
                        setFilteredList(modelsList.filter((model: any) => model.configString.includes(option)));
                    }} />
            </div>
        </form>
    </Modal>)
}