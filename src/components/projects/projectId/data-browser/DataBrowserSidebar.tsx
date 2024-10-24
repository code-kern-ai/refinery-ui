import { selectAllUsers } from '@/src/reduxStore/states/general';
import { setModalStates } from '@/src/reduxStore/states/modal';
import { selectActiveSlice, selectAdditionalData, selectDataSlicesAll, setActiveDataSlice, setActiveSearchParams, setFullSearchStore, setIsTextHighlightNeeded, setRecordsInDisplay, setTextHighlight, updateAdditionalDataState } from '@/src/reduxStore/states/pages/data-browser';
import { selectProjectId } from '@/src/reduxStore/states/project';
import style from '@/src/styles/components/projects/projectId/data-browser.module.css';
import { DataSlice } from '@/src/types/components/projects/projectId/data-browser/data-browser';
import { ModalEnum } from '@/src/types/shared/modal';
import { updateSliceInfoHelper } from '@/src/util/components/projects/projectId/data-browser/data-browser-helper';
import { Slice } from '@/submodules/javascript-functions/enums/enums';
import { Tooltip } from '@nextui-org/react';
import { IconAlertTriangle, IconInfoCircle, IconLayoutSidebar, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { timer } from 'rxjs';
import SearchGroups from './SearchGroups';
import DeleteSliceModal from './modals/DeleteSliceModal';
import DataSliceInfoModal from './modals/DataSliceInfoModal';
import MultilineTooltip from '@/src/components/shared/multilines-tooltip/MultilineTooltip';

export default function DataBrowserSidebar() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const users = useSelector(selectAllUsers);
    const activeSlice = useSelector(selectActiveSlice);
    const dataSlices = useSelector(selectDataSlicesAll);
    const sliceNames = useSelector(selectDataSlicesAll).map((slice) => (slice.name));
    const additionalData = useSelector(selectAdditionalData);

    const [isSearchMenuOpen, setIsSearchMenuOpen] = useState(true);
    const [isSearchMenuVisible, setIsSearchMenuVisible] = useState(true);
    const [timerSubscription, setTimerSubscription] = useState(null);
    const [dataSliceFilter, setDataSliceFilter] = useState('');
    const [filteredSlices, setFilteredSlices] = useState([]);

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
        if (activeSlice && activeSlice.id == slice.id) {
            dispatch(setActiveSearchParams([]));
            dispatch(setRecordsInDisplay(false));
            dispatch(setActiveDataSlice(null));
            dispatch(setTextHighlight([]));
            dispatch(setIsTextHighlightNeeded({}));
            dispatch(updateAdditionalDataState('clearFullSearch', true));
            dispatch(updateAdditionalDataState('canUpdateDynamicSlice', false));
        } else {
            dispatch(updateAdditionalDataState('canUpdateDynamicSlice', false));
            dispatch(setActiveDataSlice(slice));
        }
        dispatch(updateAdditionalDataState('displayOutdatedWarning', false));
    }

    function updateSliceInfo(slice: DataSlice) {
        const sliceInfo = updateSliceInfoHelper(slice, projectId, users);
        dispatch(setModalStates(ModalEnum.DATA_SLICE_INFO, { sliceInfo: sliceInfo, open: true }));
    }

    return (<div className={`bg-white flex-auto h-screen w-full overflow-hidden border-r border-r-gray-100 ${style.transitionAll} ${isSearchMenuOpen ? style.sidebarWidthOpen : style.sidebarWidth}`}>
        <div className={`flex flex-col select-none pt-4 px-4 pb-20 overflow-y-auto h-full ${style.sidebarWidthOpen} ${isSearchMenuVisible ? style.searchMenuWidth : null}`}>
            <div className="flex flex-row items-center">
                {isSearchMenuOpen && <div className="bg-white text-lg font-medium text-gray-900 pr-3">Existing data slices</div>}
                <IconLayoutSidebar onClick={openSearchMenu} className={`w-6 h-6 text-gray-900 cursor-pointer ${isSearchMenuOpen ? style.rotateTransform : null}`} />
            </div>
            {(isSearchMenuOpen || isSearchMenuVisible) && <div className={`transitionAll ${(isSearchMenuVisible && isSearchMenuOpen) ? 'opacity-100' : 'opacity-0'}`}>
                {sliceNames.length > 6 && <div className="mt-2">
                    <input value={dataSliceFilter} placeholder="Enter name to filter" onInput={(e: any) => {
                        setDataSliceFilter(e.target.value);
                        filterAvailableSlices(e.target.value)
                    }} className="h-9 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
                </div>}

                {dataSlices && <div className="mt-2 mb-4">
                    {dataSlices.length > 0 && <div className="w-full grid grid-cols-2 gap-y-1 items-center justify-center" style={{ gridColumnGap: '26px' }}>
                        {filteredSlices.map((slice: DataSlice, index: number) => (<Tooltip content={<div className="w-24 break-words">{slice.displayName}</div>} color="invert" placement={index % 2 == 0 ? 'right' : 'left'} key={slice.id}>
                            <button onClick={() => toggleSlice(slice)} style={{ width: '170px' }}
                                className={`cursor-pointer inline-flex border items-center justify-between px-2.5 py-1.5 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none ${activeSlice?.id == slice.id ? 'ring-blue-500 ring-2' : ' border-gray-200'}`}>
                                <label className="cursor-pointer mr-2" onClick={(e) => { updateSliceInfo(slice); e.stopPropagation(); }}>
                                    <IconInfoCircle className={`w-6 h-6 ${slice.color.textColor} ${slice.color.fillColor}`} />
                                </label>
                                <label className={`text-gray-700 truncate cursor-pointer ${slice.sliceType == Slice.STATIC_OUTLIER ? 'text-xs whitespace-pre' : 'text-sm'}`}>
                                    {slice.displayName}</label>
                                <label className="cursor-pointer mr-2" onClick={(e) => {
                                    dispatch(setModalStates(ModalEnum.DELETE_SLICE, { sliceId: slice.id, open: true }));
                                    e.stopPropagation();
                                }}>
                                    <IconTrash className="text-red-700 h-5 w-5 ml-2 cursor-pointer" />
                                </label>
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
                        {(!(activeSlice?.sliceType == Slice.STATIC_OUTLIER || !(additionalData.displayOutdatedWarning || (activeSlice?.static && additionalData.staticDataSliceCurrentCount != null && activeSlice.count != additionalData.staticDataSliceCurrentCount)))) &&
                            <Tooltip content={<MultilineTooltip tooltipLines={['Outdated slice', 'Save to update']} />} color="invert" placement="right" className="cursor-auto">
                                <div className="flex items-center tooltip-right text-gray-400">
                                    <IconAlertTriangle className="w-5 h-5" />
                                </div>
                            </Tooltip>
                        }
                    </div>
                </div>
                <span className="text-sm text-gray-400">You can filter and order all your data in the browser according to your needs. Selected filter criteria can be saved and used later on.</span>

                <SearchGroups />
            </div>}
        </div>
        <DeleteSliceModal />
        <DataSliceInfoModal />
    </div >)
}