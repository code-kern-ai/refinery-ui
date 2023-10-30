import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { selectEmbeddings, selectLabelingTasksAll, selectUsableNonTextAttributes, setAllAttributes, setAllEmbeddings } from "@/src/reduxStore/states/pages/settings";
import { selectProject } from "@/src/reduxStore/states/project";
import { CREATE_HEURISTIC, CREATE_ZERO_SHOT_INFORMATION_SOURCE } from "@/src/services/gql/mutations/heuristics";
import { GET_ATTRIBUTES_BY_PROJECT_ID, GET_EMBEDDING_SCHEMA_BY_PROJECT_ID, GET_ZERO_SHOT_RECOMMENDATIONS } from "@/src/services/gql/queries/project-setting";
import { HeuristicCreationModalsProps } from "@/src/types/components/projects/projectId/heuristics";
import { LabelingTaskTaskType } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { DEFAULT_DESCRIPTION, getFunctionName, getInformationSourceTemplate, getRouterLinkHeuristic } from "@/src/util/components/projects/projectId/heuristics-helper";
import { postProcessingAttributes } from "@/src/util/components/projects/projectId/settings/data-schema-helper";
import { postProcessingEmbeddings } from "@/src/util/components/projects/projectId/settings/embeddings-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-contants";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Create', useButton: true, disabled: true };

