import { selectSettings, setSettings } from "@/src/reduxStore/states/pages/labeling";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { QuickButtonConfig, QuickButtonProps, QuickButtonsProps } from "@/src/types/components/projects/projectId/labeling/task-header";
import { getDefaultTaskOverviewLabelSettings } from "@/src/util/components/projects/projectId/labeling/labeling-general-helper";
import { getQuickButtonConfig } from "@/src/util/components/projects/projectId/labeling/task-header-helper";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { Tooltip } from "@nextui-org/react";
import { useDispatch, useSelector } from "react-redux";

const QUICK_BUTTONS: QuickButtonConfig = getQuickButtonConfig();

export default function QuickButtons(props: QuickButtonsProps) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const settings = useSelector(selectSettings);


    function setAllLabelDisplaySettingDefault() {
        const settingsCopy = jsonCopy(settings);
        const tasks = settingsCopy.task[projectId];
        for (let taskId in tasks) {
            for (let labelId in tasks[taskId]) {
                tasks[taskId][labelId] = getDefaultTaskOverviewLabelSettings();
            }
        }
        dispatch(setSettings(settingsCopy));
    }

    function setAllLabelDisplaySetting(value: boolean, attribute?: string) {
        props.setAllLabelDisplaySetting(value, attribute);
    }

    return (<div className="flex flex-row flex-wrap gap-2 items-center">
        <QuickButton attributeName="showManual" caption="Manual" dataTipCaption="manual" setAllLabelDisplaySetting={() => setAllLabelDisplaySetting(true, 'showManual')} />
        <QuickButton attributeName="showWeakSupervision" caption="Weak Supervision" dataTipCaption="weak supervision" setAllLabelDisplaySetting={() => setAllLabelDisplaySetting(true, 'showWeakSupervision')} />
        <QuickButton attributeName="showModel" caption="Model Callback" dataTipCaption="model callback" setAllLabelDisplaySetting={() => setAllLabelDisplaySetting(true, 'showModel')} />
        <QuickButton attributeName="showHeuristics" caption="Heuristic" dataTipCaption="heuristic" setAllLabelDisplaySetting={() => setAllLabelDisplaySetting(true, 'showHeuristics')} />
        <button onClick={() => setAllLabelDisplaySetting(true)}
            className="text-sm font-medium px-2 py-0.5 rounded-md border focus:outline-none cursor-pointer flex flex-row flex-no-wrap gap-x-1 items-center">
            {QUICK_BUTTONS.all && <div className="grid grid-cols-2 gap-0.5">
                <div className={`w-2.5 h-2.5 border rounded-full ${QUICK_BUTTONS.all[0]}`}></div>
                <div className={`w-2.5 h-2.5 border rounded-full ${QUICK_BUTTONS.all[1]}`}></div>
                <div className={`w-2.5 h-2.5 border rounded-full ${QUICK_BUTTONS.all[2]}`}></div>
                <div className={`w-2.5 h-2.5 border rounded-full ${QUICK_BUTTONS.all[3]}`}></div>
            </div>}
            All
        </button>
        <button onClick={() => setAllLabelDisplaySetting(false)}
            className="text-sm font-medium px-2 py-0.5 rounded-md border focus:outline-none cursor-pointer flex flex-row flex-no-wrap gap-x-1 items-center">
            {QUICK_BUTTONS.nothing && <div className="grid grid-cols-2 gap-0.5">
                <div className={`w-2.5 h-2.5 border rounded-full ${QUICK_BUTTONS.nothing[0]}`}></div>
                <div className={`w-2.5 h-2.5 border rounded-full ${QUICK_BUTTONS.nothing[1]}`}></div>
                <div className={`w-2.5 h-2.5 border rounded-full ${QUICK_BUTTONS.nothing[2]}`}></div>
                <div className={`w-2.5 h-2.5 border rounded-full ${QUICK_BUTTONS.nothing[3]}`}></div>
            </div>}
            Nothing
        </button>
        <button onClick={setAllLabelDisplaySettingDefault}
            className="text-sm font-medium px-2 py-0.5 rounded-md border focus:outline-none cursor-pointer flex flex-row flex-no-wrap gap-x-1 items-center">
            {QUICK_BUTTONS.default && <div className="grid grid-cols-2 gap-0.5">
                <div className={`w-2.5 h-2.5 border rounded-full ${QUICK_BUTTONS.default[0]}`}></div>
                <div className={`w-2.5 h-2.5 border rounded-full ${QUICK_BUTTONS.default[1]}`}></div>
                <div className={`w-2.5 h-2.5 border rounded-full ${QUICK_BUTTONS.default[2]}`}></div>
                <div className={`w-2.5 h-2.5 border rounded-full ${QUICK_BUTTONS.default[3]}`}></div>
            </div>}
            Default
        </button>
    </div>);
}

function QuickButton(props: QuickButtonProps) {
    const settings = useSelector(selectSettings);

    return (<Tooltip content={'Activate ' + props.dataTipCaption + ' labels in labeling view'} color="invert" placement={settings.task.isCollapsed && props.caption == 'Manual' ? 'right' : 'bottom'}>
        <button onClick={props.setAllLabelDisplaySetting}
            className="text-sm font-medium px-2 py-0.5 rounded-md border focus:outline-none cursor-pointer flex flex-row flex-no-wrap gap-x-1 items-center">
            {QUICK_BUTTONS[props.attributeName] && <div className="grid grid-cols-2 gap-0.5">
                <div className={`w-2.5 h-2.5 border rounded-full ${QUICK_BUTTONS[props.attributeName][0]}`}></div>
                <div className={`w-2.5 h-2.5 border rounded-full ${QUICK_BUTTONS[props.attributeName][1]}`}></div>
                <div className={`w-2.5 h-2.5 border rounded-full ${QUICK_BUTTONS[props.attributeName][2]}`}></div>
                <div className={`w-2.5 h-2.5 border rounded-full ${QUICK_BUTTONS[props.attributeName][3]}`}></div>
            </div>}
            {props.caption}
        </button>
        {/* TODO add the background colors on hover */}
    </Tooltip>)
}