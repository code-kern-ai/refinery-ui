import Modal from "@/src/components/shared/modal/Modal";
import { selectHeuristicType } from "@/src/reduxStore/states/pages/heuristics";
import { selectEmbeddings, selectEmbeddingsFiltered, selectLabelingTasksAll, selectVisibleAttributesHeuristics, setFilteredEmbeddings } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { createHeuristicPost } from "@/src/services/base/heuristic";
import { Embedding } from "@/src/types/components/projects/projectId/settings/embeddings";
import { LabelingTask } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { embeddingRelevant } from "@/src/util/components/projects/projectId/heuristics/heuristicId/labeling-functions-helper";
import { DEFAULT_DESCRIPTION, getFunctionName, getInformationSourceTemplate, getRouterLinkHeuristic } from "@/src/util/components/projects/projectId/heuristics/heuristics-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { capitalizeFirstForClassName } from "@/submodules/javascript-functions/case-types-parser";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { Tooltip } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Create', useButton: true, disabled: true };

export default function AddActiveLeanerModal() {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const heuristicType = useSelector(selectHeuristicType);
    const embeddings = useSelector(selectEmbeddings);
    const attributes = useSelector(selectVisibleAttributesHeuristics);
    const embeddingsFiltered = useSelector(selectEmbeddingsFiltered);

    const [labelingTask, setLabelingTask] = useState<LabelingTask>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [embedding, setEmbedding] = useState<Embedding>(null);

    useEffect(() => {
        if (!embeddings || !labelingTask) return;
        const findLabelingTask = labelingTasks.find(lt => lt.id == labelingTask.id);
        const filteredEmbeddings = embeddings.filter(e => embeddingRelevant(e, attributes, labelingTasks, findLabelingTask?.id));
        dispatch(setFilteredEmbeddings(filteredEmbeddings));
        setEmbedding(filteredEmbeddings[0] ?? undefined);
    }, [embeddings, labelingTask]);

    const createHeuristic = useCallback(() => {
        const matching = labelingTasks.filter(e => e.id == labelingTask.id);
        const codeData = getInformationSourceTemplate(matching, heuristicType, embedding.name);
        if (!codeData) return;
        createHeuristicPost(projectId, labelingTask.id, codeData.code, name, description, heuristicType, (res) => {
            let id = res['data']?.['createInformationSource']?.['informationSource']?.['id'];
            if (id) {
                router.push(getRouterLinkHeuristic(heuristicType, projectId, id))
            } else {
                console.log("can't find newly created id for " + heuristicType + " --> can't open");
            }
        });
    }, [labelingTask, name, description, heuristicType, embedding]);

    const [acceptButtonAL, setAcceptButtonAL] = useState<ModalButton>(ACCEPT_BUTTON);

    useEffect(() => {
        setAcceptButtonAL({ ...ACCEPT_BUTTON, emitFunction: createHeuristic, disabled: !(embedding && name) });
    }, [labelingTask, embedding, name, createHeuristic]);

    useEffect(() => {
        if (!labelingTasks || labelingTasks.length == 0) return;
        if (embeddings.length == 0) return;
        setLabelingTask(labelingTasks[0]);
        setName(getFunctionName(heuristicType));
        setDescription(DEFAULT_DESCRIPTION);
    }, [labelingTasks, heuristicType]);

    useEffect(() => {
        if (!embeddingsFiltered || embeddingsFiltered.length == 0) return;
        setEmbedding(embeddingsFiltered[0] ?? undefined);
    }, [embeddingsFiltered]);

    return (<Modal modalName={ModalEnum.ADD_ACTIVE_LEARNER} acceptButton={acceptButtonAL}>
        <h1 className="text-lg text-gray-900 text-center mb-4">Add new active learning</h1>
        <div className="grid grid-cols-2 gap-2 items-center" style={{ gridTemplateColumns: 'max-content auto' }}>
            <Tooltip content={TOOLTIPS_DICT.HEURISTICS.CHOOSE_LABELING_TASK} color="invert" placement="right">
                <div className="justify-self-start">
                    <span className="cursor-help card-title mb-0 label-text text-left"><span className="underline filtersUnderline">Labeling task</span></span>
                </div>
            </Tooltip>
            <KernDropdown options={labelingTasks} buttonName={labelingTask?.name} selectedOption={(option: any) => setLabelingTask(option)} disabled={labelingTasks?.length == 0} />

            <Tooltip content={TOOLTIPS_DICT.HEURISTICS.ENTER_CLASS_NAME} color="invert" placement="right">
                <div className="justify-self-start">
                    <span className="cursor-help card-title mb-0 label-text text-left"><span className="underline filtersUnderline">Class name</span></span>
                </div>
            </Tooltip>
            <input placeholder="Enter a class name..." value={name} onChange={(e: any) => setName(capitalizeFirstForClassName(e.target.value))}
                className="h-9 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
            <Tooltip content={TOOLTIPS_DICT.HEURISTICS.ENTER_DESCRIPTION} color="invert" placement="right">
                <div className="justify-self-start">
                    <span className="cursor-help card-title mb-0 label-text text-left"><span className="underline filtersUnderline">Description</span></span>
                </div>
            </Tooltip>
            <input placeholder="Enter a description..." value={description} onChange={(e: any) => setDescription(e.target.value)}
                className="h-9 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
            <Tooltip content={TOOLTIPS_DICT.HEURISTICS.CHOOSE_EMBEDDING} color="invert" placement="right">
                <div className="justify-self-start">
                    <span className="cursor-help card-title mb-0 label-text text-left"><span className="underline filtersUnderline">Embedding</span></span>
                </div>
            </Tooltip>
            <KernDropdown options={embeddingsFiltered} buttonName={embedding ? embedding.name : ''} selectedOption={(option: any) => setEmbedding(option)} disabled={embeddingsFiltered.length == 0} />

        </div>
    </Modal>
    )
}