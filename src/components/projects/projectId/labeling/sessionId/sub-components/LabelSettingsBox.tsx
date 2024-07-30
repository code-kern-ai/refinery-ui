import { openModal, setModalStates } from "@/src/reduxStore/states/modal";
import { LabelSettingsBoxProps } from "@/src/types/components/projects/projectId/labeling/task-header";
import { ModalEnum } from "@/src/types/shared/modal";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { Tooltip } from "@nextui-org/react";
import { IconChecks, IconInfoCircle, IconX } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import InfoLabelBoxModal from "./InfoLabelBoxModal";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { selectSettings, setSettings } from "@/src/reduxStore/states/pages/labeling";
import { selectProjectId } from "@/src/reduxStore/states/project";

export default function LabelSettingsBox(props: LabelSettingsBoxProps) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const settings = useSelector(selectSettings);

    function toggleLabelDisplaySetting(attribute: string) {
        const getSettings = localStorage.getItem('labelingSettings');
        if (!props.labelSettingsLabel) return;
        const labelId = props.labelSettingsLabel.id;
        const taskId = props.labelSettingsLabel.taskId;
        const settingsCopy = getSettings ? JSON.parse(getSettings) : jsonCopy(settings);
        settingsCopy.task[projectId][taskId][labelId][attribute] = !settingsCopy.task[projectId][taskId][labelId][attribute];
        dispatch(setSettings(settingsCopy));
        localStorage.setItem('labelingSettings', JSON.stringify(settingsCopy));
    }

    function stopPropagation(e) {
        e.preventDefault()
        e.stopPropagation();
    }

    return (<div id="label-settings-box" style={{ top: props.position.top, left: props.position.left }}
        onMouseDown={(e) => stopPropagation(e)} onMouseUp={(e) => { stopPropagation(e) }}
        className={`flex flex-col rounded-lg bg-white shadow absolute z-10 border border-gray-300 ${props.labelSettingsLabel ? null : 'hidden'}`}>
        {props.labelSettingsLabel && <div className="pt-2">
            <div className="flex flex-row justify-center pb-2">
                <label className="mr-1 text-sm">Label:</label>
                <label className="italic font-semibold text-sm truncate pr-0.5" style={{ maxWidth: '12rem' }}>{props.labelSettingsLabel.name}</label>
            </div>
            <div className="flex flex-row flex-no-wrap gap-x-2 p-2.5 borders-gray border-t">
                <Tooltip content={TOOLTIPS_DICT.LABELING.INFO_LABEL_BOX} color="invert" placement="top" onClick={() => dispatch(setModalStates(ModalEnum.INFO_LABEL_BOX, { open: true, labelSettingsLabel: props.labelSettingsLabel }))}>
                    <IconInfoCircle className="h-6 w-6 text-gray-700" />
                </Tooltip>
                <div className="flex flex-row flex-nowrap items-center gap-x-1 cursor-pointer">
                    <span className="font-semibold text-sm text-gray-500">M</span>
                    <input className="h-4 w-4 cursor-pointer" type="checkbox" onChange={() => toggleLabelDisplaySetting('showManual')}
                        checked={settings.task[projectId][props.labelSettingsLabel.taskId][props.labelSettingsLabel.id].showManual} />
                </div>
                <div className="flex flex-row flex-nowrap items-center gap-x-1 cursor-pointer">
                    <span className="font-semibold text-sm text-gray-500">WS</span>
                    <input className="h-4 w-4 cursor-pointer" type="checkbox" onChange={() => toggleLabelDisplaySetting('showWeakSupervision')}
                        checked={settings.task[projectId][props.labelSettingsLabel.taskId][props.labelSettingsLabel.id].showWeakSupervision} />
                </div>
                <div className="flex flex-row flex-nowrap items-center gap-x-1 cursor-pointer">
                    <span className="font-semibold text-sm text-gray-500">MC</span>
                    <input className="h-4 w-4 cursor-pointer" type="checkbox" onChange={() => toggleLabelDisplaySetting('showModel')}
                        checked={settings.task[projectId][props.labelSettingsLabel.taskId][props.labelSettingsLabel.id].showModel} />
                </div>
                <div className="flex flex-row flex-nowrap items-center gap-x-1 cursor-pointer">
                    <span className="font-semibold text-sm text-gray-500">H</span>
                    <input className="h-4 w-4 cursor-pointer" type="checkbox" onChange={() => toggleLabelDisplaySetting('showHeuristics')}
                        checked={settings.task[projectId][props.labelSettingsLabel.taskId][props.labelSettingsLabel.id].showHeuristics} />
                </div>
                <Tooltip content={TOOLTIPS_DICT.LABELING.ACTIVATE_ALL} color="invert" placement="top" onClick={() => props.setAllLabelDisplaySetting(true, props.labelSettingsLabel)}>
                    <IconChecks className="h-6 w-6 text-gray-700" />
                </Tooltip>
                <Tooltip content={TOOLTIPS_DICT.LABELING.CLEAR_ALL} color="invert" placement="top" onClick={() => props.setAllLabelDisplaySetting(false, props.labelSettingsLabel)}>
                    <IconX className="h-6 w-6 text-gray-700" />
                </Tooltip>
            </div>
        </div>}
        <InfoLabelBoxModal toggleLabelDisplaySetting={(val: string) => toggleLabelDisplaySetting(val)} />
    </div>)
}