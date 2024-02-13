import Statuses from "@/src/components/shared/statuses/Statuses";
import { selectAllLookupLists, setAllLookupLists } from "@/src/reduxStore/states/pages/lookup-lists";
import { selectAttributes, selectVisibleAttributeAC, setAllAttributes, setLabelingTasksAll, updateAttributeById } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project"
import { UPDATE_ATTRIBUTE } from "@/src/services/gql/mutations/project-settings";
import { LOOKUP_LISTS_BY_PROJECT_ID } from "@/src/services/gql/queries/lookup-lists";
import { GET_ATTRIBUTES_BY_PROJECT_ID, GET_ATTRIBUTE_BY_ATTRIBUTE_ID, GET_LABELING_TASKS_BY_PROJECT_ID, GET_PROJECT_TOKENIZATION } from "@/src/services/gql/queries/project-setting";
import { Attribute, AttributeState } from "@/src/types/components/projects/projectId/settings/data-schema";
import { CurrentPage, DataTypeEnum } from "@/src/types/shared/general";
import { postProcessCurrentAttribute } from "@/src/util/components/projects/projectId/settings/attribute-calculation-helper";
import { ATTRIBUTES_VISIBILITY_STATES, DATA_TYPES, getTooltipVisibilityState } from "@/src/util/components/projects/projectId/settings/data-schema-helper";
import { copyToClipboard } from "@/submodules/javascript-functions/general";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Editor } from "@monaco-editor/react";
import { Tooltip } from "@nextui-org/react";
import { IconAlertTriangleFilled, IconArrowLeft, IconCircleCheckFilled } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import ExecutionContainer from "./ExecutionContainer";
import { getPythonFunctionRegExMatch } from "@/submodules/javascript-functions/python-functions-parser";
import DangerZone from "@/src/components/shared/danger-zone/DangerZone";
import { DangerZoneEnum } from "@/src/types/shared/danger-zone";
import ContainerLogs from "@/src/components/shared/logs/ContainerLogs";
import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import { WebSocketsService } from "@/src/services/base/web-sockets/WebSocketsService";
import { debounceTime, distinctUntilChanged, fromEvent, timer } from "rxjs";
import { unsubscribeWSOnDestroy } from "@/src/services/base/web-sockets/web-sockets-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { selectAllUsers, setBricksIntegrator, setComments } from "@/src/reduxStore/states/general";
import { REQUEST_COMMENTS } from "@/src/services/gql/queries/projects";
import { CommentDataManager } from "@/src/util/classes/comments";
import { CommentType } from "@/src/types/shared/comments";
import BricksIntegrator from "@/src/components/shared/bricks-integrator/BricksIntegrator";
import { AttributeCodeLookup } from "@/src/util/classes/attribute-calculation";
import Dropdown2 from "@/submodules/react-components/components/Dropdown2";
import { postProcessLabelingTasks, postProcessLabelingTasksSchema } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";

const EDITOR_OPTIONS = { theme: 'vs-light', language: 'python', readOnly: false };

