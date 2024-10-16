import Statuses from "@/src/components/shared/statuses/Statuses";
import { selectHeuristic, setActiveHeuristics, updateHeuristicsState } from "@/src/reduxStore/states/pages/heuristics";
import { selectAllLookupLists, setAllLookupLists } from "@/src/reduxStore/states/pages/lookup-lists";
import { selectVisibleAttributesHeuristics, setAllAttributes } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project"
import { HeuristicsProperty } from "@/src/types/components/projects/projectId/heuristics/heuristicId/heuristics-details";
import { Attribute } from "@/src/types/components/projects/projectId/settings/data-schema";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { InformationSourceType } from "@/submodules/javascript-functions/enums/enums";
import { copyToClipboard } from "@/submodules/javascript-functions/general";
import { Tooltip } from "@nextui-org/react";
import { IconArrowLeft } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/router";
import { getAttributes } from "@/src/services/base/attribute";
import { getLookupListsByProjectId } from "@/src/services/base/lookup-lists";
import { updateHeuristicPost } from "@/src/services/base/heuristic";
import { toPythonFunctionName } from "@/submodules/javascript-functions/python-functions-parser";
import { capitalizeFirstForClassName } from "@/submodules/javascript-functions/case-types-parser";

export default function HeuristicsLayout(props: any) {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const currentHeuristic = useSelector(selectHeuristic);
    const usableAttributes = useSelector(selectVisibleAttributesHeuristics);
    const lookupLists = useSelector(selectAllLookupLists);

    const [isHeaderNormal, setIsHeaderNormal] = useState(true);
    const [isNameOpen, setIsNameOpen] = useState(false);
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

    const nameRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!projectId) return;
        if (usableAttributes.length == 0) {
            refetchAttributesAndProcess();
        }
        if (lookupLists.length == 0) {
            refetchLookupListsAndProcess();
        }
    }, [projectId]);

    function onScrollEvent(event: React.UIEvent<HTMLDivElement>) {
        if (!(event.target instanceof HTMLElement)) return;
        if ((event.target as HTMLElement).scrollTop > 0) {
            setIsHeaderNormal(false);
        } else {
            setIsHeaderNormal(true);
        }
    }

    function openProperty(open: boolean, property: string) {
        if (property == HeuristicsProperty.NAME) {
            setIsNameOpen(open);
            if (open) {
                setTimeout(() => {
                    nameRef.current?.focus();
                }, 100);
            }
        }
        if (property == HeuristicsProperty.DESCRIPTION) {
            setIsDescriptionOpen(open);
            if (open) {
                setTimeout(() => {
                    descriptionRef.current?.focus();
                }, 100);
            }
        }
        if (!open) {
            saveHeuristic();
        }
    }

    function saveHeuristic() {
        if (currentHeuristic.name == "") return;
        updateHeuristicPost(projectId, currentHeuristic.id, currentHeuristic.labelingTaskId, currentHeuristic.sourceCode, currentHeuristic.description, currentHeuristic.name, (res) => {
            dispatch(updateHeuristicsState(currentHeuristic.id, { name: currentHeuristic.name, description: currentHeuristic.description }));
            if (currentHeuristic.informationSourceType == InformationSourceType.LABELING_FUNCTION || currentHeuristic.informationSourceType == InformationSourceType.ACTIVE_LEARNING) {
                props.updateSourceCode(currentHeuristic.sourceCode);
            }
        });
    }

    function changeHeuristic(value: string, property: string) {
        let finalValue = value;
        if (property == HeuristicsProperty.NAME) {
            finalValue = currentHeuristic.informationSourceType == InformationSourceType.LABELING_FUNCTION ? toPythonFunctionName(value) : currentHeuristic.informationSourceType == InformationSourceType.ACTIVE_LEARNING ? capitalizeFirstForClassName(value) : value;
        }
        dispatch(updateHeuristicsState(currentHeuristic.id, { [property]: finalValue }))
    }

    function refetchAttributesAndProcess() {
        getAttributes(projectId, ['ALL'], (res) => {
            dispatch(setAllAttributes(res.data['attributesByProjectId']));
        });
    }

    function refetchLookupListsAndProcess() {
        getLookupListsByProjectId(projectId, (res) => {
            dispatch(setAllLookupLists(res.data['knowledgeBasesByProjectId']));
        });
    }

    return (projectId && <div className={`bg-white p-4 overflow-y-auto min-h-full h-[calc(100vh-4rem)] w-[calc(100vw-5rem)]`} onScroll={onScrollEvent}>
        {currentHeuristic && <>
            <div className={`sticky z-40 h-12 ${isHeaderNormal ? 'top-1' : '-top-5'}`}>
                <div className={`bg-white flex-grow ${isHeaderNormal ? '' : 'shadow'}`}>
                    <div className={`flex-row justify-start items-center inline-block ${isHeaderNormal ? 'p-0' : 'flex py-2'}`} style={{ transition: 'all .25s ease-in-out' }}>
                        <a href={`/refinery/projects/${projectId}/heuristics`} onClick={(e) => {
                            e.preventDefault();
                            router.push(`/projects/${projectId}/heuristics`);
                            dispatch(setActiveHeuristics(null));
                        }} className="text-green-800 text-sm font-medium">
                            <IconArrowLeft className="h-5 w-5 inline-block text-green-800" />
                            <span className="leading-5">Go back</span>
                        </a>
                        {!isHeaderNormal && <div className="mx-4 text-sm leading-5 font-medium text-gray-500 inline-block">{currentHeuristic.name}</div>}
                        <Statuses status={currentHeuristic.state} page="heuristics" initialCaption="Initial" />
                        {currentHeuristic.lastTask && <Tooltip content={TOOLTIPS_DICT.HEURISTICS.EXECUTION_TIME} color="invert" placement="right" className="cursor-auto">
                            <div className="text-sm leading-5 font-normal text-gray-500 ml-3 mt-1 inline-block">{currentHeuristic.lastTask.durationText}</div>
                        </Tooltip>}
                    </div>
                </div>
            </div>
            <div className="w-full">
                <div className={`grid gap-4 ${isHeaderNormal ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {isHeaderNormal && <div className="flex items-start mt-2">
                        <Tooltip color="invert" placement="bottom" content={TOOLTIPS_DICT.HEURISTICS.EDIT_NAME}>
                            <button onClick={() => openProperty(true, HeuristicsProperty.NAME)}
                                className="flex-shrink-0 bg-white text-gray-700 text-xs font-semibold mr-3 px-4 py-2 rounded-md border border-gray-300 block float-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Edit name
                            </button>
                        </Tooltip>
                        <div className="flex-grow" onDoubleClick={() => openProperty(true, HeuristicsProperty.NAME)}>
                            {isNameOpen
                                ? (<input type="text" value={currentHeuristic.name} ref={nameRef} onInput={(e: any) => changeHeuristic(e.target.value, HeuristicsProperty.NAME)}
                                    onBlur={() => openProperty(false, HeuristicsProperty.NAME)} onKeyDown={(e) => { if (e.key == 'Enter') openProperty(false, HeuristicsProperty.NAME) }}
                                    className="h-8 w-full border-gray-300 rounded-md placeholder-italic border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />)
                                : (<div className="mr-4 text-sm leading-5 font-medium text-gray-500 inline-block " style={{ marginTop: '6px' }}>{currentHeuristic.name}</div>)}
                        </div>
                    </div>}
                    <div className="flex items-start mt-2">
                        <button onClick={() => openProperty(true, HeuristicsProperty.DESCRIPTION)}
                            className="flex-shrink-0 bg-white text-gray-700 text-xs font-semibold mr-3 px-4 py-2 rounded-md border border-gray-300 block float-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Edit description
                        </button>
                        <div className="flex-grow" onDoubleClick={() => openProperty(true, HeuristicsProperty.DESCRIPTION)}>
                            {isDescriptionOpen
                                ? (<input type="text" value={currentHeuristic.description} ref={descriptionRef} onInput={(e: any) => changeHeuristic(e.target.value, HeuristicsProperty.DESCRIPTION)}
                                    onBlur={() => openProperty(false, HeuristicsProperty.DESCRIPTION)} onKeyDown={(e) => { if (e.key == 'Enter') openProperty(false, HeuristicsProperty.DESCRIPTION) }}
                                    className="h-8 w-full border-gray-300 rounded-md placeholder-italic border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />)
                                : (<div className="mr-4 text-sm leading-5 font-medium text-gray-500 inline-block " style={{ marginTop: '6px' }}>{currentHeuristic.description}</div>)}
                        </div>
                    </div>
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

                    {currentHeuristic.informationSourceType == InformationSourceType.LABELING_FUNCTION && <>
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
                    </>}
                </div>}
                {props.children}
            </div>
        </>}
    </div>
    )
}