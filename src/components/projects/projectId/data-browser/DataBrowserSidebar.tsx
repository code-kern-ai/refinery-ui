import Modal from '@/src/components/shared/modal/Modal';
import { selectAllUsers, selectIsManaged } from '@/src/reduxStore/states/general';
import { selectModal, setModalStates } from '@/src/reduxStore/states/modal';
import { removeFromAllDataSlicesById, selectActiveSlice, selectAdditionalData, selectDataSlicesAll, setActiveDataSlice } from '@/src/reduxStore/states/pages/data-browser';
import { selectProject } from '@/src/reduxStore/states/project';
import { DELETE_DATA_SLICE } from '@/src/services/gql/queries/data-slices';
import style from '@/src/styles/components/projects/projectId/data-browser.module.css';
import { DataSlice } from '@/src/types/components/projects/projectId/data-browser.ts/data-browser';
import { ModalButton, ModalEnum } from '@/src/types/shared/modal';
import { updateSliceInfoHelper } from '@/src/util/components/projects/projectId/data-browser-helper';
import { parseLinkFromText } from '@/src/util/shared/link-parser-helper';
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants';
import { Slice } from '@/submodules/javascript-functions/enums/enums';
import { copyToClipboard } from '@/submodules/javascript-functions/general';
import { useMutation } from '@apollo/client';
import { Tooltip } from '@nextui-org/react';
import { IconAlertTriangle, IconInfoCircle, IconLayoutSidebar, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { timer } from 'rxjs';

const ABORT_BUTTON = { buttonCaption: 'Delete', useButton: true, disabled: false };

export default function DataBrowserSidebar() {
    const dispatch = useDispatch();
    const router = useRouter();

    const project = useSelector(selectProject);
    const users = useSelector(selectAllUsers);
    const isManaged = useSelector(selectIsManaged);
    const activeSlice = useSelector(selectActiveSlice);
    const dataSlices = useSelector(selectDataSlicesAll);
    const sliceNames = useSelector(selectDataSlicesAll).map((slice) => (slice.name));
    const modalDeleteSlice = useSelector(selectModal(ModalEnum.DELETE_SLICE));
    const modalSliceInfo = useSelector(selectModal(ModalEnum.DATA_SLICE_INFO));
    const additionalData = useSelector(selectAdditionalData);

    const [isSearchMenuOpen, setIsSearchMenuOpen] = useState(true);
    const [isSearchMenuVisible, setIsSearchMenuVisible] = useState(true);
    const [timerSubscription, setTimerSubscription] = useState(null);
    const [dataSliceFilter, setDataSliceFilter] = useState('');
    const [filteredSlices, setFilteredSlices] = useState([]);

    const [deleteDataSliceMut] = useMutation(DELETE_DATA_SLICE);

    const deleteDataSlice = useCallback(() => {
        deleteDataSliceMut({ variables: { projectId: project.id, dataSliceId: modalDeleteSlice.sliceId } }).then((res) => {
            dispatch(removeFromAllDataSlicesById(modalDeleteSlice.sliceId));
        });
    }, [modalDeleteSlice]);

    useEffect(() => {
        setAbortButton({ ...abortButton, emitFunction: deleteDataSlice });
    }, [modalDeleteSlice]);

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    useEffect(() => {
        if (!dataSlices) return;
        setFilteredSlices(dataSlices);
    }, [dataSlices]);

    function openSearchMenu() {
        setIsSearchMenuOpen(!isSearchMenuOpen);
        if (!isSearchMenuOpen) {
            timer(1).subscribe(() => (setIsSearchMenuVisible(true)));
            if (timerSubscription) {
                timerSubscription.unsubscribe();
                setTimerSubscription(null);
            }
        } else {
            setTimerSubscription(timer(500).subscribe(() => (setIsSearchMenuVisible(false))));
        }
    }

    function filterAvailableSlices(filter: string) {
        if (filter == '') return setFilteredSlices(dataSlices);
        const dataSlicesCopy = [...dataSlices];
        setFilteredSlices(dataSlicesCopy.filter((slice) => (slice.name.toLowerCase().includes(filter.toLowerCase()))));
    }

    function toggleSlice(slice) {
        dispatch(setActiveDataSlice(slice));
    }

    function updateSliceInfo(slice: DataSlice) {
        const sliceInfo = updateSliceInfoHelper(slice, project, users);
        dispatch(setModalStates(ModalEnum.DATA_SLICE_INFO, { sliceInfo: sliceInfo, open: true }));
    }

    function testLink(link) {
        const linkData = parseLinkFromText(link);
        router.push(linkData.route, { query: linkData.queryParams });
    }

    return (<div className={`bg-white flex-auto h-screen w-full overflow-hidden border-r border-r-gray-100 ${style.transitionAll} ${isSearchMenuOpen ? style.sidebarWidthOpen : style.sidebarWidth}`}>
        <div className={`flex flex-col select-none p-4 overflow-y-auto h-full ${style.sidebarWidthOpen} ${isSearchMenuVisible ? style.searchMenuWidth : null}`}>
            <div className="flex flex-row items-center">
                {isSearchMenuOpen && <div className="bg-white text-lg font-medium text-gray-900 pr-3">Existing data slices</div>}
                <IconLayoutSidebar onClick={openSearchMenu} className={`w-6 h-6 text-gray-900 cursor-pointer ${isSearchMenuOpen ? style.rotateTransform : null}`} />
            </div>
            {(isSearchMenuOpen || isSearchMenuVisible) && <div className={`transitionAll ${(isSearchMenuVisible && isSearchMenuOpen) ? 'opacity-100' : 'opacity-0'}`}>
                {sliceNames.length > 6 && <div className="mt-2">
                    <input value={dataSliceFilter} placeholder="Enter name to filter" onInput={(e: any) => {
                        setDataSliceFilter(e.target.value);
                        filterAvailableSlices(e.target.value)
                    }} className="h-9 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
                </div>}

                {dataSlices && <div className="mt-2 mb-4">
                    {dataSlices.length > 0 && <div className="w-full grid grid-cols-2 gap-y-1 items-center justify-center" style={{ gridColumnGap: '2px' }}>
                        {filteredSlices.map((slice: DataSlice, index: number) => (<Tooltip content={slice.name} color="invert" placement={index % 2 == 0 ? 'right' : 'left'} key={slice.id}>
                            <button onClick={() => toggleSlice(slice)} style={{ width: '180px' }}
                                className={`cursor-pointer inline-flex items-center justify-between px-2.5 py-1.5 border border-gray-200 shadow-sm text-sm font-medium rounded text-gray-700 bg-white slice-width hover:bg-gray-50 focus:outline-none ${activeSlice == slice ? 'ring-2 ring-blue-500' : ''}`}>
                                <label className="cursor-pointer mr-2" onClick={() => { updateSliceInfo(slice) }}>
                                    <IconInfoCircle className={`w-5 h-5 ${slice.color.textColor} ${slice.color.fillColor}`} />
                                </label>
                                <label className={`text-gray-700 truncate label-max-width cursor-pointer ${slice.sliceType == Slice.STATIC_OUTLIER ? 'text-xs whitespace-pre' : 'text-sm'}`}>
                                    {slice.displayName}</label>
                                <IconTrash className="text-red-700 h-5 w-5 ml-2 cursor-pointer" onClick={() => dispatch(setModalStates(ModalEnum.DELETE_SLICE, { sliceId: slice.id, open: true }))} />
                            </button>
                        </Tooltip>))}
                    </div>}
                </div>}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className={`w-full border-t border-gray-300 ${activeSlice?.sliceType == Slice.STATIC_OUTLIER || !(additionalData.displayOutdatedWarning || (activeSlice?.static && additionalData.staticDataSliceCurrentCount != null && activeSlice.count != additionalData.staticDataSliceCurrentCount)) ? '' : 'ml-20'}`}>
                        </div>
                    </div>
                    <div className="relative flex justify-start">
                        <span className="pr-2 bg-white text-lg font-medium text-gray-900">Filter</span>
                        {!(activeSlice?.sliceType == Slice.STATIC_OUTLIER || !(additionalData.displayOutdatedWarning || (activeSlice?.static && additionalData.staticDataSliceCurrentCount != null && activeSlice.count != additionalData.staticDataSliceCurrentCount))) &&
                            <Tooltip content={TOOLTIPS_DICT.DATA_BROWSER.OUTDATED_SLICE} color="invert" placement="right">
                                <div className="flex items-center tooltip-right text-gray-400">
                                    <IconAlertTriangle className="w-5 h-5" />
                                </div>
                            </Tooltip>
                        }
                    </div>
                </div>
                <span className="text-sm text-gray-400">You can filter and order all your data in the browser according to your needs. Selected filter criteria can be saved and used later on.</span>
            </div>}
        </div >
        <Modal modalName={ModalEnum.DELETE_SLICE} abortButton={abortButton}>
            <h1 className="text-lg text-gray-900 mb-2 text-center">Warning</h1>
            <div className="text-sm text-gray-500 my-2 text-center">
                Are you sure you want to delete this data slice?
            </div>
        </Modal>

        <Modal modalName={ModalEnum.DATA_SLICE_INFO}>
            <div className="flex flex-grow justify-center mb-4 font-bold">Slice information</div>
            {modalSliceInfo.sliceInfo && Object.entries(modalSliceInfo.sliceInfo).map(([key, value]: any) => (
                <Fragment key={key}>
                    {key == "Link" ? (<div>
                        <div className="mt-3 flex rounded-md">
                            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">{value.startsWith("https") ? 'https://' : 'http://'}</span>
                            <Tooltip content={TOOLTIPS_DICT.DATA_BROWSER.COPY_TO_CLIPBOARD} color="invert" placement="top">
                                <span onClick={() => copyToClipboard(value + '?pos=1&type=DATA_SLICE')}
                                    className="cursor-pointer tooltip border rounded-none rounded-r-md border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                    {value.substring(value.startsWith("https") ? 8 : 7)}</span>
                            </Tooltip>
                        </div>
                        <Tooltip content={TOOLTIPS_DICT.DATA_BROWSER.ONLY_MANAGED} color="invert" placement="right">
                            <button onClick={() => testLink(value + '?pos=1&type=DATA_SLICE')} disabled={!isManaged}
                                className="mt-3 opacity-100 w-40 bg-indigo-700 text-white text-xs leading-4 font-semibold px-4 py-2 rounded-md cursor-pointer hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                View as expert
                            </button>
                        </Tooltip>
                    </div>) : (<div className="flex flex-grow justify-between gap-8">
                        <p>{key}</p>
                        <p>{value}</p>
                    </div>)}
                </Fragment>
            ))}
        </Modal>
    </div >)
}