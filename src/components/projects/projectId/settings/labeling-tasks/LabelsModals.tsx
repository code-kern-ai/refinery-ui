import Modal from "@/src/components/shared/modal/Modal";
import { selectModal, setModalStates } from "@/src/reduxStore/states/modal";
import { removeLabelFromLabelingTask, selectLabelingTasksAll, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { CREATE_LABEL, DELETE_LABEL, UPDATE_LABEL_COLOR, UPDATE_LABEL_HOTKEY } from "@/src/services/gql/mutations/project-settings";
import { LabelColors, LabelType, LabelingTask, LabelingTasksProps } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { LabelHelper } from "@/src/util/classes/label-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { IconPencil } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ABORT_BUTTON = { buttonCaption: 'Delete label', disabled: false, useButton: true };
const ACCEPT_BUTTON = { buttonCaption: 'Add label', useButton: true, closeAfterClick: false };


export default function LabelsModals(props: LabelingTasksProps) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const labelingTasksSchema = useSelector(selectLabelingTasksAll);
    const modalDeleteLabel = useSelector(selectModal(ModalEnum.DELETE_LABEL));
    const modalAddLabel = useSelector(selectModal(ModalEnum.ADD_LABEL));
    const modalChangeColor = useSelector(selectModal(ModalEnum.CHANGE_COLOR));
    const modalRenameLabel = useSelector(selectModal(ModalEnum.RENAME_LABEL));

    const [deleteLabelMut] = useMutation(DELETE_LABEL);
    const [createLabelMut] = useMutation(CREATE_LABEL);
    const [updateLabelColorMut] = useMutation(UPDATE_LABEL_COLOR);
    const [updateLabelHotKeyMut] = useMutation(UPDATE_LABEL_HOTKEY);

    const deleteLabel = useCallback(() => {
        LabelHelper.removeLabel(modalDeleteLabel.taskId, modalDeleteLabel.label.color.name);
        deleteLabelMut({ variables: { projectId: projectId, labelId: modalDeleteLabel.label.id } }).then(() => {
            dispatch(removeLabelFromLabelingTask(modalDeleteLabel.taskId, modalDeleteLabel.label.id));
        });
    }, [modalDeleteLabel]);

    const addLabel = useCallback(() => {
        const labelColor = LabelHelper.addLabel(modalAddLabel.taskId, modalAddLabel.labelName);
        dispatch(setModalStates(ModalEnum.ADD_LABEL, { ...modalAddLabel, labelName: '', open: true }));
        createLabelMut({ variables: { projectId: projectId, labelingTaskId: modalAddLabel.taskId, labelName: modalAddLabel.labelName, labelColor: labelColor } }).then((res) => {
            // TODO: Currently fixed with websockets and refetching but another option would be to return from BE and add to redux
        })
    }, [modalAddLabel]);

    useEffect(() => {
        props.refetchWS();
    }, [addLabel, deleteLabel]);

    useEffect(() => {
        setAbortButton({ ...ABORT_BUTTON, emitFunction: deleteLabel });
        setAcceptButton({ ...ACCEPT_BUTTON, emitFunction: addLabel, disabled: modalAddLabel.labelName == '' || !LabelHelper.isLabelNameUnique(modalAddLabel.taskId, modalAddLabel.labelName) });
    }, [modalDeleteLabel, modalAddLabel]);

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);
    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    function handleKeyboardEvent(event: KeyboardEvent) {
        if (!modalChangeColor.open) return;
        const changedLabel = LabelHelper.checkAndSetLabelHotkey(event, modalChangeColor.label);
        if (!LabelHelper.labelHotkeyError) {
            updateLabelHotKeyMut({ variables: { projectId: projectId, labelingTaskLabelId: changedLabel.id, labelHotkey: changedLabel.hotkey } }).then((res) => {
                const labelingTasksSchemaCopy = jsonCopy(labelingTasksSchema);
                const labelingTask = labelingTasksSchemaCopy.find((task: LabelingTask) => task.id == modalChangeColor.taskId);
                const label = labelingTask.labels.find((label: LabelType) => label.id == modalChangeColor.label.id);
                label.hotkey = changedLabel.hotkey;
                dispatch(setModalStates(ModalEnum.CHANGE_COLOR, { ...modalChangeColor, label: label }));
                dispatch(setLabelingTasksAll(labelingTasksSchemaCopy));
                props.refetchWS();
            });
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', handleKeyboardEvent);
        return () => {
            document.removeEventListener('keydown', handleKeyboardEvent);
        };
    }, [modalChangeColor]);

    function updateLabelColor(newColor: string) {
        LabelHelper.updateLabelColor(modalChangeColor.taskId, modalChangeColor.label.color.name, newColor);
        updateLabelColorMut({ variables: { projectId: projectId, labelingTaskLabelId: modalChangeColor.label.id, labelColor: newColor } }).then((res) => {
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
            props.refetchWS();
        });
    }

    return (<>

        <Modal modalName={ModalEnum.DELETE_LABEL} abortButton={abortButton}>
            <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">Warning</div>
            <p className="mt-2 text-gray-500 text-sm text-center">Are you sure you want to delete this label?</p>
            <p className="text-gray-500 text-sm text-center">This will delete all data associated with it!</p>
        </Modal>

        <Modal modalName={ModalEnum.ADD_LABEL} acceptButton={acceptButton}>
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
                    <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.LABELING_TASK.RENAME_LABEL} color="invert" placement="bottom">
                        <span onClick={() => {
                            LabelHelper.openRenameLabel();
                            dispatch(setModalStates(ModalEnum.CHANGE_COLOR, { ...modalChangeColor, open: false }));
                            dispatch(setModalStates(ModalEnum.RENAME_LABEL, { ...modalRenameLabel, label: modalChangeColor.label, taskId: modalChangeColor.taskId, open: true }));
                        }}
                            className={`inline-flex items-center border rounded-md py-1 px-2 text-sm font-medium shadow-sm text-center cursor-pointer ${modalChangeColor.label.color?.backgroundColor} ${modalChangeColor.label.color?.textColor} ${modalChangeColor.label.color?.borderColor} ${modalChangeColor.label.color?.hoverColor}`}>
                            {modalChangeColor.label.name}
                            <IconPencil className="h-5 w-5 ml-2" />
                        </span>
                    </Tooltip>
                </div>
                <p className="mt-2 text-left">Pick a color:</p>
                <div className="mt-2 grid grid-cols-5 gap-2">
                    {LabelHelper.labelColorOptions.map((color: LabelColors) => (
                        <label key={color.name} onClick={() => updateLabelColor(color.name)}
                            className={`w-full group border rounded-md py-1 px-2 text-sm font-medium focus:outline-none shadow-sm cursor-pointer text-center ${color.backgroundColor} ${color.textColor} ${color.borderColor} ${color.hoverColor}`}>
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
    </>)
}