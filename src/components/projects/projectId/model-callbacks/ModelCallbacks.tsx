import { selectLabelingTasksAll, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProject } from "@/src/reduxStore/states/project"
import { GET_MODEL_CALLBACKS_OVERVIEW_DATA } from "@/src/services/gql/queries/model-callbacks";
import { GET_LABELING_TASKS_BY_PROJECT_ID } from "@/src/services/gql/queries/project-setting";
import { LabelingTask } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { ACTIONS_DROPDOWN_OPTIONS, postProcessModelCallbacks } from "@/src/util/components/projects/projectId/model-callbacks-helper";
import { postProcessLabelingTasks, postProcessLabelingTasksSchema } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-contants";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { useLazyQuery } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from '@/src/styles/components/projects/projectId/model-callbacks.module.css';
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { openModal, selectModal } from "@/src/reduxStore/states/modal";
import Modal from "@/src/components/shared/modal/Modal";
import { WebSocketsService } from "@/src/services/base/web-sockets/WebSocketsService";
import { CurrentPage } from "@/src/types/shared/general";

const ABORT_BUTTON = { buttonCaption: "Delete", useButton: true, disabled: false };

export default function ModelCallbacks() {
    const dispatch = useDispatch();
    const router = useRouter();

    const project = useSelector(selectProject);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const modalDelete = useSelector(selectModal(ModalEnum.DELETE_MODEL_CALLBACKS));

    const [openTab, setOpenTab] = useState(-1);
    const [modelCallbacks, setModelCallbacks] = useState([]);
    const [checkedModelCallbacks, setCheckedModelCallbacks] = useState([]);
    const [selectionList, setSelectionList] = useState('');
    const [countSelected, setCountSelected] = useState(0);

    const [refetchLabelingTasksByProjectId] = useLazyQuery(GET_LABELING_TASKS_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchModelCallbacks] = useLazyQuery(GET_MODEL_CALLBACKS_OVERVIEW_DATA, { fetchPolicy: "network-only" });

    const deleteModelCallbacks = useCallback(() => {

    }, [modalDelete, checkedModelCallbacks]);

    useEffect(() => {
        setAbortButton({ ...ABORT_BUTTON, emitFunction: deleteModelCallbacks });
        prepareSelectionList();
    }, [modalDelete]);

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    useEffect(() => {
        if (!project) return;
        refetchLabelingTasksAndProcess();
        refetchModelCallbacksAndProcess();
        WebSocketsService.subscribeToNotification(CurrentPage.MODEL_CALLBACKS, {
            projectId: project.id,
            whitelist: ['information_source_created', 'information_source_updated', 'information_source_deleted', 'labeling_task_deleted', 'labeling_task_updated', 'labeling_task_created', 'model_callback_update_statistics'],
            func: handleWebsocketNotification
        });
    }, [project]);

    function toggleTabs(index: number, labelingTask: LabelingTask | null) {
        setOpenTab(index);
    }

    function refetchLabelingTasksAndProcess() {
        refetchLabelingTasksByProjectId({ variables: { projectId: project.id } }).then((res) => {
            const labelingTasks = postProcessLabelingTasks(res['data']['projectByProjectId']['labelingTasks']['edges']);
            dispatch(setLabelingTasksAll(postProcessLabelingTasksSchema(labelingTasks)))
        });
    }

    function refetchModelCallbacksAndProcess() {
        refetchModelCallbacks({ variables: { projectId: project.id } }).then((res) => {
            setModelCallbacks(postProcessModelCallbacks(res['data']['modelCallbacksOverviewData']))
        });
    }

    function executeOption(option: string) {
        switch (option) {
            case 'Select all':
                selectModelCallbacks(true);
                break;
            case 'Deselect all':
                selectModelCallbacks(false);
                break;
            case 'Delete selected':
                prepareSelectionList();
                dispatch(openModal(ModalEnum.DELETE_MODEL_CALLBACKS));
                break;
        }
    }

    function selectModelCallbacks(checked: boolean) {
        setCheckedModelCallbacks(Array(modelCallbacks.length).fill(checked));
        prepareSelectionList();
    }

    function prepareSelectionList() {
        let selectionListFinal = '';
        let countSelected = 0;
        checkedModelCallbacks.forEach((checked, index) => {
            if (checked) {
                selectionListFinal += modelCallbacks[index].name;
                selectionListFinal += '\n';
                countSelected++;
            }
        });
        setCountSelected(countSelected)
        setSelectionList(selectionListFinal);
    }

    function handleWebsocketNotification(msgParts: string[]) {
        if (['labeling_task_updated', 'labeling_task_created'].includes(msgParts[1])) {
            refetchLabelingTasksAndProcess();
        }
        if ('labeling_task_deleted' == msgParts[1]) {
            refetchLabelingTasksAndProcess
        }
        if (['information_source_created', 'information_source_updated', 'information_source_deleted', 'model_callback_update_statistics']) {
            refetchModelCallbacksAndProcess();
        }
    }

    return (project && <div className="p-4 bg-gray-100 h-full flex-1 flex flex-col">
        <div className="w-full h-full">
            <div className="flex-shrink-0 block xl:flex justify-between items-center">
                <div className={`flex ${style.widthLine} border-b-2 border-b-gray-200 max-w-full overflow-x-auto`}>
                    <div className={`cursor-pointer text-sm leading-5 font-medium mr-10 py-5 ${openTab == -1 ? 'text-indigo-700 border-bottom' : 'text-gray-500'}`} onClick={() => toggleTabs(-1, null)}>All</div>
                    {labelingTasks.map((labelingTask, index) => <div key={labelingTask.id}>
                        <div className={`cursor-pointer text-sm leading-5 font-medium mr-10 py-5 ${openTab == index ? 'text-indigo-700 border-bottom' : 'text-gray-500'}`} onClick={() => toggleTabs(index, labelingTask)}>{labelingTask.name}</div>
                    </div>)}
                    <Tooltip color="invert" placement="right" content={TOOLTIPS_DICT.MODEL_CALLBACKS.ADD_LABELING_TASK} >
                        <button onClick={() => router.push(`/projects/${project.id}/settings`)}>
                            <IconPlus size={20} strokeWidth={1.5} className="text-gray-500 cursor-pointer" />
                        </button>
                    </Tooltip>
                </div>
                <div className="grid grid-cols-1 gap-4 xs:flex xs:gap-0 flex-row items-center">
                    {modelCallbacks && modelCallbacks.length > 0 ? (
                        <Dropdown options={ACTIONS_DROPDOWN_OPTIONS} buttonName="Actions" disabledOptions={[false, false, modelCallbacks.every((checked) => !checked)]}
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
                        <Tooltip placement="left" content={TOOLTIPS_DICT.MODEL_CALLBACKS.NAVIGATE_HEURISTICS} color="invert">
                            <button onClick={() => {
                                router.push(`/projects/${project.id}/heuristics`)
                            }} className="bg-white text-gray-700 text-xs font-medium mr-3 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Heuristics
                            </button>
                        </Tooltip>
                    </div>

                    <div className="flex justify-center overflow-visible">
                        <Tooltip placement="left" content={TOOLTIPS_DICT.MODEL_CALLBACKS.NAVIGATE_LOOKUP_LISTS} color="invert">
                            <button onClick={() => {
                                router.push(`/projects/${project.id}/lookup-lists`)
                            }} className=" bg-white text-gray-700 text-xs font-medium mr-3 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Lookup lists
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div >

            {modelCallbacks?.length == 0 ? (
                <div className="text-gray-500 font-normal mt-8">
                    <p className="text-xl leading-7">Seems like your project has no callbacks yet.</p>
                    <p className="text-base mt-3 leading-6">You can create one from the <a
                        href="https://github.com/code-kern-ai/refinery-python-sdk" target="_blank"><span
                            className="underline cursor-pointer">Python SDK</span></a>, if you want
                        to dive deeper.</p>
                </div>
            ) : (<>
                {/* TODO: import the shared component grid (used for model callbacks and heuristics) */}

                <Modal modalName={ModalEnum.DELETE_MODEL_CALLBACKS} abortButton={abortButton}>
                    <h1 className="text-lg text-gray-900 mb-2">Warning</h1>
                    <div className="text-sm text-gray-500 my-2 flex flex-col">
                        <span>Are you sure you want to delete selected model {countSelected <= 1 ? 'callback' : 'callbacks'}?</span>
                        <span>Currently selected {countSelected <= 1 ? 'is' : 'are'}:</span>
                        <span className="whitespace-pre-line font-bold">{selectionList}</span>
                    </div>
                </Modal>
            </>)}
        </div >
    </div >)
}