export default function AttributeCalculation() {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const attributes = useSelector(selectAttributes);
    const usableAttributes = useSelector(selectVisibleAttributeAC)
    const lookupLists = useSelector(selectAllLookupLists);
    const allUsers = useSelector(selectAllUsers);

    const [currentAttribute, setCurrentAttribute] = useState<Attribute>(null);
    const [isHeaderNormal, setIsHeaderNormal] = useState(true);
    const [isNameOpen, setIsNameOpen] = useState(false);
    const [duplicateNameExists, setDuplicateNameExists] = useState(false);
    const [tooltipsArray, setTooltipsArray] = useState<string[]>([]);
    const [isInitial, setIsInitial] = useState(null);  //null as add state to differentiate between initial, not and unchecked
    const [editorOptions, setEditorOptions] = useState(EDITOR_OPTIONS);
    const [tokenizationProgress, setTokenizationProgress] = useState(0);
    const [editorValue, setEditorValue] = useState('');
    const [attributeName, setAttributeName] = useState('');
    const [checkUnsavedChanges, setCheckUnsavedChanges] = useState(false);

    const [refetchAttributes] = useLazyQuery(GET_ATTRIBUTES_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [updateAttributeMut] = useMutation(UPDATE_ATTRIBUTE);
    const [refetchLookupLists] = useLazyQuery(LOOKUP_LISTS_BY_PROJECT_ID, { fetchPolicy: "no-cache" });
    const [refetchProjectTokenization] = useLazyQuery(GET_PROJECT_TOKENIZATION, { fetchPolicy: "no-cache" });
    const [refetchAttributeByAttributeId] = useLazyQuery(GET_ATTRIBUTE_BY_ATTRIBUTE_ID, { fetchPolicy: "no-cache" });
    const [refetchComments] = useLazyQuery(REQUEST_COMMENTS, { fetchPolicy: "no-cache" });
    const [refetchLabelingTasksByProjectId] = useLazyQuery(GET_LABELING_TASKS_BY_PROJECT_ID, { fetchPolicy: "network-only" });

    useEffect(unsubscribeWSOnDestroy(router, [CurrentPage.ATTRIBUTE_CALCULATION]), []);

    useEffect(() => {
        if (!currentAttribute) return;
        if (isInitial == null) setIsInitial(AttributeCodeLookup.isCodeStillTemplate(currentAttribute.sourceCode, currentAttribute.dataType))
    }, [currentAttribute]);

    useEffect(() => {
        if (!projectId) return;
        if (!currentAttribute || attributes.length == 0) {
            refetchAttributes({ variables: { projectId: projectId, stateFilter: ['ALL'] } }).then((res) => {
                dispatch(setAllAttributes(res.data['attributesByProjectId']));
                const currentAttribute = postProcessCurrentAttribute(attributes.find((attribute) => attribute.id === router.query.attributeId));
                setCurrentAttribute(currentAttribute);
                setEditorValue(currentAttribute?.sourceCodeToDisplay);
            });
        }
        if (lookupLists.length == 0) {
            refetchLookupLists({ variables: { projectId: projectId } }).then((res) => {
                dispatch(setAllLookupLists(res.data['knowledgeBasesByProjectId']));
            });
        }
        refetchLabelingTasksAndProcess();
        checkProjectTokenization();
        WebSocketsService.subscribeToNotification(CurrentPage.ATTRIBUTE_CALCULATION, {
            projectId: projectId,
            whitelist: ['attributes_updated', 'calculate_attribute', 'tokenization', 'knowledge_base_updated', 'knowledge_base_deleted', 'knowledge_base_created'],
            func: handleWebsocketNotification
        });
    }, [projectId, attributes, currentAttribute]);

    useEffect(() => {
        if (!attributes) return;
        setTooltipsArray(ATTRIBUTES_VISIBILITY_STATES.map((state) => getTooltipVisibilityState(state.value)));
    }, [attributes]);

    useEffect(() => {
        if (!currentAttribute) return;
        if (currentAttribute.saveSourceCode) {
            updateSourceCode(currentAttribute.sourceCode);
        }
        if (currentAttribute.state == AttributeState.USABLE || currentAttribute.state == AttributeState.RUNNING) {
            setEditorOptions({ ...EDITOR_OPTIONS, readOnly: true });
            setCheckUnsavedChanges(false);
        } else {
            setEditorOptions({ ...EDITOR_OPTIONS, readOnly: false });
        }
        setAttributeName(currentAttribute.name);
    }, [currentAttribute]);

    useEffect(() => {
        if (!projectId || allUsers.length == 0) return;
        setUpCommentsRequests();
    }, [allUsers, projectId]);

    useEffect(() => {
        if (!currentAttribute) return;
        if (currentAttribute.sourceCodeToDisplay == editorValue || currentAttribute.state == AttributeState.USABLE) return;
        const observer = fromEvent(document, 'keyup');
        const spinner = observer.subscribe(() => {
            setCheckUnsavedChanges(true);
        });
        const subscription = observer.pipe(
            debounceTime(2000),
            distinctUntilChanged()
        ).subscribe(() => {
            const regMatch: any = getPythonFunctionRegExMatch(editorValue);
            changeAttributeName(regMatch ? regMatch[2] : '');
            setCurrentAttribute({ ...currentAttribute, sourceCode: editorValue });
            updateSourceCode(editorValue);
            setCheckUnsavedChanges(false);
        });
        return () => {
            spinner.unsubscribe();
            subscription.unsubscribe();
        }
    }, [editorValue, currentAttribute]);

    function setUpCommentsRequests() {
        const requests = [];
        requests.push({ commentType: CommentType.ATTRIBUTE, projectId: projectId });
        requests.push({ commentType: CommentType.LABELING_TASK, projectId: projectId });
        requests.push({ commentType: CommentType.KNOWLEDGE_BASE, projectId: projectId });
        CommentDataManager.unregisterCommentRequests(CurrentPage.ATTRIBUTE_CALCULATION);
        CommentDataManager.registerCommentRequests(CurrentPage.ATTRIBUTE_CALCULATION, requests);
        const requestJsonString = CommentDataManager.buildRequestJSON();
        refetchComments({ variables: { requested: requestJsonString } }).then((res) => {
            CommentDataManager.parseCommentData(JSON.parse(res.data['getAllComments']));
            CommentDataManager.parseToCurrentData(allUsers);
            dispatch(setComments(CommentDataManager.currentDataOrder));
        });
    }

    function openName(open: boolean) {
        setIsNameOpen(open);
        if (!open && attributeName != currentAttribute.name) {
            if (attributeName.trim().length == 0) {
                setAttributeName(currentAttribute.name);
                return;
            }
            changeAttributeName(attributeName);
        }

    }

    function changeAttributeName(name: string) {
        if (name == currentAttribute.name) return;
        if (name == '') return;
        const duplicateNameExists = attributes.find((attribute) => attribute.name == name);
        if (duplicateNameExists) {
            setDuplicateNameExists(true);
            setAttributeName(currentAttribute.name);
            return;
        }
        const attributeNew = { ...currentAttribute };
        attributeNew.name = name;
        attributeNew.saveSourceCode = false;
        updateAttributeMut({ variables: { projectId: projectId, attributeId: currentAttribute.id, name: attributeNew.name } }).then(() => {
            setCurrentAttribute(postProcessCurrentAttribute(attributeNew));
            setEditorValue(attributeNew.sourceCode.replace('def ac(record)', 'def ' + attributeNew.name + '(record)'));
            dispatch(updateAttributeById(attributeNew));
            setDuplicateNameExists(false);
        });
    }

    function updateVisibility(option: any) {
        const attributeNew = { ...currentAttribute };
        attributeNew.visibility = option.value;
        attributeNew.visibilityIndex = ATTRIBUTES_VISIBILITY_STATES.findIndex((state) => state.name === option);
        attributeNew.visibilityName = option.name;
        attributeNew.saveSourceCode = false;
        updateAttributeMut({ variables: { projectId: projectId, attributeId: currentAttribute.id, visibility: attributeNew.visibility } }).then(() => {
            setCurrentAttribute(postProcessCurrentAttribute(attributeNew));
            dispatch(updateAttributeById(attributeNew));
        });
    }

    function updateDataType(option: any) {
        const attributeNew = { ...currentAttribute };
        attributeNew.dataType = option.value;
        attributeNew.dataTypeName = option.name;
        attributeNew.saveSourceCode = false;
        updateAttributeMut({ variables: { projectId: projectId, attributeId: currentAttribute.id, dataType: attributeNew.dataType } }).then(() => {
            setCurrentAttribute(postProcessCurrentAttribute(attributeNew));
            dispatch(updateAttributeById(attributeNew));
        });
    }

    function openBricksIntegrator() {
        document.getElementById('bricks-integrator-open-button').click();
    }

    function onScrollEvent(event: any) {
        if (!(event.target instanceof HTMLElement)) return;
        if ((event.target as HTMLElement).scrollTop > 0) {
            setIsHeaderNormal(false);
        } else {
            setIsHeaderNormal(true);
        }
    }

    function updateSourceCode(value: string, attributeNameParam?: string) {
        var regMatch: any = getPythonFunctionRegExMatch(value);
        if (!regMatch) {
            console.log("Can't find python function name -- seems wrong -- better dont save");
            return;
        }
        const finalSourceCode = value.replace(regMatch[0], 'def ac(record)');
        updateAttributeMut({ variables: { projectId: projectId, attributeId: currentAttribute.id, sourceCode: finalSourceCode, name: attributeNameParam } }).then(() => {
        });
    }

    function checkProjectTokenization() {
        refetchProjectTokenization({ variables: { projectId: projectId } }).then((res) => {
            setTokenizationProgress(res.data['projectTokenization']?.progress);
        });
    }

    function updateNameAndCodeBricksIntegrator(code: string) {
        setEditorValue(code);
        const regMatch: any = getPythonFunctionRegExMatch(code);
        updateSourceCode(code, regMatch[2]);
        setIsInitial(false);
    }

    function refetchLabelingTasksAndProcess() {
        refetchLabelingTasksByProjectId({ variables: { projectId: projectId } }).then((res) => {
            const labelingTasks = postProcessLabelingTasks(res['data']['projectByProjectId']['labelingTasks']['edges']);
            dispatch(setLabelingTasksAll(postProcessLabelingTasksSchema(labelingTasks)));
        });
    }

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (!currentAttribute) return;
        if (!projectId) return;
        if (msgParts[1] == 'calculate_attribute') {
            if (msgParts[2] == 'progress' && msgParts[3] == currentAttribute.id) {
                const currentAttributeCopy = { ...currentAttribute };
                currentAttributeCopy.progress = Number(msgParts[4]);
                currentAttributeCopy.state = AttributeState.RUNNING;
                setCurrentAttribute(currentAttributeCopy);
            } else {
                refetchAttributes({ variables: { projectId: projectId, stateFilter: ['ALL'] } }).then((res) => {
                    dispatch(setAllAttributes(res.data['attributesByProjectId']));
                });
                refetchAttributeByAttributeId({ variables: { projectId: projectId, attributeId: currentAttribute?.id } }).then((res) => {
                    const attribute = res.data['attributeByAttributeId'];
                    if (attribute == null) setCurrentAttribute(null);
                    else setCurrentAttribute(postProcessCurrentAttribute(attribute));
                });
                if (msgParts[2] == "finished") {
                    timer(2000).subscribe(() => checkProjectTokenization());
                }
            }
        } else if (['knowledge_base_updated', 'knowledge_base_deleted', 'knowledge_base_created'].includes(msgParts[1])) {
            refetchLookupLists({ variables: { projectId: projectId } }).then((res) => {
                dispatch(setAllLookupLists(res.data['knowledgeBasesByProjectId']));
            });
        } else if (msgParts[1] == 'tokenization' && msgParts[2] == 'docbin') {
            if (msgParts[3] == 'progress') {
                setTokenizationProgress(Number(msgParts[4]));
            } else if (msgParts[3] == 'state') {
                if (msgParts[4] == 'IN_PROGRESS') setTokenizationProgress(0);
                else if (msgParts[4] == 'FINISHED') {
                    timer(2000).subscribe(() => checkProjectTokenization());
                }
            }
        }
    }, [projectId, currentAttribute]);

    useEffect(() => {
        if (!projectId) return;
        WebSocketsService.updateFunctionPointer(projectId, CurrentPage.ATTRIBUTE_CALCULATION, handleWebsocketNotification)
    }, [handleWebsocketNotification, projectId]);

    return (projectId && <div className="bg-white p-4 pb-16 overflow-y-auto h-screen" style={{ width: 'calc(100vw - 75px)' }} onScroll={(e: any) => onScrollEvent(e)}>
        {currentAttribute && <div>
            <div className={`sticky z-40 h-12 ${isHeaderNormal ? 'top-1' : '-top-5'}`}>
                <div className={`bg-white flex-grow ${isHeaderNormal ? '' : 'shadow'}`}>
                    <div className={`flex-row justify-start items-center inline-block ${isHeaderNormal ? 'p-0' : 'flex py-2'}`} style={{ transition: 'all .25s ease-in-out' }}>
                        <a href={`/refinery/projects/${projectId}/settings`} onClick={(e) => {
                            e.preventDefault();
                            router.push(`/projects/${projectId}/settings`);
                        }} className="text-green-800 text-sm font-medium">
                            <IconArrowLeft className="h-5 w-5 inline-block text-green-800" />
                            <span className="leading-5">Go back</span>
                        </a>
                        {!isHeaderNormal && <div className="mx-4 text-sm leading-5 font-medium text-gray-500 inline-block">{currentAttribute.name}</div>}
                        <Statuses status={currentAttribute.state} page="attributes" initialCaption="Registered" />
                    </div>
                </div>
            </div>
            <div className="w-full">
                <div className={`grid gap-4 ${isHeaderNormal ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {isHeaderNormal && <div className="flex items-center mt-2">
                        <Tooltip color="invert" placement="right" content={currentAttribute.state == AttributeState.USABLE || currentAttribute.state == AttributeState.RUNNING ? TOOLTIPS_DICT.ATTRIBUTE_CALCULATION.CANNOT_EDIT_NAME : TOOLTIPS_DICT.ATTRIBUTE_CALCULATION.EDIT_NAME}>
                            <button onClick={() => openName(true)} disabled={currentAttribute.state == AttributeState.USABLE || currentAttribute.state == AttributeState.RUNNING}
                                className={`flex-shrink-0 bg-white text-gray-700 text-xs font-semibold mr-3 px-4 py-2 rounded-md border border-gray-300 block float-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${currentAttribute.state == AttributeState.USABLE || currentAttribute.state == AttributeState.RUNNING}`}>
                                Edit name
                            </button>
                        </Tooltip>
                        <div className="inline-block" onDoubleClick={() => openName(true)}>
                            {(isNameOpen && currentAttribute.state != AttributeState.USABLE && currentAttribute.state != AttributeState.RUNNING)
                                ? (<input type="text" value={attributeName} onInput={(e: any) => setAttributeName(e.target.value)}
                                    onBlur={() => openName(false)} onKeyDown={(e) => { if (e.key == 'Enter') openName(false) }}
                                    className="h-8 text-sm border-gray-300 rounded-md placeholder-italic border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />)
                                : (<div className="mr-4 text-sm leading-5 font-medium text-gray-500 inline-block">{currentAttribute.name}</div>)}
                        </div>
                    </div>}
                </div>
                {duplicateNameExists && <div className="text-red-700 text-xs mt-2">Attribute name exists</div>}
                <div className="grid grid-cols-2 gap-2 items-center mt-8" style={{ gridTemplateColumns: 'max-content auto' }}>
                    <div className="text-sm leading-5 font-medium text-gray-700">Visibility</div>
                    <Dropdown2 buttonName={currentAttribute.visibilityName} options={ATTRIBUTES_VISIBILITY_STATES} dropdownWidth="w-52" tooltipArrayPlacement="right" tooltipsArray={tooltipsArray}
                        selectedOption={(option: any) => updateVisibility(option)} disabled={currentAttribute.state == AttributeState.USABLE} />

                    <div className="text-sm leading-5 font-medium text-gray-700">Data type</div>
                    <div className="flex flex-row items-center">
                        <Tooltip color="invert" placement="right" content={currentAttribute.state == AttributeState.USABLE || currentAttribute.state == AttributeState.RUNNING ? TOOLTIPS_DICT.ATTRIBUTE_CALCULATION.CANNOT_EDIT_DATATYPE : TOOLTIPS_DICT.ATTRIBUTE_CALCULATION.EDIT_DATATYPE}>
                            <Dropdown2 buttonName={currentAttribute.dataTypeName} options={DATA_TYPES} dropdownWidth="w-52"
                                selectedOption={(option: any) => updateDataType(option)} disabled={currentAttribute.state == AttributeState.USABLE} />
                        </Tooltip>
                        {currentAttribute.dataType == DataTypeEnum.EMBEDDING_LIST && <div className="text-gray-700 text-sm ml-3">Only useable for similarity search</div>}
                    </div>
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
                        {lookupLists.length == 0 ? 'No lookup lists in project' : 'Lookup lists'}</div>
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
                </div>
                <div className="flex flex-row items-center justify-between my-3">
                    <div className="text-sm leading-5 font-medium text-gray-700 inline-block mr-2">Editor</div>
                    <div className="flex flex-row flex-nowrap">
                        <BricksIntegrator
                            moduleTypeFilter="generator,classifier" functionType="Attribute"
                            nameLookups={attributes.map(a => a.name)}
                            preparedCode={(code: string) => {
                                if (currentAttribute.state == AttributeState.USABLE) return;
                                updateNameAndCodeBricksIntegrator(code);
                            }} />
                        <Tooltip content={TOOLTIPS_DICT.ATTRIBUTE_CALCULATION.AVAILABLE_LIBRARIES} placement="left" color="invert">
                            <a href="https://github.com/code-kern-ai/refinery-ac-exec-env/blob/dev/requirements.txt"
                                target="_blank"
                                className="ml-2 bg-white text-gray-700 text-xs font-semibold  px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none">
                                See installed libraries
                            </a>
                        </Tooltip>
                    </div>
                </div>

                <div className="border mt-1 relative">
                    {isInitial && <div
                        className="absolute top-0 bottom-0 left-0 right-0 bg-gray-200 flex items-center justify-center z-10" style={{ opacity: '0.9' }}>
                        <div className="flex flex-col gap-2">
                            <button onClick={openBricksIntegrator}
                                className="bg-white text-gray-900 text font-semibold px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none">
                                Search in bricks
                            </button>
                            <button onClick={() => setIsInitial(false)}
                                className="bg-white text-gray-900 text font-semibold px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none">
                                Start from scratch
                            </button>
                        </div>
                    </div>}
                    <Editor
                        height="400px"
                        defaultLanguage={'python'}
                        value={editorValue}
                        options={editorOptions}
                        onChange={(value) => {
                            setEditorValue(value);
                        }}
                    />
                </div>

                <div className="mt-2 flex flex-grow justify-between items-center float-right">
                    {checkUnsavedChanges && <div className="flex items-center">
                        <div className="text-sm font-normal">Saving...</div>
                        <LoadingIcon color="indigo" />
                    </div>}
                </div>


                <ExecutionContainer currentAttribute={currentAttribute} tokenizationProgress={tokenizationProgress} checkUnsavedChanges={checkUnsavedChanges}
                    refetchCurrentAttribute={() => {
                        refetchAttributeByAttributeId({ variables: { projectId: projectId, attributeId: currentAttribute?.id } }).then((res) => {
                            const attribute = res.data['attributeByAttributeId'];
                            if (attribute == null) setCurrentAttribute(null);
                            else setCurrentAttribute(postProcessCurrentAttribute(attribute));
                        });
                    }} />
                <ContainerLogs logs={currentAttribute.logs} type="attribute" />

                <div className="mt-8">
                    <div className="text-sm leading-5 font-medium text-gray-700 inline-block">Calculation progress</div>
                    {currentAttribute.progress == 0 && currentAttribute.state == AttributeState.INITIAL && <div className="bg-white">
                        <div className="py-6 text-sm leading-5 font-normal text-gray-500">This attribute was not yet run.</div>
                    </div>}
                    {currentAttribute.progress < 1 && currentAttribute.state == AttributeState.RUNNING &&
                        <div className=" mb-4 card border border-gray-200 bg-white flex-grow overflow-visible rounded-2xl">
                            <div className="card-body p-6">
                                <div className="flex flex-row items-center">
                                    <Tooltip content={TOOLTIPS_DICT.ATTRIBUTE_CALCULATION.BEING_EXECUTED} color="invert" placement="right" className="relative z-10 cursor-auto"><LoadingIcon /></Tooltip>
                                    <div className="text-sm leading-5 font-normal text-gray-500 w-full">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                            <div className="bg-green-400 h-2.5 rounded-full" style={{ 'width': currentAttribute.progress + '%' }}>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>}
                    {currentAttribute.state !== AttributeState.RUNNING && currentAttribute.state !== AttributeState.INITIAL && <div className="flex flex-row items-center">
                        {currentAttribute.state == AttributeState.USABLE && <Tooltip content={TOOLTIPS_DICT.GENERAL.SUCCESSFULLY_CREATED} color="invert" className="cursor-auto">
                            <IconCircleCheckFilled className="h-6 w-6 text-green-500" />
                        </Tooltip>}
                        {currentAttribute.state == AttributeState.FAILED && <Tooltip content={TOOLTIPS_DICT.GENERAL.ERROR} color="invert" className="cursor-auto">
                            <IconAlertTriangleFilled className="h-6 w-6 text-red-500" />
                        </Tooltip>}
                        <div className="py-6 text-sm leading-5 font-normal text-gray-500">
                            {currentAttribute.state === 'FAILED' ? 'Attribute calculation ran into errors.' : 'Attribute calculation finished successfully.'}
                        </div>
                    </div>}
                </div>

                <DangerZone elementType={DangerZoneEnum.ATTRIBUTE} name={currentAttribute.name} id={currentAttribute.id} />
            </div >
        </div >}
    </div >)
}