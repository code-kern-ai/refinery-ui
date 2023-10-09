import Modal from "@/src/components/shared/modal/Modal";
import { openModal, selectModal, setModalStates } from "@/src/reduxStore/states/modal";
import { removeFromAllLabelingTasksById, selectLabelingTasksAll, selectUsableAttributes, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProject } from "@/src/reduxStore/states/project";
import { CREATE_LABELING_TASK, DELETE_LABELING_TASK, UPDATE_LABELING_TASK } from "@/src/services/gql/mutations/project";
import { GET_LABELING_TASKS_BY_PROJECT_ID } from "@/src/services/gql/queries/project";
import { LabelingTask, LabelingTaskTaskType } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { LabelHelper } from "@/src/util/classes/label-helper";
import { labelingTaskFromString, labelingTaskToString, postProcessLabelingTasks, postProcessLabelingTasksSchema } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { use, useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";

const ABORT_BUTTON = { buttonCaption: 'Delete labeling task', disabled: false, useButton: true };
const ACCEPT_BUTTON = { buttonCaption: 'Add labeling task', useButton: true };

export default function LabelingTasks() {
    const dispatch = useDispatch();
    const project = useSelector(selectProject);
    const labelingTasksSchema = useSelector(selectLabelingTasksAll);
    const modalDeleteLabelingTask = useSelector(selectModal(ModalEnum.DELETE_LABELING_TASK));
    const modalAddLabelingTask = useSelector(selectModal(ModalEnum.ADD_LABELING_TASK));
    const usableAttributes = useSelector(selectUsableAttributes);

    const [labelingTasksDropdownArray, setLabelingTasksDropdownArray] = useState<{ name: string, value: string }[]>([]);

    const [refetchLabelingTasksByProjectId] = useLazyQuery(GET_LABELING_TASKS_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [updateLabelingTaskMut] = useMutation(UPDATE_LABELING_TASK);
    const [deleteLabelingTaskMut] = useMutation(DELETE_LABELING_TASK);
    const [createLabelingTaskMut] = useMutation(CREATE_LABELING_TASK);

    useEffect(() => {
        refetchLabelingTasksByProjectId({ variables: { projectId: project.id } }).then((res) => {
            const labelingTasks = postProcessLabelingTasks(res['data']['projectByProjectId']['labelingTasks']['edges']);
            if (onlyLabelsChanged(labelingTasks)) {
                LabelHelper.setLabelMap(labelingTasks);
            } else {
                dispatch(setLabelingTasksAll(postProcessLabelingTasksSchema(labelingTasks)))
            }
        });
    }, [project]);

    useEffect(() => {
        setLabelingTasksDropdownArray(labelingTasksDropdownValues());
    }, [labelingTasksSchema]);

    const deleteLabelingTask = useCallback(() => {
        deleteLabelingTaskMut({ variables: { projectId: project.id, labelingTaskId: modalDeleteLabelingTask.taskId } }).then((res) => {
            dispatch(removeFromAllLabelingTasksById(modalDeleteLabelingTask.taskId));
        });
    }, [modalDeleteLabelingTask]);

    const addLabelingTask = useCallback(() => {
        let taskTarget = null;
        if (modalAddLabelingTask.targetAttribute !== 'Full Record') {
            taskTarget = usableAttributes.find((attribute) => attribute.name == modalAddLabelingTask.targetAttribute).id;;
        }

        createLabelingTaskMut({
            variables: {
                projectId: project.id,
                labelingTaskName: modalAddLabelingTask.taskName,
                labelingTaskType: LabelingTaskTaskType.MULTICLASS_CLASSIFICATION,
                labelingTaskTargetId: taskTarget
            }
        }).then((res) => {
            // TODO: return from BE and add to redux
        });
    }, [modalAddLabelingTask]);

    useEffect(() => {
        setAbortButton({ ...ABORT_BUTTON, emitFunction: deleteLabelingTask });
        setAcceptButton({ ...ACCEPT_BUTTON, emitFunction: addLabelingTask, disabled: (modalAddLabelingTask.taskName == '' || modalAddLabelingTask.targetAttribute == '') || !isTaskNameUnique(modalAddLabelingTask.taskName) });
    }, [modalDeleteLabelingTask, modalAddLabelingTask]);

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);
    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    function onlyLabelsChanged(tasks: any): boolean {
        if (labelingTasksSchema.length == 0) return false;
        if (labelingTasksSchema != tasks.length) return false;
        for (const task of tasks) {
            if (getTaskArrayAttribute(task.id, 'id') == 'UNKNOWN') return false;
            if (getTaskArrayAttribute(task.id, 'taskType') != task.taskType)
                return false;
            if (getTaskArrayAttribute(task.id, 'name') != task.name)
                return false;
        }
        return true;
    }

    function getTaskArrayAttribute(taskId: string, valueID: string) {
        for (let task of labelingTasksSchema) {
            if (task.id == taskId) return task[valueID];
        }
        return 'UNKNOWN';
    }

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
        if (!isTaskNameUnique(value)) return;
        updateLabelingTaskMut({ variables: { projectId: project.id, labelingTaskId: task.id, labelingTaskName: value, labelingTaskType: task.taskType, labelingTaskTargetId: task.targetId == "" ? null : task.targetId } }).then((res) => {
            const labelingTasksSchemaCopy = jsonCopy(labelingTasksSchema);
            labelingTasksSchemaCopy[index].name = value;
            labelingTasksSchemaCopy[index].nameOpen = false;
            dispatch(setLabelingTasksAll(labelingTasksSchemaCopy));
        });
    }

    function updateLabelingTaskType(task: LabelingTask, index: number, value: string) {
        updateLabelingTaskMut({ variables: { projectId: project.id, labelingTaskId: task.id, labelingTaskName: task.name, labelingTaskType: value, labelingTaskTargetId: task.targetId == "" ? null : task.targetId } }).then((res) => {
            const labelingTasksSchemaCopy = jsonCopy(labelingTasksSchema);
            labelingTasksSchemaCopy[index].taskType = value;
            dispatch(setLabelingTasksAll(labelingTasksSchemaCopy));
        });
    }

    function isTaskNameUnique(value: string): boolean {
        return !labelingTasksSchema.some((task: LabelingTask) => task.name == value);
    }

    function labelingTasksDropdownValues() {
        if (labelingTasksSchema.length != 0) return labelingTasksDropdownArray;
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
                            {labelingTasksSchema.map((task: LabelingTask, index: number) => (
                                <tr key={task.id} className={`${index % 2 != 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                    <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">{task.targetName}</td>
                                    <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                        {!task.nameOpen ?
                                            <p className="break-words cursor-pointer" onClick={() => openTaskName(index)}>{task.name}</p>
                                            : <input type="text" defaultValue={task.name} onKeyDown={(event) => {
                                                if (event.key == 'Enter') changeTaskName(task, index, event.currentTarget.value);
                                            }} onBlur={(event) => changeTaskName(task, index, event.currentTarget.value)} autoFocus={true}
                                                className="h-8 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />}
                                    </td>
                                    <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                        <Dropdown options={labelingTasksDropdownArray} buttonName={labelingTaskToString(task.taskType)}
                                            disabledOptions={[false, task.targetName === 'Full Record', false]} dropdownWidth="w-60" dropdownItemsClasses="w-60"
                                            selectedOption={(option: string) => updateLabelingTaskType(task, index, labelingTaskFromString(option))} />
                                    </td>
                                    <td className="flex flex-wrap justify-center items-center px-3 py-2 text-sm text-gray-500">
                                        ADD LABELS
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
            <Tooltip content="Currently supporting classifications and extractions" color="invert" placement="right">
                <button onClick={() => dispatch(openModal(ModalEnum.ADD_LABELING_TASK))}
                    className="inline-block items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                    <IconPlus className="h-5 w-5 inline-block mr-1" />
                    Add labeling task
                </button>
            </Tooltip>
        </div>

        <Modal modalName={ModalEnum.DELETE_LABELING_TASK} abortButton={abortButton}>
            <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
                Warning </div>
            <p className="mt-2 text-gray-500 text-sm">Are you sure you want to delete this labeling task?</p>
            <p className="text-gray-500 text-sm">This will delete all data associated with it, including heuristics and labels!</p>
        </Modal>

        <Modal modalName={ModalEnum.ADD_LABELING_TASK} acceptButton={acceptButton}>
            <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
                Add a labeling task </div>
            <div className="mb-2 flex flex-grow justify-center text-sm text-gray-500">
                Afterward, you can select the label task type depending on the target type</div>
            <div className="grid grid-cols-2 gap-2 items-center" style={{ gridTemplateColumns: 'max-content auto' }}>
                <Tooltip content="Choose attribute to be labeled" placement="right" color="invert">
                    <span className="card-title mb-0 label-text flex"><span className="cursor-help underline filtersUnderline">Target Attribute</span></span>
                </Tooltip>
                <Dropdown options={usableAttributes} buttonName={modalAddLabelingTask.targetAttribute ? modalAddLabelingTask.targetAttribute : 'Choose'} selectedOption={(option: string) => {
                    dispatch(setModalStates(ModalEnum.ADD_LABELING_TASK, { ...modalAddLabelingTask, targetAttribute: option }));
                }} />
                <Tooltip content="Name of your labeling task" placement="right" color="invert">
                    <span className="card-title mb-0 label-text flex"><span className="cursor-help underline filtersUnderline">Name</span></span>
                </Tooltip>
                <input placeholder="Labeling task name" value={modalAddLabelingTask.taskName} onChange={(event: any) => {
                    dispatch(setModalStates(ModalEnum.ADD_LABELING_TASK, { ...modalAddLabelingTask, taskName: event.target.value }));
                }} onKeyDown={(event) => {
                    if (event.key == 'Enter') addLabelingTask();
                }} className="h-8 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
            </div>
        </Modal>
    </div>
    )
}