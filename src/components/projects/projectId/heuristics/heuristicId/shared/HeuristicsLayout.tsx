import Statuses from "@/src/components/shared/statuses/Statuses";
import { selectHeuristic, updateHeuristicsState } from "@/src/reduxStore/states/pages/heuristics";
import { selectAllLookupLists, setAllLookupLists } from "@/src/reduxStore/states/pages/lookup-lists";
import { selectUsableAttributes, setAllAttributes } from "@/src/reduxStore/states/pages/settings";
import { selectProject } from "@/src/reduxStore/states/project"
import { UPDATE_INFORMATION_SOURCE } from "@/src/services/gql/mutations/heuristics";
import { LOOKUP_LISTS_BY_PROJECT_ID } from "@/src/services/gql/queries/lookup-lists";
import { GET_ATTRIBUTES_BY_PROJECT_ID } from "@/src/services/gql/queries/project-setting";
import { HeuristicsProperty } from "@/src/types/components/projects/projectId/heuristics/heuristicId/heuristics-details";
import { Attribute } from "@/src/types/components/projects/projectId/settings/data-schema";
import { postProcessLookupLists } from "@/src/util/components/projects/projectId/lookup-lists-helper";
import { postProcessingAttributes } from "@/src/util/components/projects/projectId/settings/data-schema-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { InformationSourceType } from "@/submodules/javascript-functions/enums/enums";
import { copyToClipboard } from "@/submodules/javascript-functions/general";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"

