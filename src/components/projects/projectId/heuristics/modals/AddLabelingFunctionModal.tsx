import Modal from "@/src/components/shared/modal/Modal";
import { selectHeuristicType } from "@/src/reduxStore/states/pages/heuristics";
import { selectLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { createHeuristicPost } from "@/src/services/base/heuristic";
import { LabelingTask } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { DEFAULT_DESCRIPTION, getFunctionName, getInformationSourceTemplate, getRouterLinkHeuristic } from "@/src/util/components/projects/projectId/heuristics/heuristics-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { toPythonFunctionName } from "@/submodules/javascript-functions/python-functions-parser";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { Tooltip } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Create', useButton: true, disabled: true };

export default function AddLabelingFunctionModal() {
    const router = useRouter();

    const projectId = useSelector(selectProjectId);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const heuristicType = useSelector(selectHeuristicType);

    const [labelingTask, setLabelingTask] = useState<LabelingTask>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const createHeuristic = useCallback(() => {
        const matching = labelingTasks.filter(e => e.id == labelingTask.id);
        const codeData = getInformationSourceTemplate(matching, heuristicType, '');
        if (!codeData) return;
        createHeuristicPost(projectId, labelingTask.id, codeData.code, name, description, heuristicType, (res) => {
            let id = res['data']?.['createInformationSource']?.['informationSource']?.['id'];
            if (id) {
                router.push(getRouterLinkHeuristic(heuristicType, projectId, id))
            } else {
                console.log("can't find newly created id for " + heuristicType + " --> can't open");
            }
        });
    }, [labelingTask, name, description]);

    const [acceptButtonLF, setAcceptButtonLF] = useState<ModalButton>(ACCEPT_BUTTON);

    useEffect(() => {
        setAcceptButtonLF({ ...ACCEPT_BUTTON, emitFunction: createHeuristic, disabled: !(labelingTask && name) });
    }, [labelingTask, name, createHeuristic]);

    useEffect(() => {
        if (!labelingTasks || labelingTasks.length == 0) return;
        setLabelingTask(labelingTasks[0]);
        setName(getFunctionName(heuristicType));
        setDescription(DEFAULT_DESCRIPTION);
    }, [labelingTasks, heuristicType]);

    return (<Modal modalName={ModalEnum.ADD_LABELING_FUNCTION} acceptButton={acceptButtonLF}>
        <h1 className="text-lg text-gray-900 text-center mb-4">Add new labeling function</h1>
        <div className="grid grid-cols-2 gap-2 items-center" style={{ gridTemplateColumns: 'max-content auto' }}>
            <Tooltip content={TOOLTIPS_DICT.HEURISTICS.CHOOSE_LABELING_TASK} color="invert" placement="right">
                <div className="justify-self-start">
                    <span className="cursor-help card-title mb-0 label-text text-left"><span className="underline filtersUnderline">Labeling task</span></span>
                </div>
            </Tooltip>
            <KernDropdown options={labelingTasks} buttonName={labelingTask?.name} selectedOption={(option: any) => setLabelingTask(option)} disabled={labelingTasks?.length == 0} />

            <Tooltip content={TOOLTIPS_DICT.HEURISTICS.ENTER_FUNCTION_NAME} color="invert" placement="right">
                <div className="justify-self-start">
                    <span className="cursor-help card-title mb-0 label-text text-left"><span className="underline filtersUnderline">Function name</span></span>
                </div>
            </Tooltip>
            <input placeholder="Enter a function name..." value={name} onChange={(e: any) => setName(toPythonFunctionName(e.target.value))}
                className="h-9 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
            <Tooltip content={TOOLTIPS_DICT.HEURISTICS.ENTER_DESCRIPTION} color="invert" placement="right">
                <div className="justify-self-start">
                    <span className="cursor-help card-title mb-0 label-text text-left"><span className="underline filtersUnderline">Description</span></span>
                </div>
            </Tooltip>
            <input placeholder="Enter a description..." value={description} onChange={(e: any) => setDescription(e.target.value)}
                className="h-9 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
        </div>
    </Modal>
    )
}