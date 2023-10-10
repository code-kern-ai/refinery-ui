import Modal from "@/src/components/shared/modal/Modal";
import { openModal, selectModal, setModalStates } from "@/src/reduxStore/states/modal";
import { removeFromAllLabelingTasksById, removeLabelFromLabelingTask, selectLabelingTasksAll, selectUsableAttributes, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProject } from "@/src/reduxStore/states/project";
import { WebSocketsService } from "@/src/services/base/web-sockets/WebSocketsService";
import { CREATE_LABEL, CREATE_LABELING_TASK, DELETE_LABEL, DELETE_LABELING_TASK, HANDLE_LABEL_RENAME_WARNING, UPDATE_LABELING_TASK, UPDATE_LABEL_COLOR, UPDATE_LABEL_HOTKEY, UPDATE_LABEL_NAME } from "@/src/services/gql/mutations/project";
import { CHECK_RENAME_LABEL, GET_LABELING_TASKS_BY_PROJECT_ID } from "@/src/services/gql/queries/project";
import { LabelColors, LabelType, LabelingTask, LabelingTaskTaskType } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { CurrentPage } from "@/src/types/shared/general";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { LabelHelper } from "@/src/util/classes/label-helper";
import { labelingTaskFromString, labelingTaskToString, postProcessLabelingTasks, postProcessLabelingTasksSchema } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { IconAlertTriangleFilled, IconColorPicker, IconInfoCircleFilled, IconPencil, IconPlus, IconTrash, IconTriangleInverted } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";

const ABORT_BUTTON = { buttonCaption: 'Delete labeling task', disabled: false, useButton: true };
const ACCEPT_BUTTON = { buttonCaption: 'Add labeling task', useButton: true };

const ABORT_BUTTON_LABEL = { buttonCaption: 'Delete label', disabled: false, useButton: true };
const ACCEPT_BUTTON_LABEL = { buttonCaption: 'Add label', useButton: true, closeAfterClick: false };

const ACCEPT_BUTTON_RENAME = { buttonCaption: 'Rename', useButton: true }

