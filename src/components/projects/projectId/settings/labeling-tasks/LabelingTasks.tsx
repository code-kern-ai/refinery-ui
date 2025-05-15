import { openModal, setModalStates } from "@/src/reduxStore/states/modal";
import { selectLabelingTasksAll, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { LabelType, LabelTypeWithOnClick, LabelingTask, LabelingTaskTaskType, LabelingTaskWithOnClick } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { ModalEnum } from "@/src/types/shared/modal";
import { LabelHelper } from "@/src/util/classes/label-helper";
import { isTaskNameUnique, labelingTaskFromString, labelingTaskToString } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { useCallback, useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import RenameLabelModal from "./RenameLabelModal";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import AddLabelingTaskModal from "./AddLabelingTaskModal";
import DeleteLabelingTaskModal from "./DeleteLabelingTaskModal";
import DeleteLabelModal from "./DeleteLabelModal";
import AddLabelModal from "./AddLabelModal";
import ChangeColorModal from "./ChangeColorModal";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { updateLabelingTask } from "@/src/services/base/labeling-tasks";
import IconButton from "@/submodules/react-components/components/kern-button/IconButton";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import { MemoIconColorPicker, MemoIconPlus, MemoIconTrash } from "@/submodules/react-components/components/kern-icons/icons";
import { useConsoleLog } from "@/submodules/react-components/hooks/useConsoleLog";

export default function LabelingTasks() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const labelingTasksSchema = useSelector(selectLabelingTasksAll);

    const [labelingTasksDropdownArray, setLabelingTasksDropdownArray] = useState<{ name: string, value: string }[]>([]);

    useEffect(() => {
        LabelHelper.setLabelColorOptions();
    }, [projectId]);

    useEffect(() => {
        setLabelingTasksDropdownArray(labelingTasksDropdownValues());
    }, [labelingTasksSchema]);

    function openTaskName(index: number) {
        const labelingTasksSchemaCopy = jsonCopy(labelingTasksSchema);
        labelingTasksSchemaCopy[index].nameOpen = true;
        dispatch(setLabelingTasksAll(labelingTasksSchemaCopy));
    }

    function changeTaskName(task: LabelingTask, index: number, value: string) {
        const labelingTasksSchemaCopy = jsonCopy(labelingTasksSchema);
        labelingTasksSchemaCopy[index].nameOpen = false;
        dispatch(setLabelingTasksAll(labelingTasksSchemaCopy));
        if (value == '') return;
        if (!isTaskNameUnique(labelingTasksSchema, value)) return;
        updateLabelingTask(projectId, {
            labelingTaskId: task.id,
            labelingTaskName: value,
            labelingTaskType: task.taskType,
            labelingTaskTargetId: task.targetId == "" ? null : task.targetId
        }, (res) => {
            const labelingTasksSchemaCopy = jsonCopy(labelingTasksSchema);
            labelingTasksSchemaCopy[index].name = value;
            labelingTasksSchemaCopy[index].nameOpen = false;
            dispatch(setLabelingTasksAll(labelingTasksSchemaCopy));
        });
    }

    function updateLabelingTaskType(task: LabelingTask, index: number, value: string) {
        updateLabelingTask(projectId, {
            labelingTaskId: task.id,
            labelingTaskName: task.name,
            labelingTaskType: value,
            labelingTaskTargetId: task.targetId == "" ? null : task.targetId
        }, (res) => {
            const labelingTasksSchemaCopy = jsonCopy(labelingTasksSchema);
            labelingTasksSchemaCopy[index].taskType = value;
            dispatch(setLabelingTasksAll(labelingTasksSchemaCopy));
        });
    }

    function labelingTasksDropdownValues() {
        const prepareNewArray: { name: string, value: string }[] = [];
        for (let t of Object.values(LabelingTaskTaskType)) {
            if (t == LabelingTaskTaskType.NOT_USEABLE) continue;
            prepareNewArray.push({
                name: labelingTaskToString(t),
                value: t,
            });
        }
        return prepareNewArray;
    }

    const deleteLabelingTask = useCallback((task) => () => dispatch(setModalStates(ModalEnum.DELETE_LABELING_TASK, { taskId: task.id, open: true })), [])

    const deleteLabel = useCallback((task: LabelingTask, label: LabelType) => () => {
        dispatch(setModalStates(ModalEnum.DELETE_LABEL, { taskId: task.id, label: label, open: true }));
    }, []);

    const changeColorLabel = useCallback((task: LabelingTask, label: LabelType) => () => {
        dispatch(setModalStates(ModalEnum.CHANGE_COLOR, { taskId: task.id, label: label, open: true }));
    }, []);

    const labelingTasksFinal = useMemo(() => {
        if (!labelingTasksSchema) return null;
        return labelingTasksSchema.map((labelingTask) => (
            {
                ...labelingTask,
                onDelete: deleteLabelingTask(labelingTask),
                labels: labelingTask.labels.map((label) => ({ ...label, onDelete: deleteLabel(labelingTask, label), onChangeColor: changeColorLabel(labelingTask, label) })),
            }
        ))
    }, [labelingTasksSchema]);


    return (<div className="mt-8">
        <div className="text-lg leading-6 text-gray-900 font-medium inline-block">
            Labeling tasks
        </div>
        <div className="mt-1">
            <div className="text-sm leading-5 font-normal text-gray-500 inline-block">Define what kind of things you
                want to
                label. We currently support classifications and extractions.</div>

            <div className="inline-block min-w-full align-middle">
                <div className="shadow ring-1 ring-black ring-opacity-5 md:rounded-lg" style={{ padding: '3px' }}>
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col"
                                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Target</th>
                                <th scope="col"
                                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500 w-60">
                                    Name</th>
                                <th scope="col"
                                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Task Type</th>
                                <th scope="col"
                                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Labels</th>
                                <th scope="col"
                                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {labelingTasksFinal && labelingTasksFinal.map((task: LabelingTaskWithOnClick, index: number) => (
                                <tr key={task.id} className={`${index % 2 != 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                    <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">{task.targetName}</td>
                                    <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                        {!task.nameOpen ?
                                            <p className="break-words cursor-pointer" onClick={() => openTaskName(index)}>{task.name}</p>
                                            : <input type="text" defaultValue={task.name} onKeyDown={(event) => {
                                                if (event.key == 'Enter') changeTaskName(task, index, event.currentTarget.value);
                                            }} onBlur={(event) => changeTaskName(task, index, event.currentTarget.value)} autoFocus={true}
                                                className="h-8 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />}
                                    </td>
                                    <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                        <KernDropdown options={labelingTasksDropdownArray} buttonName={labelingTaskToString(task.taskType)}
                                            disabledOptions={[false, task.targetName === 'Full Record', false]} dropdownWidth="w-60" dropdownItemsClasses="w-60"
                                            selectedOption={(option: any) => updateLabelingTaskType(task, index, labelingTaskFromString(option.name))} />
                                    </td>
                                    <td className="flex flex-wrap justify-center items-center px-3 py-2 text-sm text-gray-500">
                                        {task.labels.map((label: LabelTypeWithOnClick) => (
                                            <div key={label.id} className={`inline-flex border items-center m-1 px-1.5 py-0.5 rounded-md text-sm font-medium ${label.color.backgroundColor} ${label.color.textColor} ${label.color.borderColor} ${label.color.hoverColor}`}>
                                                <MemoIconColorPicker className="h-4 w-4 mr-1 cursor-pointer" onClick={label.onChangeColor} />
                                                <span>{label.name}</span>
                                                {label.hotkey && <kbd className="ml-2 uppercase inline-flex items-center border bg-white border-gray-200 rounded px-2 text-sm font-sans font-medium text-gray-400">{label.hotkey}</kbd>}
                                                <MemoIconTrash className="h-4 w-4 ml-1 cursor-pointer" onClick={label.onDelete} />
                                            </div>
                                        ))}
                                        <IconButton
                                            icon={MemoIconPlus}
                                            disabled={task.taskType == LabelingTaskTaskType.NOT_SET}
                                            onClick={() => dispatch(setModalStates(ModalEnum.ADD_LABEL, { taskId: task.id, open: true }))}
                                        />
                                    </td>
                                    <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                        <MemoIconTrash onClick={task.onDelete} className="h-6 w-6 text-red-700 cursor-pointer" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div className="mt-1 flex items-center gap-1">
            <KernButton
                text="Add labeling task"
                icon={MemoIconPlus}
                onClick={() => dispatch(openModal(ModalEnum.ADD_LABELING_TASK))}
                tooltip={TOOLTIPS_DICT.PROJECT_SETTINGS.LABELING_TASK.NEW_LABELING_TASK}
                tooltipPlacement="right"
            />
        </div>

        <AddLabelingTaskModal />
        <DeleteLabelingTaskModal />
        <DeleteLabelModal />
        <AddLabelModal />
        <ChangeColorModal />
        <RenameLabelModal />
    </div >
    )
}