import { openModal, setModalStates } from "@/src/reduxStore/states/modal";
import { selectLabelingTasksAll, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { WebSocketsService } from "@/src/services/base/web-sockets/WebSocketsService";
import { unsubscribeWSOnDestroy } from "@/src/services/base/web-sockets/web-sockets-helper";
import { GET_LABELING_TASKS_BY_PROJECT_ID } from "@/src/services/gql/queries/project-setting";
import { LabelType, LabelingTask, LabelingTaskTaskType } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { CurrentPage } from "@/src/types/shared/general";
import { ModalEnum } from "@/src/types/shared/modal";
import { LabelHelper } from "@/src/util/classes/label-helper";
import { isTaskNameUnique, labelingTaskFromString, labelingTaskToString, postProcessLabelingTasks, postProcessLabelingTasksSchema } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { IconColorPicker, IconPlus, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import RenameLabelModal from "./RenameLabelModal";
import { UPDATE_LABELING_TASK } from "@/src/services/gql/mutations/project-settings";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import AddLabelingTaskModal from "./AddLabelingTaskModal";
import DeleteLabelingTaskModal from "./DeleteLabelingTaskModal";
import DeleteLabelModal from "./DeleteLabelModal";
import AddLabelModal from "./AddLabelModal";
import ChangeColorModal from "./ChangeColorModal";
import Dropdown2 from "@/submodules/react-components/components/Dropdown2";

export default function LabelingTasks() {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const labelingTasksSchema = useSelector(selectLabelingTasksAll);

    const [labelingTasksDropdownArray, setLabelingTasksDropdownArray] = useState<{ name: string, value: string }[]>([]);

    const [updateLabelingTaskMut] = useMutation(UPDATE_LABELING_TASK);

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
        updateLabelingTaskMut({ variables: { projectId: projectId, labelingTaskId: task.id, labelingTaskName: value, labelingTaskType: task.taskType, labelingTaskTargetId: task.targetId == "" ? null : task.targetId } }).then((res) => {
            const labelingTasksSchemaCopy = jsonCopy(labelingTasksSchema);
            labelingTasksSchemaCopy[index].name = value;
            labelingTasksSchemaCopy[index].nameOpen = false;
            dispatch(setLabelingTasksAll(labelingTasksSchemaCopy));
        });
    }

    function updateLabelingTaskType(task: LabelingTask, index: number, value: string) {
        updateLabelingTaskMut({ variables: { projectId: projectId, labelingTaskId: task.id, labelingTaskName: task.name, labelingTaskType: value, labelingTaskTargetId: task.targetId == "" ? null : task.targetId } }).then((res) => {
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

    return (<div className="mt-8">
        <div className="text-lg leading-6 text-gray-900 font-medium inline-block">
            Labeling tasks
        </div>
        <div className="mt-1">
            <div className="text-sm leading-5 font-medium text-gray-700 inline-block">Define what kind of things you
                want to
                label. We currently support classifications and extractions.</div>

            <div className="inline-block min-w-full align-middle">
                <form className="shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
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
                            {labelingTasksSchema && labelingTasksSchema.map((task: LabelingTask, index: number) => (
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
                                        <Dropdown2 options={labelingTasksDropdownArray} buttonName={labelingTaskToString(task.taskType)}
                                            disabledOptions={[false, task.targetName === 'Full Record', false]} dropdownWidth="w-60" dropdownItemsClasses="w-60"
                                            selectedOption={(option: any) => updateLabelingTaskType(task, index, labelingTaskFromString(option.name))} />
                                    </td>
                                    <td className="flex flex-wrap justify-center items-center px-3 py-2 text-sm text-gray-500">
                                        {task.labels.map((label: LabelType) => (
                                            <div key={label.id} className={`inline-flex border items-center m-1 px-1.5 py-0.5 rounded-md text-sm font-medium ${label.color.backgroundColor} ${label.color.textColor} ${label.color.borderColor} ${label.color.hoverColor}`}>
                                                <IconColorPicker className="h-4 w-4 mr-1 cursor-pointer" onClick={() => dispatch(setModalStates(ModalEnum.CHANGE_COLOR, { taskId: task.id, label: label, open: true }))} />
                                                <span>{label.name}</span>
                                                {label.hotkey && <kbd className="ml-2 uppercase inline-flex items-center border bg-white border-gray-200 rounded px-2 text-sm font-sans font-medium text-gray-400">{label.hotkey}</kbd>}
                                                <IconTrash className="h-4 w-4 ml-1 cursor-pointer" onClick={() => dispatch(setModalStates(ModalEnum.DELETE_LABEL, { taskId: task.id, label: label, open: true }))} />
                                            </div>
                                        ))}

                                        <span
                                            className="bg-gray-100 text-gray-800 cursor-pointer p-1 rounded-md hover:bg-gray-300">
                                            <IconPlus className="cursor-pointer" onClick={() => dispatch(setModalStates(ModalEnum.ADD_LABEL, { taskId: task.id, open: true }))} />
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                        <IconTrash onClick={() => dispatch(setModalStates(ModalEnum.DELETE_LABELING_TASK, { taskId: task.id, open: true }))}
                                            className="h-6 w-6 text-red-700 cursor-pointer" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </form>
            </div>
        </div>
        <div className="mt-1 flex items-center gap-1">
            <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.LABELING_TASK.NEW_LABELING_TASK} color="invert" placement="right">
                <button onClick={() => dispatch(openModal(ModalEnum.ADD_LABELING_TASK))}
                    className="inline-block items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                    <IconPlus className="h-5 w-5 inline-block mr-1" />
                    Add labeling task
                </button>
            </Tooltip>
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