export default function LabelingTasks() {
    const dispatch = useDispatch();
    const project = useSelector(selectProject);

    const labelingTasksSchema = useSelector(selectLabelingTasksAll);
    const modalDeleteLabelingTask = useSelector(selectModal(ModalEnum.DELETE_LABELING_TASK));
    const modalAddLabelingTask = useSelector(selectModal(ModalEnum.ADD_LABELING_TASK));
    const modalDeleteLabel = useSelector(selectModal(ModalEnum.DELETE_LABEL));
    const modalAddLabel = useSelector(selectModal(ModalEnum.ADD_LABEL));
    const modalChangeColor = useSelector(selectModal(ModalEnum.CHANGE_COLOR));
    const modalRenameLabel = useSelector(selectModal(ModalEnum.RENAME_LABEL));
    const usableAttributes = useSelector(selectUsableAttributes);

    const [labelingTasksDropdownArray, setLabelingTasksDropdownArray] = useState<{ name: string, value: string }[]>([]);

    const [refetchLabelingTasksByProjectId] = useLazyQuery(GET_LABELING_TASKS_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchCheckRenameLabel] = useLazyQuery(CHECK_RENAME_LABEL, { fetchPolicy: "no-cache" });
    const [updateLabelingTaskMut] = useMutation(UPDATE_LABELING_TASK);
    const [deleteLabelingTaskMut] = useMutation(DELETE_LABELING_TASK);
    const [createLabelingTaskMut] = useMutation(CREATE_LABELING_TASK);
    const [deleteLabelMut] = useMutation(DELETE_LABEL);
    const [createLabelMut] = useMutation(CREATE_LABEL);
    const [updateLabelColorMut] = useMutation(UPDATE_LABEL_COLOR);
    const [updateLabelHotKeyMut] = useMutation(UPDATE_LABEL_HOTKEY);
    const [handleRenameWarningMut] = useMutation(HANDLE_LABEL_RENAME_WARNING);
    const [updateLabelNameMut] = useMutation(UPDATE_LABEL_NAME);

    useEffect(() => {
        LabelHelper.setLabelColorOptions();
        refetchLabelingTasksAndProcess();
    }, [project]);

    useEffect(() => {
        setLabelingTasksDropdownArray(labelingTasksDropdownValues());
    }, [labelingTasksSchema]);

    function refetchLabelingTasksAndProcess() {
        refetchLabelingTasksByProjectId({ variables: { projectId: project.id } }).then((res) => {
            const labelingTasks = postProcessLabelingTasks(res['data']['projectByProjectId']['labelingTasks']['edges']);
            dispatch(setLabelingTasksAll(postProcessLabelingTasksSchema(labelingTasks)))
        });
    }

    function handleKeyboardEvent(event: KeyboardEvent) {
        if (!modalChangeColor.open) return;
        const changedLabel = LabelHelper.checkAndSetLabelHotkey(event, modalChangeColor.label);
        if (!LabelHelper.labelHotkeyError) {
            updateLabelHotKeyMut({ variables: { projectId: project.id, labelingTaskLabelId: changedLabel.id, labelHotkey: changedLabel.hotkey } }).then((res) => {
                const labelingTasksSchemaCopy = jsonCopy(labelingTasksSchema);
                const labelingTask = labelingTasksSchemaCopy.find((task: LabelingTask) => task.id == modalChangeColor.taskId);
                const label = labelingTask.labels.find((label: LabelType) => label.id == modalChangeColor.label.id);
                label.hotkey = changedLabel.hotkey;
                dispatch(setModalStates(ModalEnum.CHANGE_COLOR, { ...modalChangeColor, label: label }));
                dispatch(setLabelingTasksAll(labelingTasksSchemaCopy));
            });
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', handleKeyboardEvent);
        return () => {
            document.removeEventListener('keydown', handleKeyboardEvent);
        };
    }, [modalChangeColor]);


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
                projectId: project.id, labelingTaskName: modalAddLabelingTask.taskName, labelingTaskType: LabelingTaskTaskType.MULTICLASS_CLASSIFICATION, labelingTaskTargetId: taskTarget
            }
        }).then((res) => {
            // TODO: Currently fixed with websockets and refetching but another option would be to return from BE and add to redux
        });
    }, [modalAddLabelingTask]);

    const deleteLabel = useCallback(() => {
        LabelHelper.removeLabel(modalDeleteLabel.taskId, modalDeleteLabel.labelColor);
        deleteLabelMut({ variables: { projectId: project.id, labelId: modalDeleteLabel.labelId } }).then(() => {
            dispatch(removeLabelFromLabelingTask({ taskId: modalDeleteLabel.taskId, labelId: modalDeleteLabel.labelId }));
        });
    }, [modalDeleteLabel]);

    const addLabel = useCallback(() => {
        const labelColor = LabelHelper.addLabel(modalAddLabel.taskId, modalAddLabel.labelName);
        dispatch(setModalStates(ModalEnum.ADD_LABEL, { ...modalAddLabel, labelName: '', open: true }));
        createLabelMut({ variables: { projectId: project.id, labelingTaskId: modalAddLabel.taskId, labelName: modalAddLabel.labelName, labelColor: labelColor } }).then((res) => {
            // TODO: Currently fixed with websockets and refetching but another option would be to return from BE and add to redux
        })
    }, [modalAddLabel]);

    const renameLabel = useCallback(() => {
        updateLabelNameMut({ variables: { projectId: project.id, labelId: modalRenameLabel.label.id, newName: modalRenameLabel.newLabelName } }).then((res) => {
            const labelingTasksSchemaCopy = jsonCopy(labelingTasksSchema);
            const labelingTask = labelingTasksSchemaCopy.find((task: LabelingTask) => task.id == modalRenameLabel.taskId);
            const label = labelingTask.labels.find((label: LabelType) => label.id == modalRenameLabel.label.id);
            label.name = modalRenameLabel.newLabelName;
            dispatch(setLabelingTasksAll(labelingTasksSchemaCopy));
        });
    }, [modalRenameLabel]);

    useEffect(() => {
        WebSocketsService.subscribeToNotification(CurrentPage.SETTINGS, {
            projectId: project.id,
            whitelist: ['label_created', 'labeling_task_created'],
            func: handleWebsocketNotification
        });
    }, [project, addLabel, addLabelingTask]);

    useEffect(() => {
        setAbortButton({ ...ABORT_BUTTON, emitFunction: deleteLabelingTask });
        setAcceptButton({ ...ACCEPT_BUTTON, emitFunction: addLabelingTask, disabled: (modalAddLabelingTask.taskName == '' || modalAddLabelingTask.targetAttribute == '') || !isTaskNameUnique(modalAddLabelingTask.taskName) });
        setAcceptButtonLabel({ ...ACCEPT_BUTTON_LABEL, emitFunction: addLabel, disabled: modalAddLabel.labelName == '' || !LabelHelper.isLabelNameUnique(modalAddLabel.taskId, modalAddLabel.labelName) });
        setAbortButtonLabel({ ...ABORT_BUTTON_LABEL, emitFunction: deleteLabel });
        setAcceptButtonRename({ ...ACCEPT_BUTTON_RENAME, emitFunction: renameLabel, disabled: LabelHelper.renameLabelData?.checkResults?.errors.length > 0 });
    }, [modalDeleteLabelingTask, modalAddLabelingTask, modalAddLabel, modalDeleteLabel, modalRenameLabel]);

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);
    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);
    const [abortButtonLabel, setAbortButtonLabel] = useState<ModalButton>(ABORT_BUTTON_LABEL);
    const [acceptButtonLabel, setAcceptButtonLabel] = useState<ModalButton>(ACCEPT_BUTTON_LABEL);
    const [acceptButtonRename, setAcceptButtonRename] = useState<ModalButton>(ACCEPT_BUTTON_RENAME);

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

    function updateLabelColor(newColor: string) {
        LabelHelper.updateLabelColor(modalChangeColor.taskId, modalChangeColor.label.color.name, newColor);
        updateLabelColorMut({ variables: { projectId: project.id, labelingTaskLabelId: modalChangeColor.label.id, labelColor: newColor } }).then((res) => {
            const labelingTasksSchemaCopy = jsonCopy(labelingTasksSchema);
            const labelingTask = labelingTasksSchemaCopy.find((task: LabelingTask) => task.id == modalChangeColor.taskId);
            const label = labelingTask.labels.find((label: LabelType) => label.id == modalChangeColor.label.id);
            label.color.name = newColor;
            label.color.backgroundColor = 'bg-' + newColor + '-100';
            label.color.textColor = 'text-' + newColor + '-700';
            label.color.borderColor = 'border-' + newColor + '-400';
            label.color.hoverColor = 'hover:bg-' + newColor + '-200';
            dispatch(setModalStates(ModalEnum.CHANGE_COLOR, { ...modalChangeColor, label: label }));
            dispatch(setLabelingTasksAll(labelingTasksSchemaCopy));
        });
    }

    function checkRenameLabel() {
        refetchCheckRenameLabel({ variables: { projectId: project.id, labelId: modalRenameLabel.label.id, newName: modalRenameLabel.newLabelName } }).then((res: any) => {
            const result = JSON.parse(res.data['checkRenameLabel']);
            result.warnings.forEach(e => {
                e.open = false;
                e.oldParsed = LabelHelper.prepareSourceCode(e.old, e.information_source_name);
                e.newParsed = LabelHelper.prepareSourceCode(e.new, e.information_source_name);
            });
            LabelHelper.renameLabelData.checkResults = result;
        });
    }

    function handleLabelRenameWarning(warning: any) {
        if (warning == null) return;
        handleRenameWarningMut({ variables: { projectId: project.id, warningData: JSON.stringify(warning) } }).then((res) => {
            checkRenameLabel();
        });
    }

    function handleWebsocketNotification(msgParts: string[]) {
        if (['label_created', 'labeling_task_created'].includes(msgParts[1])) {
            refetchLabelingTasksAndProcess();
        }
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
                                        {task.labels.map((label: LabelType) => (
                                            <div key={label.id} className={`inline-flex border items-center m-1 px-1.5 py-0.5 rounded-md text-sm font-medium ${label.color.backgroundColor} ${label.color.textColor} ${label.color.borderColor} ${label.color.hoverColor}`}>
                                                <IconColorPicker className="h-4 w-4 mr-1 cursor-pointer" onClick={() => dispatch(setModalStates(ModalEnum.CHANGE_COLOR, { taskId: task.id, label: label, open: true }))} />
                                                <span>{label.name}</span>
                                                {label.hotkey && <kbd className="ml-2 uppercase inline-flex items-center border bg-white border-gray-200 rounded px-2 text-sm font-sans font-medium text-gray-400">{label.hotkey}</kbd>}
                                                <IconTrash className="h-4 w-4 ml-1 cursor-pointer" onClick={() => dispatch(setModalStates(ModalEnum.DELETE_LABEL, { taskId: task.id, labelId: label.id, labelColor: label.color.name, open: true }))} />
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

        <Modal modalName={ModalEnum.DELETE_LABEL} abortButton={abortButtonLabel}>
            <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">Warning</div>
            <p className="mt-2 text-gray-500 text-sm text-center">Are you sure you want to delete this label?</p>
            <p className="text-gray-500 text-sm text-center">This will delete all data associated with it!</p>
        </Modal>

        <Modal modalName={ModalEnum.ADD_LABEL} acceptButton={acceptButtonLabel}>
            <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
                Enter your labels </div>
            <div className="mb-2 flex flex-grow justify-center text-sm text-gray-500">
                You can add press enter to add a label</div>
            <input value={modalAddLabel.labelName} placeholder="Enter labels"
                onChange={(event: any) => dispatch(setModalStates(ModalEnum.ADD_LABEL, { ...modalAddLabel, labelName: event.target.value }))}
                onKeyDown={(event) => {
                    if (event.key == 'Enter') addLabel();
                }} className="h-8 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
        </Modal>

        <Modal modalName={ModalEnum.CHANGE_COLOR}>
            {modalChangeColor.label && <div>
                <div className="self-center flex flex-row flex-nowrap items-center justify-center">
                    <p className="mr-2 font-bold">Label:</p>
                    <Tooltip content="Rename label" color="invert" placement="bottom">
                        <span onClick={() => {
                            LabelHelper.openRenameLabel();
                            dispatch(setModalStates(ModalEnum.CHANGE_COLOR, { ...modalChangeColor, open: false }));
                            dispatch(setModalStates(ModalEnum.RENAME_LABEL, { ...modalRenameLabel, label: modalChangeColor.label, taskId: modalChangeColor.taskId, open: true }));
                        }}
                            className={`inline-flex items-center border rounded-md py-1 px-2 text-sm font-medium shadow-sm text-gray-900 text-center cursor-pointer ${modalChangeColor.label.color?.backgroundColor} ${modalChangeColor.label.color?.textColor} ${modalChangeColor.label.color?.borderColor} ${modalChangeColor.label.color?.hoverColor}`}>
                            {modalChangeColor.label.name}
                            <IconPencil className="h-5 w-5 ml-2" />
                        </span>
                    </Tooltip>
                </div>
                <p className="mt-2 text-left">Pick a color:</p>
                <div className="mt-2 grid grid-cols-5 gap-2">
                    {LabelHelper.labelColorOptions.map((color: LabelColors) => (
                        <label key={color.name} onClick={() => updateLabelColor(color.name)}
                            className={`w-full group border rounded-md py-1 px-2 text-sm font-medium hover:bg-gray-50 focus:outline-none shadow-sm text-gray-900 cursor-pointer text-center ${color.backgroundColor} ${color.textColor} ${color.borderColor} ${color.hoverColor}`}>
                            {color.name}
                        </label>
                    ))}
                </div>
                <div className="mt-4">
                    <label htmlFor="hotkey" className="block text-sm font-medium text-gray-700 text-left">Select a hotkey by pressing a key:</label>
                    <div className="flex flex-row flex-nowrap items-center mt-1">
                        <span className="w-10 bg-gray-100 rounded border text-center h-6 uppercase">
                            {modalChangeColor.label.hotkey}</span>
                        {LabelHelper.labelHotkeyError && <span className="ml-2 text-sm text-rose-700">{LabelHelper.labelHotkeyError}</span>}
                    </div>
                </div>
            </div>}
        </Modal>

        <Modal modalName={ModalEnum.RENAME_LABEL} acceptButton={acceptButtonRename}>
            {LabelHelper.renameLabelData && modalRenameLabel.label && <div className="flex flex-col gap-y-2">
                <div className="self-center flex flex-row flex-nowrap items-center justify-center">
                    <p className="mr-2 font-bold">Change label name:</p><span
                        className={`border rounded-md py-1 px-2 text-sm font-medium shadow-sm text-gray-900 text-center ${modalRenameLabel.label.color?.backgroundColor} ${modalRenameLabel.label.color?.textColor} ${modalRenameLabel.label.color?.borderColor} ${modalRenameLabel.label.color?.hoverColor}`}>{modalRenameLabel.label.name}</span>
                </div>
                <div className="flex flex-col gap-y-2" style={{ maxHeight: 'calc(80vh - 100px)' }}>
                    <div className="flex flex-row flex-nowrap items-center">
                        <input defaultValue={modalRenameLabel.label.name} onChange={(event) => dispatch(setModalStates(ModalEnum.RENAME_LABEL, { ...modalRenameLabel, newLabelName: event.target.value }))}
                            onInput={(event: any) => LabelHelper.checkInputRenameLabel(event, modalRenameLabel)} onKeyDown={(event: any) => {
                                if (event.key == 'Enter') checkRenameLabel();
                            }}
                            className="h-8 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
                        <button onClick={checkRenameLabel} disabled={!LabelHelper.renameLabelData.canCheck}
                            className={`ml-2 flex-shrink-0 bg-green-100 text-green-700 border border-green-400 text-xs font-semibold px-4 py-2 rounded-md hover:bg-green-200 focus:outline-none ${LabelHelper.renameLabelData.canCheck ? 'opacity-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                            Check Rename</button>
                    </div>
                    {LabelHelper.renameLabelData.checkResults?.errors.length > 0 && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex flex-col">
                        <div className="self-center flex flex-row flex-nowrap items-center -mt-1 mb-1">
                            <strong className="font-bold">Errors detected</strong>
                            <IconAlertTriangleFilled className="h-5 w-5 text-red-400" />
                        </div>
                        {LabelHelper.renameLabelData.checkResults.errors.map((error: any) => (
                            <pre key={error.msg} className="text-sm overflow-x-auto">{error.msg}</pre>
                        ))}
                    </div>}
                    {LabelHelper.renameLabelData.checkResults?.infos.length > 0 && <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative flex flex-col">
                        <div className="self-center flex flex-row flex-nowrap items-center -mt-1 mb-1">
                            <strong className="font-bold">Information</strong>
                            <IconInfoCircleFilled className="h-5 w-5 text-blue-400" />
                        </div>
                        {LabelHelper.renameLabelData.checkResults.infos.map((info: any) => (
                            <pre key={info.msg} className="text-sm overflow-x-auto">{info.msg}</pre>
                        ))}
                    </div>}
                    {LabelHelper.renameLabelData.checkResults?.warnings.length > 0 && <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative flex flex-col">
                        <div className="self-center flex flex-row flex-nowrap items-center -mt-1 mb-1">
                            <strong className="font-bold">Warning</strong>
                            <IconAlertTriangleFilled className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="self-center">
                            <span className="text-sm mb-2">
                                <p className="text-center">Inside each toggle is a suggestion how to fix the
                                    corresponding
                                    warning.</p>
                                <p className="text-center">Please check them carefully before applying!</p>
                            </span>
                        </div>
                        {LabelHelper.renameLabelData.checkResults.warnings.map((warning: any) => (
                            <div key={warning.msg} className={`flex flex-col gap-y-1 ${warning.open ? 'border border-yellow-400' : ''} `}>
                                <div className="flex flex-row items-center cursor-pointer" onClick={() => {
                                    // TODO: fix this
                                }}>
                                    <div className="mr-1">
                                        <IconTriangleInverted className={`h-3 w-3 ${warning.open ? 'transform rotate-180' : ''}`} />
                                    </div>
                                    <span className="text-sm overflow-x-auto">{warning.msg}</span>
                                </div>
                                <div className={`flex flex-col p-2 ${warning.open ? '' : 'hidden'}`}>
                                    {warning.key == 'KNOWLEDGE_BASE' && <div>
                                        <div className="flex flex-row">
                                            <span className="mr-2 font-bold text-sm">Current name:</span>
                                            <span className="text-sm">{warning.old}</span>
                                        </div>
                                        <div className="flex flex-row">
                                            <span className="mr-2 font-bold text-sm">New name:</span>
                                            <span className="text-sm">{warning.new}</span>
                                        </div></div>}
                                    {warning.key == 'HEURISTIC' && <div className="flex flex-col gap-y-2">
                                        <span className="text-sm">
                                            <Tooltip content="Open information source in new tab" placement="right" color="invert">
                                                <a href={'../heuristics/' + warning.id} target="_blank"
                                                    className="cursor-pointer underline font-bold">
                                                    Current source code:</a>
                                            </Tooltip>
                                        </span>
                                        <pre>{warning.oldParsed}</pre>
                                        <span className="text-sm font-bold text-left">Suggested changes:</span>
                                        <pre>{warning.newParsed}</pre>
                                    </div>}
                                    <button onClick={() => handleLabelRenameWarning(warning)}
                                        className="self-center mt-2 bg-green-100 text-green-700 border border-green-400 text-xs font-semibold px-4 py-2 rounded-md hover:bg-green-200 focus:outline-none">Change</button>
                                </div>
                            </div>
                        ))}
                    </div>}
                </div>
            </div >}
        </Modal >
    </div >
    )
}