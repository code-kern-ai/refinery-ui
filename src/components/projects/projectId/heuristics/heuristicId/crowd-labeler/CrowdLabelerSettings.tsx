import { selectAnnotators, selectAnnotatorsDict } from "@/src/reduxStore/states/general";
import { selectDataSlicesAll, selectDataSlicesDict } from "@/src/reduxStore/states/pages/data-browser";
import { selectHeuristic, updateHeuristicsState } from "@/src/reduxStore/states/pages/heuristics";
import { selectLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { CREATE_ACCESS_LINK, LOCK_ACCESS_LINK, REMOVE_ACCESS_LINK, UPDATE_INFORMATION_SOURCE } from "@/src/services/gql/mutations/heuristics";
import { GET_ACCESS_LINK } from "@/src/services/gql/queries/heuristics";
import { parseToSettingsJson } from "@/src/util/components/projects/projectId/heuristics/heuristicId/crowd-labeler-helper";
import { buildFullLink, parseLinkFromText } from "@/src/util/shared/link-parser-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { copyToClipboard } from "@/submodules/javascript-functions/general";
import Dropdown2 from "@/submodules/react-components/components/Dropdown2";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { IconLock, IconLockOpen, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function CrowdLabelerSettings() {
    const dispatch = useDispatch();
    const router = useRouter();

    const projectId = useSelector(selectProjectId);
    const currentHeuristic = useSelector(selectHeuristic);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const annotators = useSelector(selectAnnotators);
    const annotatorsDict = useSelector(selectAnnotatorsDict);
    const dataSlices = useSelector(selectDataSlicesAll);
    const dataSlicesDict = useSelector(selectDataSlicesDict);

    const [updateHeuristicMut] = useMutation(UPDATE_INFORMATION_SOURCE);
    const [createAccessLinkMut] = useMutation(CREATE_ACCESS_LINK);
    const [removeAccessLinkMut] = useMutation(REMOVE_ACCESS_LINK);
    const [refetchAccessLink] = useLazyQuery(GET_ACCESS_LINK, { fetchPolicy: 'cache-first' });
    const [changeAccessLinkMut] = useMutation(LOCK_ACCESS_LINK);

    useEffect(() => {
        if (!projectId || !currentHeuristic.crowdLabelerSettings.accessLinkId) return;
        refetchAccessLink({ variables: { projectId: projectId, linkId: currentHeuristic.crowdLabelerSettings.accessLinkId } }).then((res) => {
            if (!res?.data?.accessLink?.id) {
                dispatch(updateHeuristicsState(currentHeuristic.id, { crowdLabelerSettings: { ...currentHeuristic.crowdLabelerSettings, accessLinkId: null, accessLinkParsed: null } }));
                return;
            }
            fillLinkData(res.data.accessLink);
        });
    }, [projectId, currentHeuristic.crowdLabelerSettings.accessLinkId]);

    function saveHeuristic(labelingTaskParam: any, crowdLabelerSettings: any = null) {
        const labelingTask = labelingTaskParam ? labelingTaskParam.id : currentHeuristic.labelingTaskId;
        const code = parseToSettingsJson(crowdLabelerSettings ? crowdLabelerSettings : currentHeuristic.crowdLabelerSettings);
        updateHeuristicMut({ variables: { projectId: projectId, informationSourceId: currentHeuristic.id, labelingTaskId: labelingTask, code: code } }).then((res) => {
            dispatch(updateHeuristicsState(currentHeuristic.id, { labelingTaskId: labelingTask.id, labelingTaskName: labelingTask.name, labels: labelingTask.labels }));
        });
    }

    function changeSettings(attributeName: string, newValue: any, saveToDb: boolean = true) {
        const crowdLabelerSettingsCopy = { ...currentHeuristic.crowdLabelerSettings };
        if (attributeName == 'annotatorId') {
            crowdLabelerSettingsCopy[attributeName] = annotators.find(a => a.mail == newValue.mail)?.id ?? newValue;
        } else if (attributeName == 'dataSliceId') {
            crowdLabelerSettingsCopy[attributeName] = dataSlices.find(a => a.name == newValue)?.id ?? newValue;
        }
        dispatch(updateHeuristicsState(currentHeuristic.id, { crowdLabelerSettings: crowdLabelerSettingsCopy }));
        if (saveToDb) saveHeuristic(null, crowdLabelerSettingsCopy);
    }

    function generateAccessLink() {
        createAccessLinkMut({ variables: { projectId: projectId, type: "HEURISTIC", id: currentHeuristic.id } }).then((res) => {
            const link = res.data.generateAccessLink.link;
            const labelingTask = currentHeuristic.labelingTaskId;
            const code = parseToSettingsJson({ ...currentHeuristic.crowdLabelerSettings, accessLinkId: link.id });
            updateHeuristicMut({ variables: { projectId: projectId, informationSourceId: currentHeuristic.id, labelingTaskId: labelingTask, code: code } }).then((res) => {
                dispatch(updateHeuristicsState(currentHeuristic.id, { crowdLabelerSettings: { ...currentHeuristic.crowdLabelerSettings, accessLinkId: link.id, accessLinkLocked: link.isLocked, accessLinkParsed: buildFullLink(link.link), isHTTPS: window.location.protocol == 'https:' } }));
            });
        });
    }

    function removeAccessLink() {
        removeAccessLinkMut({ variables: { projectId: projectId, linkId: currentHeuristic.crowdLabelerSettings.accessLinkId } }).then((res) => {
            dispatch(updateHeuristicsState(currentHeuristic.id, { crowdLabelerSettings: { ...currentHeuristic.crowdLabelerSettings, accessLink: null, accessLinkId: null, accessLinkParsed: null } }));
            const labelingTask = currentHeuristic.labelingTaskId;
            const code = parseToSettingsJson({ ...currentHeuristic.crowdLabelerSettings, accessLinkId: null });
            updateHeuristicMut({ variables: { projectId: projectId, informationSourceId: currentHeuristic.id, labelingTaskId: labelingTask, code: code } }).then((res) => {
                dispatch(updateHeuristicsState(currentHeuristic.id, { crowdLabelerSettings: { ...currentHeuristic.crowdLabelerSettings, accessLink: null, accessLinkId: null, accessLinkParsed: null } }));
            });
        });
    }

    function fillLinkData(linkObj: any) {
        const link = linkObj.link;
        dispatch(updateHeuristicsState(currentHeuristic.id, { crowdLabelerSettings: { ...currentHeuristic.crowdLabelerSettings, accessLink: link, accessLinkParsed: buildFullLink(link), accessLinkLocked: linkObj.isLocked, isHTTPS: window.location.protocol == 'https:' } }));
    }

    function testLink() {
        const linkData = parseLinkFromText(currentHeuristic.crowdLabelerSettings.accessLink);
        router.push(linkData.route, { query: linkData.queryParams });
    }

    function changeAccessLinkLock() {
        if (!currentHeuristic.crowdLabelerSettings.accessLinkId) return;
        changeAccessLinkMut({ variables: { projectId: projectId, linkId: currentHeuristic.crowdLabelerSettings.accessLinkId, lockState: !currentHeuristic.crowdLabelerSettings.accessLinkLocked } }).then((res) => {
            dispatch(updateHeuristicsState(currentHeuristic.id, { crowdLabelerSettings: { ...currentHeuristic.crowdLabelerSettings, accessLinkLocked: !currentHeuristic.crowdLabelerSettings.accessLinkLocked } }));
        });
    }

    return (<>
        {currentHeuristic.crowdLabelerSettings && <div className="mt-8 text-sm text-gray-700 leading-5">
            <div className="font-medium">Settings</div>
            <div className="font-normal mt-2">Labeling task</div>
            <div className="relative flex-shrink-0 min-h-16 flex justify-between pb-2">
                <div className="flex items-center flex-wrap mt-3">
                    <div className="text-sm leading-5 font-medium text-gray-700 inline-block mr-2">Editor</div>
                    <Tooltip content={TOOLTIPS_DICT.LABELING_FUNCTION.LABELING_TASK} color="invert" placement="top">
                        <Dropdown2 options={labelingTasks} buttonName={currentHeuristic?.labelingTaskName} selectedOption={(option: any) => saveHeuristic(option)} />

                    </Tooltip>
                    {currentHeuristic.labels?.length == 0 ? (<div className="text-sm font-normal text-gray-500 ml-3">No labels for target task</div>) : <>
                        {currentHeuristic.labels?.map((label: any, index: number) => (
                            <Tooltip content={TOOLTIPS_DICT.GENERAL.CLICK_TO_COPY} color="invert" placement="top" key={label.name}>
                                <span onClick={() => copyToClipboard(label.name)}
                                    className={`inline-flex border items-center px-2 py-0.5 rounded text-xs font-medium cursor-pointer ml-3 ${label.color.backgroundColor} ${label.color.hoverColor} ${label.color.textColor} ${label.color.borderColor}`}>
                                    {label.name}
                                </span>
                            </Tooltip>
                        ))}
                    </>}
                </div>
            </div>
            <div className="font-normal mt-2">Annotator and slice</div>
            <div className="flex items-center">
                <Tooltip content={TOOLTIPS_DICT.CROWD_LABELER.SELECT_ANNOTATOR} color="invert" placement="right">

                    <Dropdown2 options={annotators} buttonName={annotatorsDict[currentHeuristic?.crowdLabelerSettings?.annotatorId]?.mail ?? 'Select annotator'}
                        disabled={annotators.length == 0} selectedOption={(option) => changeSettings('annotatorId', option)} valuePropertyPath="mail" />

                </Tooltip>
                <p className="px-2"> is going to work on slice </p>
                <Tooltip content={TOOLTIPS_DICT.CROWD_LABELER.SELECT_DATA_SLICE} color="invert" placement="right">
                    <Dropdown2 options={dataSlices} buttonName={dataSlicesDict[currentHeuristic?.crowdLabelerSettings?.dataSliceId]?.name ?? 'Select data slice'}
                        disabled={dataSlices.length == 0} selectedOption={(option) => changeSettings('dataSliceId', option.name)} />

                </Tooltip>
            </div>
            <div className="mt-4">
                <button onClick={generateAccessLink} disabled={!currentHeuristic.labelingTaskId || !currentHeuristic.crowdLabelerSettings.annotatorId || !currentHeuristic.crowdLabelerSettings.dataSliceId}
                    className="w-40 bg-indigo-700 text-white text-xs leading-4 font-semibold px-4 py-2 rounded-md cursor-pointer hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    Generate link</button>
                {currentHeuristic.crowdLabelerSettings.accessLinkParsed && <div className="mt-2">
                    <label className="text-sm font-medium text-gray-700">Heuristic URL</label>
                    <div className="mt-1 flex rounded-md">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">{currentHeuristic.crowdLabelerSettings.isHTTPS ? 'https://' : 'http://'}</span>
                        <Tooltip content={TOOLTIPS_DICT.CROWD_LABELER.COPY_TO_CLIPBOARD} color="invert" placement="top">
                            <span onClick={() => copyToClipboard(currentHeuristic.crowdLabelerSettings.accessLinkParsed)} style={{ backgroundColor: currentHeuristic.crowdLabelerSettings.accessLinkLocked ? '#f4f4f5' : null }}
                                className="cursor-pointer tooltip border rounded-none rounded-r-md border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                {currentHeuristic.crowdLabelerSettings.accessLinkParsed.substring(currentHeuristic.crowdLabelerSettings.isHTTPS ? 8 : 7)}
                            </span>
                        </Tooltip>
                    </div>
                    <div className="flex flex-row items-center mt-2 gap-2">
                        <button onClick={testLink}
                            className="opacity-100 w-40 bg-indigo-700 text-white text-xs leading-4 font-semibold px-4 py-2 rounded-md cursor-pointer hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            View as annotator
                        </button>
                        {currentHeuristic.crowdLabelerSettings.accessLinkLocked ? (<Tooltip content={TOOLTIPS_DICT.CROWD_LABELER.UNLOCK_ACCESS} color="invert" placement="top">
                            <button className="px-0 normal-case" onClick={changeAccessLinkLock}><IconLock size={24} stroke={2} /></button>
                        </Tooltip>) : (<Tooltip content={TOOLTIPS_DICT.CROWD_LABELER.LOCK_ACCESS} color="invert" placement="top">
                            <button className="px-0 normal-case" onClick={changeAccessLinkLock}><IconLockOpen size={24} stroke={2} /></button>
                        </Tooltip>)}
                        <Tooltip content={TOOLTIPS_DICT.CROWD_LABELER.REMOVE_LINK} color="invert" placement="top">
                            <button className="px-0 normal-case" onClick={removeAccessLink}>
                                <IconTrash size={24} stroke={2} />
                            </button>
                        </Tooltip>
                    </div>
                </div>}
            </div>
        </div >}
    </>);
}