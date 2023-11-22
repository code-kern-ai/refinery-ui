import { selectProjectId } from "@/src/reduxStore/states/project";
import { HeaderDisplayProps, LabelingSuiteTaskHeaderLabelDisplayData } from "@/src/types/components/projects/projectId/labeling/task-header";
import { SettingManager } from "@/src/util/classes/labeling/settings-manager";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import QuickButtons from "./QuickButtons";

export default function HeaderDisplay(props: HeaderDisplayProps) {
    const projectId = useSelector(selectProjectId);

    const [labelSettingsLabel, setLabelSettingsLabel] = useState<LabelingSuiteTaskHeaderLabelDisplayData>(null);
    const [settingsConfTasks, setSettingsConfTasks] = useState(null);

    useEffect(() => {
        if (!SettingManager.settings) return;
        setSettingsConfTasks(SettingManager.settings.task[projectId]);
    }, [SettingManager.settings]);

    function setLabelSettingsLabelFunc(label: LabelingSuiteTaskHeaderLabelDisplayData) {
        if (label == labelSettingsLabel) {
            setLabelSettingsLabel(null);
            return;
        } else {
            setLabelSettingsLabel(label);
        }
    }

    function labelSettingsBoxPosition() { }

    return (<div className="border md:rounded-lg">
        <table className="min-w-full">
            <tbody className="bg-white divide-y divide-gray-200">
                {props.displayData.map((task, i) => (<tr key={task.id} className={`${i % 2 == 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="font-bold py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-6 whitespace-nowrap">
                        {task.name}
                    </td>
                    <td className={`pl-3 py-2 text-sm text-gray-500 w-full ${i == 0 ? 'pr-8' : 'pr-3'}`}>
                        <div className="flex flex-row flex-wrap gap-2">
                            {task.labelOrder.map((labelId, j) => (<div key={labelId} onClick={() => {
                                setLabelSettingsLabelFunc(task.labels[labelId]);
                                labelSettingsBoxPosition();
                            }} className="text-sm font-medium px-2 py-0.5 rounded-md border focus:outline-none cursor-pointer flex flex-row flex-no-wrap gap-x-1 items-center">
                                {settingsConfTasks && settingsConfTasks[task.id][labelId] && <div className="grid grid-cols-2 gap-0.5">
                                    <div className={`w-2.5 h-2.5 border rounded-full ${settingsConfTasks[task.id][labelId].showManual ? task.labels[labelId].color.backgroundColor : 'bg-white'} ${task.labels[labelId].color.borderColor}`}></div>
                                    <div className={`w-2.5 h-2.5 border rounded-full ${settingsConfTasks[task.id][labelId].showWeakSupervision ? task.labels[labelId].color.backgroundColor : 'bg-white'} ${task.labels[labelId].color.borderColor}`}></div>
                                    <div className={`w-2.5 h-2.5 border rounded-full ${settingsConfTasks[task.id][labelId].showModel ? task.labels[labelId].color.backgroundColor : 'bg-white'} ${task.labels[labelId].color.borderColor}`}></div>
                                    <div className={`w-2.5 h-2.5 border rounded-full ${settingsConfTasks[task.id][labelId].showHeuristics ? task.labels[labelId].color.backgroundColor : 'bg-white'} ${task.labels[labelId].color.borderColor}`}></div>
                                </div>}
                                <div className="truncate" style={{ maxWidth: '260px' }}>{task.labels[labelId].name}</div>
                            </div>))}
                        </div>
                    </td>
                </tr>))}
                {SettingManager.settings.task.alwaysShowQuickButtons && (<tr className={props.displayData.length % 2 == 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="font-bold py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">Quick buttons</td>
                    <td className="px-3 py-2 text-sm text-gray-500 w-full">
                        <QuickButtons labelSettingsLabel={labelSettingsLabel} />
                    </td>
                </tr>)}
            </tbody>
        </table>
    </div>);
}