import Modal from "@/src/components/shared/modal/Modal";
import { selectHeuristicType } from "@/src/reduxStore/states/pages/heuristics";
import { selectLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProject } from "@/src/reduxStore/states/project";
import { CREATE_HEURISTIC } from "@/src/services/gql/mutations/heuristics";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { DEFAULT_DESCRIPTION, getFunctionName, getInformationSourceTemplate, getRouterLinkHeuristic } from "@/src/util/components/projects/projectId/heuristics/heuristics-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Create', useButton: true, disabled: true };

export default function AddCrowdLabelerModal() {
    const router = useRouter();

    const project = useSelector(selectProject);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const heuristicType = useSelector(selectHeuristicType);

    const [labelingTask, setLabelingTask] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const [createHeuristicMut] = useMutation(CREATE_HEURISTIC);

    const createHeuristic = useCallback(() => {
        const labelingTaskId = labelingTasks.find(lt => lt.name == labelingTask)?.id;
        const matching = labelingTasks.filter(e => e.id == labelingTaskId);
        const codeData = getInformationSourceTemplate(matching, heuristicType, '');
        if (!codeData) return;

        createHeuristicMut({
            variables: {
                projectId: project.id,
                labelingTaskId: labelingTaskId,
                sourceCode: codeData.code,
                name: name,
                description: description,
                type: heuristicType
            }
        }).then((res) => {
            let id = res['data']?.['createInformationSource']?.['informationSource']?.['id'];
            if (id) {
                router.push(getRouterLinkHeuristic(heuristicType, project.id, id))
            } else {
                console.log("can't find newly created id for " + heuristicType + " --> can't open");
            }
        });
    }, [labelingTask, name, description]);

    const [acceptButtonCL, setAcceptButtonCL] = useState<ModalButton>(ACCEPT_BUTTON);

    useEffect(() => {
        setAcceptButtonCL({ ...ACCEPT_BUTTON, emitFunction: createHeuristic, disabled: !(labelingTask && name) });
    }, [labelingTask, name, createHeuristic]);

    useEffect(() => {
        if (!labelingTasks || labelingTasks.length == 0) return;
        setLabelingTask(labelingTasks[0].name);
        setName(getFunctionName(heuristicType));
        setDescription(DEFAULT_DESCRIPTION);
    }, [labelingTasks, heuristicType]);

    return (<Modal modalName={ModalEnum.ADD_CROWD_LABELER} acceptButton={acceptButtonCL}>
        <h1 className="text-lg text-gray-900 text-center mb-4">Add new crowd labeler</h1>
        <div className="grid grid-cols-2 gap-2 items-center" style={{ gridTemplateColumns: 'max-content auto' }}>
            <Tooltip content={TOOLTIPS_DICT.HEURISTICS.CHOOSE_LABELING_TASK} color="invert" placement="right">
                <div className="justify-self-start">
                    <span className="cursor-help card-title mb-0 label-text text-left"><span className="underline filtersUnderline">Labeling task</span></span>
                </div>
            </Tooltip>
            <Dropdown options={labelingTasks} buttonName={labelingTask} selectedOption={(option: string) => setLabelingTask(option)} disabled={labelingTasks?.length == 0} />
            <Tooltip content={TOOLTIPS_DICT.HEURISTICS.ENTER_HEURISTIC_NAME} color="invert" placement="right">
                <div className="justify-self-start">
                    <span className="cursor-help card-title mb-0 label-text text-left"><span className="underline filtersUnderline">Heuristic name</span></span>
                </div>
            </Tooltip>
            <input placeholder="Enter a function name..." value={name} onChange={(e: any) => setName(e.target.value)}
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