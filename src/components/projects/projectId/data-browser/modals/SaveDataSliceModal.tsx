import Modal from "@/src/components/shared/modal/Modal"
import { selectUser } from "@/src/reduxStore/states/general";
import { closeModal, selectModal, setModalStates } from "@/src/reduxStore/states/modal";
import { extendAllDataSlices, selectActiveSearchParams, selectActiveSlice, selectAdditionalData, selectConfiguration, selectDataSlicesAll, setActiveDataSlice, updateAdditionalDataState } from "@/src/reduxStore/states/pages/data-browser";
import { selectAttributes, selectLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { CREATE_DATA_SLICE, UPDATE_DATA_SLICE } from "@/src/services/gql/mutations/data-browser";
import { DataSlice } from "@/src/types/components/projects/projectId/data-browser/data-browser";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal"
import { getRawFilterForSave, parseFilterToExtended } from "@/src/util/components/projects/projectId/data-browser/filter-parser-helper";
import { getColorStruct } from "@/src/util/components/projects/projectId/heuristics/shared-helper";
import { SearchGroup } from "@/submodules/javascript-functions/enums/enums";
import { useMutation } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Save', disabled: true, useButton: true }

export default function SaveDataSliceModal(props: { fullSearch: {} }) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const modalSaveDataSlice = useSelector(selectModal(ModalEnum.SAVE_DATA_SLICE));
    const attributes = useSelector(selectAttributes);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const activeSearchParams = useSelector(selectActiveSearchParams);
    const configuration = useSelector(selectConfiguration);
    const user = useSelector(selectUser);
    const dataSlices = useSelector(selectDataSlicesAll);
    const activeSlice = useSelector(selectActiveSlice);

    const [isStatic, setIsStatic] = useState<boolean>(false);

    const [createDataSliceMut] = useMutation(CREATE_DATA_SLICE);
    const [updateDataSliceMut] = useMutation(UPDATE_DATA_SLICE);

    const saveDataSlice = useCallback(() => {
        createDataSliceMut({
            variables: {
                projectId: projectId,
                name: modalSaveDataSlice.sliceName,
                static: isStatic,
                filterRaw: getRawFilterForSave(props.fullSearch),
                filterData: parseFilterToExtended(activeSearchParams, attributes, configuration, labelingTasks, user, props.fullSearch[SearchGroup.DRILL_DOWN].value)
            }
        }).then((res) => {
            const id = res["data"]["createDataSlice"]["id"];
            const slice = {
                id: id, name: modalSaveDataSlice.sliceName, static: isStatic, filterRaw: getRawFilterForSave(props.fullSearch),
                filterData: parseFilterToExtended(activeSearchParams, attributes, configuration, labelingTasks, user, props.fullSearch[SearchGroup.DRILL_DOWN].value), color: getColorStruct(isStatic),
                displayName: modalSaveDataSlice.sliceName
            }
            dispatch(extendAllDataSlices(slice));
        });
        dispatch(updateAdditionalDataState('displayOutdatedWarning', false));
    }, [modalSaveDataSlice]);

    const updateDataSliceByName = useCallback(() => {
        dataSlices.forEach((slice: DataSlice) => {
            if (slice.name == modalSaveDataSlice.sliceName) {
                dispatch(setActiveDataSlice(slice));
                updateSlice(slice.id);
                return;
            }
        });
    }, [modalSaveDataSlice, activeSlice, dataSlices]);

    useEffect(() => {
        setAcceptButton({
            ...ACCEPT_BUTTON,
            emitFunction: modalSaveDataSlice.sliceNameExists ? updateDataSliceByName : saveDataSlice,
            buttonCaption: modalSaveDataSlice.sliceNameExists ? 'Update' : 'Save',
            disabled: modalSaveDataSlice.sliceName == ''
        })
    }, [modalSaveDataSlice]);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    function checkIfNameExists(name: string) {
        const exists = dataSlices.find(slice => slice.name == name);
        dispatch(setModalStates(ModalEnum.SAVE_DATA_SLICE, { sliceNameExists: exists }));
    }

    const updateSlice = useCallback((sliceId: string) => {
        const finalStatic = isStatic == null ? activeSlice.static : isStatic;
        updateDataSliceMut({
            variables: {
                projectId: projectId,
                static: finalStatic,
                dataSliceId: sliceId,
                filterRaw: getRawFilterForSave(props.fullSearch),
                filterData: parseFilterToExtended(activeSearchParams, attributes, configuration, labelingTasks, user, props.fullSearch[SearchGroup.DRILL_DOWN].value)
            }
        }).then((res) => { });
    }, [activeSlice, isStatic, props.fullSearch]);

    return (<Modal modalName={ModalEnum.SAVE_DATA_SLICE} acceptButton={acceptButton}>
        <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">Data slice creation</div>
        <div className="mb-2 flex flex-grow justify-center text-sm">Save or update the current filter settings as a data slice</div>
        <p className="pt-4 text-left">You have two choices.
            <label className="block font-bold mt-2">Dynamic:</label>
            Stores the current filter critera and is reapplied whenever the data slice is selected.
            <label className="block font-bold mt-2 ">Static:</label>
            Used for visualization filters and scope of work for annotators & domain experts. Stores the current records provided by your filter.
            These are limited to 10,000 records and can be refreshed if necessary.
        </p>
        <div className="mt-2">
            <div className="flex items-center gap-2">
                <div className="flex gap-1 items-center">
                    <input type="radio" id="slice-type-dynamic" name="slice-type" value="dynamic"
                        onChange={() => setIsStatic(false)} checked={!isStatic}
                        style={{ accentColor: 'rgb(29,78,216)' }} className="h-4 w-4" />
                    <label htmlFor="slice-type-dynamic" className=" border-gray-200 cursor-pointer" >
                        Dynamic
                    </label>
                </div>
                <div className="flex gap-1 items-center">
                    <input type="radio" id="slice-type-static" name="slice-type" value="static"
                        onChange={() => setIsStatic(true)} checked={isStatic}
                        style={{ accentColor: 'rgb(180,83,9)' }} className="h-4 w-4" />
                    <label htmlFor="slice-type-static" className=" border-gray-200 cursor-pointer" >
                        Static
                    </label>
                </div>
            </div>
            <div className="flex w-full justify-between mt-2">
                <input type="text" value={modalSaveDataSlice.sliceName}
                    onChange={(e) => dispatch(setModalStates(ModalEnum.SAVE_DATA_SLICE, { sliceName: e.target.value }))}
                    onKeyUp={(e: any) => checkIfNameExists(e.target.value)}
                    onKeyDown={(e: any) => {
                        if (e.key == 'Enter') {
                            modalSaveDataSlice.sliceNameExists ? updateDataSliceByName() : saveDataSlice();
                            dispatch(setModalStates(ModalEnum.SAVE_DATA_SLICE, { sliceName: '', sliceNameExists: false, open: false }));
                        }
                    }} className="h-9 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" placeholder="Enter name..." />
            </div>
        </div>
    </Modal>)
}