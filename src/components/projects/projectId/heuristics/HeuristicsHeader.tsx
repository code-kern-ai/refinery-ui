import LoadingIcon from '@/src/components/shared/loading/LoadingIcon';
import Modal from '@/src/components/shared/modal/Modal';
import Statuses from '@/src/components/shared/statuses/Statuses';
import { selectIsManaged } from '@/src/reduxStore/states/general';
import { openModal, selectModal } from '@/src/reduxStore/states/modal';
import { selectHeuristicsAll, setHeuristicType } from '@/src/reduxStore/states/pages/heuristics';
import { selectLabelingTasksAll } from '@/src/reduxStore/states/pages/settings';
import { selectProjectId } from '@/src/reduxStore/states/project';
import { WebSocketsService } from '@/src/services/base/web-sockets/WebSocketsService';
import { unsubscribeWSOnDestroy } from '@/src/services/base/web-sockets/web-sockets-helper';
import { CREATE_INFORMATION_SOURCE_PAYLOAD, DELETE_HEURISTIC, RUN_ZERO_SHOT_PROJECT, SET_ALL_HEURISTICS, START_WEAK_SUPERVISIONS } from '@/src/services/gql/mutations/heuristics';
import { GET_CURRENT_WEAK_SUPERVISION_RUN } from '@/src/services/gql/queries/heuristics';
import style from '@/src/styles/components/projects/projectId/heuristics/heuristics.module.css';
import { Heuristic, HeuristicsHeaderProps } from '@/src/types/components/projects/projectId/heuristics/heuristics';
import { LabelingTask } from '@/src/types/components/projects/projectId/settings/labeling-tasks';
import { CurrentPage } from '@/src/types/shared/general';
import { ModalButton, ModalEnum } from '@/src/types/shared/modal';
import { Status } from '@/src/types/shared/statuses';
import { ACTIONS_DROPDOWN_OPTIONS, NEW_HEURISTICS, checkSelectedHeuristics, postProcessCurrentWeakSupervisionRun } from '@/src/util/components/projects/projectId/heuristics/heuristics-helper';
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants';
import { InformationSourceType } from '@/submodules/javascript-functions/enums/enums';
import Dropdown from '@/submodules/react-components/components/Dropdown';
import { useLazyQuery, useMutation } from '@apollo/client';
import { Tooltip } from '@nextui-org/react';
import { IconPlus, IconWaveSine } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LastWeakSupervisionModal from './modals/LastWeakSupervisionModal';

const ABORT_BUTTON = { buttonCaption: "Delete", useButton: true, disabled: false };

