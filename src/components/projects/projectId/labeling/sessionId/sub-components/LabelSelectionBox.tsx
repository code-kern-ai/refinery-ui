import { selectUser } from "@/src/reduxStore/states/general";
import { selectSettings } from "@/src/reduxStore/states/pages/labeling";
import { LabelSelectionBoxProps } from "@/src/types/components/projects/projectId/labeling/labeling";
import { LabelingTaskTaskType } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { UserRole } from "@/src/types/shared/sidebar";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { Tooltip } from "@nextui-org/react";
import { IconCirclePlus } from "@tabler/icons-react";
import { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function LabelSelectionBox(props: LabelSelectionBoxProps) {
    const user = useSelector(selectUser);
    const settings = useSelector(selectSettings);

    const [newLabel, setNewLabel] = useState('');
    const [taskFilteredDict, setTaskFilteredDict] = useState({});

    useEffect(() => {
        if (!props.labelHotkeys) return;
        document.addEventListener('keyup', handleKeyboardEvent);
        return () => {
            document.removeEventListener('keyup', handleKeyboardEvent);
        };
    }, [props.labelHotkeys, props.activeTasks]);

    function handleKeyboardEvent(event) {
        const labelSelection = document.getElementById('label-selection-box');
        if (!labelSelection || labelSelection.classList.contains('hidden') ) return;
        for (const key in props.labelHotkeys) {
            if (key == event.key) {
                const activeTasks = props.activeTasks.map(x => x.task);
                const task = activeTasks.find(t => t.id == props.labelHotkeys[key].taskId);
                props.addRla(task, props.labelHotkeys[key].labelId);
                event.preventDefault();
                event.stopPropagation();
                return;
            }
        }
    }

    
    useEffect(() => {
        if (!props.activeTasks || props.activeTasks.length == 0) return;
        const taskFilteredDict = {};
        props.activeTasks.forEach((task) => {
            if (task.task.taskType == LabelingTaskTaskType.MULTICLASS_CLASSIFICATION) {
                taskFilteredDict[task.task.id] = task.task.labels.slice(settings.labeling.showNLabelButton);
            } else {
                taskFilteredDict[task.task.id] = task.task.labels;
            }
        });
        setTaskFilteredDict(taskFilteredDict);
    }, [props.activeTasks, settings.labeling.showNLabelButton]);

    function stopPropagation(e) {
        e.preventDefault()
        e.stopPropagation();
    }

    return (<div id="label-selection-box" style={{ top: props.position.top, left: props.position.left, minWidth: '270px' }}
        onMouseDown={(e) => stopPropagation(e)} onMouseUp={(e) => stopPropagation(e)}
        className={`flex flex-col rounded-lg bg-white shadow absolute z-50 border border-gray-300 ${props.activeTasks && props.activeTasks.length > 0 ? null : 'hidden'}`}>
        {props.activeTasks && <div className="max-h-80 overflow-y-auto">
            {props.activeTasks && props.activeTasks.map((task, index) => <Fragment key={task.task.id}>
                <div className={`flex flex-grow flex-row justify-center p-2 ${index != 0 ? 'border-t borders-gray' : null}`}>
                    <label className="mr-1 text-sm">Task:</label>
                    <label className="italic font-bold text-sm truncate pr-0.5" style={{ maxWidth: '12rem' }}>{task.task.name}</label>
                </div>
                <div className="flex flex-row gap-x-1 flex-nowrap p-2.5 border borders-gray">
                    <input onClick={(e: any) => e.target.focus()} type="text" value={newLabel} onChange={(e) => {
                        setNewLabel(e.target.value);
                        props.checkLabelVisibleInSearch(e.target.value, task.task);
                    }} 
                    onKeyUp={(e: any) => e.stopPropagation()}
                    onKeyDown={(e: any) => {
                        if (e.key == 'Enter') {
                            if (e.target.value == '') return;
                            props.addNewLabelToTask(e.target.value, task.task);
                            setNewLabel('');
                        }
                    }} style={{ outline: 'none', boxShadow: 'none' }} placeholder="Search label name..."
                        className="h-8 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />

                    {user && user.role == UserRole.ENGINEER && <Tooltip content={TOOLTIPS_DICT.LABELING.CREATE_LABEL} placement="left" color="invert">
                        <div className="flex items-center">
                            <button onClick={() => {
                                props.addNewLabelToTask(newLabel, task.task);
                                setNewLabel('');
                            }}
                                disabled={props.labelAddButtonDisabled || newLabel == ''} className="disabled:cursor-not-allowed disabled:opacity-50">
                                <IconCirclePlus className={`${props.labelAddButtonDisabled || newLabel == '' ? 'text-gray-300' : 'text-gray-700'}`} />
                            </button>
                        </div>
                    </Tooltip>}
                </div>
                <div className={`flex-grow flex flex-col justify-center ${index == props.activeTasks.length - 1 ? 'p-3' : 'px-3 pt-3'}`}>
                    {props.activeTasks && taskFilteredDict && taskFilteredDict[task.task.id] && taskFilteredDict[task.task.id].map((label, index) =>
                        <button key={label.id} className={`text-sm font-medium px-2 py-0.5 rounded-md border mb-2 focus:outline-none ${props.labelLookup[label.id].color.backgroundColor}  ${props.labelLookup[label.id].color.textColor}  ${props.labelLookup[label.id].color.borderColor}`} role="button"
                            style={{ display: props.labelLookup[label.id].visibleInSearch ? null : 'none' }}
                            onClick={(e) => props.addRla(task.task, label.id)}>
                            <span className="truncate" style={{ maxWidth: '260px' }}>{label.name}
                                {label.hotkey && <kbd className="ml-1 uppercase inline-flex items-center border bg-white border-gray-200 rounded px-2 text-sm font-sans font-medium text-gray-400">{label.hotkey}</kbd>}
                            </span>
                        </button>)}
                </div>
            </Fragment>)}
        </div>}
    </div>);
}