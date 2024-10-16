import { selectUser } from "@/src/reduxStore/states/general";
import { openModal, selectModal } from "@/src/reduxStore/states/modal";
import { selectActiveSearchParams, selectActiveSlice, selectAdditionalData, selectConfiguration, setActiveDataSlice, updateAdditionalDataState } from "@/src/reduxStore/states/pages/data-browser";
import { selectAttributes, selectEmbeddings, selectLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { ModalEnum } from "@/src/types/shared/modal";
import { getRawFilterForSave, parseFilterToExtended } from "@/src/util/components/projects/projectId/data-browser/filter-parser-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { SearchGroup, Slice } from "@/submodules/javascript-functions/enums/enums";
import { Tooltip } from "@nextui-org/react";
import { IconChartBubble, IconFilter, IconRotate } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import CreateOutlierSliceModal from "./modals/CreateOutlierSliceModal";
import SaveDataSliceModal from "./modals/SaveDataSliceModal";
import { createOutlierSlice, updateDataSlice } from "@/src/services/base/data-browser";

export function DataSliceOperations(props: { fullSearch: {} }) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const modalOutlierSlice = useSelector(selectModal(ModalEnum.CREATE_OUTLIER_SLICE));
    const configuration = useSelector(selectConfiguration);
    const user = useSelector(selectUser);
    const attributes = useSelector(selectAttributes);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const activeSearchParams = useSelector(selectActiveSearchParams);
    const activeSlice = useSelector(selectActiveSlice);
    const additionalData = useSelector(selectAdditionalData);
    const embeddings = useSelector(selectEmbeddings);

    function updateSlice() {
        updateDataSlice(projectId, {
            static: activeSlice.static,
            dataSliceId: activeSlice.id,
            filterRaw: getRawFilterForSave(props.fullSearch),
            filterData: parseFilterToExtended(activeSearchParams, attributes, configuration, labelingTasks, user, props.fullSearch[SearchGroup.DRILL_DOWN].value)
        }, (res) => {
            dispatch(setActiveDataSlice(activeSlice));
        });
        dispatch(updateAdditionalDataState('displayOutdatedWarning', false));
    }

    function requestOutlierSlice() {
        if (embeddings.length == 0) return;
        let embeddingId = embeddings.length == 1 ? embeddings[0].id : modalOutlierSlice.embeddingId;
        createOutlierSlice(projectId, embeddingId, (result: any) => { });
    }

    return (<div>
        <div className="flex items-center mt-4">
            <Tooltip content={TOOLTIPS_DICT.DATA_BROWSER.SAVE_SLICE} color="invert" placement="top">
                <button onClick={() => dispatch(openModal(ModalEnum.SAVE_DATA_SLICE))}
                    className="mr-1 inline-flex items-center w-36 px-2.5 py-1.5 border border-gray-200 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                    <IconFilter className="w-6 h-6 mr-1" />
                    Save data slice
                </button>
            </Tooltip>
            <Tooltip content={TOOLTIPS_DICT.DATA_BROWSER.SAVE_SLICE} color="invert" placement="top">
                <button onClick={updateSlice} disabled={!activeSlice || activeSlice?.sliceType == Slice.STATIC_OUTLIER || (activeSlice?.static && activeSlice.count == additionalData.staticDataSliceCurrentCount && !additionalData.displayOutdatedWarning)}
                    className="mr-1 f inline-flex items-center w-40 px-2.5 py-1.5 border border-gray-200 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50">
                    <IconRotate className="w-6 h-6 mr-1" />
                    Update data slice
                </button>
            </Tooltip>
        </div>
        <div className="mt-1">
            <Tooltip content={embeddings.length == 0 ? TOOLTIPS_DICT.DATA_BROWSER.CREATE_EMBEDDINGS : TOOLTIPS_DICT.DATA_BROWSER.STATIC_DATA_SLICE} color="invert" placement="right">
                <button onClick={() => embeddings.length == 1 ? requestOutlierSlice() : dispatch(openModal(ModalEnum.CREATE_OUTLIER_SLICE))}
                    disabled={embeddings.length == 0}
                    className="mr-1 f inline-flex items-center w-36 px-2.5 py-1.5 border border-gray-200 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50">
                    <IconChartBubble className="w-6 h-6 mr-1 text-green-700 fill-green-100" />
                    Find outliers
                </button>
            </Tooltip>
        </div>

        <SaveDataSliceModal fullSearch={props.fullSearch} />
        <CreateOutlierSliceModal />
    </div>)
}