export default function HeuristicsHeader(props: HeuristicsHeaderProps) {
    const dispatch = useDispatch();
    const router = useRouter();

    const isManaged = useSelector(selectIsManaged);
    const projectId = useSelector(selectProjectId);
    const heuristics = useSelector(selectHeuristicsAll);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const modalDelete = useSelector(selectModal(ModalEnum.DELETE_HEURISTICS));

    const [openTab, setOpenTab] = useState(-1);
    const [selectionList, setSelectionList] = useState('');
    const [countSelected, setCountSelected] = useState(0);
    const [areHeuristicsSelected, setAreHeuristicsSelected] = useState(false);
    const [areValidHeuristicsSelected, setAreValidHeuristicsSelected] = useState(false);
    const [currentWeakSupervisionRun, setCurrentWeakSupervisionRun] = useState(null);

    const [setHeuristicsMut] = useMutation(SET_ALL_HEURISTICS);
    const [deleteHeuristicMut] = useMutation(DELETE_HEURISTIC);
    const [startWeakSupervisionMut] = useMutation(START_WEAK_SUPERVISIONS);
    const [refetchCurrentWeakSupervision] = useLazyQuery(GET_CURRENT_WEAK_SUPERVISION_RUN, { fetchPolicy: "network-only" });
    const [createTaskMut] = useMutation(CREATE_INFORMATION_SOURCE_PAYLOAD);
    const [runZeroShotMut] = useMutation(RUN_ZERO_SHOT_PROJECT);

    useEffect(unsubscribeWSOnDestroy(router, [CurrentPage.HEURISTICS]), []);

    useEffect(() => {
        if (!projectId) return;
        WebSocketsService.subscribeToNotification(CurrentPage.HEURISTICS, {
            projectId: projectId,
            whitelist: ['weak_supervision_started', 'weak_supervision_finished'],
            func: handleWebsocketNotification
        });
    }, [projectId]);

    const deleteHeuristics = useCallback(() => {
        heuristics.forEach((heuristic) => {
            if (heuristic.selected) {
                deleteHeuristicMut({ variables: { projectId: projectId, informationSourceId: heuristic.id } }).then(() => props.refetch());
            }
        });
    }, [modalDelete]);

    useEffect(() => {
        if (!heuristics) return;
        setAreHeuristicsSelected(checkSelectedHeuristics(heuristics, false));
        setAreValidHeuristicsSelected(checkSelectedHeuristics(heuristics, true));
        refetchCurrentWeakSupervisionAndProcess();
    }, [heuristics]);

    useEffect(() => {
        setAbortButton({ ...ABORT_BUTTON, emitFunction: deleteHeuristics });
        prepareSelectionList();
    }, [modalDelete]);

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    function refetchCurrentWeakSupervisionAndProcess() {
        refetchCurrentWeakSupervision({ variables: { projectId: projectId } }).then((res) => {
            if (res == null) {
                setCurrentWeakSupervisionRun({ state: Status.NOT_YET_RUN });
            } else {
                setCurrentWeakSupervisionRun(postProcessCurrentWeakSupervisionRun(res['data']['currentWeakSupervisionRun']));
            }
        });
    }

    function toggleTabs(index: number, labelingTask: LabelingTask | null) {
        setOpenTab(index);
        props.filterList(labelingTask);
    }

    function executeOption(option: string) {
        switch (option) {
            case 'Labeling function':
                dispatch(setHeuristicType(InformationSourceType.LABELING_FUNCTION));
                dispatch(openModal(ModalEnum.ADD_LABELING_FUNCTION));
                break;
            case 'Active learning':
                dispatch(setHeuristicType(InformationSourceType.ACTIVE_LEARNING));
                dispatch(openModal(ModalEnum.ADD_ACTIVE_LEARNER));
                break;
            case 'Zero-shot':
                dispatch(setHeuristicType(InformationSourceType.ZERO_SHOT));
                dispatch(openModal(ModalEnum.ADD_ZERO_SHOT));
                break;
            case 'Crowd labeler':
                dispatch(setHeuristicType(InformationSourceType.CROWD_LABELER));
                dispatch(openModal(ModalEnum.ADD_CROWD_LABELER));
                break;
            case 'Select all':
                selectHeuristics(true);
                break;
            case 'Deselect all':
                selectHeuristics(false);
                break;
            case 'Run selected':
                runSelectedHeuristics();
                break;
            case 'Delete selected':
                prepareSelectionList();
                dispatch(openModal(ModalEnum.DELETE_HEURISTICS));
                break;
        }
    }

    function runSelectedHeuristics() {
        heuristics.forEach((heuristic: Heuristic) => {
            if (heuristic.selected) {
                runHeuristic(heuristic.informationSourceType, heuristic.id);
            }
        });
    }

    function runHeuristic(type: InformationSourceType, id: string) {
        if (type == InformationSourceType.ZERO_SHOT) {
            runZeroShotMut({ variables: { projectId: projectId, informationSourceId: id } }).then(() => { });
        } else if (type == InformationSourceType.CROWD_LABELER) {
        } else {
            createTaskMut({ variables: { projectId: projectId, informationSourceId: id } }).then(() => { });
        }
    }

    function selectHeuristics(checked: boolean) {
        setHeuristicsMut({ variables: { projectId: projectId, value: checked } }).then(() => { props.refetch() });
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

    function startWeakSupervision() {
        startWeakSupervisionMut({ variables: { projectId: projectId } }).then(() => { });
    }

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (['weak_supervision_started', 'weak_supervision_finished'].includes(msgParts[1])) {
            setCurrentWeakSupervisionRun(null);
            refetchCurrentWeakSupervisionAndProcess();
        }
    }, []);

    useEffect(() => {
        if (!projectId) return;
        WebSocketsService.updateFunctionPointer(projectId, CurrentPage.HEURISTICS, handleWebsocketNotification)
    }, [handleWebsocketNotification, projectId]);

    return (
        <div className="flex-shrink-0 block xl:flex justify-between items-center">
            <div className={`flex ${style.widthLine} border-b-2 border-b-gray-200 max-w-full overflow-x-auto`}>
                <div className={`cursor-pointer text-sm leading-5 font-medium mr-10 py-5 ${openTab == -1 ? 'text-indigo-700 ' + style.borderBottom : 'text-gray-500'}`} onClick={() => toggleTabs(-1, null)}>All</div>
                {labelingTasks && labelingTasks.map((labelingTask, index) => <div key={labelingTask.id}>
                    <div className={`cursor-pointer text-sm leading-5 font-medium mr-10 py-5 ${openTab == index ? 'text-indigo-700 ' + style.borderBottom : 'text-gray-500'}`} onClick={() => toggleTabs(index, labelingTask)}>{labelingTask.name}</div>
                </div>)}
                <Tooltip color="invert" placement="right" content={TOOLTIPS_DICT.HEURISTICS.ADD_LABELING_TASK} >
                    <button onClick={() => router.push(`/projects/${projectId}/settings`)}>
                        <IconPlus size={20} strokeWidth={1.5} className="text-gray-500 cursor-pointer" />
                    </button>
                </Tooltip>
            </div>
            <div className="grid grid-cols-1 gap-4 xs:flex xs:gap-0 flex-row items-center mt-2 xl:mt-0">
                {labelingTasks && labelingTasks.length > 0 ? (<Tooltip content={TOOLTIPS_DICT.HEURISTICS.ENABLED_NEW_HEURISTIC} color="invert" placement="right">
                    <Dropdown options={NEW_HEURISTICS} buttonName="New heuristic" tooltipsArray={[null, null, null, isManaged ? null : 'Only available for managed projects']}
                        disabledOptions={[false, false, !(labelingTasks && labelingTasks.length > 0), !isManaged]}
                        selectedOption={(option: string) => executeOption(option)} buttonClasses={`${style.actionsHeight} text-xs whitespace-nowrap`} dropdownClasses="mr-3" dropdownItemsWidth='w-36' dropdownWidth='w-32' />
                </Tooltip>) : (<Tooltip content={TOOLTIPS_DICT.HEURISTICS.DISABLED_NEW_HEURISTIC} color="invert">
                    <button type="button" disabled={true}
                        className="mr-3 inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-1.5 bg-white text-xs font-medium text-gray-700 opacity-50 cursor-not-allowed focus:ring-offset-2 focus:ring-offset-gray-400"
                        id="menu-button" aria-expanded="true" aria-haspopup="true">
                        New heuristic
                        <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                            fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd" />
                        </svg>
                    </button>
                </Tooltip>)}

                {heuristics && heuristics.length > 0 ? (
                    <Dropdown options={ACTIONS_DROPDOWN_OPTIONS} buttonName="Actions" disabledOptions={[false, false, heuristics.every((checked) => !checked), heuristics.every((checked) => !checked)]}
                        selectedOption={(option: string) => executeOption(option)} dropdownClasses="mr-3" buttonClasses={`${style.actionsHeight} text-xs`} dropdownItemsWidth='w-36' dropdownWidth='w-32' />
                ) : (
                    <Tooltip placement="left" content={TOOLTIPS_DICT.HEURISTICS.ENABLE_ACTIONS} color="invert">
                        <button type="button" disabled={true}
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
                    {areHeuristicsSelected ? (<>
                        {areValidHeuristicsSelected ? (
                            <Tooltip content={TOOLTIPS_DICT.HEURISTICS.WEAK_SUPERVISION} color="invert" placement="right">
                                <button onClick={startWeakSupervision}
                                    className="bg-indigo-700 text-white text-xs font-semibold mr-3 px-4 py-2 rounded-md border hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Weak supervision
                                </button>
                            </Tooltip>
                        ) : (<Tooltip content={TOOLTIPS_DICT.HEURISTICS.SELECT_AT_LEAST_ONE_VALID_HEURISTIC} color="invert" placement="left">
                            <button className="bg-indigo-700 text-white text-xs font-semibold mr-3 px-4 py-2 rounded-md border opacity-50 cursor-not-allowed" disabled={true}>
                                Weak supervision
                            </button>
                        </Tooltip>)}
                    </>) : (<Tooltip content={TOOLTIPS_DICT.HEURISTICS.SELECT_AT_LEAST_ONE_HEURISTIC} color="invert" placement="left">
                        <button className="bg-indigo-700 text-white text-xs font-semibold mr-3 px-4 py-2 rounded-md border opacity-50 cursor-not-allowed" disabled={true}>
                            Weak supervision
                            {currentWeakSupervisionRun?.state == 'CREATED' && <LoadingIcon color="indigo" />}
                        </button>
                    </Tooltip>)}
                </div>

                <div className="flex justify-center overflow-visible">
                    {currentWeakSupervisionRun ? (<Tooltip content={TOOLTIPS_DICT.HEURISTICS.LAST_WEAK_SUPERVISION_INFO} color="invert" placement="left">
                        <button onClick={() => dispatch(openModal(ModalEnum.LAST_WEAK_SUPERVISION_RUN))}
                            className="bg-white text-gray-700 text-xs font-medium mr-3 px-4 py-1.5 rounded-md border border-gray-300 cursor-pointer inline-block hover:bg-gray-50">
                            <IconWaveSine size={20} strokeWidth={1.5} className="text-gray-500 mr-2" />
                        </button>
                    </Tooltip>) : (<Tooltip content={TOOLTIPS_DICT.HEURISTICS.LAST_WEAK_SUPERVISION_INFO} color="invert" placement="left">
                        <button className="bg-white text-gray-700 text-xs font-medium mr-3 px-4 py-1.5 rounded-md border border-gray-300 cursor-pointer inline-block hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={true}>
                            <IconWaveSine size={20} strokeWidth={1.5} className="text-gray-500 mr-2" />
                        </button>
                    </Tooltip>)}
                </div>

                <div className="flex justify-center overflow-visible">
                    <Tooltip placement="left" content={TOOLTIPS_DICT.HEURISTICS.NAVIGATE_MODEL_CALLBACKS} color="invert">
                        <button onClick={() => {
                            router.push(`/projects/${projectId}/model-callbacks`)
                        }} className="bg-white text-gray-700 text-xs font-medium mr-3 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Model callbacks
                        </button>
                    </Tooltip>
                </div>

                <div className="flex justify-center overflow-visible">
                    <Tooltip placement="left" content={TOOLTIPS_DICT.HEURISTICS.NAVIGATE_LOOKUP_LISTS} color="invert">
                        <button onClick={() => {
                            router.push(`/projects/${projectId}/lookup-lists`)
                        }} className=" bg-white text-gray-700 text-xs font-medium mr-3 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Lookup lists
                        </button>
                    </Tooltip>
                </div>
            </div>

            <Modal modalName={ModalEnum.DELETE_HEURISTICS} abortButton={abortButton}>
                <h1 className="text-lg text-gray-900 mb-2">Warning</h1>
                <div className="text-sm text-gray-500 my-2 flex flex-col">
                    <span>Are you sure you want to delete selected {countSelected <= 1 ? 'heuristic' : 'heuristics'}?</span>
                    <span>Currently selected {countSelected <= 1 ? 'is' : 'are'}:</span>
                    <span className="whitespace-pre-line font-bold">{selectionList}</span>
                </div>
            </Modal>
            <LastWeakSupervisionModal currentWeakSupervisionRun={currentWeakSupervisionRun} />
        </div >
    )
}