export default function HeuristicsLayout(props: any) {
    const dispatch = useDispatch();
    const router = useRouter();

    const project = useSelector(selectProject);
    const currentHeuristic = useSelector(selectHeuristic);
    const usableAttributes = useSelector(selectUsableAttributes).filter((attribute) => attribute.id != '@@NO_ATTRIBUTE@@');
    const lookupLists = useSelector(selectAllLookupLists);

    const [isHeaderNormal, setIsHeaderNormal] = useState(true);
    const [isNameOpen, setIsNameOpen] = useState(false);
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

    const [refetchAttributes] = useLazyQuery(GET_ATTRIBUTES_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchLookupLists] = useLazyQuery(LOOKUP_LISTS_BY_PROJECT_ID);
    const [updateHeuristicMut] = useMutation(UPDATE_INFORMATION_SOURCE);

    useEffect(() => {
        if (!project) return;
        if (usableAttributes.length == 0) {
            refetchAttributesAndProcess();
        }
        if (lookupLists.length == 0) {
            refetchLookupListsAndProcess();
        }
    }, [project]);

    function onScrollEvent(event: any) {
        if (!(event.target instanceof HTMLElement)) return;
        if ((event.target as HTMLElement).scrollTop > 0) {
            setIsHeaderNormal(false);
        } else {
            setIsHeaderNormal(true);
        }
    }

    function openProperty(open: boolean, property: string) {
        if (property == HeuristicsProperty.NAME) setIsNameOpen(open);
        if (property == HeuristicsProperty.DESCRIPTION) setIsDescriptionOpen(open);
        if (!open) {
            saveHeuristic();
        }
    }

    function saveHeuristic() {
        updateHeuristicMut({ variables: { projectId: project.id, informationSourceId: currentHeuristic.id, labelingTaskId: currentHeuristic.labelingTaskId, name: currentHeuristic.name, description: currentHeuristic.description } }).then((res) => {
            dispatch(updateHeuristicsState(currentHeuristic.id, { name: currentHeuristic.name, description: currentHeuristic.description }));
            if (currentHeuristic.informationSourceType == InformationSourceType.LABELING_FUNCTION || currentHeuristic.informationSourceType == InformationSourceType.ACTIVE_LEARNING) {
                props.updateSourceCode(currentHeuristic.sourceCode);
            }
        });
    }

    function changeHeuristic(value: string, property: string) {
        dispatch(updateHeuristicsState(currentHeuristic.id, { [property]: value }))
    }

    function refetchAttributesAndProcess() {
        refetchAttributes({ variables: { projectId: project.id, stateFilter: ['ALL'] } }).then((res) => {
            dispatch(setAllAttributes(postProcessingAttributes(res.data['attributesByProjectId'])));
        });
    }

    function refetchLookupListsAndProcess() {
        refetchLookupLists({ variables: { projectId: project.id } }).then((res) => {
            dispatch(setAllLookupLists(postProcessLookupLists(res.data["knowledgeBasesByProjectId"])));
        });
    }

    return (project && <div className="bg-white p-4 pb-16 overflow-y-auto h-screen" onScroll={(e: any) => onScrollEvent(e)}>
        {currentHeuristic && <div>
            <div className={`sticky z-40 h-12 ${isHeaderNormal ? 'top-1' : '-top-5'}`}>
                <div className={`bg-white flex-grow ${isHeaderNormal ? '' : 'shadow'}`}>
                    <div className={`flex-row justify-start items-center inline-block ${isHeaderNormal ? 'p-0' : 'flex py-2'}`} style={{ transition: 'all .25s ease-in-out' }}>
                        <button onClick={() => router.push(`/projects/${project.id}/heuristics`)}
                            className="text-green-800 text-sm font-medium">
                            <IconArrowLeft className="h-5 w-5 inline-block text-green-800" />
                            <span className="leading-5">Go back</span>
                        </button>
                        {!isHeaderNormal && <div className="mx-4 text-sm leading-5 font-medium text-gray-500 inline-block">{currentHeuristic.name}</div>}
                        <Statuses status={currentHeuristic.state} page="heuristics" initialCaption="Initial" />
                        {currentHeuristic.lastTask && <Tooltip content={TOOLTIPS_DICT.HEURISTICS.EXECUTION_TIME} color="invert" placement="right">
                            <div className="text-sm leading-5 font-normal text-gray-500 ml-3 mt-1 inline-block">{currentHeuristic.lastTask.durationText}</div>
                        </Tooltip>}
                        {(currentHeuristic.informationSourceType === InformationSourceType.CROWD_LABELER && currentHeuristic.lastTask) && <div className="text-sm leading-5 font-normal text-gray-500 w-36">
                            <div className="w-36 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div className="bg-green-400 h-2.5 rounded-full" style={{ 'width': currentHeuristic.lastTask.progress + '%' }}>
                                </div>
                            </div>
                        </div>}
                    </div>
                </div>
            </div>
            <div className="w-full">
                <div className={`grid gap-4 ${isHeaderNormal ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {isHeaderNormal && <div className="flex items-center mt-2">
                        <Tooltip color="invert" placement="bottom" content={TOOLTIPS_DICT.HEURISTICS.EDIT_NAME}>
                            <button onClick={() => openProperty(true, HeuristicsProperty.NAME)}
                                className="flex-shrink-0 bg-white text-gray-700 text-xs font-semibold mr-3 px-4 py-2 rounded-md border border-gray-300 block float-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Edit name
                            </button>
                        </Tooltip>
                        <div className="inline-block" onDoubleClick={() => openProperty(true, HeuristicsProperty.NAME)}>
                            {isNameOpen
                                ? (<input type="text" value={currentHeuristic.name} onInput={(e: any) => changeHeuristic(e.target.value, HeuristicsProperty.NAME)}
                                    onBlur={() => openProperty(false, HeuristicsProperty.NAME)} onKeyDown={(e) => { if (e.key == 'Enter') openProperty(false, HeuristicsProperty.NAME) }}
                                    className="h-8 border-gray-300 rounded-md placeholder-italic border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />)
                                : (<div className="mr-4 text-sm leading-5 font-medium text-gray-500 inline-block">{currentHeuristic.name}</div>)}
                        </div>
                    </div>}
                    {isHeaderNormal && <div className="flex items-center mt-2">
                        <Tooltip color="invert" placement="bottom" content={TOOLTIPS_DICT.HEURISTICS.EDIT_DESCRIPTION}>
                            <button onClick={() => openProperty(true, HeuristicsProperty.DESCRIPTION)}
                                className="flex-shrink-0 bg-white text-gray-700 text-xs font-semibold mr-3 px-4 py-2 rounded-md border border-gray-300 block float-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Edit description
                            </button>
                        </Tooltip>
                        <div className="inline-block" onDoubleClick={() => openProperty(true, HeuristicsProperty.DESCRIPTION)}>
                            {isDescriptionOpen
                                ? (<input type="text" value={currentHeuristic.description} onInput={(e: any) => changeHeuristic(e.target.value, HeuristicsProperty.DESCRIPTION)}
                                    onBlur={() => openProperty(false, HeuristicsProperty.DESCRIPTION)} onKeyDown={(e) => { if (e.key == 'Enter') openProperty(false, HeuristicsProperty.DESCRIPTION) }}
                                    className="h-8 border-gray-300 rounded-md placeholder-italic border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />)
                                : (<div className="mr-4 text-sm leading-5 font-medium text-gray-500 inline-block">{currentHeuristic.description}</div>)}
                        </div>
                    </div>}
                </div>
                {(currentHeuristic.informationSourceType == InformationSourceType.LABELING_FUNCTION || currentHeuristic.informationSourceType == InformationSourceType.ACTIVE_LEARNING) && <div className="grid grid-cols-2 gap-2 items-center mt-8" style={{ gridTemplateColumns: 'max-content auto' }}>
                    <div className="text-sm leading-5 font-medium text-gray-700 inline-block">Attributes</div>
                    <div className="flex flex-row items-center">
                        {usableAttributes.length == 0 && <div className="text-sm font-normal text-gray-500">No usable attributes.</div>}
                        {usableAttributes.map((attribute: Attribute) => (
                            <Tooltip key={attribute.id} content={attribute.dataTypeName + ' - ' + TOOLTIPS_DICT.GENERAL.CLICK_TO_COPY} color="invert" placement="top">
                                <span onClick={() => copyToClipboard(attribute.name)}>
                                    <div className={`cursor-pointer border items-center px-2 py-0.5 rounded text-xs font-medium text-center mr-2 ${'bg-' + attribute.color + '-100'} ${'text-' + attribute.color + '-700'} ${'border-' + attribute.color + '-400'} ${'hover:bg-' + attribute.color + '-200'}`}>
                                        {attribute.name}
                                    </div>
                                </span>
                            </Tooltip>
                        ))}
                    </div>

                    <div className="text-sm leading-5 font-medium text-gray-700 inline-block">
                        {lookupLists.length == 0 ? 'No lookup lists' : 'Lookup lists'}</div>
                    <div className="flex flex-row items-center">
                        {lookupLists.map((lookupList) => (
                            <Tooltip key={lookupList.id} content={TOOLTIPS_DICT.GENERAL.IMPORT_STATEMENT} color="invert" placement="top">
                                <span onClick={() => copyToClipboard("from knowledge import " + lookupList.pythonVariable)}>
                                    <div className="cursor-pointer border items-center px-2 py-0.5 rounded text-xs font-medium text-center mr-2">
                                        {lookupList.pythonVariable} - {lookupList.termCount}
                                    </div>
                                </span>
                            </Tooltip>
                        ))}
                    </div>
                </div>}
                {props.children}
            </div>
        </div>}
    </div>
    )
}