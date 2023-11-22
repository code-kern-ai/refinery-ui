import Modal from "@/src/components/shared/modal/Modal";
import { LineBreaksType } from "@/src/types/components/projects/projectId/data-browser/data-browser";
import { ComponentType, LabelingSuiteSettings } from "@/src/types/components/projects/projectId/labeling/settings";
import { ModalEnum } from "@/src/types/shared/modal";
import { SettingManager } from "@/src/util/classes/labeling/settings-manager";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { Tooltip } from "@nextui-org/react";
import { IconInfoCircle } from "@tabler/icons-react";
import { Fragment, useEffect, useState } from "react";

export default function LabelingSettingsModal() {
    const [activeTab, setActiveTab] = useState<ComponentType>(ComponentType.MAIN);
    const [settingsConf, setSettingsConf] = useState<LabelingSuiteSettings>(null);

    useEffect(() => {
        if (!SettingManager.settings) return;
        SettingManager.prepareColorOptions();
        setSettingsConf(SettingManager.settings);
    }, [SettingManager.settings]);

    function changeSetting(page: ComponentType, setting: string, value?: any) {
        SettingManager.changeSetting(page, setting, value);
        setSettingsConf({ ...settingsConf });
    }

    function toggleLineBreaks() {
        if (settingsConf?.main.lineBreaks == LineBreaksType.IS_PRE_WRAP || settingsConf?.main.lineBreaks == LineBreaksType.IS_PRE_LINE) {
            changeSetting(ComponentType.MAIN, 'lineBreaks', LineBreaksType.NORMAL);
        } else {
            changeSetting(ComponentType.MAIN, 'lineBreaks', LineBreaksType.IS_PRE_WRAP);
        }
        localStorage.setItem('lineBreaks', JSON.stringify(settingsConf.main.lineBreaks));
    }

    function toggleLineBreaksPreWrap() {
        if (settingsConf?.main.lineBreaks === LineBreaksType.IS_PRE_WRAP) {
            changeSetting(ComponentType.MAIN, 'lineBreaks', LineBreaksType.IS_PRE_LINE);
        } else if (settingsConf?.main.lineBreaks === LineBreaksType.IS_PRE_LINE) {
            changeSetting(ComponentType.MAIN, 'lineBreaks', LineBreaksType.IS_PRE_WRAP);
        }
        localStorage.setItem('lineBreaks', JSON.stringify(settingsConf.main.lineBreaks));
    }

    return (<Modal modalName={ModalEnum.LABELING_SETTINGS} doNotFullyInit={true}>
        <div className="flex flex-row items-center justify-center gap-x-2">
            <span className="text-lg leading-6 text-gray-900 font-medium">
                Settings
            </span>
            <Tooltip content={TOOLTIPS_DICT.LABELING.SETTINGS} color="invert" placement="top">
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
            <div className="grid gap-y-2 gap-x-4 items-center" style={{ gridTemplateColumns: 'max-content 100px max-content' }}>
                <span>Auto next record</span>
                <span className="cursor-pointer flex items-center">
                    <input className="h-5 w-5 cursor-pointer" type="checkbox" checked={settingsConf?.main.autoNextRecord} onChange={() => changeSetting(ComponentType.MAIN, 'autoNextRecord')} /></span>
                <Tooltip content={TOOLTIPS_DICT.LABELING.AUTO_NEXT_RECORD} color="invert" placement="top"><IconInfoCircle className="h-5 w-5" /></Tooltip>

                <span>Hover background</span>
                <Dropdown options={SettingManager.hoverColorOptions} buttonName={settingsConf?.main.hoverGroupBackgroundColor} backgroundColors={SettingManager.hoverColorClassArray}
                    dropdownItemsClasses="max-h-80 overflow-y-auto" buttonCaptionBgColor={settingsConf?.main.hoverGroupBackgroundColorClass}
                    selectedOption={(option: string) => changeSetting(ComponentType.MAIN, 'hoverGroupBackgroundColor', option)} />
                <Tooltip content={TOOLTIPS_DICT.LABELING.HOVER_BACKGROUND} color="invert" placement="top"><IconInfoCircle className="h-5 w-5" /></Tooltip>

                <span>Visible line breaks</span>
                <div className="flex items-center h-5">
                    <input id="comments" type="checkbox" onChange={toggleLineBreaks} checked={settingsConf?.main.lineBreaks != LineBreaksType.NORMAL}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded cursor-pointer" />
                </div>
                <Tooltip content={TOOLTIPS_DICT.LABELING.LINE_BREAKS} color="invert" placement="top"><IconInfoCircle className="h-5 w-5" /></Tooltip>

                {settingsConf?.main.lineBreaks != LineBreaksType.NORMAL && <Fragment>
                    <label htmlFor="preWrap" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer italic">Pre-wrap</label>
                    <input type="radio" checked={settingsConf?.main.lineBreaks == LineBreaksType.IS_PRE_WRAP} onChange={toggleLineBreaksPreWrap} name="lineBreaks" id="preWrap"
                        className="focus:ring-blue-500 h-6 w-4 text-blue-600 border-gray-200 cursor-pointer" />
                    <Tooltip content={TOOLTIPS_DICT.LABELING.PRE_WRAP} color="invert" placement="top"><IconInfoCircle className="h-5 w-5" /></Tooltip>

                    <label htmlFor="preLine" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer italic">Pre-line</label>
                    <input type="radio" checked={settingsConf?.main.lineBreaks == LineBreaksType.IS_PRE_LINE} onChange={toggleLineBreaksPreWrap} name="lineBreaks" id="preLine"
                        className="focus:ring-blue-500 h-6 w-4 text-blue-600 border-gray-200 cursor-pointer" />
                    <Tooltip content={TOOLTIPS_DICT.LABELING.PRE_LINE} color="invert" placement="top"><IconInfoCircle className="h-5 w-5" /></Tooltip>
                </Fragment>}
            </div>
        </div>}
    </Modal >)
}