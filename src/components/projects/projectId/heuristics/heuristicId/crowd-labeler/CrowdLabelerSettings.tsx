import { selectAnnotators, selectAnnotatorsDict } from "@/src/reduxStore/states/general";
import { selectHeuristic, updateHeuristicsState } from "@/src/reduxStore/states/pages/heuristics";
import { selectLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProject } from "@/src/reduxStore/states/project";
import { UPDATE_INFORMATION_SOURCE } from "@/src/services/gql/mutations/heuristics";
import { parseToSettingsJson } from "@/src/util/components/projects/projectId/heuristics/heuristicId/crowd-labeler-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { copyToClipboard, jsonCopy } from "@/submodules/javascript-functions/general";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { useDispatch, useSelector } from "react-redux";

export default function CrowdLabelerSettings() {
    const dispatch = useDispatch();

    const project = useSelector(selectProject);
    const currentHeuristic = useSelector(selectHeuristic);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const annotators = useSelector(selectAnnotators);
    const annotatorsDict = useSelector(selectAnnotatorsDict);

    const [updateHeuristicMut] = useMutation(UPDATE_INFORMATION_SOURCE);

    function saveHeuristic(labelingTaskName: string, crowdLabelerSettings: any = null) {
        const labelingTask = labelingTaskName ? labelingTasks.find(a => a.name == labelingTaskName) : labelingTasks.find(a => a.id == currentHeuristic.labelingTaskId);
        const code = parseToSettingsJson(crowdLabelerSettings ? crowdLabelerSettings : currentHeuristic.crowdLabelerSettings);
        updateHeuristicMut({ variables: { projectId: project.id, informationSourceId: currentHeuristic.id, labelingTaskId: labelingTask.id, code: code } }).then((res) => {
            dispatch(updateHeuristicsState(currentHeuristic.id, { labelingTaskId: labelingTask.id, labelingTaskName: labelingTask.name, labels: labelingTask.labels }))
        });
    }

    function changeSettings(attributeName: string, newValue: any, saveToDb: boolean = true) {
        const crowdLabelerSettingsCopy = jsonCopy(currentHeuristic.crowdLabelerSettings);
        crowdLabelerSettingsCopy[attributeName] = annotators.find(a => a.mail == newValue)?.id ?? newValue;
        dispatch(updateHeuristicsState(currentHeuristic.id, { crowdLabelerSettings: crowdLabelerSettingsCopy }));
        if (saveToDb) saveHeuristic(null, crowdLabelerSettingsCopy);
    }

    return (<>
        {currentHeuristic.crowdLabelerSettings && <div className="mt-8 text-sm text-gray-700 leading-5">
            <div className="font-medium">Settings</div>
            <div className="font-normal mt-2">Labeling task</div>
            <div className="relative flex-shrink-0 min-h-16 flex justify-between pb-2">
                <div className="flex items-center flex-wrap mt-3">
                    <div className="text-sm leading-5 font-medium text-gray-700 inline-block mr-2">Editor</div>
                    <Tooltip content={TOOLTIPS_DICT.LABELING_FUNCTION.LABELING_TASK} color="invert" placement="top">
                        <Dropdown options={labelingTasks.map(a => a.name)} buttonName={currentHeuristic?.labelingTaskName} selectedOption={(option: string) => saveHeuristic(option)} />
                    </Tooltip>
                    {currentHeuristic.labels?.length == 0 ? (<div className="text-sm font-normal text-gray-500 ml-3">No labels for target task</div>) : <>
                        {currentHeuristic.labels?.map((label: any, index: number) => (
                            <Tooltip content={TOOLTIPS_DICT.HEURISTICS.CLICK_TO_COPY} color="invert" placement="top" key={label.name}>
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
                    <Dropdown options={annotators.map(u => u.mail)} buttonName={annotatorsDict[currentHeuristic?.crowdLabelerSettings?.annotatorId]?.mail ?? 'Select annotator'}
                        disabled={annotators.length == 0} selectedOption={(option) => changeSettings('annotatorId', option)} />

                </Tooltip>
                {/* <kern-dropdown [dropdownOptions]="{
                                optionArray:annotators,
                                buttonCaption:crowdSettings.annotatorId?annotatorLookup[crowdSettings.annotatorId]?.mail:'Select annotator',
                                buttonTooltip: 'Select an annotator',
                                valuePropertyPath:'id',
                                isDisabled:annotators.length == 0,
                                isDisabled:informationSource?.lastTask ? informationSource?.lastTask.progress !=0:false
                            }" (optionClicked)="changeSettings('annotatorId',$event)">
                            </kern-dropdown> */}
                <p className="px-2"> is going to work on slice </p>
                {/* <kern-dropdown [dropdownOptions]="{
                                optionArray:dataSlices,
                                buttonCaption:crowdSettings.dataSliceId?sliceLookup[crowdSettings.dataSliceId]?.name:'Select slice',
                                buttonTooltip: 'Select a static slice',
                                valuePropertyPath:'id',
                                isDisabled:dataSlices.length == 0,
                                isDisabled:informationSource?.lastTask ? informationSource?.lastTask.progress !=0:false
                            }" (optionClicked)="changeSettings('dataSliceId',$event)">
                            </kern-dropdown> */}

            </div>
        </div>}
    </>);
}