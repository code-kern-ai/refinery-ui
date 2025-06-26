import Statuses from "@/src/components/shared/statuses/Statuses";
import { selectAllLookupLists, setAllLookupLists } from "@/src/reduxStore/states/pages/lookup-lists";
import { selectAttributes, selectVisibleAttributeAC, selectVisibleAttributesWithoutPermissions, setAllAttributes, setLabelingTasksAll, updateAttributeById } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project"
import { Attribute, AttributeState, AttributeVisibility, AttributeWithOnClick, LLMConfig } from "@/src/types/components/projects/projectId/settings/data-schema";
import { DataTypeEnum } from "@/src/types/shared/general";
import { LLM_PROVIDER_OPTIONS, postProcessCurrentAttribute } from "@/src/util/components/projects/projectId/settings/attribute-calculation-helper";
import { ATTRIBUTES_VISIBILITY_STATES, DATA_TYPES, getTooltipVisibilityState } from "@/src/util/components/projects/projectId/settings/data-schema-helper";
import { copyToClipboard } from "@/submodules/javascript-functions/general";
import { Editor } from "@monaco-editor/react";
import { Tooltip } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import ExecutionContainer from "./ExecutionContainer";
import { getPythonFunctionRegExMatch, toPythonFunctionName } from "@/submodules/javascript-functions/python-functions-parser";
import DangerZone from "@/src/components/shared/danger-zone/DangerZone";
import { DangerZoneEnum } from "@/src/types/shared/danger-zone";
import ContainerLogs from "@/src/components/shared/logs/ContainerLogs";
import LoadingIcon from "@/submodules/react-components/components/LoadingIcon";
import { debounceTime, distinctUntilChanged, fromEvent, timer } from "rxjs";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { selectAllUsers, selectOrganizationId, setComments } from "@/src/reduxStore/states/general";
import { CommentDataManager } from "@/src/util/classes/comments";
import { CommentType } from "@/src/types/shared/comments";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { useWebsocket } from "@/submodules/react-components/hooks/web-socket/useWebsocket";
import { postProcessLabelingTasksSchema } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { getAllComments } from "@/src/services/base/comment";
import { getAttributes } from "@/src/services/base/attribute";
import { getLookupListsByProjectId } from "@/src/services/base/lookup-lists";
import { getLabelingTasksByProjectId, getProjectTokenization } from "@/src/services/base/project";
import { getAttributeByAttributeId, updateAttribute } from "@/src/services/base/project-setting";
import { Application, CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";
import { VisitBricksButton } from "@/src/components/shared/bricks/VisitBricksButton";
import LLMResponseConfig from "./LLMResponseConfig";
import useDebounce from "@/submodules/react-components/hooks/useHooks/useDebounce";
import useRefFor from "@/submodules/react-components/hooks/useRefFor";
import { simpleDictCompare } from "@/submodules/javascript-functions/validations";
import { LLM_CODE_TEMPLATE_EXAMPLES, LLM_CODE_TEMPLATE_OPTIONS } from "./LLM/llmTemplates";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import { MemoIconAlertTriangleFilled, MemoIconArrowLeft, MemoIconCircleCheckFilled } from "@/submodules/react-components/components/kern-icons/icons";
import { LookupListWithOnClick } from "@/src/types/components/projects/projectId/lookup-lists";

const EDITOR_OPTIONS = { theme: 'vs-light', language: 'python', readOnly: false };



export default function AttributeCalculation() {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const attributes = useSelector(selectAttributes);
    const usableAttributes = useSelector(selectVisibleAttributesWithoutPermissions);
    const lookupLists = useSelector(selectAllLookupLists);
    const allUsers = useSelector(selectAllUsers);

    const [currentAttribute, setCurrentAttribute] = useState<Attribute>(null);
    const [isHeaderNormal, setIsHeaderNormal] = useState(true);
    const [isNameOpen, setIsNameOpen] = useState(false);
    const [duplicateNameExists, setDuplicateNameExists] = useState(false);
    const [tooltipsArray, setTooltipsArray] = useState<string[]>([]);
    const [editorOptions, setEditorOptions] = useState(EDITOR_OPTIONS);
    const [tokenizationProgress, setTokenizationProgress] = useState(0);
    const [editorValue, setEditorValue] = useState('');
    const [attributeName, setAttributeName] = useState('');
    const [checkUnsavedChanges, setCheckUnsavedChanges] = useState(false);
    const [enableRunButton, setEnableButton] = useState(false);
    const [additionalConfigTmp, setAdditionalConfigTmp] = useState<LLMConfig>(null);

    const currentAttributeRef = useRefFor(currentAttribute);
    const debouncedConfig = useDebounce(additionalConfigTmp, 1000);

    const updateSourceCode = useCallback((value: string, attributeNameParam?: string) => {
        var regMatch: any = getPythonFunctionRegExMatch(value);
        if (!regMatch) {
            console.log("Can't find python function name -- seems wrong -- better dont save");
            return;
        }
        const finalSourceCode = value.replace(regMatch[0], 'def ac(record)');
        updateAttribute(projectId, currentAttribute.id, (res) => {

        }, null, null, attributeNameParam, finalSourceCode);
    }, [projectId, currentAttribute]);

    useEffect(() => setAdditionalConfigTmp(currentAttribute?.additionalConfig), [currentAttribute?.additionalConfig])

    useEffect(() => {
        if (!projectId) return;
        if (lookupLists.length == 0) {
            getLookupListsByProjectId(projectId, (res) => {
                dispatch(setAllLookupLists(res));
            });
        }
        refetchLabelingTasksAndProcess();
        checkProjectTokenization();
    }, [projectId, attributes]);

    useEffect(() => {
        if (currentAttribute || !projectId) return;
        getAttributeByAttributeId(projectId, router.query.attributeId as string, (attribute) => {
            const currentAttribute = postProcessCurrentAttribute(attribute);
            setCurrentAttribute(currentAttribute);
            setEditorValue(currentAttribute?.sourceCodeToDisplay);
        });
    }, [projectId, currentAttribute, router.query.attributeId])

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
    }, [currentAttribute, updateSourceCode]);

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
    }, [editorValue, currentAttribute, updateSourceCode]);


    useEffect(() => {
        if (!currentAttributeRef.current || !currentAttributeRef.current.additionalConfig || simpleDictCompare(currentAttributeRef.current?.additionalConfig, debouncedConfig)) return;
        const attributeNew = { ...currentAttribute };
        const finalConfig = { ...debouncedConfig };
        if (finalConfig.llmConfig && finalConfig.llmIdentifier == 'Azure Foundry') {
            delete finalConfig.llmConfig.openAioSeries;
        }
        attributeNew.additionalConfig = { ...finalConfig };
        updateAttribute(projectId, currentAttribute.id, (res) => {
            setCurrentAttribute(postProcessCurrentAttribute(attributeNew));
            dispatch(updateAttributeById(attributeNew));
            setEnableButton(true);
        }, null, null, null, null, null, finalConfig);

    }, [debouncedConfig])


    function setUpCommentsRequests() {
        const requests = [];
        requests.push({ commentType: CommentType.ATTRIBUTE, projectId: projectId });
        requests.push({ commentType: CommentType.LABELING_TASK, projectId: projectId });
        requests.push({ commentType: CommentType.KNOWLEDGE_BASE, projectId: projectId });
        CommentDataManager.unregisterCommentRequests(CurrentPage.ATTRIBUTE_CALCULATION);
        CommentDataManager.registerCommentRequests(CurrentPage.ATTRIBUTE_CALCULATION, requests);
        const requestJsonString = CommentDataManager.buildRequestJSON();
        getAllComments(requestJsonString, (res) => {
            CommentDataManager.parseCommentData(res);
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

    const attributesRef = useRefFor(attributes);
    const changeAttributeName = useCallback((name: string) => {
        if (name == currentAttributeRef.current.name) return;
        if (name == '') return;
        const duplicateNameExists = attributesRef.current.find((attribute) => attribute.name == name);
        if (duplicateNameExists) {
            setDuplicateNameExists(true);
            setAttributeName(currentAttributeRef.current.name);
            return;
        }
        const attributeNew = { ...currentAttributeRef.current };
        attributeNew.name = name;
        attributeNew.saveSourceCode = false;
        updateAttribute(projectId, currentAttributeRef.current.id, (res) => {
            setCurrentAttribute(postProcessCurrentAttribute(attributeNew));
            setEditorValue(attributeNew.sourceCode.replace('def ac(record)', 'def ' + attributeNew.name + '(record)'));
            dispatch(updateAttributeById(attributeNew));
            setDuplicateNameExists(false);
        }, null, null, attributeNew.name);
    }, []);

    const updateVisibility = useCallback((option: { name: string, value: string }) => {
        const attributeNew = { ...currentAttributeRef.current };
        attributeNew.visibility = option.value as AttributeVisibility;
        attributeNew.visibilityIndex = ATTRIBUTES_VISIBILITY_STATES.findIndex((state) => state.name === option.name);
        attributeNew.visibilityName = option.name;
        attributeNew.saveSourceCode = false;
        updateAttribute(projectId, currentAttributeRef.current.id, (res) => {
            setCurrentAttribute(postProcessCurrentAttribute(attributeNew));
            dispatch(updateAttributeById(attributeNew));
        }, null, null, null, null, attributeNew.visibility);
    }, []);

    const updateDataType = useCallback((option: { name: string, value: string }) => {
        const attributeNew = { ...currentAttributeRef.current };
        attributeNew.dataType = option.value;
        attributeNew.dataTypeName = option.name;
        attributeNew.saveSourceCode = false;
        updateAttribute(projectId, currentAttributeRef.current.id, (res) => {
            setCurrentAttribute(postProcessCurrentAttribute(attributeNew));
            dispatch(updateAttributeById(attributeNew));
        }, attributeNew.dataType);
    }, []);

    function onScrollEvent(event: any) {
        if (!(event.target instanceof HTMLElement)) return;
        if ((event.target as HTMLElement).scrollTop > 0) {
            setIsHeaderNormal(false);
        } else {
            setIsHeaderNormal(true);
        }
    }

    function checkProjectTokenization() {
        getProjectTokenization(projectId, (res) => {
            setTokenizationProgress(res?.progress);
        });
    }

    function refetchLabelingTasksAndProcess() {
        getLabelingTasksByProjectId(projectId, (res) => {
            dispatch(setLabelingTasksAll(postProcessLabelingTasksSchema(res)));
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
                getAttributes(projectId, ['ALL'], (res) => {
                    dispatch(setAllAttributes(res));
                });
                if (msgParts[2] == 'deleted') return
                getAttributeByAttributeId(projectId, currentAttribute?.id, (attribute) => {
                    if (!attribute) setCurrentAttribute(null);
                    else setCurrentAttribute(postProcessCurrentAttribute(attribute));
                });
                if (msgParts[2] == "finished") {
                    timer(2000).subscribe(() => checkProjectTokenization());
                }
            }
        } else if (['knowledge_base_updated', 'knowledge_base_deleted', 'knowledge_base_created'].includes(msgParts[1])) {
            getLookupListsByProjectId(projectId, (res) => {
                dispatch(setAllLookupLists(res));
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

    const selectCodeTemplate = useCallback((option) => {
        if (!currentAttributeRef.current) return;
        updateSourceCode(LLM_CODE_TEMPLATE_EXAMPLES[option.value]);
        setEditorValue(LLM_CODE_TEMPLATE_EXAMPLES[option.value].replace('def ac(record)', 'def ' + currentAttributeRef.current.name + '(record)'));
    }, [updateSourceCode])

    const orgId = useSelector(selectOrganizationId);
    useWebsocket(orgId, Application.REFINERY, CurrentPage.ATTRIBUTE_CALCULATION, handleWebsocketNotification, projectId);

    const goBack = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        router.push(`/projects/${projectId}/settings`);
    }, []);

    const copyToClipboardFunc = useCallback((name: string) => copyToClipboard(name), []);

    const usableAttributesFinal = useMemo(() => usableAttributes.map((attribute) => (
        { ...attribute, onClick: () => copyToClipboardFunc(attribute.name) }
    )), [usableAttributes]);

    const lookupListsFinal = useMemo(() => lookupLists.map((lookupList) => (
        { ...lookupList, onClick: () => copyToClipboardFunc("from knowledge import " + lookupList.pythonVariable) }
    )), [lookupLists]);

    const disabledOptions = useMemo(() => {
        if (!currentAttribute || currentAttribute.dataType == DataTypeEnum.LLM_RESPONSE) return undefined;
        return DATA_TYPES.map((e) => e.value == DataTypeEnum.LLM_RESPONSE);
    }, [currentAttribute?.dataType])

    return (projectId && <div className={`bg-white p-4 overflow-y-auto min-h-full h-[calc(100vh-4rem)]`} onScroll={(e: any) => onScrollEvent(e)}>
        {currentAttribute && <div>
            <div className={`sticky z-50 h-12 ${isHeaderNormal ? 'top-1' : '-top-5'}`}>
                <div className={`bg-white flex-grow ${isHeaderNormal ? '' : 'shadow'}`}>
                    <div className={`flex-row justify-start items-center inline-block ${isHeaderNormal ? 'p-0' : 'flex py-2'}`} style={{ transition: 'all .25s ease-in-out' }}>
                        <a href={`/refinery/projects/${projectId}/settings`} onClick={goBack} className="text-green-800 text-sm font-medium">
                            <MemoIconArrowLeft className="h-5 w-5 inline-block text-green-800" />
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
                        <KernButton
                            text="Edit name"
                            disabled={currentAttribute.state == AttributeState.USABLE || currentAttribute.state == AttributeState.RUNNING}
                            onClick={() => openName(true)}
                            className="mr-3"
                            tooltip={currentAttribute.state == AttributeState.USABLE || currentAttribute.state == AttributeState.RUNNING ? TOOLTIPS_DICT.ATTRIBUTE_CALCULATION.CANNOT_EDIT_NAME : TOOLTIPS_DICT.ATTRIBUTE_CALCULATION.EDIT_NAME}
                            tooltipPlacement="bottom"
                        />
                        <div className="inline-block" onDoubleClick={() => openName(true)}>
                            {(isNameOpen && currentAttribute.state != AttributeState.USABLE && currentAttribute.state != AttributeState.RUNNING)
                                ? (<input type="text" value={attributeName} onInput={(e: any) => setAttributeName(toPythonFunctionName(e.target.value))}
                                    onBlur={() => openName(false)} onKeyDown={(e) => { if (e.key == 'Enter') openName(false) }}
                                    className="h-8 text-sm border-gray-300 rounded-md placeholder-italic border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />)
                                : (<div className="mr-4 text-sm leading-5 font-medium text-gray-500 inline-block">{currentAttribute.name}</div>)}
                        </div>
                    </div>}
                </div>
                {duplicateNameExists && <div className="text-red-700 text-xs mt-2">Attribute name exists</div>}
                <div className="grid grid-cols-2 gap-2 items-center mt-8" style={{ gridTemplateColumns: 'max-content auto' }}>
                    <div className="text-sm leading-5 font-medium text-gray-700">Visibility</div>
                    <KernDropdown buttonName={currentAttribute.visibilityName} options={ATTRIBUTES_VISIBILITY_STATES} dropdownWidth="w-52" tooltipArrayPlacement="right" tooltipsArray={tooltipsArray}
                        selectedOption={(option: any) => updateVisibility(option)} disabled={currentAttribute.state == AttributeState.USABLE} dropdownClasses="z-40" />

                    <div className="text-sm leading-5 font-medium text-gray-700">Data type</div>
                    <div className="flex flex-row items-center">
                        <Tooltip color="invert" placement="right" className="cursor-not-allowed" content={currentAttribute.state == AttributeState.USABLE || currentAttribute.state == AttributeState.RUNNING ? TOOLTIPS_DICT.ATTRIBUTE_CALCULATION.CANNOT_EDIT_DATATYPE : TOOLTIPS_DICT.ATTRIBUTE_CALCULATION.EDIT_DATATYPE}>
                            <KernDropdown buttonName={currentAttribute.dataTypeName} options={DATA_TYPES} dropdownWidth="w-52"
                                selectedOption={(option: any) => updateDataType(option)} disabledOptions={disabledOptions} disabled={currentAttribute.state == AttributeState.USABLE || currentAttribute.dataType == DataTypeEnum.LLM_RESPONSE} dropdownClasses="z-30" />
                        </Tooltip>
                        {currentAttribute.dataType == DataTypeEnum.EMBEDDING_LIST && <div className="text-gray-700 text-sm ml-3">Only useable for similarity search</div>}
                        {currentAttribute.dataType == DataTypeEnum.LLM_RESPONSE && <div className="ml-3 flex flex-row flex-nowrap w-full items-center gap-x-2">
                            <label className="block text-sm font-medium text-gray-900 whitespace-nowrap">Provider</label>
                            <KernDropdown
                                buttonName={additionalConfigTmp?.llmIdentifier ?? 'Select LLM provider'}
                                options={LLM_PROVIDER_OPTIONS}
                                dropdownWidth="w-64"
                                selectedOption={(option) => setAdditionalConfigTmp(p => ({ ...p, llmIdentifier: option }))}
                                disabled={currentAttribute.state == AttributeState.USABLE}
                            />
                            <label className="block text-sm font-medium text-gray-900 whitespace-nowrap">Api Key</label>

                            <input type="text" disabled={currentAttribute.state == AttributeState.USABLE} value={additionalConfigTmp?.llmConfig.apiKey || ""} onInput={(e: any) => setAdditionalConfigTmp(p => ({ ...p, llmConfig: { ...additionalConfigTmp.llmConfig, apiKey: e.target.value } }))}
                                className="h-8 text-sm border-gray-300 rounded-md placeholder-italic w-full border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:opacity-50" />
                        </div>}
                    </div>
                    <div className="text-sm leading-5 font-medium text-gray-700 inline-block">Attributes</div>
                    <div className="flex flex-row items-center">
                        {usableAttributesFinal.length == 0 && <div className="text-sm font-normal text-gray-500">No usable attributes.</div>}
                        {usableAttributesFinal.map((attribute: AttributeWithOnClick) => (
                            <Tooltip key={attribute.id} content={attribute.dataTypeName + ' - ' + TOOLTIPS_DICT.GENERAL.CLICK_TO_COPY} color="invert" placement="top">
                                <span onClick={attribute.onClick}>
                                    <div className={`cursor-pointer border items-center px-2 py-0.5 rounded text-xs font-medium text-center mr-2 ${'bg-' + attribute.color + '-100'} ${'text-' + attribute.color + '-700'} ${'border-' + attribute.color + '-400'} ${'hover:bg-' + attribute.color + '-200'}`}>
                                        {attribute.name}
                                    </div>
                                </span>
                            </Tooltip>
                        ))}
                    </div>

                    <div className="text-sm leading-5 font-medium text-gray-700 inline-block">
                        {lookupListsFinal.length == 0 ? 'No lookup lists in project' : 'Lookup lists'}</div>
                    <div className="flex flex-row items-center">
                        {lookupListsFinal.map((lookupList: LookupListWithOnClick) => (
                            <Tooltip key={lookupList.id} content={TOOLTIPS_DICT.GENERAL.IMPORT_STATEMENT} color="invert" placement="top">
                                <span onClick={lookupList.onClick}>
                                    <div className="cursor-pointer border items-center px-2 py-0.5 rounded text-xs font-medium text-center mr-2">
                                        {lookupList.pythonVariable} - {lookupList.termCount}
                                    </div>
                                </span>
                            </Tooltip>
                        ))}
                    </div>
                </div>
                {
                    currentAttribute.dataType == DataTypeEnum.LLM_RESPONSE &&
                    <LLMResponseConfig disabled={currentAttribute.state == AttributeState.USABLE} attributeId={currentAttribute?.id} fullLlmConfig={additionalConfigTmp} setFullLlmConfig={setAdditionalConfigTmp} apiKey={additionalConfigTmp?.llmConfig.apiKey} noPlayground={currentAttribute.state == AttributeState.USABLE} />
                }
                <div className="flex flex-row items-center justify-between my-3">
                    <div className="flex flex-row flex-nowrap items-center">
                        <span className="text-sm leading-5 font-medium text-gray-700 inline-block mr-2">{currentAttribute.dataType == DataTypeEnum.LLM_RESPONSE ? 'Postprocessing' : 'Editor'}</span>
                        {currentAttribute.dataType == DataTypeEnum.LLM_RESPONSE &&
                            <Tooltip content={TOOLTIPS_DICT.ATTRIBUTE_CALCULATION.LLM_POSTPROCESSING_CODE} color="invert" placement="right">
                                <KernDropdown
                                    buttonName="Use code example"
                                    options={LLM_CODE_TEMPLATE_OPTIONS}
                                    dropdownWidth="w-52"
                                    disabled={currentAttribute.state == AttributeState.USABLE}
                                    selectedOption={selectCodeTemplate}
                                />
                            </Tooltip>}
                    </div>
                    <div className="flex flex-row flex-nowrap">
                        <VisitBricksButton urlExtension="generators" tooltipPlacement="left" size="small" />
                        <Tooltip content={TOOLTIPS_DICT.ATTRIBUTE_CALCULATION.AVAILABLE_LIBRARIES} placement="bottom" color="invert">
                            <a href="https://github.com/code-kern-ai/refinery-ac-exec-env/blob/dev/requirements.txt"
                                target="_blank"
                                className="ml-2 bg-white text-gray-700 text-xs font-semibold  px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none">
                                See installed libraries
                            </a>
                        </Tooltip>
                    </div>
                </div>

                <div className="border mt-1 relative">
                    <Editor
                        height="400px"
                        defaultLanguage={'python'}
                        value={editorValue}
                        options={editorOptions}
                        onChange={(value) => {
                            setEditorValue(value);
                            setEnableButton(true);
                        }}
                    />
                </div>

                <div className="mt-2 flex flex-grow justify-between items-center float-right">
                    {checkUnsavedChanges && <div className="flex items-center">
                        <div className="text-sm font-normal">Saving...</div>
                        <LoadingIcon color="indigo" />
                    </div>}
                </div>


                <ExecutionContainer currentAttribute={currentAttribute} tokenizationProgress={tokenizationProgress} enableRunButton={enableRunButton} checkUnsavedChanges={checkUnsavedChanges}
                    setEnabledButton={(value: boolean) => setEnableButton(value)}
                    refetchCurrentAttribute={() => {
                        getAttributeByAttributeId(projectId, currentAttribute?.id, (attribute) => {
                            if (attribute == null) setCurrentAttribute(null);
                            else setCurrentAttribute(postProcessCurrentAttribute(attribute));
                        });
                    }} />
                <ContainerLogs logs={currentAttribute.logs} type="attribute" />

                <div className="mt-8">
                    <div className="text-sm leading-5 font-medium text-gray-700 inline-block">Calculation progress</div>
                    {(currentAttribute.progress == 0 || isNaN(currentAttribute.progress)) && currentAttribute.state == AttributeState.INITIAL && <div className="bg-white">
                        <div className="py-6 text-sm leading-5 font-normal text-gray-500">This attribute was not yet run.</div>
                    </div>}
                    {currentAttribute.progress == 0.9 && currentAttribute.state == AttributeState.INITIAL && <div className="bg-white">
                        <div className="py-6 text-sm leading-5 font-normal text-gray-500">This attribute was not yet run.</div>
                    </div>}
                    {currentAttribute.progress < 1 && currentAttribute.state == AttributeState.RUNNING &&
                        <div className=" mb-4 card border border-gray-200 bg-white flex-grow overflow-visible rounded-2xl">
                            <div className="card-body p-6">
                                <div className="flex flex-row items-center">
                                    <Tooltip content={TOOLTIPS_DICT.ATTRIBUTE_CALCULATION.BEING_EXECUTED} color="invert" placement="right" className="relative z-10 cursor-auto"><LoadingIcon /></Tooltip>
                                    <div className="text-sm leading-5 font-normal text-gray-500 w-full">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                            <div className="bg-green-400 h-2.5 rounded-full" style={{ 'width': (currentAttribute.progress * 100) + '%' }}>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>}
                    {currentAttribute.state !== AttributeState.RUNNING && currentAttribute.state !== AttributeState.INITIAL && <div className="flex flex-row items-center">
                        {currentAttribute.state == AttributeState.USABLE && <Tooltip content={TOOLTIPS_DICT.GENERAL.SUCCESSFULLY_CREATED} color="invert" className="cursor-auto">
                            <MemoIconCircleCheckFilled className="h-6 w-6 text-green-500" />
                        </Tooltip>}
                        {currentAttribute.state == AttributeState.FAILED && <Tooltip content={TOOLTIPS_DICT.GENERAL.ERROR} color="invert" className="cursor-auto">
                            <MemoIconAlertTriangleFilled className="h-6 w-6 text-red-500" />
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