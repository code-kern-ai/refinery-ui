import { selectProject } from "@/src/reduxStore/states/project";
import { useDispatch, useSelector } from "react-redux";
import style from '@/src/styles/components/projects/projectId/heuristics.module.css';
import { use, useCallback, useEffect, useState } from "react";
import { selectLabelingTasksAll, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { CurrentPage } from "@/src/types/shared/general";
import { WebSocketsService } from "@/src/services/base/web-sockets/WebSocketsService";
import { LabelingTask } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { GET_LABELING_TASKS_BY_PROJECT_ID } from "@/src/services/gql/queries/project-setting";
import { useLazyQuery, useMutation } from "@apollo/client";
import { postProcessLabelingTasks, postProcessLabelingTasksSchema } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { Tooltip } from "@nextui-org/react";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-contants";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { ACTIONS_DROPDOWN_OPTIONS, NEW_HEURISTICS, postProcessHeuristics } from "@/src/util/components/projects/projectId/heuristics-helper";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import Modal from "@/src/components/shared/modal/Modal";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { openModal, selectModal } from "@/src/reduxStore/states/modal";
import { GET_HEURISTICS_OVERVIEW_DATA } from "@/src/services/gql/queries/heuristics";
import { selectAllHeuristics, setAllHeuristics } from "@/src/reduxStore/states/pages/heuristics";
import GridCards from "@/src/components/shared/grid-cards/GridCards";
import { DELETE_HEURISTIC, SET_ALL_HEURISTICS } from "@/src/services/gql/mutations/heuristics";
import HeuristicsCreationModals from "./HeuristicsCreationModals";
import { InformationSourceType } from "@/submodules/javascript-functions/enums/enums";

const ABORT_BUTTON = { buttonCaption: "Delete", useButton: true, disabled: false };

export function HeuristicsOverview() {
    const router = useRouter();
    const dispatch = useDispatch();

    const project = useSelector(selectProject);
    const heuristics = useSelector(selectAllHeuristics);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const modalDelete = useSelector(selectModal(ModalEnum.DELETE_HEURISTICS));

    const [openTab, setOpenTab] = useState(-1);
    const [selectionList, setSelectionList] = useState('');
    const [countSelected, setCountSelected] = useState(0);
    const [filteredList, setFilteredList] = useState([]);
    const [heuristicType, setHeuristicType] = useState(null);

    const [refetchLabelingTasksByProjectId] = useLazyQuery(GET_LABELING_TASKS_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchHeuristics] = useLazyQuery(GET_HEURISTICS_OVERVIEW_DATA, { fetchPolicy: "network-only" });
    const [setHeuristicsMut] = useMutation(SET_ALL_HEURISTICS);
    const [deleteHeuristicMut] = useMutation(DELETE_HEURISTIC);

    const deleteHeuristics = useCallback(() => {
        heuristics.forEach((heuristic) => {
            if (heuristic.selected) {
                deleteHeuristicMut({ variables: { projectId: project.id, informationSourceId: heuristic.id } }).then(() => refetchHeuristicsAndProcess());
            }
        });
    }, [modalDelete]);

    useEffect(() => {
        setAbortButton({ ...ABORT_BUTTON, emitFunction: deleteHeuristics });
        prepareSelectionList();
    }, [modalDelete]);

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    useEffect(() => {
        if (!project) return;
        refetchLabelingTasksAndProcess();
        refetchHeuristicsAndProcess();
        WebSocketsService.subscribeToNotification(CurrentPage.HEURISTICS, {
            projectId: project.id,
            whitelist: [],
            func: handleWebsocketNotification
        });
    }, [project]);

    function toggleTabs(index: number, labelingTask: LabelingTask | null) {
        setOpenTab(index);
        setFilteredList(labelingTask != null ? heuristics.filter((heuristic) => heuristic.labelingTaskId === labelingTask.id) : heuristics);
    }

    function refetchLabelingTasksAndProcess() {
        refetchLabelingTasksByProjectId({ variables: { projectId: project.id } }).then((res) => {
            const labelingTasks = postProcessLabelingTasks(res['data']['projectByProjectId']['labelingTasks']['edges']);
            dispatch(setLabelingTasksAll(postProcessLabelingTasksSchema(labelingTasks)));
        });
    }

    function refetchHeuristicsAndProcess() {
        refetchHeuristics({ variables: { projectId: project.id } }).then((res) => {
            const heuristics = postProcessHeuristics(res['data']['informationSourcesOverviewData'], project.id);
            dispatch(setAllHeuristics(heuristics));
            setFilteredList(heuristics);
        });
    }

    function handleWebsocketNotification() {

    }

    function executeOption(option: string) {
        switch (option) {
            case 'Labeling function':
                setHeuristicType(InformationSourceType.LABELING_FUNCTION);
                dispatch(openModal(ModalEnum.ADD_LABELING_FUNCTION));
                break;
            case 'Active learning':
                setHeuristicType(InformationSourceType.ACTIVE_LEARNING);
                dispatch(openModal(ModalEnum.ADD_ACTIVE_LEARNER));
                break;
            case 'Zero-shot':
                setHeuristicType(InformationSourceType.ZERO_SHOT);
                dispatch(openModal(ModalEnum.ADD_ZERO_SHOT));
                break;
            case 'Crowd labeler':
                setHeuristicType(InformationSourceType.CROWD_LABELER);
                dispatch(openModal(ModalEnum.ADD_CROWD_LABELER));
                break;
            case 'Select all':
                selectHeuristics(true);
                break;
            case 'Deselect all':
                selectHeuristics(false);
                break;
            case 'Delete selected':
                prepareSelectionList();
                dispatch(openModal(ModalEnum.DELETE_HEURISTICS));
                break;
        }
    }

    function selectHeuristics(checked: boolean) {
        setHeuristicsMut({ variables: { projectId: project.id, value: checked } }).then(() => { refetchHeuristicsAndProcess() });
    }

    function prepareSelectionList() {
        let selectionListFinal = '';
        let countSelected = 0;
        heuristics.forEach((heuristic, index) => {
            if (heuristic.selected) {
                selectionListFinal += heuristics[index].name;
                selectionListFinal += '\n';
                countSelected++;
            }
        });
        setCountSelected(countSelected)
        setSelectionList(selectionListFinal);
    }

    return (project && <div className="p-4 bg-gray-100 h-full flex-1 flex flex-col">
        <div className="w-full h-full -mr-4">
            <div className="flex-shrink-0 block xl:flex justify-between items-center">
                <div className={`flex ${style.widthLine} border-b-2 border-b-gray-200 max-w-full overflow-x-auto`}>
                    <div className={`cursor-pointer text-sm leading-5 font-medium mr-10 py-5 ${openTab == -1 ? 'text-indigo-700 ' + style.borderBottom : 'text-gray-500'}`} onClick={() => toggleTabs(-1, null)}>All</div>
                    {labelingTasks.map((labelingTask, index) => <div key={labelingTask.id}>
                        <div className={`cursor-pointer text-sm leading-5 font-medium mr-10 py-5 ${openTab == index ? 'text-indigo-700 ' + style.borderBottom : 'text-gray-500'}`} onClick={() => toggleTabs(index, labelingTask)}>{labelingTask.name}</div>
                    </div>)}
                    <Tooltip color="invert" placement="right" content={TOOLTIPS_DICT.HEURISTICS.ADD_LABELING_TASK} >
                        <button onClick={() => router.push(`/projects/${project.id}/settings`)}>
                            <IconPlus size={20} strokeWidth={1.5} className="text-gray-500 cursor-pointer" />
                        </button>
                    </Tooltip>
                </div>
                <div className="grid grid-cols-1 gap-4 xs:flex xs:gap-0 flex-row items-center">
                    <Dropdown options={NEW_HEURISTICS} buttonName="New heuristic" selectedOption={(option: string) => executeOption(option)} buttonClasses={`${style.actionsHeight} text-xs whitespace-nowrap`} dropdownClasses="mr-3" />

                    {heuristics && heuristics.length > 0 ? (
                        <Dropdown options={ACTIONS_DROPDOWN_OPTIONS} buttonName="Actions" disabledOptions={[false, false, heuristics.every((checked) => !checked), heuristics.every((checked) => !checked)]}
                            selectedOption={(option: string) => executeOption(option)} dropdownClasses="mr-3" buttonClasses={`${style.actionsHeight} text-xs`} />
                    ) : (
                        <Tooltip placement="left" content={TOOLTIPS_DICT.MODEL_CALLBACKS.ENABLE_ACTIONS} color="invert">
                            <button type="button"
                                className="mr-3 inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-1.5 bg-white text-xs font-medium text-gray-700 opacity-50 cursor-not-allowed focus:ring-offset-2 focus:ring-offset-gray-400"
                                id="menu-button" aria-expanded="true" aria-haspopup="true">
                                Actions
                                <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                    fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd" />
                                </svg>
                            </button>
                        </Tooltip>
                    )}

                    <div className="flex justify-center overflow-visible">
                        <Tooltip placement="left" content={TOOLTIPS_DICT.HEURISTICS.NAVIGATE_MODEL_CALLBACKS} color="invert">
                            <button onClick={() => {
                                router.push(`/projects/${project.id}/model-callbacks`)
                            }} className="bg-white text-gray-700 text-xs font-medium mr-3 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Model callbacks
                            </button>
                        </Tooltip>
                    </div>

                    <div className="flex justify-center overflow-visible">
                        <Tooltip placement="left" content={TOOLTIPS_DICT.HEURISTICS.NAVIGATE_LOOKUP_LISTS} color="invert">
                            <button onClick={() => {
                                router.push(`/projects/${project.id}/lookup-lists`)
                            }} className=" bg-white text-gray-700 text-xs font-medium mr-3 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Lookup lists
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div >

            {heuristics && heuristics.length == 0 ? (
                <div>
                    <div className="text-gray-500 font-normal mt-8">
                        <p className="text-xl leading-7">Seems like your project has no heuristic yet.</p>
                        <p className="text-base mt-3 leading-6">You can create one from the button New heuristic in the bar
                            above. Also, we got some quick-links from our <a href="https://docs.kern.ai/"
                                target="_blank"><span className="underline cursor-pointer">documentation</span></a>, if you want
                            to dive deeper.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
                        <div>
                            <div className="text-gray-900 text-xl leading-7 font-semibold">What are heuristics?</div>
                            <div className="text-gray-500 text-base leading-6 font-normal mt-3">Think of the as noisy, imperfect
                                label signals. They can be labeling functions, active learning models or something else that
                                you can integrate. The general interface is that they have some record as input and produce
                                some label-related output (e.g. the label name for classification tasks).</div>
                            <div
                                className="text-green-800 hover:text-green-500 text-base leading-6 font-semibold mt-3 cursor-pointer">
                                <a href="https://docs.kern.ai/refinery/heuristics#labeling-functions" target="_blank">Read
                                    about labeling functions</a>
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-900 text-xl leading-7 font-semibold">How to use templates</div>
                            <div className="text-gray-500 text-base leading-6 font-normal mt-3">You don't need to re-invent the
                                wheel in some cases, as labeling functions often share some of their structure. We have a
                                public GitHub repository containing some template functions, so you can look into this.
                            </div>
                            <div
                                className="text-green-800 hover:text-green-500 text-base leading-6 font-semibold mt-3 cursor-pointer">
                                <a href="https://github.com/code-kern-ai/template-functions" target="_blank">See template
                                    functions</a>
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-900 text-xl leading-7 font-semibold">Applying active learning</div>
                            <div className="text-gray-500 text-base leading-6 font-normal mt-3">As you label data manually (and
                                build embeddings), you can make great use of active learning to build implicit heuristics.
                                They are straightforward to be implemented, as we autogenerate the coding for it. Still, you
                                can dive deeper into their mechanics in our docs.</div>
                            <div
                                className="text-green-800 hover:text-green-500 text-base leading-6 font-semibold mt-3 cursor-pointer">
                                <a href="https://docs.kern.ai/refinery/heuristics#active-learners" target="_blank">Read
                                    about active learning</a>
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-900 text-xl leading-7 font-semibold">Starting with zero-shot</div>
                            <div className="text-gray-500 text-base leading-6 font-normal mt-3">Zero-shot models are really
                                great heuristics, as they infer predictions from the label names (and some context). You
                                might want to use them for your project, but be aware that pulling them can require some
                                time, since they contain enormous amounts of parameters.</div>
                            <div
                                className="text-green-800 hover:text-green-500 text-base leading-6 font-semibold mt-3 cursor-pointer">
                                <a href="https://docs.kern.ai/refinery/heuristics#zero-shot-classifiers"
                                    target="_blank">Read
                                    about zero-shot</a>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (<>
                <div className="overflow-y-auto" style={{ maxHeight: '93%' }}>
                    <div className={`mt-8 ${filteredList.length > 3 ? style.flexContainer : 'grid gap-6 grid-cols-3'}`}>
                        {heuristics.length > 0 && filteredList.length == 0 && <span className="text-gray-500 text-base leading-6 font-normal mt-4">No heuristics for this labeling task</span>}
                        <GridCards filteredList={filteredList} refetch={refetchHeuristicsAndProcess} />
                    </div>
                </div>
                <Modal modalName={ModalEnum.DELETE_HEURISTICS} abortButton={abortButton}>
                    <h1 className="text-lg text-gray-900 mb-2">Warning</h1>
                    <div className="text-sm text-gray-500 my-2 flex flex-col">
                        <span>Are you sure you want to delete selected model {countSelected <= 1 ? 'callback' : 'callbacks'}?</span>
                        <span>Currently selected {countSelected <= 1 ? 'is' : 'are'}:</span>
                        <span className="whitespace-pre-line font-bold">{selectionList}</span>
                    </div>
                </Modal>
            </>)}

            <HeuristicsCreationModals heuristicType={heuristicType} />
        </div >
    </div >)
}