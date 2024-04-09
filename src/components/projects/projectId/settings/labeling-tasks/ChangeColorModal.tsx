import Modal from "@/src/components/shared/modal/Modal";
import { selectModal, setModalStates } from "@/src/reduxStore/states/modal";
import { selectLabelingTasksAll, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { LabelColors, LabelType, LabelingTask } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { ModalEnum } from "@/src/types/shared/modal";
import { LabelHelper } from "@/src/util/classes/label-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { Tooltip } from "@nextui-org/react";
import { IconPencil } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateLabelColor as ulc, updateLabelHotkey } from "@/src/services/base/labeling";

export default function ChangeColorModal() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const labelingTasksSchema = useSelector(selectLabelingTasksAll);
    const modalChangeColor = useSelector(selectModal(ModalEnum.CHANGE_COLOR));
    const modalRenameLabel = useSelector(selectModal(ModalEnum.RENAME_LABEL));

    const [hotKeyError, setHotKeyError] = useState<string>('');
    const [usedHotKeys, setUsedHotKeys] = useState<string[]>([]);

    function handleKeyboardEvent(event: KeyboardEvent) {
        if (!modalChangeColor.open) return;
        const changedLabel = LabelHelper.checkAndSetLabelHotkey(event, modalChangeColor.label, usedHotKeys);
        setHotKeyError(LabelHelper.labelHotkeyError);
        if (!LabelHelper.labelHotkeyError) {
            updateLabelHotkey(projectId, {
                labelingTaskLabelId: modalChangeColor.label.id,
                labelHotkey: changedLabel.hotkey
            }, (res) => {
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
        setHotKeyError('');
        document.addEventListener('keydown', handleKeyboardEvent);
        return () => {
            document.removeEventListener('keydown', handleKeyboardEvent);
        };
    }, [modalChangeColor]);

    useEffect(() => {
        if (!labelingTasksSchema) return;
        const usedHotkeys = [];
        labelingTasksSchema.forEach((task: LabelingTask) => {
            task.labels.forEach((label: LabelType) => {
                if (label.hotkey) usedHotkeys.push(label.hotkey);
            })
        })
        setUsedHotKeys(usedHotkeys);
    }, [modalChangeColor, labelingTasksSchema]);

    function updateLabelColor(newColor: string) {
        LabelHelper.updateLabelColor(modalChangeColor.taskId, modalChangeColor.label.color.name, newColor);
        ulc(projectId, {
            labelingTaskLabelId: modalChangeColor.label.id,
            labelColor: newColor
        }, (res) => {
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

    return (<Modal modalName={ModalEnum.CHANGE_COLOR}>
        {modalChangeColor.label && <div>
            <div className="self-center flex flex-row flex-nowrap items-center justify-center">
                <p className="mr-2 font-bold">Label:</p>
                <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.LABELING_TASK.RENAME_LABEL} color="invert" placement="bottom">
                    <span onClick={() => {
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
                    {hotKeyError && <span className="ml-2 text-sm text-rose-700">{hotKeyError}</span>}
                </div>
            </div>
        </div>}
    </Modal>)
}