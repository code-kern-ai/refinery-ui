import Modal from "@/src/components/shared/modal/Modal";
import MultilineTooltip from "@/src/components/shared/multilines-tooltip/MultilineTooltip";
import { selectSettings, updateSettings } from "@/src/reduxStore/states/pages/labeling";
import { selectProject } from "@/src/reduxStore/states/project";
import { LineBreaksType } from "@/src/types/components/projects/projectId/data-browser/data-browser";
import { ComponentType } from "@/src/types/components/projects/projectId/labeling/settings";
import { ModalEnum } from "@/src/types/shared/modal";
import { COLOR_OPTIONS } from "@/src/util/constants";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import Dropdown2 from "@/submodules/react-components/components/Dropdown2";
import { Tooltip } from "@nextui-org/react";
import { IconInfoCircle } from "@tabler/icons-react";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function LabelingSettingsModal() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProject);
    const settings = useSelector(selectSettings);

    const [activeTab, setActiveTab] = useState<ComponentType>(ComponentType.MAIN);
    const [hoverColorOptions, setHoverColorOptions] = useState<string[]>([]);
    const [hoverColorClassArray, setHoverColorClassArray] = useState<string[]>([]);

    useEffect(() => {
        if (!projectId) return;
        prepareColorOptions();
    }, [projectId]);

    function changeSetting(page: ComponentType, setting: string, value?: any) {
        dispatch(updateSettings(page, setting, value));
    }

    function prepareColorOptions() {
        setHoverColorOptions(['None', 'light gray', ...COLOR_OPTIONS]);
        setHoverColorClassArray([null, 'bg-gray-100', ...COLOR_OPTIONS.map(c => `bg-${c}-200`)]);
    }

    function toggleLineBreaks() {
        if (settings?.main.lineBreaks == LineBreaksType.IS_PRE_WRAP || settings?.main.lineBreaks == LineBreaksType.IS_PRE_LINE) {
            changeSetting(ComponentType.MAIN, 'lineBreaks', LineBreaksType.NORMAL);
            localStorage.setItem('lineBreaks', JSON.stringify(LineBreaksType.NORMAL));

        } else {
            changeSetting(ComponentType.MAIN, 'lineBreaks', LineBreaksType.IS_PRE_WRAP);
            localStorage.setItem('lineBreaks', JSON.stringify(LineBreaksType.IS_PRE_WRAP));

        }
    }

    function toggleLineBreaksPreWrap() {
        if (settings?.main.lineBreaks === LineBreaksType.IS_PRE_WRAP) {
            changeSetting(ComponentType.MAIN, 'lineBreaks', LineBreaksType.IS_PRE_LINE);
            localStorage.setItem('lineBreaks', JSON.stringify(LineBreaksType.IS_PRE_LINE));

        } else if (settings?.main.lineBreaks === LineBreaksType.IS_PRE_LINE) {
            changeSetting(ComponentType.MAIN, 'lineBreaks', LineBreaksType.IS_PRE_WRAP);
            localStorage.setItem('lineBreaks', JSON.stringify(LineBreaksType.IS_PRE_WRAP));
        }
    }

    return (<Modal modalName={ModalEnum.LABELING_SETTINGS} doNotFullyInit={true}>
        <div className="flex flex-row items-center justify-center gap-x-2">
            <span className="text-lg leading-6 text-gray-900 font-medium">
                Settings
            </span>
            <Tooltip content={<MultilineTooltip tooltipLines={['Note that your browser stores these settings.', 'Not your user or your organization!']} />} color="invert" placement="top" className="cursor-auto">
                <IconInfoCircle className="h-6 w-6" />
            </Tooltip>
        </div>
        <div className="flex justify-center">
            <div className="sm:block">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab(ComponentType.MAIN)}
                            className={`cursor-pointer whitespace-nowrap py-4 px-1 font-medium text-sm ${activeTab == ComponentType.MAIN ? 'border-indigo-500 text-indigo-600 border-b-2' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Global</button>
                        <button onClick={() => setActiveTab(ComponentType.TASK_HEADER)}
                            className={`cursor-pointer whitespace-nowrap py-4 px-1  font-medium text-sm ${activeTab == ComponentType.TASK_HEADER ? 'border-indigo-500 text-indigo-600 border-b-2' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Task Legend</button>
                        <button onClick={() => setActiveTab(ComponentType.LABELING)}
                            className={`cursor-pointer whitespace-nowrap py-4 px-1 font-medium text-sm ${activeTab == ComponentType.LABELING ? 'border-indigo-500 text-indigo-600 border-b-2' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Labeling</button>
                        <button onClick={() => setActiveTab(ComponentType.OVERVIEW_TABLE)}
                            className={`cursor-pointer whitespace-nowrap py-4 px-1  font-medium text-sm ${activeTab == ComponentType.OVERVIEW_TABLE ? 'border-indigo-500 text-indigo-600 border-b-2' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Overview Table</button>
                    </nav>
                </div>
            </div>
        </div>
        {/* Page Main */}
        {activeTab == ComponentType.MAIN && <div className="flex flex-col gap-y-2 items-center my-4">
            <div className="grid gap-y-2 gap-x-4 items-center text-left" style={{ gridTemplateColumns: 'max-content auto max-content' }}>
                <span>Auto next record</span>
                <span className="cursor-pointer flex items-center">
                    <input className="h-5 w-5 cursor-pointer" type="checkbox" checked={settings?.main.autoNextRecord} onChange={() => changeSetting(ComponentType.MAIN, 'autoNextRecord')} /></span>
                <Tooltip content={TOOLTIPS_DICT.LABELING.AUTO_NEXT_RECORD} color="invert" placement="top" className="cursor-auto"><IconInfoCircle className="h-5 w-5" /></Tooltip>
                <span>Hover background</span>
                <Dropdown2 options={hoverColorOptions} buttonName={settings?.main.hoverGroupBackgroundColor} backgroundColors={hoverColorClassArray}
                    dropdownItemsClasses="max-h-80 overflow-y-auto" buttonCaptionBgColor={settings?.main.hoverGroupBackgroundColorClass}
                    selectedOption={(option: any) => changeSetting(ComponentType.MAIN, 'hoverGroupBackgroundColor', option)} dropdownWidth="w-32" />
                <Tooltip content={TOOLTIPS_DICT.LABELING.HOVER_BACKGROUND} color="invert" placement="top" className="cursor-auto"><IconInfoCircle className="h-5 w-5" /></Tooltip>
                <span>Visible line breaks</span>
                <div className="flex items-center h-5">
                    <input id="comments" type="checkbox" onChange={toggleLineBreaks} checked={settings?.main.lineBreaks != LineBreaksType.NORMAL}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded cursor-pointer" />
                </div>
                <Tooltip content={TOOLTIPS_DICT.LABELING.LINE_BREAKS} color="invert" placement="top" className="cursor-auto"><IconInfoCircle className="h-5 w-5" /></Tooltip>
                {settings?.main.lineBreaks != LineBreaksType.NORMAL && <Fragment>
                    <label htmlFor="preWrap" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer italic">Pre-wrap</label>
                    <input type="radio" checked={settings?.main.lineBreaks == LineBreaksType.IS_PRE_WRAP} onChange={toggleLineBreaksPreWrap} name="lineBreaks" id="preWrap"
                        className="focus:ring-blue-500 h-6 w-4 text-blue-600 border-gray-200 cursor-pointer" />
                    <Tooltip content={TOOLTIPS_DICT.LABELING.PRE_WRAP} color="invert" placement="top" className="cursor-auto"><IconInfoCircle className="h-5 w-5" /></Tooltip>

                    <label htmlFor="preLine" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer italic">Pre-line</label>
                    <input type="radio" checked={settings?.main.lineBreaks == LineBreaksType.IS_PRE_LINE} onChange={toggleLineBreaksPreWrap} name="lineBreaks" id="preLine"
                        className="focus:ring-blue-500 h-6 w-4 text-blue-600 border-gray-200 cursor-pointer" />
                    <Tooltip content={TOOLTIPS_DICT.LABELING.PRE_LINE} color="invert" placement="top" className="cursor-auto"><IconInfoCircle className="h-5 w-5" /></Tooltip>
                </Fragment>}
            </div>
        </div>}
        {/* Task Header */}
        {activeTab == ComponentType.TASK_HEADER && <div className="flex flex-col gap-y-2 items-center my-4">
            <p className="text-sm text-gray-600 text-center">These are general settings.<br />For label specific settings use the task list at the top</p>
            <div className="grid gap-y-2 gap-x-4 items-center text-left" style={{ gridTemplateColumns: 'max-content auto max-content' }}>
                <span>Show task legend</span>
                <span className="cursor-pointer flex items-center">
                    <input className="h-5 w-5 cursor-pointer" type="checkbox" checked={settings?.task.show} onChange={() => changeSetting(ComponentType.TASK_HEADER, 'show')} /></span>
                <Tooltip content={<MultilineTooltip tooltipLines={['Completely hide/show the feature.', 'Active settings are preserved']} />} color="invert" placement="top" className="cursor-auto"><IconInfoCircle className="h-5 w-5" /></Tooltip>
                <span>Collapse</span>
                <span className="cursor-pointer flex items-center">
                    <input className="h-5 w-5 cursor-pointer" type="checkbox" checked={settings?.task.isCollapsed} onChange={() => changeSetting(ComponentType.TASK_HEADER, 'isCollapsed')} /></span>
                <Tooltip content={TOOLTIPS_DICT.LABELING.IS_COLLAPSED} color="invert" placement="top" className="cursor-auto"><IconInfoCircle className="h-5 w-5" /></Tooltip>
                <span>Always show quick buttons</span>
                <span className="cursor-pointer flex items-center">
                    <input className="h-5 w-5 cursor-pointer" type="checkbox" checked={settings?.task.alwaysShowQuickButtons} onChange={() => changeSetting(ComponentType.TASK_HEADER, 'alwaysShowQuickButtons')} /></span>
                <Tooltip content={TOOLTIPS_DICT.LABELING.QUICK_BUTTON} color="invert" placement="top" className="cursor-auto"><IconInfoCircle className="h-5 w-5" /></Tooltip>
            </div>
        </div>}
        {/* Labeling */}
        {activeTab == ComponentType.LABELING && <div className="flex flex-col gap-y-2 items-center my-4">
            <div className="grid gap-y-2 gap-x-4 items-center text-left" style={{ gridTemplateColumns: 'max-content auto max-content' }}>
                <span>Label options</span>
                <input value={settings?.labeling.showNLabelButton} type="number" onChange={(e) => changeSetting(ComponentType.LABELING, 'showNLabelButton', e.target.value)}
                    className="h-9 w-12 text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
                <Tooltip content={<MultilineTooltip tooltipLines={['Amount of label buttons shown before hiding the rest under: \'other \<task\> options\'']} />} color="invert" placement="top" className="cursor-auto"><IconInfoCircle className="h-5 w-5" /></Tooltip>
                <span>Close label box</span>
                <span className="cursor-pointer flex items-center">
                    <input className="h-5 w-5 cursor-pointer" type="checkbox" checked={settings?.labeling.closeLabelBoxAfterLabel} onChange={() => changeSetting(ComponentType.LABELING, 'closeLabelBoxAfterLabel')} /></span>
                <Tooltip content={TOOLTIPS_DICT.LABELING.CLOSE_LABEL_BOX} color="invert" placement="top" className="cursor-auto"><IconInfoCircle className="h-5 w-5" /></Tooltip>
                <span>Show task names</span>
                <span className="cursor-pointer flex items-center">
                    <input className="h-5 w-5 cursor-pointer" type="checkbox" checked={settings?.labeling.showTaskNames} onChange={() => changeSetting(ComponentType.LABELING, 'showTaskNames')} /></span>
                <Tooltip content={TOOLTIPS_DICT.LABELING.SHOW_TASK_NAMES} color="invert" placement="top" className="cursor-auto"><IconInfoCircle className="h-5 w-5" /></Tooltip>
                <span>Show heuristic confidence</span>
                <span className="cursor-pointer flex items-center">
                    <input className="h-5 w-5 cursor-pointer" type="checkbox" checked={settings?.labeling.showHeuristicConfidence} onChange={() => changeSetting(ComponentType.LABELING, 'showHeuristicConfidence')} /></span>
                <Tooltip content={<MultilineTooltip tooltipLines={['Display the heuristic label confidence.', 'Please see in our docs for more information on confidence calculation.']} />} color="invert" placement="top" className="cursor-auto"><IconInfoCircle className="h-5 w-5" /></Tooltip>
                <span>Compact classification label display</span>
                <span className="cursor-pointer flex items-center">
                    <input className="h-5 w-5 cursor-pointer" type="checkbox" checked={settings?.labeling.compactClassificationLabelDisplay} onChange={() => changeSetting(ComponentType.LABELING, 'compactClassificationLabelDisplay')} /></span>
                <Tooltip content={TOOLTIPS_DICT.LABELING.LABEL_DISPLAY} color="invert" placement="top" className="cursor-auto"><IconInfoCircle className="h-5 w-5" /></Tooltip>
                <span>Swim lane extraction labels</span>
                <span className="cursor-pointer flex items-center">
                    <input className="h-5 w-5 cursor-pointer" type="checkbox" checked={settings?.labeling.swimLaneExtractionDisplay} onChange={() => changeSetting(ComponentType.LABELING, 'swimLaneExtractionDisplay')} /></span>
                <Tooltip content={<MultilineTooltip tooltipLines={['Groups display of labels in type, task, creator & label. Same group gets the same distance to the text.', 'Might use a lot of space.']} />} color="invert" placement="top" className="cursor-auto"><IconInfoCircle className="h-5 w-5" /></Tooltip>
            </div>
        </div>}
        {/* Overview table */}
        {activeTab == ComponentType.OVERVIEW_TABLE && <div className="flex flex-col gap-y-2 items-center my-4">
            <div className="grid gap-y-2 gap-x-4 items-center text-left" style={{ gridTemplateColumns: 'max-content auto max-content' }}>
                <span>Show overview table</span>
                <span className="cursor-pointer flex items-center">
                    <input className="h-5 w-5 cursor-pointer" type="checkbox" checked={settings?.overviewTable.show} onChange={() => changeSetting(ComponentType.OVERVIEW_TABLE, 'show')} /></span>
                <Tooltip content={<MultilineTooltip tooltipLines={['Completely hide/show the feature.', 'Active settings are preserved']} />} color="invert" placement="top" className="cursor-auto"><IconInfoCircle className="h-5 w-5" /></Tooltip>
                <span>Show heuristics</span>
                <span className="cursor-pointer flex items-center">
                    <input className="h-5 w-5 cursor-pointer" type="checkbox" checked={settings?.overviewTable.showHeuristics} onChange={() => changeSetting(ComponentType.OVERVIEW_TABLE, 'showHeuristics')} /></span>
                <Tooltip content={TOOLTIPS_DICT.LABELING.SHOW_HEURISTICS} color="invert" placement="top" className="cursor-auto"><IconInfoCircle className="h-5 w-5" /></Tooltip>
                <span>Include task legend settings</span>
                <span className="cursor-pointer flex items-center">
                    <input className="h-5 w-5 cursor-pointer" type="checkbox" checked={settings?.overviewTable.includeLabelDisplaySettings} onChange={() => changeSetting(ComponentType.OVERVIEW_TABLE, 'includeLabelDisplaySettings')} /></span>
                <Tooltip content={<MultilineTooltip tooltipLines={['If active the table will filter entries depending on task legend settings.', 'Note that show heuristic disabled will overrule this']} />} color="invert" placement="top" className="cursor-auto"><IconInfoCircle className="h-5 w-5" /></Tooltip>
            </div>
        </div>}
    </Modal >)
}