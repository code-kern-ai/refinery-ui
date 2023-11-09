import Modal from "@/src/components/shared/modal/Modal";
import { openModal, selectModal, setModalStates } from "@/src/reduxStore/states/modal";
import { selectDataSlicesAll } from "@/src/reduxStore/states/pages/data-browser";
import { selectProject } from "@/src/reduxStore/states/project";
import { CREATE_DATA_SLICE } from "@/src/services/gql/queries/data-slices";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { IconFilter } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Save', disabled: true, useButton: true }

export function DataSliceOperations(props: { fullSearch: {} }) {
    const dispatch = useDispatch();

    const project = useSelector(selectProject);
    const modalSaveDataSlice = useSelector(selectModal(ModalEnum.SAVE_DATA_SLICE));
    const dataSlices = useSelector(selectDataSlicesAll);

    const [isStatic, setIsStatic] = useState<boolean>(false);

    const [createDataSliceMut] = useMutation(CREATE_DATA_SLICE);

    const saveDataSlice = useCallback(() => {
        createDataSliceMut({
            variables: {
                projectId: project.id,
                name: modalSaveDataSlice.sliceName,
                static: isStatic,
                filterRaw: getRawFilterForSave(),
                filterData: []
            }
        })
    }, [modalSaveDataSlice]);

    const updateDataSlice = useCallback(() => { }, [modalSaveDataSlice]);

    useEffect(() => {
        setAcceptButton({
            ...ACCEPT_BUTTON,
            emitFunction: modalSaveDataSlice.sliceNameExists ? updateDataSlice : saveDataSlice,
            buttonCaption: modalSaveDataSlice.sliceNameExists ? 'Update' : 'Save',
            disabled: modalSaveDataSlice.sliceName == ''
        })
    }, [modalSaveDataSlice])

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    function checkIfNameExists(name: string) {
        const exists = dataSlices.find(slice => slice.name == name);
        dispatch(setModalStates(ModalEnum.SAVE_DATA_SLICE, { sliceNameExists: exists }));
    }

    function getRawFilterForSave(): string {
        const selectedFilters = {};
        for (let [key, value] of Object.entries(props.fullSearch)) {
            selectedFilters[key] = value
        }
        console.log(selectedFilters);
        return JSON.stringify(selectedFilters);
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
        </div>
        <Modal modalName={ModalEnum.SAVE_DATA_SLICE} acceptButton={acceptButton}>
            <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
                Data slice creation</div>
            <div className="mb-2 flex flex-grow justify-center text-sm">
                Save or update the current filter settings as a data slice</div>
            <p className="pt-4 text-left">You have two choices.
                <label className="block font-bold mt-2">Dynamic:</label>
                Stores the current filter critera and is reapplied whenever the data slice is selected.
                <label className="block font-bold mt-2 ">Static:</label>
                Used for visualization filters and scope of work for annotators & domain experts. Stores the current records provided by your filter.
                These are limited to 10,000 records and can be refreshed if necessary.
            </p>
            <div className="mt-2">
                <div className="flex">
                    <div className=" items-center">
                        <input type="radio" id="slice-type-dynamic" name="slice-type" value="dynamic"
                            onChange={() => setIsStatic(false)} checked={!isStatic}
                            style={{ accentColor: 'rgb(29,78,216)' }} className="h-4 w-4" />
                        <label htmlFor="slice-type-dynamic" className="h-4 w-4 border-gray-200 cursor-pointer" >
                            Dynamic
                        </label>
                    </div>
                    <div className=" items-center">
                        <input type="radio" id="slice-type-static" name="slice-type" value="static"
                            onChange={() => setIsStatic(true)} checked={isStatic}
                            style={{ accentColor: 'rgb(180,83,9)' }} className="h-4 w-4" />
                        <label htmlFor="slice-type-static" className="h-4 w-4 border-gray-200 cursor-pointer" >
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
                                modalSaveDataSlice.sliceNameExists ? updateDataSlice() : saveDataSlice()
                            }
                        }} className="h-9 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" placeholder="Enter name..." />
                </div>
            </div>
        </Modal>
    </div>)
}