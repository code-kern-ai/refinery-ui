import LoadingIcon from '@/src/components/shared/loading/LoadingIcon';
import { selectIsManaged } from '@/src/reduxStore/states/general';
import { openModal, selectModal } from '@/src/reduxStore/states/modal';
import { selectHeuristicsAll, setHeuristicType } from '@/src/reduxStore/states/pages/heuristics';
import { selectLabelingTasksAll } from '@/src/reduxStore/states/pages/settings';
import { selectProjectId } from '@/src/reduxStore/states/project';
import { CREATE_INFORMATION_SOURCE_PAYLOAD, RUN_ZERO_SHOT_PROJECT, SET_ALL_HEURISTICS, START_WEAK_SUPERVISIONS } from '@/src/services/gql/mutations/heuristics';
import { GET_CURRENT_WEAK_SUPERVISION_RUN } from '@/src/services/gql/queries/heuristics';
import style from '@/src/styles/components/projects/projectId/heuristics/heuristics.module.css';
import { Heuristic, HeuristicsHeaderProps } from '@/src/types/components/projects/projectId/heuristics/heuristics';
import { LabelingTask } from '@/src/types/components/projects/projectId/settings/labeling-tasks';
import { CurrentPage } from '@/src/types/shared/general';
import { ModalEnum } from '@/src/types/shared/modal';
import { Status } from '@/src/types/shared/statuses';
import { ACTIONS_DROPDOWN_OPTIONS, NEW_HEURISTICS, checkSelectedHeuristics, postProcessCurrentWeakSupervisionRun } from '@/src/util/components/projects/projectId/heuristics/heuristics-helper';
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants';
import { InformationSourceType } from '@/submodules/javascript-functions/enums/enums';
import { useLazyQuery, useMutation } from '@apollo/client';
import { Tooltip } from '@nextui-org/react';
import { IconPlus, IconWaveSine } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LastWeakSupervisionModal from './modals/LastWeakSupervisionModal';
import DeleteHeuristicsModal from './DeleteHeuristicsModal';
import Dropdown2 from '@/submodules/react-components/components/Dropdown2';
import { useWebsocket } from '@/src/services/base/web-sockets/useWebsocket';


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
    const [loadingIconWS, setLoadingIconWS] = useState(false);

    const [setHeuristicsMut] = useMutation(SET_ALL_HEURISTICS);
    const [startWeakSupervisionMut] = useMutation(START_WEAK_SUPERVISIONS);
    const [refetchCurrentWeakSupervision] = useLazyQuery(GET_CURRENT_WEAK_SUPERVISION_RUN, { fetchPolicy: "network-only" });
    const [createTaskMut] = useMutation(CREATE_INFORMATION_SOURCE_PAYLOAD);
    const [runZeroShotMut] = useMutation(RUN_ZERO_SHOT_PROJECT);

    useEffect(() => {
        if (!heuristics) return;
        setAreHeuristicsSelected(checkSelectedHeuristics(heuristics, false));
        setAreValidHeuristicsSelected(checkSelectedHeuristics(heuristics, true));
        refetchCurrentWeakSupervisionAndProcess();
    }, [heuristics]);

    useEffect(() => {
        prepareSelectionList();
    }, [modalDelete]);


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
        setLoadingIconWS(true);
        startWeakSupervisionMut({ variables: { projectId: projectId } }).then(() => {
            setLoadingIconWS(false);
        });
    }

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (['weak_supervision_started', 'weak_supervision_finished'].includes(msgParts[1])) {
            setCurrentWeakSupervisionRun(null);
            refetchCurrentWeakSupervisionAndProcess();
        }
    }, []);

    useWebsocket(CurrentPage.HEURISTICS, handleWebsocketNotification, projectId);

    return (
        <div className="flex-shrink-0 block xl:flex justify-between items-center">
            <div className={`flex ${style.widthLine} border-b-2 border-b-gray-200 max-w-full overflow-x-auto`}>
                <div className={`cursor-pointer text-sm leading-5 font-medium mr-10 py-5 ${openTab == -1 ? 'text-indigo-700 ' + style.borderBottom : 'text-gray-500'}`} onClick={() => toggleTabs(-1, null)}>All</div>
                {labelingTasks && labelingTasks.map((labelingTask, index) => <div key={labelingTask.id}>
                    <div className={`cursor-pointer text-sm leading-5 font-medium mr-10 py-5 ${openTab == index ? 'text-indigo-700 ' + style.borderBottom : 'text-gray-500'}`} onClick={() => toggleTabs(index, labelingTask)}>{labelingTask.name}</div>
                </div>)}
                <Tooltip color="invert" placement="right" content={TOOLTIPS_DICT.HEURISTICS.ADD_LABELING_TASK} >
                    <button onClick={() => {
                        localStorage.setItem('openModal', 'true');
                        router.push(`/projects/${projectId}/settings`);
                    }}>
                        <IconPlus size={20} strokeWidth={1.5} className="text-gray-500 cursor-pointer" />
                    </button>
                </Tooltip>
            </div>
            <div className="grid grid-cols-1 gap-4 xs:flex xs:gap-0 flex-row items-center mt-2 xl:mt-0">
                {labelingTasks && labelingTasks.length > 0 ? (<Tooltip content={TOOLTIPS_DICT.HEURISTICS.ENABLED_NEW_HEURISTIC} color="invert" placement="right">
                    <Dropdown2 options={NEW_HEURISTICS} buttonName="New heuristic" tooltipsArray={[null, null, null, isManaged ? null : 'Only available for managed projects']}
                        disabledOptions={[false, false, !(labelingTasks && labelingTasks.length > 0), !isManaged]}
                        selectedOption={(option: string) => executeOption(option)} buttonClasses={`${style.actionsHeight} text-xs whitespace-nowrap`} dropdownClasses="mr-3" dropdownItemsWidth='w-40' dropdownWidth='w-32'
                        iconsArray={['IconCode', 'IconBolt', 'IconSparkles', 'IconUsers']} useFillForIcons={[false, true, true, false]} />
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
                    <Dropdown2 options={ACTIONS_DROPDOWN_OPTIONS} buttonName="Actions" disabledOptions={[false, false, heuristics.every((checked) => !checked.selected), heuristics.every((checked) => !checked.selected)]}
                        selectedOption={(option: string) => executeOption(option)} dropdownClasses="mr-3" buttonClasses={`${style.actionsHeight} text-xs`} dropdownItemsWidth='w-40' dropdownWidth='w-32'
                        iconsArray={['IconSquareCheck', 'IconSquare', 'IconPlayerPlayFilled', 'IconTrash']} />
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
                                    className="bg-indigo-700 flex items-center text-white text-xs font-semibold mr-3 px-4 py-2 rounded-md border hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Weak supervision
                                    {loadingIconWS && <LoadingIcon color="indigo" size="xs" />}
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
                            <IconWaveSine size={20} strokeWidth={2} className="text-gray-700" />
                        </button>
                    </Tooltip>) : (<Tooltip content={TOOLTIPS_DICT.HEURISTICS.LAST_WEAK_SUPERVISION_INFO} color="invert" placement="left">
                        <button className="bg-white text-gray-700 text-xs font-medium mr-3 px-4 py-1.5 rounded-md border border-gray-300 cursor-pointer inline-block hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={true}>
                            <IconWaveSine size={20} strokeWidth={2} className="text-gray-500" />
                        </button>
                    </Tooltip>)}
                </div>

                <div className="flex justify-center overflow-visible">
                    <Tooltip placement="left" content={TOOLTIPS_DICT.HEURISTICS.NAVIGATE_MODEL_CALLBACKS} color="invert">
                        <a href={`/refinery/projects/${projectId}/model-callbacks`} onClick={(e: any) => { e.preventDefault(); router.push(`/projects/${projectId}/model-callbacks`) }}
                            className="bg-white text-gray-700 text-xs font-medium mr-3 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Model callbacks
                        </a>
                    </Tooltip>
                </div>

                <div className="flex justify-center overflow-visible">
                    <Tooltip placement="left" content={TOOLTIPS_DICT.HEURISTICS.NAVIGATE_LOOKUP_LISTS} color="invert">
                        <a href={`/refinery/projects/${projectId}/lookup-lists`} onClick={(e: any) => { e.preventDefault(); router.push(`/projects/${projectId}/lookup-lists`) }}
                            className=" bg-white text-gray-700 text-xs font-medium mr-3 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Lookup lists
                        </a>
                    </Tooltip>
                </div>
            </div>

            <DeleteHeuristicsModal selectionList={selectionList} countSelected={countSelected} refetch={props.refetch} />
            <LastWeakSupervisionModal currentWeakSupervisionRun={currentWeakSupervisionRun} />
        </div >
    )
}