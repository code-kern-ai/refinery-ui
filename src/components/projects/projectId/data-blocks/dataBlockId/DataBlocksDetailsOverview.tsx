import { selectProjectId } from "@/src/reduxStore/states/project";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import { MemoIconArrowLeft } from "@/submodules/react-components/components/kern-icons/icons";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectDataBlock, setActiveDataBlock, updateDataBlocksState } from "@/src/reduxStore/states/pages/data-blocks";
import { getDataBlock, updateDataBlock } from "@/src/services/base/data-blocks";
import { DataBlockProperty } from "@/src/types/components/projects/projectId/data-blocks/data-blocks";

export default function DataBlocksDetailsOverview() {
    const router = useRouter();
    const dispatch = useDispatch();

    const dataBlockId = router.query.dataBlockId;
    const projectId = useSelector(selectProjectId);
    const currentDataBlock = useSelector(selectDataBlock);

    const [isHeaderNormal, setIsHeaderNormal] = useState(true);
    const [isNameOpen, setIsNameOpen] = useState(false);
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

    const nameRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        if (!dataBlockId) return;
        getDataBlock(dataBlockId as string, (res) => {
            dispatch(setActiveDataBlock(res));
        });
    }, [dataBlockId]);

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
                        {!isHeaderNormal && <div className="mx-4 text-sm leading-5 font-medium text-gray-500 inline-block">{currentDataBlock.name}</div>}
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
                <div className="p-4">
                </div>
            </div>
        </>}
    </div>
    )
}
