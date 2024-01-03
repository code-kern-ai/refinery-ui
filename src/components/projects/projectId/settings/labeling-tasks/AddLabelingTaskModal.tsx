import Modal from "@/src/components/shared/modal/Modal";
import { selectModal, setModalStates } from "@/src/reduxStore/states/modal";
import { selectLabelingTasksAll, selectUsableAttributes } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { CREATE_LABELING_TASK } from "@/src/services/gql/mutations/project-settings";
import { LabelingTaskTaskType, LabelingTasksProps } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { isTaskNameUnique } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Add labeling task', useButton: true };

export default function AddLabelingTaskModal(props: LabelingTasksProps) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const usableAttributes = useSelector(selectUsableAttributes);
    const modalAddLabelingTask = useSelector(selectModal(ModalEnum.ADD_LABELING_TASK));
    const labelingTasksSchema = useSelector(selectLabelingTasksAll);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    const [createLabelingTaskMut] = useMutation(CREATE_LABELING_TASK);

    const addLabelingTask = useCallback(() => {
        let taskTarget = null;
        if (modalAddLabelingTask.targetAttribute !== 'Full Record') {
            taskTarget = usableAttributes.find((attribute) => attribute.name == modalAddLabelingTask.targetAttribute).id;;
        }
        createLabelingTaskMut({
            variables: {
                projectId: projectId, labelingTaskName: modalAddLabelingTask.taskName, labelingTaskType: LabelingTaskTaskType.MULTICLASS_CLASSIFICATION, labelingTaskTargetId: taskTarget
            }
        }).then((res) => {
        });
    }, [modalAddLabelingTask]);

    useEffect(() => {
        props.refetchWS();
    }, [addLabelingTask]);

    useEffect(() => {
        setAcceptButton({ ...ACCEPT_BUTTON, emitFunction: addLabelingTask, disabled: (modalAddLabelingTask.taskName == '' || modalAddLabelingTask.targetAttribute == '') || !isTaskNameUnique(labelingTasksSchema, modalAddLabelingTask.taskName) });
    }, [modalAddLabelingTask]);

    return (<Modal modalName={ModalEnum.ADD_LABELING_TASK} acceptButton={acceptButton}>
        <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
            Add a labeling task </div>
        <div className="mb-2 flex flex-grow justify-center text-sm text-gray-500">
            Afterward, you can select the label task type depending on the target type</div>
        <div className="grid grid-cols-2 gap-2 items-center" style={{ gridTemplateColumns: 'max-content auto' }}>
            <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.LABELING_TASK.TARGET_ATTRIBUTE} placement="right" color="invert">
                <span className="card-title mb-0 label-text flex"><span className="cursor-help underline filtersUnderline">Target Attribute</span></span>
            </Tooltip>
            <Dropdown options={usableAttributes} buttonName={modalAddLabelingTask.targetAttribute ? modalAddLabelingTask.targetAttribute : 'Choose'} selectedOption={(option: string) => {
                dispatch(setModalStates(ModalEnum.ADD_LABELING_TASK, { ...modalAddLabelingTask, targetAttribute: option }));
            }} />
            <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.LABELING_TASK.NAME_LABELING_TASK} placement="right" color="invert">
                <span className="card-title mb-0 label-text flex"><span className="cursor-help underline filtersUnderline">Name</span></span>
            </Tooltip>
            <input placeholder="Labeling task name" value={modalAddLabelingTask.taskName} onChange={(event: any) => {
                dispatch(setModalStates(ModalEnum.ADD_LABELING_TASK, { ...modalAddLabelingTask, taskName: event.target.value }));
            }} onKeyDown={(event) => {
                if (event.key == 'Enter') addLabelingTask();
            }} className="h-8 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
        </div>
    </Modal>)
}