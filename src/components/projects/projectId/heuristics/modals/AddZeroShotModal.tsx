import Modal from "@/src/components/shared/modal/Modal";
import { CacheEnum, selectCachedValue, setCache } from "@/src/reduxStore/states/cachedValues";
import { selectModal } from "@/src/reduxStore/states/modal";
import { selectHeuristicType } from "@/src/reduxStore/states/pages/heuristics";
import { selectLabelingTasksAll, selectUseableEmbedableAttributes } from "@/src/reduxStore/states/pages/settings";
import { selectProject, selectProjectId } from "@/src/reduxStore/states/project";
import { CREATE_ZERO_SHOT_INFORMATION_SOURCE } from "@/src/services/gql/mutations/heuristics";
import { LabelingTaskTaskType } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { getRouterLinkHeuristic } from "@/src/util/components/projects/projectId/heuristics/heuristics-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { InformationSourceType } from "@/submodules/javascript-functions/enums/enums";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Create', useButton: true, disabled: true };

export default function AddZeroShotModal() {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const attributes = useSelector(selectUseableEmbedableAttributes);
    const modalZs = useSelector(selectModal(ModalEnum.ADD_ZERO_SHOT));
    const heuristicType = useSelector(selectHeuristicType);
    const project = useSelector(selectProject);
    const models = useSelector(selectCachedValue(CacheEnum.ZERO_SHOT_RECOMMENDATIONS));

    const [labelingTask, setLabelingTask] = useState('');
    const [attribute, setAttribute] = useState<string>(null);
    const [model, setModel] = useState<string>('');
    const [labelingTasksClassification, setLabelingTasksClassification] = useState([]);
    const [showZSAttribute, setShowZSAttribute] = useState<boolean>(false);
    const [hoverBoxList, setHoverBoxList] = useState<any[]>([]);

    useEffect(() => {
        if (!attributes) return;
        setAttribute(attributes[0]?.name);
    }, [attributes]);

    useEffect(() => {
        if (!project.tokenizer) return;
        const language = project.tokenizer.split("_")[0];
        const modelsFiltered = models.filter(model => model.language == language).sort((a, b) => a.prio - b.prio);
        dispatch(setCache(CacheEnum.ZERO_SHOT_RECOMMENDATIONS, modelsFiltered));
        const hoverBoxList = modelsFiltered.map(model => {
            return {
                avgTime: model.avgTime,
                base: model.base,
                size: model.size,
            }
        });
        setHoverBoxList(hoverBoxList);
    }, [project]);

    const [createZeroShotMut] = useMutation(CREATE_ZERO_SHOT_INFORMATION_SOURCE);

    const createZeroShot = useCallback(() => {
        const parseTask = labelingTask.split(' - ');
        const taskName = parseTask.length > 0 ? parseTask[parseTask.length - 1] : labelingTask;
        const labelingTaskId = labelingTasks.find(lt => lt.name == taskName)?.id;
        const attributeId = attributes.find(a => a.name == attribute) ? attributes.find(a => a.name == attribute).id : '';
        createZeroShotMut({ variables: { projectId: projectId, targetConfig: model, labelingTaskId: labelingTaskId, attributeId: attributeId } }).then((res) => {
            let id = res['data']?.['createZeroShotInformationSource']['id'];
            if (id) {
                router.push(getRouterLinkHeuristic(heuristicType, projectId, id))
            } else {
                console.log("can't find newly created id for " + heuristicType + " --> can't open");
            }
        });
    }, [modalZs, labelingTask, attribute, model]);

    useEffect(() => {
        setAcceptButtonZS({ ...ACCEPT_BUTTON, emitFunction: createZeroShot, disabled: !(labelingTask && model) });
    }, [labelingTask, modalZs, model]);

    const [acceptButtonZS, setAcceptButtonZS] = useState<ModalButton>(ACCEPT_BUTTON);

    useEffect(() => {
        setLabelingTask(labelingTasksClassification[0]);
    }, [labelingTasksClassification]);

    useEffect(() => {
        if (!labelingTasks || labelingTasks.length == 0) return;
        setLabelingTask(labelingTasks[0].name);
        if (heuristicType == InformationSourceType.ZERO_SHOT) {
            const labelingTasksCopy = labelingTasks.filter(t => t.taskType == LabelingTaskTaskType.MULTICLASS_CLASSIFICATION);
            if (labelingTasksCopy.length) {
                setShowZSAttribute(!(labelingTasksCopy[0].taskTarget == 'ON_ATTRIBUTE'));
            }
            setLabelingTasksClassification(labelingTasksCopy.map((task) => {
                return task.taskTarget == 'ON_WHOLE_RECORD' ? ('Full Record - ' + task.name) : task.name
            }));
        }
    }, [labelingTasks, heuristicType]);

    return (<Modal modalName={ModalEnum.ADD_ZERO_SHOT} acceptButton={acceptButtonZS}>
        <h1 className="text-lg text-gray-900 text-center mb-4">Add new zero shot classification</h1>
        <div className="grid grid-cols-2 gap-2 items-center" style={{ gridTemplateColumns: 'max-content auto' }}>
            <Tooltip content={TOOLTIPS_DICT.HEURISTICS.CHOOSE_LABELING_TASK} color="invert" placement="right">
                <div className="justify-self-start">
                    <span className="cursor-help card-title mb-0 label-text text-left"><span className="underline filtersUnderline">Target task</span></span>
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
            <Dropdown options={models && models.map(model => model.configString)} hasSearchBar={true} optionsHaveLink={true} optionsHaveHoverBox={true}
                linkList={models && models.map(model => model.link)}
                selectedOption={(option: string) => setModel(option)}
                hoverBoxList={hoverBoxList} />
        </div>
    </Modal>)
}