export default function HeuristicsCreationModals(props: HeuristicCreationModalsProps) {
    const dispatch = useDispatch();
    const router = useRouter();

    const project = useSelector(selectProject);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const embeddings = useSelector(selectEmbeddings);
    const attributes = useSelector(selectUsableNonTextAttributes);
    const modalLf = useSelector(selectModal(ModalEnum.ADD_LABELING_FUNCTION));
    const modalAl = useSelector(selectModal(ModalEnum.ADD_ACTIVE_LEARNER));
    const modalZs = useSelector(selectModal(ModalEnum.ADD_ZERO_SHOT));
    const modalCl = useSelector(selectModal(ModalEnum.ADD_CROWD_LABELER));

    const [labelingTask, setLabelingTask] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [embedding, setEmbedding] = useState('');
    const [labelingTasksClassification, setLabelingTasksClassification] = useState([]);
    const [showZSAttribute, setShowZSAttribute] = useState<boolean>(false);
    const [attribute, setAttribute] = useState<string>('');
    const [model, setModel] = useState<string>('');
    const [models, setModels] = useState([]);

    const [refetchEmbeddings] = useLazyQuery(GET_EMBEDDING_SCHEMA_BY_PROJECT_ID, { fetchPolicy: "no-cache" });
    const [createHeuristicMut] = useMutation(CREATE_HEURISTIC);
    const [createZeroShotMut] = useMutation(CREATE_ZERO_SHOT_INFORMATION_SOURCE);
    const [refetchAttributes] = useLazyQuery(GET_ATTRIBUTES_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchZeroShotRecommendations] = useLazyQuery(GET_ZERO_SHOT_RECOMMENDATIONS, { fetchPolicy: 'network-only', nextFetchPolicy: 'cache-first' });

    const createHeuristic = useCallback(() => {
        const labelingTaskId = labelingTasks.find(lt => lt.name == labelingTask)?.id;
        const matching = labelingTasks.filter(e => e.id == labelingTaskId);
        const codeData = getInformationSourceTemplate(matching, props.heuristicType, embedding);
        if (!codeData) return;
        createHeuristicMut({
            variables: {
                projectId: project.id,
                labelingTaskId: labelingTaskId,
                sourceCode: codeData.code,
                name: name,
                description: description,
                type: props.heuristicType
            }
        }).then((res) => {
            let id = res['data']?.['createInformationSource']?.['informationSource']?.['id'];
            if (id) {
                router.push(getRouterLinkHeuristic(props.heuristicType, project.id, id))
            } else {
                console.log("can't find newly created id for " + props.heuristicType + " --> can't open");
            }
        });
    }, [modalLf, modalAl, modalCl, labelingTask, name, description]);

    const createZeroShot = useCallback(() => {
        const labelingTaskId = labelingTasks.find(lt => lt.name == labelingTask)?.id;
        const attributeId = attributes.find(a => a.name == attribute) ? attributes.find(a => a.name == attribute).id : '';
        createZeroShotMut({ variables: { projectId: project.id, targetConfig: model, labelingTaskId: labelingTaskId, attributeId: attributeId } }).then((res) => {
            let id = res['data']?.['createZeroShotInformationSource']['id'];
            if (id) {
                router.push(getRouterLinkHeuristic(props.heuristicType, project.id, id))
            } else {
                console.log("can't find newly created id for " + props.heuristicType + " --> can't open");
            }
        });
    }, [modalZs, labelingTask, attribute, model]);

    useEffect(() => {
        setAcceptButtonLF({ ...ACCEPT_BUTTON, emitFunction: createHeuristic, disabled: !(labelingTask && name) });
        setAcceptButtonAL({ ...ACCEPT_BUTTON, emitFunction: createHeuristic, disabled: !(embedding && name) });
        setAcceptButtonZS({ ...ACCEPT_BUTTON, emitFunction: createZeroShot, disabled: !(labelingTask && model) });
        setAcceptButtonCL({ ...ACCEPT_BUTTON, emitFunction: createHeuristic, disabled: !(labelingTask && name) });
    }, [labelingTask, name, description, modalLf, modalAl, modalZs, modalCl, embedding, model]);

    const [acceptButtonLF, setAcceptButtonLF] = useState<ModalButton>(ACCEPT_BUTTON);
    const [acceptButtonAL, setAcceptButtonAL] = useState<ModalButton>(ACCEPT_BUTTON);
    const [acceptButtonZS, setAcceptButtonZS] = useState<ModalButton>(ACCEPT_BUTTON);
    const [acceptButtonCL, setAcceptButtonCL] = useState<ModalButton>(ACCEPT_BUTTON);

    useEffect(() => {
        if (!project) return;
        if (embeddings.length == 0) {
            refetchEmbeddings({ variables: { projectId: project.id } }).then((res) => {
                const embeddingsFinal = postProcessingEmbeddings(res.data['projectByProjectId']['embeddings']['edges'].map((e) => e['node']), []);
                dispatch(setAllEmbeddings(embeddingsFinal));
            });
        }
        if (attributes.length == 0) {
            refetchAttributes({ variables: { projectId: project.id, stateFilter: ['ALL'] } }).then((res) => {
                dispatch(setAllAttributes(postProcessingAttributes(res.data['attributesByProjectId'])));
            });
        }
        if (models.length == 0) {
            refetchZeroShotRecommendations().then((res) => {
                setModels(JSON.parse(res.data['zeroShotRecommendations']));
            });
        }
    }, [project, embeddings, attributes, models]);

    useEffect(() => {
        if (labelingTasks.length == 0) return;
        if (embeddings.length == 0) return;
        setLabelingTask(labelingTasks[0].name);
        setName(getFunctionName(props.heuristicType));
        setDescription(DEFAULT_DESCRIPTION);
        setEmbedding(embeddings[0].name);
        if (props.heuristicType == 'ZERO_SHOT') {
            const labelingTasksCopy = labelingTasks.filter(t => t.taskType == LabelingTaskTaskType.MULTICLASS_CLASSIFICATION);
            if (labelingTasksCopy.length) {
                setShowZSAttribute(!(labelingTasksCopy[0].taskTarget == 'ON_ATTRIBUTE'));
            }
            setLabelingTasksClassification(labelingTasksCopy.map((task) => {
                return task.taskTarget == 'ON_WHOLE_RECORD' ? ('Full Record - ' + task.name) : task.name
            }));
        }
    }, [labelingTasks, embedding, props.heuristicType]);

    useEffect(() => {
        setLabelingTask(labelingTasksClassification[0]);
    }, [labelingTasksClassification]);

    return (<>
        <Modal modalName={ModalEnum.ADD_LABELING_FUNCTION} acceptButton={acceptButtonLF}>
            <h1 className="text-lg text-gray-900 text-center mb-4">Add new labeling function</h1>
            <div className="grid grid-cols-2 gap-2 items-center" style={{ gridTemplateColumns: 'max-content auto' }}>
                <Tooltip content={TOOLTIPS_DICT.HEURISTICS.CHOOSE_LABELING_TASK} color="invert" placement="right">
                    <div className="justify-self-start">
                        <span className="cursor-help card-title mb-0 label-text text-left"><span className="underline filtersUnderline">Labeling task</span></span>
                    </div>
                </Tooltip>
                <Dropdown options={labelingTasks} buttonName={labelingTask} selectedOption={(option: string) => setLabelingTask(option)} disabled={labelingTasks.length == 0} />
                <Tooltip content={TOOLTIPS_DICT.HEURISTICS.ENTER_FUNCTION_NAME} color="invert" placement="right">
                    <div className="justify-self-start">
                        <span className="cursor-help card-title mb-0 label-text text-left"><span className="underline filtersUnderline">Function name</span></span>
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

        <Modal modalName={ModalEnum.ADD_ACTIVE_LEARNER} acceptButton={acceptButtonAL}>
            <h1 className="text-lg text-gray-900 text-center mb-4">Add new active learning</h1>
            <div className="grid grid-cols-2 gap-2 items-center" style={{ gridTemplateColumns: 'max-content auto' }}>
                <Tooltip content={TOOLTIPS_DICT.HEURISTICS.CHOOSE_LABELING_TASK} color="invert" placement="right">
                    <div className="justify-self-start">
                        <span className="cursor-help card-title mb-0 label-text text-left"><span className="underline filtersUnderline">Labeling task</span></span>
                    </div>
                </Tooltip>
                <Dropdown options={labelingTasks} buttonName={labelingTask} selectedOption={(option: string) => setLabelingTask(option)} disabled={labelingTasks.length == 0} />
                <Tooltip content={TOOLTIPS_DICT.HEURISTICS.ENTER_CLASS_NAME} color="invert" placement="right">
                    <div className="justify-self-start">
                        <span className="cursor-help card-title mb-0 label-text text-left"><span className="underline filtersUnderline">Class name</span></span>
                    </div>
                </Tooltip>
                <input placeholder="Enter a class name..." value={name} onChange={(e: any) => setName(e.target.value)}
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
                <Dropdown options={embeddings.map(e => e.name)} buttonName={embedding} selectedOption={(option: string) => setEmbedding(option)} disabled={embeddings.length == 0} />
            </div>
        </Modal>

        <Modal modalName={ModalEnum.ADD_ZERO_SHOT} acceptButton={acceptButtonZS}>
            <h1 className="text-lg text-gray-900 text-center mb-4">Add new zero shot classification</h1>
            <div className="grid grid-cols-2 gap-2 items-center" style={{ gridTemplateColumns: 'max-content auto' }}>
                <Tooltip content={TOOLTIPS_DICT.HEURISTICS.CHOOSE_LABELING_TASK} color="invert" placement="right">
                    <div className="justify-self-start">
                        <span className="cursor-help card-title mb-0 label-text text-left"><span className="underline filtersUnderline">Labeling task</span></span>
                    </div>
                </Tooltip>
                <Dropdown options={labelingTasksClassification} buttonName={labelingTask} disabled={labelingTasksClassification.length == 0} selectedOption={(option: string) => {
                    let optionCopy = option;
                    if (option.indexOf('Full Record - ') == 0) {
                        optionCopy = option.substring('Full Record - '.length);
                    }
                    const findTask = labelingTasks.find(t => t.name == optionCopy);
                    if (findTask && findTask.taskTarget == 'ON_ATTRIBUTE') {
                        setShowZSAttribute(true);
                    }
                    setLabelingTask(option);
                }} />
                {showZSAttribute && <><Tooltip content={TOOLTIPS_DICT.HEURISTICS.CHOOSE_ATTRIBUTE} color="invert" placement="right">
                    <div className="justify-self-start">
                        <span className="cursor-help card-title mb-0 label-text text-left"><span className="underline filtersUnderline">Attribute</span></span>
                    </div>
                </Tooltip>
                    <Dropdown options={attributes} buttonName={attribute} selectedOption={(option: string) => setAttribute(option)} disabled={attributes.length == 0} />
                </>}
                <Tooltip content={TOOLTIPS_DICT.HEURISTICS.CHOOSE_MODEL} color="invert" placement="right">
                    <div className="justify-self-start">
                        <span className="cursor-help card-title mb-0 label-text text-left"><span className="underline filtersUnderline">Model</span></span>
                    </div>
                </Tooltip>
                <Dropdown options={models.map(model => model.configString)} hasSearchBar={true} selectedOption={(option: string) => setModel(option)} />
            </div>
        </Modal>

        <Modal modalName={ModalEnum.ADD_CROWD_LABELER} acceptButton={acceptButtonCL}>
            <h1 className="text-lg text-gray-900 text-center mb-4">Add new crowd labeler</h1>
            <div className="grid grid-cols-2 gap-2 items-center" style={{ gridTemplateColumns: 'max-content auto' }}>
                <Tooltip content={TOOLTIPS_DICT.HEURISTICS.CHOOSE_LABELING_TASK} color="invert" placement="right">
                    <div className="justify-self-start">
                        <span className="cursor-help card-title mb-0 label-text text-left"><span className="underline filtersUnderline">Labeling task</span></span>
                    </div>
                </Tooltip>
                <Dropdown options={labelingTasks} buttonName={labelingTask} selectedOption={(option: string) => setLabelingTask(option)} disabled={labelingTasks.length == 0} />
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
    </>);
}