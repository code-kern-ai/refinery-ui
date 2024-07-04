import { selectProjectId } from "@/src/reduxStore/states/project";
import { HeaderDisplayProps, LabelingSuiteTaskHeaderLabelDisplayData } from "@/src/types/components/projects/projectId/labeling/task-header";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import QuickButtons from "./QuickButtons";
import LabelSettingsBox from "./LabelSettingsBox";
import { selectHoverGroupDict, selectSettings, selectTmpHighlightIds, setHoverGroupDict, setSettings } from "@/src/reduxStore/states/pages/labeling";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { LabelingPageParts } from "@/src/types/components/projects/projectId/labeling/labeling-main-component";

export function shouldHighlightOn(tmpHighlightIds: string[], comparedId: string[]) {
    return tmpHighlightIds.some((id) => comparedId.includes(id));
}

export default function HeaderDisplay(props: HeaderDisplayProps) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const settings = useSelector(selectSettings);
    const hoverGroupsDict = useSelector(selectHoverGroupDict);
    const tmpHighlightIds = useSelector(selectTmpHighlightIds);

    const [labelSettingsLabel, setLabelSettingsLabel] = useState<LabelingSuiteTaskHeaderLabelDisplayData>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        const handleMouseDown = (event) => {
            if (!event.target.closest('label-settings-box')) {
                setLabelSettingsLabel(null);
            }
        };
        window.addEventListener('mousedown', handleMouseDown);
        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
        };
    }, []);

    function setLabelSettingsLabelFunc(label: LabelingSuiteTaskHeaderLabelDisplayData) {
        if (label == labelSettingsLabel) {
            setLabelSettingsLabel(null);
            return;
        } else {
            setLabelSettingsLabel(label);
        }
    }

    function labelSettingsBoxPosition(e) {
        const labelSettingsBox = document.getElementById('label-settings-box');
        if (!labelSettingsBox) return;
        const baseBom = document.getElementById('base-dom-task-header');
        const widthLabelSettingsBox = 290;
        const baseBox = baseBom.getBoundingClientRect();
        const { top, left, height } = e.target.getBoundingClientRect();
        const posTop = (top + height - baseBox.top + 10);
        let posLeft = (left - baseBox.left);
        if (posLeft + widthLabelSettingsBox > baseBox.width) posLeft = baseBox.width - widthLabelSettingsBox - 10;
        setPosition({ top: posTop, left: posLeft });
    }

    function setAllLabelDisplaySetting(value: boolean, labelSettingsLabel?: any, attribute?: string, deactivateOthers?: boolean) {
        const getSettings = localStorage.getItem('labelingSettings');
        const settingsCopy = getSettings ? JSON.parse(getSettings) : jsonCopy(settings);
        const tasks = settingsCopy.task[projectId];
        if (deactivateOthers && !attribute) {
            console.error("deactivateOthers needs attribute");
            return;
        }
        if (labelSettingsLabel) {
            const labelId = labelSettingsLabel.id;
            const taskId = labelSettingsLabel.taskId;
            if (attribute && !deactivateOthers) tasks[taskId][labelId][attribute] = value;
            else {
                for (let key in tasks[taskId][labelId]) {
                    if (deactivateOthers) {
                        if (key == attribute) {
                            tasks[taskId][labelId][key] = value;
                        } else {
                            tasks[taskId][labelId][key] = false;
                        }
                    } else {
                        tasks[taskId][labelId][key] = value;
                    }
                }
            }
        } else {
            for (let taskId in tasks) {
                for (let labelId in tasks[taskId]) {
                    if (attribute && !deactivateOthers) tasks[taskId][labelId][attribute] = value;
                    else {
                        for (let key in tasks[taskId][labelId]) {
                            if (deactivateOthers) {
                                if (key == attribute) {
                                    tasks[taskId][labelId][key] = value;
                                } else {
                                    tasks[taskId][labelId][key] = false;
                                }
                            } else {
                                tasks[taskId][labelId][key] = value;
                            }
                        }
                    }
                }
            }
        }
        dispatch(setSettings(settingsCopy));
        localStorage.setItem('labelingSettings', JSON.stringify(settingsCopy));
    }

    function onMouseEvent(update: boolean, labelId: string, task?) {
        let hoverGroupsDictCopy = {};
        if (!hoverGroupsDictCopy[labelId] && update) {
            hoverGroupsDictCopy[labelId] = {
                [LabelingPageParts.TASK_HEADER]: true,
                [LabelingPageParts.OVERVIEW_TABLE]: true,
                [LabelingPageParts.TABLE_MODAL]: true,
                [LabelingPageParts.MANUAL]: true,
                [LabelingPageParts.WEAK_SUPERVISION]: true,
                [LabelingPageParts.INFORMATION_SOURCE]: true,
            }
            dispatch(setHoverGroupDict(hoverGroupsDictCopy));
        } else {
            dispatch(setHoverGroupDict(null));
        }
    }

    return (<div className="border md:rounded-lg">
        <table className="min-w-full">
            <tbody className="bg-white divide-y divide-gray-200">
                {props.displayData && props.displayData.map((task, i) => (<tr key={task.id} className={`${i % 2 == 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className={`font-semibold py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-6 whitespace-nowrap ${shouldHighlightOn(tmpHighlightIds, [task.id]) ? settings.main.hoverGroupBackgroundColorClass : ''}`}>
                        {task.name}
                    </td>
                    <td className={`pl-3 py-2 text-sm text-gray-500 w-full ${i == 0 ? 'pr-8' : 'pr-3'}`}>
                        <div className="flex flex-row flex-wrap gap-2">
                            {task.labelOrder.map((labelId, j) => (<div key={labelId} onClick={(e) => {
                                setLabelSettingsLabelFunc(task.labels[labelId]);
                                labelSettingsBoxPosition(e);
                            }} onMouseEnter={() => onMouseEvent(true, task.labels[labelId].id, task)} onMouseLeave={() => onMouseEvent(false, task.labels[labelId].id)}
                                className={`text-sm font-medium px-2 py-0.5 rounded-md border focus:outline-none cursor-pointer flex flex-row flex-no-wrap gap-x-1 items-center ${shouldHighlightOn(tmpHighlightIds, [task.labels[labelId].taskId]) || hoverGroupsDict[task.labels[labelId].id] && hoverGroupsDict[task.labels[labelId].id][LabelingPageParts.TASK_HEADER] ? task.labels[labelId].color.backgroundColor : ''}`}>
                                {settings.task[projectId] && settings.task[projectId][task.id] && settings.task[projectId][task.id][labelId] && <div className="grid grid-cols-2 gap-0.5">
                                    <div className={`w-2.5 h-2.5 border rounded-full ${settings.task[projectId][task.id][labelId].showManual ? task.labels[labelId].color.backgroundColor : 'bg-white'} ${task.labels[labelId].color.borderColor}`}></div>
                                    <div className={`w-2.5 h-2.5 border rounded-full ${settings.task[projectId][task.id][labelId].showWeakSupervision ? task.labels[labelId].color.backgroundColor : 'bg-white'} ${task.labels[labelId].color.borderColor}`}></div>
                                    <div className={`w-2.5 h-2.5 border rounded-full ${settings.task[projectId][task.id][labelId].showModel ? task.labels[labelId].color.backgroundColor : 'bg-white'} ${task.labels[labelId].color.borderColor}`}></div>
                                    <div className={`w-2.5 h-2.5 border rounded-full ${settings.task[projectId][task.id][labelId].showHeuristics ? task.labels[labelId].color.backgroundColor : 'bg-white'} ${task.labels[labelId].color.borderColor}`}></div>
                                </div>}
                                <div className="truncate" style={{ maxWidth: '260px' }}>{task.labels[labelId].name}</div>
                            </div>))}
                        </div>
                    </td>
                </tr>))}
                {settings.task.alwaysShowQuickButtons && (<tr className={props.displayData.length % 2 == 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="font-semibold py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">Quick buttons</td>
                    <td className="px-3 py-2 text-sm text-gray-500 w-full">
                        <QuickButtons labelSettingsLabel={labelSettingsLabel} setAllLabelDisplaySetting={(val, attribute) => setAllLabelDisplaySetting(val, null, attribute)} />
                    </td>
                </tr>)}
            </tbody>
        </table>
        <LabelSettingsBox labelSettingsLabel={labelSettingsLabel} position={position} setAllLabelDisplaySetting={(val, labelSettingsLabel) => setAllLabelDisplaySetting(val, labelSettingsLabel)} />
    </div>);
}