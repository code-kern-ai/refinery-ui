import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { selectEmbeddings, selectLabelingTasksAll, setAllEmbeddings } from "@/src/reduxStore/states/pages/settings";
import { selectProject } from "@/src/reduxStore/states/project";
import { CREATE_HEURISTIC } from "@/src/services/gql/mutations/heuristics";
import { GET_EMBEDDING_SCHEMA_BY_PROJECT_ID } from "@/src/services/gql/queries/project-setting";
import { HeuristicCreationModalsProps } from "@/src/types/components/projects/projectId/heuristics";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { DEFAULT_DESCRIPTION, getFunctionName, getInformationSourceTemplate, getRouterLinkHeuristic } from "@/src/util/components/projects/projectId/heuristics-helper";
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
    const modalLf = useSelector(selectModal(ModalEnum.ADD_LABELING_FUNCTION));
    const modalAl = useSelector(selectModal(ModalEnum.ADD_ACTIVE_LEARNER));

    const [labelingTask, setLabelingTask] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [embedding, setEmbedding] = useState('');

    const [refetchEmbeddings] = useLazyQuery(GET_EMBEDDING_SCHEMA_BY_PROJECT_ID, { fetchPolicy: "no-cache" });
    const [createHeuristicMut] = useMutation(CREATE_HEURISTIC);

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
    }, [modalLf, modalAl, labelingTask, name, description]);

    useEffect(() => {
        setAcceptButtonLF({ ...ACCEPT_BUTTON, emitFunction: createHeuristic, disabled: !(labelingTask && name) });
        setAcceptButtonAL({ ...ACCEPT_BUTTON, emitFunction: createHeuristic, disabled: !(embedding && name) });
    }, [labelingTask, name, description, modalLf, modalAl]);

    const [acceptButtonLF, setAcceptButtonLF] = useState<ModalButton>(ACCEPT_BUTTON);
    const [acceptButtonAL, setAcceptButtonAL] = useState<ModalButton>(ACCEPT_BUTTON);

    useEffect(() => {
        if (!project) return;
        if (embeddings.length == 0) {
            refetchEmbeddings({ variables: { projectId: project.id } }).then((res) => {
                const embeddingsFinal = postProcessingEmbeddings(res.data['projectByProjectId']['embeddings']['edges'].map((e) => e['node']), []);
                dispatch(setAllEmbeddings(embeddingsFinal));
            });
        }
    }, [project]);

    useEffect(() => {
        if (labelingTasks.length == 0) return;
        if (embeddings.length == 0) return;
        setLabelingTask(labelingTasks[0].name);
        setName(getFunctionName(props.heuristicType));
        setDescription(DEFAULT_DESCRIPTION);
        setEmbedding(embeddings[0].name);
    }, [labelingTasks, embedding, props.heuristicType]);

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

    </>);
}