import { selectProjectId } from "@/src/reduxStore/states/project";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import { MemoIconAlertTriangleFilled, MemoIconArrowLeft, MemoIconInfoCircleFilled, MemoIconPlayerPlay } from "@/submodules/react-components/components/kern-icons/icons";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectDataBlock, setActiveDataBlock, updateDataBlocksState } from "@/src/reduxStore/states/pages/data-blocks";
import { getDataBlock, updateDataBlock, executeDataBlockQuery } from "@/src/services/base/data-blocks";
import { DataBlockProperty, DataBlockType, SQLTemplates } from "@/src/types/components/projects/projectId/data-blocks/data-blocks";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { getSQLTemplatesDict } from "@/src/util/components/projects/projectId/data-blocks/data-blocks";
import CopyToClipboard from "@/submodules/react-components/components/CopyToClipboard";
import { validateSQLClauses } from "@/src/services/base/misc";
import ExtendDataBlockSection from "./ExtendDataBlockSection";
import DataBlockResultsSection from "./DataBlockResultsSection";
import { Tooltip } from "@nextui-org/react";
import { selectOrganizationId } from "@/src/reduxStore/states/general";
import { useWebsocket } from "@/submodules/react-components/hooks/web-socket/useWebsocket";
import { Application, CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";

const DEFAULT_SQL_TEMPLATE = {
    selectClause: '',
    whereClause: '',
    groupByClause: '',
    orderByClause: '',
    limitClause: 100,
    from_clause: '',
}

export default function DataBlocksDetailsOverview() {
    const router = useRouter();
    const dispatch = useDispatch();

    const dataBlockId = router.query.dataBlockId;
    const projectId = useSelector(selectProjectId);
    const orgId = useSelector(selectOrganizationId);
    const currentDataBlock = useSelector(selectDataBlock);

    const [isHeaderNormal, setIsHeaderNormal] = useState(true);
    const [isNameOpen, setIsNameOpen] = useState(false);
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
    const [sqlTemplate, setSQLTemplate] = useState<SQLTemplates>(SQLTemplates.BLANK_QUERY);
    const [sqlTemplateState, setSQLTemplateState] = useState<any>(DEFAULT_SQL_TEMPLATE);
    const [sqlTemplatePreview, setSQLTemplatePreview] = useState<any>(DEFAULT_SQL_TEMPLATE);
    const [previewText, setPreviewText] = useState('');
    const [isTestQuerySuccess, setIsTestQuerySuccess] = useState(false);
    const [isQueryExecuted, setIsQueryExecuted] = useState(false);
    const nameRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLInputElement>(null);
    const isInitializingRef = useRef(false);

    useEffect(() => {
        if (!dataBlockId || !projectId) return;
        getDataBlock(projectId, dataBlockId as string, (res) => {
            dispatch(setActiveDataBlock(res));
        });
    }, [projectId, dataBlockId]);

    useEffect(() => {
        if (!currentDataBlock || !currentDataBlock.sqlConfig) return;
        isInitializingRef.current = true;
        setSQLTemplate(currentDataBlock.sqlConfig.template);
        setSQLTemplateState(currentDataBlock.sqlConfig.config);
        setTimeout(() => {
            isInitializingRef.current = false;
        }, 0);
    }, [currentDataBlock]);

    useEffect(() => {
        if (!projectId || !sqlTemplate) return;
        const preview = getSQLTemplatesDict(projectId)[sqlTemplate];
        setSQLTemplatePreview({
            selectClause: preview.selectClause,
            whereClause: preview.whereClause,
            groupByClause: preview.groupByClause,
            orderByClause: preview.orderByClause,
            from_clause: preview.from_clause,
            limitClause: preview.limitClause,
        });
        setPreviewText(preview.selectClause + '\n' + preview.from_clause + '\n' + preview.whereClause + '\n' + preview.limitClause);
    }, [sqlTemplate, projectId]);

    useEffect(() => {
        if (!sqlTemplatePreview.from_clause) return;
        let selectClause = sqlTemplatePreview.selectClause;
        if (sqlTemplateState.selectClause.trim()) {
            selectClause = sqlTemplatePreview.selectClause + sqlTemplateState.selectClause;
        }
        let whereClause = sqlTemplatePreview.whereClause;
        if (sqlTemplateState.whereClause.trim()) {
            whereClause = sqlTemplatePreview.whereClause + ' AND (' + sqlTemplateState.whereClause + ')';
        }
        let groupByClause = '';
        if (sqlTemplateState.groupByClause.trim()) {
            groupByClause = sqlTemplatePreview.groupByClause + sqlTemplateState.groupByClause;
        }
        let orderByClause = '';
        if (sqlTemplateState.orderByClause.trim()) {
            orderByClause = sqlTemplatePreview.orderByClause + sqlTemplateState.orderByClause;
        }
        let limitClause = '';
        if (sqlTemplateState.limitClause) {
            limitClause = sqlTemplatePreview.limitClause + sqlTemplateState.limitClause;
        }
        const clauses = [selectClause, sqlTemplatePreview.from_clause, whereClause, groupByClause, orderByClause, limitClause].filter(clause => clause.trim() !== '');
        setPreviewText(clauses.join('\n'));
    }, [sqlTemplateState, sqlTemplatePreview]);

    const onScrollEvent = useCallback((event: any) => {
        if (!(event.target instanceof HTMLElement)) return;
        if ((event.target as HTMLElement).scrollTop > 0) {
            setIsHeaderNormal(false);
        } else {
            setIsHeaderNormal(true);
        }
    }, []);

    const openProperty = useCallback((open: boolean, property: string) => {
        if (property == DataBlockProperty.NAME) {
            setIsNameOpen(open);
            if (open) {
                setTimeout(() => {
                    nameRef.current?.focus();
                }, 100);
            }
        }
        if (property == DataBlockProperty.DESCRIPTION) {
            setIsDescriptionOpen(open);
            if (open) {
                setTimeout(() => {
                    descriptionRef.current?.focus();
                }, 100);
            }
        }
        if (!open) {
            saveDataBlock();
        }
    }, [currentDataBlock]);

    const saveDataBlock = useCallback(() => {
        if (!currentDataBlock || !projectId || currentDataBlock.name == "") return;
        updateDataBlock(projectId, currentDataBlock.id, currentDataBlock.name, currentDataBlock.description, (res) => {
            dispatch(updateDataBlocksState(currentDataBlock.id, { name: currentDataBlock.name, description: currentDataBlock.description }));
        });
    }, [projectId, currentDataBlock]);

    const changeDataBlock = useCallback((value: string, property: string) => {
        if (!currentDataBlock) return;
        let updatedDataBlock = { ...currentDataBlock };
        if (property == DataBlockProperty.NAME) {
            updatedDataBlock.name = value;
        }
        if (property == DataBlockProperty.DESCRIPTION) {
            updatedDataBlock.description = value;
        }
        dispatch(setActiveDataBlock(updatedDataBlock));
    }, [currentDataBlock]);

    const validateQuery = useCallback(() => {
        setIsQueryExecuted(false);
        const sqlClauses = {
            select: sqlTemplateState.selectClause,
            where: sqlTemplateState.whereClause,
            groupBy: sqlTemplateState.groupByClause,
            orderBy: sqlTemplateState.orderByClause,
            limit: sqlTemplateState.limitClause,
        }
        validateSQLClauses(sqlClauses, (res) => {
            if (res.isValid) {
                setIsTestQuerySuccess(true);
                alert('Everything is valid');
                return;
            }
            let error = '';
            if (res.denyReason.select) {
                error += 'SELECT clause is NOT valid: ' + res.denyReason.select;
            }
            if (res.denyReason.where) {
                error += 'WHERE clause is NOT valid: ' + res.denyReason.where;
            }
            if (res.denyReason.groupBy) {
                error += 'GROUP BY is NOT valid: ' + res.denyReason.group_by;
            }
            if (res.denyReason.orderBy) {
                error += 'ORDER BY is NOT valid: ' + res.denyReason.order_by;
            }
            if (res.denyReason.limit) {
                error += 'LIMIT is NOT valid: ' + res.denyReason.limit;
            }
            if (res.denyReason.db_check) {
                error += 'DB check is NOT valid: ' + res.denyReason.db_check;
            }
            setIsTestQuerySuccess(false);
            alert(error);
        });
    }, [sqlTemplateState, sqlTemplatePreview]);

    const executeQuery = useCallback(() => {
        executeDataBlockQuery(projectId, currentDataBlock.id, sqlTemplate, sqlTemplateState, () => {
            setIsQueryExecuted(true);
            refetchDataBlockById();
        });
    }, [projectId, currentDataBlock, sqlTemplate, sqlTemplateState]);

    const refetchDataBlockById = useCallback(() => {
        getDataBlock(projectId, currentDataBlock.id, (res) => {
            dispatch(setActiveDataBlock(res));
        });
    }, [projectId, currentDataBlock]);

    const addWarning = useMemo(() => {
        if (!currentDataBlock) return null;
        if (currentDataBlock.type == DataBlockType.LIVE) return null;
        const containsRecordId = sqlTemplateState.selectClause.includes('record_id');
        const containsRunningId = sqlTemplateState.selectClause.includes('running_id');
        return [
            containsRecordId ? <Tooltip content="Warning: Column with the name record_id is used in the attribute calculation. Ensure that you don't use the column as alias" color="invert" placement="right" className="cursor-default">
                <MemoIconAlertTriangleFilled className="inline-block text-yellow-400 h-5 w-5" />
            </Tooltip> : null,
            containsRunningId ? <Tooltip content="Warning: Column with the name running_id is used in the attribute calculation. Ensure that you don't use the column as alias" color="invert" placement="right" className="cursor-default">
                <MemoIconAlertTriangleFilled className="inline-block text-yellow-400 h-5 w-5" />
            </Tooltip> : null
        ]
    }, [currentDataBlock?.type, sqlTemplateState.selectClause]);

    const addInfo = useMemo(() => {
        return <Tooltip content={<div className="no-ligatures">{`Queries need to be built like: data->>'<attribute_name>' to work (<attribute_name> does not work)`}</div>} color="invert" placement="right" className="cursor-default">
            <MemoIconInfoCircleFilled className="inline-block text-blue-500 h-5 w-5" />
        </Tooltip>
    }, []);

    const parseSQLClause = useCallback((clause: string, keyword: string): { prefix: string; editable: string } => {
        if (!clause.trim()) {
            return { prefix: keyword, editable: '' };
        }
        const upperClause = clause.toUpperCase();
        const upperKeyword = keyword.toUpperCase();
        if (upperClause.startsWith(upperKeyword)) {
            const prefix = clause.substring(0, keyword.length);
            const editable = clause.substring(keyword.length).trim();
            return { prefix, editable };
        }

        return { prefix: keyword, editable: clause };
    }, []);

    const setAndPrefillSQLTemplateState = useCallback((value: SQLTemplates) => {
        setSQLTemplate(value);
        if (!projectId) return;
        const template = getSQLTemplatesDict(projectId)[value];
        const selectParsed = parseSQLClause(template.selectClause, 'SELECT ');
        let wherePrefix = template.whereClause;
        let whereEditable = '';
        if (template.whereClause && template.whereClause.trim()) {
            wherePrefix = template.whereClause;
            whereEditable = '';
        }

        const groupByParsed = parseSQLClause(template.groupByClause || '', 'GROUP BY ');
        const orderByParsed = parseSQLClause(template.orderByClause || '', 'ORDER BY ');
        let limitPrefix = 'LIMIT ';
        let limitEditable = '';
        if (template.limitClause && template.limitClause.trim()) {
            const limitMatch = template.limitClause.match(/^LIMIT\s+(\d+)/i);
            if (limitMatch) {
                limitPrefix = 'LIMIT ';
                limitEditable = limitMatch[1];
            } else {
                limitPrefix = template.limitClause;
            }
        }

        setSQLTemplatePreview({
            selectClause: selectParsed.prefix,
            whereClause: wherePrefix,
            groupByClause: groupByParsed.prefix,
            orderByClause: orderByParsed.prefix,
            from_clause: template.from_clause,
            limitClause: limitPrefix,
        });
        setSQLTemplateState({
            selectClause: selectParsed.editable,
            whereClause: whereEditable,
            groupByClause: groupByParsed.editable,
            orderByClause: orderByParsed.editable,
            limitClause: limitEditable ? parseInt(limitEditable, 10) : 100,
        });
    }, [projectId, parseSQLClause]);

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (msgParts[1] == 'calculate_attribute') {
            refetchDataBlockById();
        }
    }, [currentDataBlock]);

    useWebsocket(orgId, Application.REFINERY, CurrentPage.DATA_BLOCKS_DETAILS, handleWebsocketNotification, projectId);

    return (projectId && <div className={`bg-white p-4 overflow-y-auto min-h-full h-[calc(100vh-4rem)] w-[calc(100vw-5rem)]`} onScroll={onScrollEvent}>
        {currentDataBlock && <>
            <div className={`sticky z-40 h-12 ${isHeaderNormal ? 'top-1' : '-top-5'}`}>
                <div className={`bg-white flex-grow ${isHeaderNormal ? '' : 'shadow'}`}>
                    <div className={`flex-row justify-start items-center inline-block ${isHeaderNormal ? 'p-0' : 'flex py-2'}`} style={{ transition: 'all .25s ease-in-out' }}>
                        <a href={`/refinery/projects/${projectId}/data-blocks`} onClick={(e) => {
                            e.preventDefault();
                            router.push(`/projects/${projectId}/data-blocks`);
                            dispatch(setActiveDataBlock(null));
                        }} className="text-green-800 text-sm font-medium">
                            <MemoIconArrowLeft className="h-5 w-5 inline-block text-green-800" />
                            <span className="leading-5">Go back</span>
                        </a>
                        {isHeaderNormal && <span className="ml-4 text-sm leading-5 font-medium text-gray-500 inline-block">Type:{currentDataBlock.type}</span>}
                        {!isHeaderNormal && <div className="mx-4 text-sm leading-5 font-medium text-gray-500 inline-block">{currentDataBlock.name} - <span className="text-gray-500">Type:{currentDataBlock.type}</span></div>}
                    </div>
                </div>
            </div>
            <div className="w-full">
                <div className={`grid gap-4 ${isHeaderNormal ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {isHeaderNormal && <div className="flex items-start mt-2">
                        <KernButton
                            text="Edit name"
                            onClick={() => openProperty(true, DataBlockProperty.NAME)}
                            className="mr-3"
                        />
                        <div className="flex-grow" onDoubleClick={() => openProperty(true, DataBlockProperty.NAME)}>
                            {isNameOpen
                                ? (<input type="text" value={currentDataBlock.name} ref={nameRef} onInput={(e: any) => changeDataBlock(e.target.value, DataBlockProperty.NAME)}
                                    onBlur={() => openProperty(false, DataBlockProperty.NAME)} onKeyDown={(e) => { if (e.key == 'Enter') openProperty(false, DataBlockProperty.NAME) }}
                                    className="h-8 w-full border-gray-300 rounded-md placeholder-italic border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />)
                                : (<div className="mr-4 text-sm leading-5 font-medium text-gray-500 inline-block " style={{ marginTop: '6px' }}>{currentDataBlock.name}</div>)}
                        </div>
                    </div>}
                    <div className="flex items-start mt-2">
                        <KernButton
                            text="Edit description"
                            onClick={() => openProperty(true, DataBlockProperty.DESCRIPTION)}
                            className="mr-3"
                        />
                        <div className="flex-grow" onDoubleClick={() => openProperty(true, DataBlockProperty.DESCRIPTION)}>
                            {isDescriptionOpen
                                ? (<input type="text" value={currentDataBlock.description} ref={descriptionRef} onInput={(e: any) => changeDataBlock(e.target.value, DataBlockProperty.DESCRIPTION)}
                                    onBlur={() => openProperty(false, DataBlockProperty.DESCRIPTION)} onKeyDown={(e) => { if (e.key == 'Enter') openProperty(false, DataBlockProperty.DESCRIPTION) }}
                                    className="h-8 w-full border-gray-300 rounded-md placeholder-italic border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />)
                                : (<div className="mr-4 text-sm leading-5 font-medium text-gray-500 inline-block " style={{ marginTop: '6px' }}>{currentDataBlock.description}</div>)}
                        </div>
                    </div>
                </div>
                <div className="my-4">
                    <div className="text-sm leading-5 font-medium text-gray-700 items-center flex gap-x-2">
                        SQL template
                        {sqlTemplate == SQLTemplates.BLANK_QUERY && <span className="inline-block ">{addInfo}</span>}
                    </div>
                    <KernDropdown options={Object.values(SQLTemplates)}
                        buttonName={sqlTemplate}
                        selectedOption={setAndPrefillSQLTemplateState} dropdownWidth="w-52" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="select-query" className="text-sm leading-5 font-medium text-gray-700">Select <span className="inline-block">{addWarning}</span></label>
                            <textarea id="select-query" value={sqlTemplateState.selectClause} className="w-full border-gray-300 rounded-md placeholder-italic border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100 no-ligatures"
                                onChange={(e) => setSQLTemplateState({ ...sqlTemplateState, selectClause: e.target.value })} />
                        </div>
                        <div>
                            <label htmlFor="where-query" className="text-sm leading-5 font-medium text-gray-700">Where</label>
                            <textarea id="where-query" value={sqlTemplateState.whereClause} className="w-full border-gray-300 rounded-md placeholder-italic border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100 no-ligatures"
                                onChange={(e) => setSQLTemplateState({ ...sqlTemplateState, whereClause: e.target.value })} />
                        </div>
                        <div>
                            <label htmlFor="group-by-query" className="text-sm leading-5 font-medium text-gray-700">Group by</label>
                            <textarea id="group-by-query" value={sqlTemplateState.groupByClause} className="w-full border-gray-300 rounded-md placeholder-italic border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100 no-ligatures"
                                onChange={(e) => setSQLTemplateState({ ...sqlTemplateState, groupByClause: e.target.value })} />
                        </div>
                        <div>
                            <label htmlFor="order-by-query" className="text-sm leading-5 font-medium text-gray-700">Order by</label>
                            <textarea id="order-by-query" value={sqlTemplateState.orderByClause} className="w-full border-gray-300 rounded-md placeholder-italic border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100 no-ligatures"
                                onChange={(e) => setSQLTemplateState({ ...sqlTemplateState, orderByClause: e.target.value })} />
                        </div>
                        <div>
                            <label htmlFor="limit-query" className="text-sm leading-5 font-medium text-gray-700">Limit</label>
                            <input
                                id="limit-query"
                                type="number"
                                value={sqlTemplateState.limitClause ?? 100}
                                min="1"
                                max="100"
                                className="w-full h-8 border-gray-300 rounded-md placeholder-italic border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                                onChange={(e) => {
                                    const inputValue = e.target.value;
                                    if (inputValue === '') {
                                        setSQLTemplateState({ ...sqlTemplateState, limitClause: 100 });
                                        return;
                                    }
                                    const numValue = parseInt(inputValue, 10);
                                    if (!isNaN(numValue)) {
                                        const clampedValue = Math.min(Math.max(1, numValue), 100);
                                        setSQLTemplateState({ ...sqlTemplateState, limitClause: clampedValue });
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex flex-row gap-x-2 items-center">
                            <label htmlFor="preview-text" className="text-sm leading-5 font-medium text-gray-700">Preview query</label>
                            <CopyToClipboard nameToCopy={previewText} />
                        </div>

                        <div className="bg-gray-100 p-4 rounded-md flex-1 min-h-0">
                            <pre className="whitespace-pre-wrap text-sm text-gray-800 h-full">{previewText}</pre>
                        </div>
                        <div className='flex flex-row gap-x-2 mt-2 items-center'>
                            <KernButton
                                text="Validate query"
                                onClick={validateQuery}
                                disabled={!sqlTemplateState.selectClause.trim()}
                                icon={MemoIconPlayerPlay}
                            />
                            <KernButton
                                text="Execute query"
                                disabled={!isTestQuerySuccess || isQueryExecuted}
                                onClick={executeQuery}
                                buttonColor="indigo"
                                textColor="white"
                                solidTheme
                            />
                            {isQueryExecuted && currentDataBlock.type == DataBlockType.LIVE && <div className="text-sm leading-5 font-medium text-green-700">Query executed, can be used</div>}
                        </div>
                    </div>
                </div>
                {(currentDataBlock.sqlData && currentDataBlock.sqlData.length > 0) && <>
                    {currentDataBlock.type == DataBlockType.STABLE && <ExtendDataBlockSection />}
                    <DataBlockResultsSection />
                </>}
            </div>
        </>}
    </div>
    )
}
