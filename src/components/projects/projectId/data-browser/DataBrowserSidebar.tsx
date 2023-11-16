import { selectAllUsers } from '@/src/reduxStore/states/general';
import { setModalStates } from '@/src/reduxStore/states/modal';
import { selectActiveSlice, selectAdditionalData, selectDataSlicesAll, setActiveDataSlice } from '@/src/reduxStore/states/pages/data-browser';
import { selectProject } from '@/src/reduxStore/states/project';
import style from '@/src/styles/components/projects/projectId/data-browser.module.css';
import { DataSlice } from '@/src/types/components/projects/projectId/data-browser/data-browser';
import { ModalEnum } from '@/src/types/shared/modal';
import { updateSliceInfoHelper } from '@/src/util/components/projects/projectId/data-browser/data-browser-helper';
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants';
import { Slice } from '@/submodules/javascript-functions/enums/enums';
import { Tooltip } from '@nextui-org/react';
import { IconAlertTriangle, IconInfoCircle, IconLayoutSidebar, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { timer } from 'rxjs';
import SearchGroups from './SearchGroups';
import DeleteSliceModal from './modals/DeleteSliceModal';
import DataSliceInfoModal from './modals/DataSliceInfoModal';

export default function DataBrowserSidebar() {
    const dispatch = useDispatch();

    const project = useSelector(selectProject);
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
        dispatch(setActiveDataSlice(slice));
    }

    function updateSliceInfo(slice: DataSlice) {
        const sliceInfo = updateSliceInfoHelper(slice, project, users);
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

                <SearchGroups />
            </div>}
        </div>
        <DeleteSliceModal />
        <DataSliceInfoModal />
    </div >)
}