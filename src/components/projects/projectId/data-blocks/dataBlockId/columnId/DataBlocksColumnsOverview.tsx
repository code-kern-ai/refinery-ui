import DangerZone from "@/src/components/shared/danger-zone/DangerZone";
import { selectDataBlock, selectDataBlockColumns, selectUsableDataBlockColumns, setActiveDataBlock, setAllDataBlocks, updateDataBlockColumnById } from "@/src/reduxStore/states/pages/data-blocks";
import { selectAllLookupLists, setAllLookupLists } from "@/src/reduxStore/states/pages/lookup-lists";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { getLookupListsByProjectId } from "@/src/services/base/lookup-lists";
import { getProjectTokenization } from "@/src/services/base/project";
import { DataBlockColumn, DataBlockColumnState, DataBlockColumnType } from "@/src/types/components/projects/projectId/data-blocks/data-blocks";
import { LLMConfig } from "@/src/types/components/projects/projectId/settings/data-schema";
import { DangerZoneEnum } from "@/src/types/shared/danger-zone";
import { DATA_BLOCK_COLUMN_TYPES, postProcessCurrentDataBlockColumn } from "@/src/util/components/projects/projectId/data-blocks/data-blocks";
import { getPythonFunctionRegExMatch, toPythonFunctionName } from "@/submodules/javascript-functions/python-functions-parser";
import { simpleDictCompare } from "@/submodules/javascript-functions/validations";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import useDebounce from "@/submodules/react-components/hooks/useHooks/useDebounce";
import useRefFor from "@/submodules/react-components/hooks/useRefFor";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { debounceTime, distinctUntilChanged, fromEvent, timer } from "rxjs";
import { LLM_CODE_TEMPLATE_EXAMPLES, LLM_CODE_TEMPLATE_OPTIONS } from "../../../attributes/attributeId/LLM/llmTemplates";
import { selectOrganizationId } from "@/src/reduxStore/states/general";
import { useWebsocket } from "@/submodules/react-components/hooks/web-socket/useWebsocket";
import { Application, CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";
import { copyToClipboard } from "@/submodules/javascript-functions/general";
import { MemoIconAlertTriangleFilled, MemoIconArrowLeft, MemoIconCircleCheckFilled } from "@/submodules/react-components/components/kern-icons/icons";
import Statuses from "@/src/components/shared/statuses/Statuses";
import { Tooltip } from "@nextui-org/react";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { LLM_PROVIDER_OPTIONS } from "@/src/util/components/projects/projectId/settings/attribute-calculation-helper";
import { InfoButton } from "@/submodules/react-components/components/InfoButton";
import LLMResponseConfig from "../../../attributes/attributeId/LLMResponseConfig";
import { Editor } from "@monaco-editor/react";
import LoadingIcon from "@/submodules/react-components/components/LoadingIcon";
import { getDataBlock, getDataBlockColumnByColumnId, getDataBlocks, updateDataBlockColumn } from "@/src/services/base/data-blocks";
import ExecutionContainer from "../../../attributes/attributeId/ExecutionContainer";
import ContainerLogs from "@/src/components/shared/logs/ContainerLogs";
import { getColorForDataType } from "@/src/util/components/projects/projectId/settings/data-schema-helper";

const EDITOR_OPTIONS = { theme: 'vs-light', language: 'python', readOnly: false };


export default function DataBlocksColumnsOverview() {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const dataBlock = useSelector(selectDataBlock);
    const dataBlockColumns = useSelector(selectUsableDataBlockColumns);

    const [currentDataBlockColumn, setCurrentDataBlockColumn] = useState<DataBlockColumn>(null);
    const [isHeaderNormal, setIsHeaderNormal] = useState(true);
    const [isNameOpen, setIsNameOpen] = useState(false);
    const [duplicateNameExists, setDuplicateNameExists] = useState(false);
    const [editorOptions, setEditorOptions] = useState(EDITOR_OPTIONS);
    const [tokenizationProgress, setTokenizationProgress] = useState(0);
    const [editorValue, setEditorValue] = useState('');
    const [dataBlockColumnName, setDataBlockColumnName] = useState('');
    const [checkUnsavedChanges, setCheckUnsavedChanges] = useState(false);
    const [enableRunButton, setEnableButton] = useState(false);
    const [additionalConfigTmp, setAdditionalConfigTmp] = useState<LLMConfig>(null);

    const currentDataBlockColumnRef = useRefFor(currentDataBlockColumn);
    const debouncedConfig = useDebounce(additionalConfigTmp, 1000);

    const dataBlockColumnsFinal = useMemo(() => {
        if (!dataBlockColumns) return [];
        return dataBlockColumns.map((dataBlockColumn: DataBlockColumn) => {
            return {
                ...dataBlockColumn,
                color: getColorForDataType(dataBlockColumn.columnDataType),
            }
        })
    }, [dataBlockColumns]);

    const updateSourceCode = useCallback((value: string, dataBlockColumnNameParam?: string) => {
        if (!dataBlock?.id) return;
        var regMatch: any = getPythonFunctionRegExMatch(value);
        if (!regMatch) {
            console.log("Can't find python function name -- seems wrong -- better dont save");
            return;
        }
        const finalSourceCode = value.replace(regMatch[0], 'def ac(record)');
        updateDataBlockColumn(dataBlock.id, currentDataBlockColumn.id, (res) => {

        }, null, null, dataBlockColumnNameParam, finalSourceCode);
    }, [currentDataBlockColumn, dataBlock?.id]);

    useEffect(() => setAdditionalConfigTmp(currentDataBlockColumn?.additionalConfig), [currentDataBlockColumn?.additionalConfig])

    useEffect(() => {
        if (!projectId) return;
        checkProjectTokenization();
    }, [projectId]);

    useEffect(() => {
        if (dataBlock) return;
        getDataBlock(router.query.dataBlockId as string, (res) => {
            dispatch(setActiveDataBlock(res));
        });
    }, [dataBlock, router.query.dataBlockId]);

    useEffect(() => {
        if (currentDataBlockColumn || !dataBlock) return;
        getDataBlockColumnByColumnId(dataBlock.id, router.query.columnId as string, (dataBlockColumn) => {
            const currentDataBlockColumn = postProcessCurrentDataBlockColumn(dataBlockColumn);
            setCurrentDataBlockColumn(currentDataBlockColumn);
            setEditorValue(currentDataBlockColumn?.sourceCodeToDisplay);
        });
    }, [dataBlock, currentDataBlockColumn, router.query.columnId])


    useEffect(() => {
        if (!currentDataBlockColumn) return;
        if (currentDataBlockColumn.saveSourceCode) {
            updateSourceCode(currentDataBlockColumn.sourceCode);
        }
        if (currentDataBlockColumn.state == DataBlockColumnState.USABLE || currentDataBlockColumn.state == DataBlockColumnState.RUNNING) {
            setEditorOptions({ ...EDITOR_OPTIONS, readOnly: true });
            setCheckUnsavedChanges(false);
        } else {
            setEditorOptions({ ...EDITOR_OPTIONS, readOnly: false });
        }
        setDataBlockColumnName(currentDataBlockColumn.name);
    }, [currentDataBlockColumn]);

    useEffect(() => {
        if (!currentDataBlockColumn) return;
        if (currentDataBlockColumn.sourceCodeToDisplay == editorValue || currentDataBlockColumn.state == DataBlockColumnState.USABLE) return;
        const observer = fromEvent(document, 'keyup');
        const spinner = observer.subscribe(() => {
            setCheckUnsavedChanges(true);
        });
        const subscription = observer.pipe(
            debounceTime(2000),
            distinctUntilChanged()
        ).subscribe(() => {
            const regMatch: any = getPythonFunctionRegExMatch(editorValue);
            changeDataBlockColumnName(regMatch ? regMatch[2] : '');
            setCurrentDataBlockColumn({ ...currentDataBlockColumn, sourceCode: editorValue });
            updateSourceCode(editorValue);
            setCheckUnsavedChanges(false);
        });
        return () => {
            spinner.unsubscribe();
            subscription.unsubscribe();
        }
    }, [editorValue, currentDataBlockColumn]);


    useEffect(() => {
        if (!dataBlock?.id) return;
        if (!currentDataBlockColumnRef.current || !currentDataBlockColumnRef.current.additionalConfig || simpleDictCompare(currentDataBlockColumnRef.current?.additionalConfig, debouncedConfig)) return;
        const dataBlockColumnNew = { ...currentDataBlockColumnRef.current };
        const finalConfig = { ...debouncedConfig };
        if (finalConfig.llmConfig && finalConfig.llmIdentifier == 'Azure Foundry') {
            delete finalConfig.llmConfig.openAioSeries;
        }
        dataBlockColumnNew.additionalConfig = { ...finalConfig };
        updateDataBlockColumn(dataBlock.id, currentDataBlockColumn.id, (res) => {
            setCurrentDataBlockColumn(postProcessCurrentDataBlockColumn(dataBlockColumnNew));
            dispatch(updateDataBlockColumnById(dataBlockColumnNew));
            setEnableButton(true);
        }, null, null, null, null, finalConfig);

    }, [debouncedConfig, dataBlock?.id])

    function openName(open: boolean) {
        setIsNameOpen(open);
        if (!open && dataBlockColumnName != currentDataBlockColumn.name) {
            if (dataBlockColumnName.trim().length == 0) {
                setDataBlockColumnName(currentDataBlockColumn.name);
                return;
            }
            changeDataBlockColumnName(dataBlockColumnName);
        }

    }

    const dataBlockColumnsRef = useRefFor(dataBlockColumns);
    const changeDataBlockColumnName = useCallback((name: string) => {
        if (name == currentDataBlockColumnRef.current.name) return;
        if (name == '') return;
        if (!dataBlock?.id) return;
        const duplicateNameExists = dataBlockColumnsRef.current.find((attribute) => attribute.name == name);
        if (duplicateNameExists) {
            setDuplicateNameExists(true);
            setDataBlockColumnName(currentDataBlockColumnRef.current.name);
            return;
        }
        const dataBlockColumnNew = { ...currentDataBlockColumnRef.current };
        dataBlockColumnNew.name = name;
        dataBlockColumnNew.saveSourceCode = false;
        updateDataBlockColumn(dataBlock.id, currentDataBlockColumnRef.current.id, (res) => {
            setCurrentDataBlockColumn(postProcessCurrentDataBlockColumn(dataBlockColumnNew));
            setEditorValue(dataBlockColumnNew.sourceCode.replace('def ac(record)', 'def ' + dataBlockColumnNew.name + '(record)'));
            dispatch(updateDataBlockColumnById(dataBlockColumnNew));
            setDuplicateNameExists(false);
        }, null, null, dataBlockColumnNew.name);
    }, [dataBlock?.id]);

    const updateDataType = useCallback((option: { name: string, value: string }) => {
        if (!dataBlock?.id) return;
        const dataBlockColumnNew = { ...currentDataBlockColumnRef.current };
        dataBlockColumnNew.dataType = option.value;
        dataBlockColumnNew.dataTypeName = option.name;
        dataBlockColumnNew.saveSourceCode = false;
        updateDataBlockColumn(dataBlock.id, currentDataBlockColumnRef.current.id, (res) => {
            setCurrentDataBlockColumn(postProcessCurrentDataBlockColumn(dataBlockColumnNew));
            dispatch(updateDataBlockColumnById(dataBlockColumnNew));
        }, dataBlockColumnNew.dataType);
    }, [dataBlock?.id]);

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

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (!projectId) return;
        if (!currentDataBlockColumn) return;
        if (msgParts[1] == 'calculate_attribute') {
            if (msgParts[2] == 'progress' && msgParts[3] == currentDataBlockColumn.id) {
                const currentDataBlockColumnCopy = { ...currentDataBlockColumn };
                currentDataBlockColumnCopy.progress = Number(msgParts[4]);
                currentDataBlockColumnCopy.state = DataBlockColumnState.RUNNING;
                dispatch(updateDataBlockColumnById(currentDataBlockColumnCopy));
            } else {
                getDataBlock(dataBlock.id, (res) => {
                    dispatch(setActiveDataBlock(res));
                });
                if (msgParts[2] == 'deleted') return
                getDataBlockColumnByColumnId(dataBlock.id, currentDataBlockColumn.id, (attribute) => {
                    if (!attribute) setCurrentDataBlockColumn(null);
                    else setCurrentDataBlockColumn(postProcessCurrentDataBlockColumn(attribute));
                });
                if (msgParts[2] == "finished") {
                    timer(2000).subscribe(() => checkProjectTokenization());
                }
            }
        }
        if (msgParts[1] == 'tokenization' && msgParts[2] == 'docbin') {
            if (msgParts[3] == 'progress') {
                setTokenizationProgress(Number(msgParts[4]));
            } else if (msgParts[3] == 'state') {
                if (msgParts[4] == 'IN_PROGRESS') setTokenizationProgress(0);
                else if (msgParts[4] == 'FINISHED') {
                    timer(2000).subscribe(() => checkProjectTokenization());
                }
            }
        }
    }, [projectId, currentDataBlockColumn, dataBlock?.id]);

    const selectCodeTemplate = useCallback((option) => {
        if (!currentDataBlockColumnRef.current) return;
        updateSourceCode(LLM_CODE_TEMPLATE_EXAMPLES[option.value]);
        setEditorValue(LLM_CODE_TEMPLATE_EXAMPLES[option.value].replace('def ac(record)', 'def ' + currentDataBlockColumnRef.current.name + '(record)'));
    }, [])

    const orgId = useSelector(selectOrganizationId);
    useWebsocket(orgId, Application.REFINERY, CurrentPage.DATA_BLOCKS_COLUMNS, handleWebsocketNotification, projectId);

    const copyToClipboardFunc = useCallback((name: string) => copyToClipboard(name), []);

    const disabledOptions = useMemo(() => {
        if (!currentDataBlockColumn || currentDataBlockColumn.dataType == DataBlockColumnType.LLM_RESPONSE) return undefined;
        return DATA_BLOCK_COLUMN_TYPES.map((e) => e.value == DataBlockColumnType.LLM_RESPONSE);
    }, [currentDataBlockColumn?.dataType])

    return (projectId && <div className={`bg-white p-4 overflow-y-auto min-h-full h-[calc(100vh-4rem)]`} onScroll={(e: any) => onScrollEvent(e)}>
        {currentDataBlockColumn && <div>
            <div className={`sticky z-40 h-12 ${isHeaderNormal ? 'top-1' : '-top-5'}`}>
                <div className={`bg-white flex-grow ${isHeaderNormal ? '' : 'shadow'}`}>
                    <div className={`flex-row justify-start items-center inline-block ${isHeaderNormal ? 'p-0' : 'flex py-2'}`} style={{ transition: 'all .25s ease-in-out' }}>
                        <a href={`/refinery/projects/${projectId}/data-blocks/${dataBlock.id}`} className="text-green-800 text-sm font-medium">
                            <MemoIconArrowLeft className="h-5 w-5 inline-block text-green-800" />
                            <span className="leading-5">Go back</span>
                        </a>
                        {!isHeaderNormal && <div className="mx-4 text-sm leading-5 font-medium text-gray-500 inline-block">{currentDataBlockColumn.name}</div>}
                        <Statuses status={currentDataBlockColumn.state} page="attributes" initialCaption="Registered" />
                    </div>
                </div>
            </div>
            <div className="w-full">
                <div className={`grid gap-4 ${isHeaderNormal ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {isHeaderNormal && <div className="flex items-center mt-2">
                        <KernButton
                            text="Edit name"
                            disabled={currentDataBlockColumn.state == DataBlockColumnState.USABLE || currentDataBlockColumn.state == DataBlockColumnState.RUNNING}
                            onClick={() => openName(true)}
                            className="mr-3"
                            tooltip={currentDataBlockColumn.state == DataBlockColumnState.USABLE || currentDataBlockColumn.state == DataBlockColumnState.RUNNING ? TOOLTIPS_DICT.ATTRIBUTE_CALCULATION.CANNOT_EDIT_NAME : TOOLTIPS_DICT.ATTRIBUTE_CALCULATION.EDIT_NAME}
                            tooltipPlacement="bottom"
                        />
                        <div className="inline-block" onDoubleClick={() => openName(true)}>
                            {(isNameOpen && currentDataBlockColumn.state != DataBlockColumnState.USABLE && currentDataBlockColumn.state != DataBlockColumnState.RUNNING)
                                ? (<input type="text" value={dataBlockColumnName} onInput={(e: any) => setDataBlockColumnName(toPythonFunctionName(e.target.value))}
                                    onBlur={() => openName(false)} onKeyDown={(e) => { if (e.key == 'Enter') openName(false) }}
                                    className="h-8 text-sm border-gray-300 rounded-md placeholder-italic border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />)
                                : (<div className="mr-4 text-sm leading-5 font-medium text-gray-500 inline-block">{currentDataBlockColumn.name}</div>)}
                        </div>
                    </div>}
                </div>
                {duplicateNameExists && <div className="text-red-700 text-xs mt-2">Data block column name exists</div>}
                <div className="grid grid-cols-2 gap-2 items-center mt-8" style={{ gridTemplateColumns: 'max-content auto' }}>
                    <div className="text-sm leading-5 font-medium text-gray-700">Data type</div>
                    <div className="flex flex-row items-center">
                        <Tooltip color="invert" placement="right" className="cursor-not-allowed" content={currentDataBlockColumn.state == DataBlockColumnState.USABLE || currentDataBlockColumn.state == DataBlockColumnState.RUNNING ? TOOLTIPS_DICT.ATTRIBUTE_CALCULATION.CANNOT_EDIT_DATATYPE : TOOLTIPS_DICT.ATTRIBUTE_CALCULATION.EDIT_DATATYPE}>
                            <KernDropdown buttonName={currentDataBlockColumn.dataTypeName} options={DATA_BLOCK_COLUMN_TYPES} dropdownWidth="w-52"
                                selectedOption={(option: any) => updateDataType(option)} disabledOptions={disabledOptions} disabled={currentDataBlockColumn.state == DataBlockColumnState.USABLE || currentDataBlockColumn.dataType == DataBlockColumnType.LLM_RESPONSE} dropdownClasses="z-30" />
                        </Tooltip>
                        {currentDataBlockColumn.dataType == DataBlockColumnType.LLM_RESPONSE && <div className="ml-3 flex flex-row flex-nowrap w-full items-center gap-x-2">
                            <label className="block text-sm font-medium text-gray-900 whitespace-nowrap">Provider</label>
                            <KernDropdown
                                buttonName={additionalConfigTmp?.llmIdentifier ?? 'Select LLM provider'}
                                options={LLM_PROVIDER_OPTIONS}
                                dropdownWidth="w-64"
                                selectedOption={(option) => setAdditionalConfigTmp(p => ({ ...p, llmIdentifier: option }))}
                                disabled={currentDataBlockColumn.state == DataBlockColumnState.USABLE}
                            />
                            <label className={"block text-sm font-medium text-gray-900 whitespace-nowrap" + (additionalConfigTmp?.llmIdentifier != 'Privatemode AI' ? "" : " line-through")}>Api Key</label>

                            {additionalConfigTmp?.llmIdentifier != 'Privatemode AI' ?
                                <input type="text" disabled={currentDataBlockColumn.state == DataBlockColumnState.USABLE} value={additionalConfigTmp?.llmConfig.apiKey || ""} onInput={(e: any) => setAdditionalConfigTmp(p => ({ ...p, llmConfig: { ...additionalConfigTmp.llmConfig, apiKey: e.target.value } }))}
                                    className="h-8 text-sm border-gray-300 rounded-md placeholder-italic w-full border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:opacity-50" />
                                : <InfoButton content="Set in backend" divPosition="right" infoButtonSize="sm" />}
                        </div>}
                    </div>
                    <div className="text-sm leading-5 font-medium text-gray-700 inline-block">Data block columns</div>
                    <div className="flex flex-row items-center">
                        {dataBlockColumnsFinal.length == 0 && <div className="text-sm font-normal text-gray-500">No usable data block columns.</div>}
                        {dataBlockColumnsFinal.map((dataBlockColumn: DataBlockColumn) => (
                            <Tooltip key={dataBlockColumn.id} content={dataBlockColumn.columnDataType + ' - ' + TOOLTIPS_DICT.GENERAL.CLICK_TO_COPY} color="invert" placement="top">
                                <span onClick={() => copyToClipboardFunc(dataBlockColumn.columnName)}>
                                    <div className={`cursor-pointer border items-center px-2 py-0.5 rounded text-xs font-medium text-center mr-2 ${'bg-' + dataBlockColumn.color + '-100'} ${'text-' + dataBlockColumn.color + '-700'} ${'border-' + dataBlockColumn.color + '-400'} ${'hover:bg-' + dataBlockColumn.color + '-200'}`}>
                                        {dataBlockColumn.columnName}
                                    </div>
                                </span>
                            </Tooltip>
                        ))}
                    </div>
                </div>
                {
                    currentDataBlockColumn.dataType == DataBlockColumnType.LLM_RESPONSE &&
                    <LLMResponseConfig disabled={currentDataBlockColumn.state == DataBlockColumnState.USABLE} dataBlockColumnId={currentDataBlockColumn?.id} fullLlmConfig={additionalConfigTmp} setFullLlmConfig={setAdditionalConfigTmp} apiKey={additionalConfigTmp?.llmConfig.apiKey} noPlayground={currentDataBlockColumn.state == DataBlockColumnState.USABLE} />
                }
                <div className="flex flex-row items-center justify-between my-3">
                    <div className="flex flex-row flex-nowrap items-center">
                        <span className="text-sm leading-5 font-medium text-gray-700 inline-block mr-2">{currentDataBlockColumn.dataType == DataBlockColumnType.LLM_RESPONSE ? 'Postprocessing' : 'Editor'}</span>
                        {currentDataBlockColumn.dataType == DataBlockColumnType.LLM_RESPONSE &&
                            <Tooltip content={TOOLTIPS_DICT.ATTRIBUTE_CALCULATION.LLM_POSTPROCESSING_CODE} color="invert" placement="right">
                                <KernDropdown
                                    buttonName="Use code example"
                                    options={LLM_CODE_TEMPLATE_OPTIONS}
                                    dropdownWidth="w-52"
                                    disabled={currentDataBlockColumn.state == DataBlockColumnState.USABLE}
                                    selectedOption={selectCodeTemplate}
                                />
                            </Tooltip>}
                    </div>
                    <div className="flex flex-row flex-nowrap">
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


                <ExecutionContainer currentAttribute={currentDataBlockColumn} tokenizationProgress={tokenizationProgress} enableRunButton={enableRunButton} checkUnsavedChanges={checkUnsavedChanges}
                    setEnabledButton={(value: boolean) => setEnableButton(value)}
                    refetchCurrentAttribute={() => {
                        getDataBlockColumnByColumnId(dataBlock.id, router.query.columnId as string, (dataBlockColumn) => {
                            if (dataBlockColumn == null) setCurrentDataBlockColumn(null);
                            else setCurrentDataBlockColumn(postProcessCurrentDataBlockColumn(dataBlockColumn));
                        });
                    }} isDataBlockColumn />
                <ContainerLogs logs={currentDataBlockColumn.logs} type="attribute" />

                <div className="mt-8">
                    <div className="text-sm leading-5 font-medium text-gray-700 inline-block">Calculation progress</div>
                    {(currentDataBlockColumn.progress == 0 || isNaN(currentDataBlockColumn.progress)) && currentDataBlockColumn.state == DataBlockColumnState.INITIAL && <div className="bg-white">
                        <div className="py-6 text-sm leading-5 font-normal text-gray-500">This attribute was not yet run.</div>
                    </div>}
                    {currentDataBlockColumn.progress == 0.9 && currentDataBlockColumn.state == DataBlockColumnState.INITIAL && <div className="bg-white">
                        <div className="py-6 text-sm leading-5 font-normal text-gray-500">This attribute was not yet run.</div>
                    </div>}
                    {currentDataBlockColumn.progress < 1 && currentDataBlockColumn.state == DataBlockColumnState.RUNNING &&
                        <div className=" mb-4 card border border-gray-200 bg-white flex-grow overflow-visible rounded-2xl">
                            <div className="card-body p-6">
                                <div className="flex flex-row items-center">
                                    <Tooltip content={TOOLTIPS_DICT.ATTRIBUTE_CALCULATION.BEING_EXECUTED} color="invert" placement="right" className="relative z-10 cursor-auto"><LoadingIcon /></Tooltip>
                                    <div className="text-sm leading-5 font-normal text-gray-500 w-full">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                            <div className="bg-green-400 h-2.5 rounded-full" style={{ 'width': (currentDataBlockColumn.progress * 100) + '%' }}>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>}
                    {currentDataBlockColumn.state !== DataBlockColumnState.RUNNING && currentDataBlockColumn.state !== DataBlockColumnState.INITIAL && <div className="flex flex-row items-center">
                        {currentDataBlockColumn.state == DataBlockColumnState.USABLE && <Tooltip content={TOOLTIPS_DICT.GENERAL.SUCCESSFULLY_CREATED} color="invert" className="cursor-auto">
                            <MemoIconCircleCheckFilled className="h-6 w-6 text-green-500" />
                        </Tooltip>}
                        {currentDataBlockColumn.state == DataBlockColumnState.FAILED && <Tooltip content={TOOLTIPS_DICT.GENERAL.ERROR} color="invert" className="cursor-auto">
                            <MemoIconAlertTriangleFilled className="h-6 w-6 text-red-500" />
                        </Tooltip>}
                        <div className="py-6 text-sm leading-5 font-normal text-gray-500">
                            {currentDataBlockColumn.state === 'FAILED' ? 'Attribute calculation ran into errors.' : 'Attribute calculation finished successfully.'}
                        </div>
                    </div>}
                </div>

                <DangerZone elementType={DangerZoneEnum.DATA_BLOCK_COLUMN} name={currentDataBlockColumn.name} id={currentDataBlockColumn.id} />
            </div >
        </div >}
    </div >)
}