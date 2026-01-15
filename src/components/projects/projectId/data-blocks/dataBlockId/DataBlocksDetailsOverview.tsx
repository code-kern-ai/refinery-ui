import { selectProjectId } from "@/src/reduxStore/states/project";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import { MemoIconArrowLeft, MemoIconPlayerPlay } from "@/submodules/react-components/components/kern-icons/icons";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectDataBlock, setActiveDataBlock, updateDataBlocksState } from "@/src/reduxStore/states/pages/data-blocks";
import { getDataBlock, updateDataBlock, executeDataBlockQuery } from "@/src/services/base/data-blocks";
import { DataBlockProperty, DataBlockType, SQLTemplates } from "@/src/types/components/projects/projectId/data-blocks/data-blocks";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { getSQLTemplatesDict } from "@/src/util/components/projects/projectId/data-blocks/data-blocks";
import CopyToClipboard from "@/submodules/react-components/components/CopyToClipboard";
import { testGroupByClause, testOrderByClause, testSelectClause, testWhereClause } from "@/src/services/base/misc";
import ExtendDataBlockSection from "./ExtendDataBlockSection";
import { forkJoin, Observable } from "rxjs";
import DataBlockResultsSection from "./DataBlockResultsSection";

export default function DataBlocksDetailsOverview() {
    const router = useRouter();
    const dispatch = useDispatch();

    const dataBlockId = router.query.dataBlockId;
    const projectId = useSelector(selectProjectId);
    const currentDataBlock = useSelector(selectDataBlock);

    const [isHeaderNormal, setIsHeaderNormal] = useState(true);
    const [isNameOpen, setIsNameOpen] = useState(false);
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
    const [sqlTemplate, setSQLTemplate] = useState<SQLTemplates>(SQLTemplates.BLANK_QUERY);
    const [sqlTemplateState, setSQLTemplateState] = useState<any>({
        selectClause: '',
        whereClause: '',
        groupByClause: '',
        orderByClause: '',
    });
    const [sqlTemplatePreview, setSQLTemplatePreview] = useState<any>({
        selectClause: '',
        whereClause: '',
        groupByClause: '',
        orderByClause: '',
        from_clause: '',
    });
    const [previewText, setPreviewText] = useState('');
    const [isTestQuerySuccess, setIsTestQuerySuccess] = useState(false);
    const nameRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLInputElement>(null);
    const isInitializingRef = useRef(false);

    useEffect(() => {
        if (!dataBlockId) return;
        getDataBlock(dataBlockId as string, (res) => {
            dispatch(setActiveDataBlock(res));
        });
    }, [dataBlockId]);

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
        });
        setPreviewText(preview.selectClause + '\n' + preview.from_clause + '\n' + preview.whereClause);
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
        const clauses = [selectClause, sqlTemplatePreview.from_clause, whereClause, groupByClause, orderByClause].filter(clause => clause.trim() !== '');
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
        if (!currentDataBlock || currentDataBlock.name == "") return;
        updateDataBlock(projectId, currentDataBlock.id, currentDataBlock.name, currentDataBlock.description, (res) => {
            dispatch(updateDataBlocksState(currentDataBlock.id, { name: currentDataBlock.name, description: currentDataBlock.description }));
        });
    }, [currentDataBlock]);

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

    const testQuery = useCallback(() => {
        const wrapCallbackAsObservable = <T,>(fn: (arg: T, callback: (result: any) => void) => void, arg: T): Observable<any> => {
            return new Observable(observer => {
                fn(arg, (result) => {
                    observer.next(result);
                    observer.complete();
                });
            });
        };
        const observables: any = {
            select: wrapCallbackAsObservable(testSelectClause, sqlTemplateState.selectClause),
        };
        if (sqlTemplateState.whereClause.trim()) {
            observables.where = wrapCallbackAsObservable(testWhereClause, sqlTemplateState.whereClause);
        }
        if (sqlTemplateState.orderByClause.trim()) {
            observables.orderBy = wrapCallbackAsObservable(testOrderByClause, sqlTemplateState.orderByClause);
        }
        if (sqlTemplateState.groupByClause.trim()) {
            observables.groupBy = wrapCallbackAsObservable(testGroupByClause, sqlTemplateState.groupByClause);
        }
        forkJoin(observables).subscribe({
            next: (results: any) => {
                let error = '';
                if (!results.select.isValid)
                    error += 'SELECT clause is NOT valid: ' + results.select.denyReason;
                if (results.where && !results.where.isValid)
                    error += 'WHERE clause is NOT valid: ' + results.where.denyReason;
                if (results.groupBy && !results.groupBy.isValid)
                    error += 'GROUP BY is NOT valid: ' + results.groupBy.denyReason;
                if (results.orderBy && !results.orderBy.isValid)
                    error += 'ORDER BY is NOT valid: ' + results.orderBy.denyReason;
                const isValid = Object.values(results).every((r: any) => r.isValid);
                setIsTestQuerySuccess(isValid);
                alert(isValid ? "Everything is valid" : error);
            }
        });
    }, [sqlTemplateState, sqlTemplatePreview]);

    const executeQuery = useCallback(() => {
        executeDataBlockQuery(currentDataBlock.id, sqlTemplate, sqlTemplateState, () => {
            refetchDataBlockById();
        });
    }, [currentDataBlock, sqlTemplate, sqlTemplateState]);

    const refetchDataBlockById = useCallback(() => {
        getDataBlock(currentDataBlock.id, (res) => {
            dispatch(setActiveDataBlock(res));
        });
    }, [currentDataBlock]);

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
                    <div className="text-sm leading-5 font-medium text-gray-700">SQL template</div>
                    <KernDropdown options={Object.values(SQLTemplates)}
                        buttonName={sqlTemplate}
                        selectedOption={setSQLTemplate} dropdownWidth="w-52" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="select-query" className="text-sm leading-5 font-medium text-gray-700">Select</label>
                            <textarea id="select-query" value={sqlTemplateState.selectClause} className="w-full border-gray-300 rounded-md placeholder-italic border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                                onChange={(e) => setSQLTemplateState({ ...sqlTemplateState, selectClause: e.target.value })} />
                        </div>
                        <div>
                            <label htmlFor="where-query" className="text-sm leading-5 font-medium text-gray-700">Where</label>
                            <textarea id="where-query" value={sqlTemplateState.whereClause} className="w-full border-gray-300 rounded-md placeholder-italic border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                                onChange={(e) => setSQLTemplateState({ ...sqlTemplateState, whereClause: e.target.value })} />
                        </div>
                        <div>
                            <label htmlFor="group-by-query" className="text-sm leading-5 font-medium text-gray-700">Group by</label>
                            <textarea id="group-by-query" value={sqlTemplateState.groupByClause} className="w-full border-gray-300 rounded-md placeholder-italic border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                                onChange={(e) => setSQLTemplateState({ ...sqlTemplateState, groupByClause: e.target.value })} />
                        </div>
                        <div>
                            <label htmlFor="order-by-query" className="text-sm leading-5 font-medium text-gray-700">Order by</label>
                            <textarea id="order-by-query" value={sqlTemplateState.orderByClause} className="w-full border-gray-300 rounded-md placeholder-italic border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                                onChange={(e) => setSQLTemplateState({ ...sqlTemplateState, orderByClause: e.target.value })} />
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
                        <div className='flex flex-row gap-x-2 mt-2'>
                            <KernButton
                                text="Test query"
                                onClick={testQuery}
                                disabled={!sqlTemplateState.selectClause.trim()}
                                icon={MemoIconPlayerPlay}
                            />
                            <KernButton
                                text="Execute query"
                                disabled={!isTestQuerySuccess}
                                onClick={executeQuery}
                                buttonColor="indigo"
                                textColor="white"
                                solidTheme
                            />
                        </div>
                    </div>
                </div>
                {(currentDataBlock.data && currentDataBlock.data.length > 0) && <>
                    {currentDataBlock.type == DataBlockType.STABLE && <ExtendDataBlockSection />}
                    <DataBlockResultsSection />
                </>}
            </div>
        </>}
    </div>
    )
}
