import { selectKnowledgeGraph, setActiveKnowledgeGraph, updateKnowledgeGraphsState } from "@/src/reduxStore/states/pages/knowledge-graphs";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { getKnowledgeGraph, updateKnowledgeGraph } from "@/src/services/base/knowledge-graphs";
import { KnowledgeGraphProperty, KnowledgeGraphType } from "@/src/types/components/projects/projectId/knowledge-graphs/knowledge-graphs";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import { MemoIconArrowLeft } from "@/submodules/react-components/components/kern-icons/icons";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LiveKnowledgeGraphDetailsOverview from "./LiveKnowledgeGraphDetailsOverview";
import StableKnowledgeGraphDetailsOverview from "./StableKnowledgeGraphDetailsOverview";

export default function KnowledgeGraphsDetailsOverview() {
    const router = useRouter();
    const dispatch = useDispatch();

    const knowledgeGraphId = router.query.knowledgeGraphId;
    const projectId = useSelector(selectProjectId);
    const currentKnowledgeGraph = useSelector(selectKnowledgeGraph);

    const [isHeaderNormal, setIsHeaderNormal] = useState(true);
    const [isNameOpen, setIsNameOpen] = useState(false);
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

    const nameRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        if (!knowledgeGraphId) return;
        getKnowledgeGraph(knowledgeGraphId as string, (res) => {
            dispatch(setActiveKnowledgeGraph(res));
        });
    }, [knowledgeGraphId]);

    const onScrollEvent = useCallback((event: any) => {
        if (!(event.target instanceof HTMLElement)) return;
        if ((event.target as HTMLElement).scrollTop > 0) {
            setIsHeaderNormal(false);
        } else {
            setIsHeaderNormal(true);
        }
    }, []);

    const openProperty = useCallback((open: boolean, property: string) => {
        if (property == KnowledgeGraphProperty.NAME) {
            setIsNameOpen(open);
            if (open) {
                setTimeout(() => {
                    nameRef.current?.focus();
                }, 100);
            }
        }
        if (property == KnowledgeGraphProperty.DESCRIPTION) {
            setIsDescriptionOpen(open);
            if (open) {
                setTimeout(() => {
                    descriptionRef.current?.focus();
                }, 100);
            }
        }
        if (!open) {
            saveKnowledgeGraph();
        }
    }, [currentKnowledgeGraph]);

    const saveKnowledgeGraph = useCallback(() => {
        if (!currentKnowledgeGraph || currentKnowledgeGraph.name == "") return;
        updateKnowledgeGraph(projectId, currentKnowledgeGraph.id, currentKnowledgeGraph.name, currentKnowledgeGraph.description, (res) => {
            dispatch(updateKnowledgeGraphsState(currentKnowledgeGraph.id, { name: currentKnowledgeGraph.name, description: currentKnowledgeGraph.description }));
        });
    }, [currentKnowledgeGraph]);

    const changeKnowledgeGraph = useCallback((value: string, property: string) => {
        if (!currentKnowledgeGraph) return;
        let updatedKnowledgeGraph = { ...currentKnowledgeGraph };
        if (property == KnowledgeGraphProperty.NAME) {
            updatedKnowledgeGraph.name = value;
        }
        if (property == KnowledgeGraphProperty.DESCRIPTION) {
            updatedKnowledgeGraph.description = value;
        }
        dispatch(setActiveKnowledgeGraph(updatedKnowledgeGraph));
    }, [currentKnowledgeGraph]);


    return (projectId && <div className={`bg-white p-4 overflow-y-auto min-h-full h-[calc(100vh-4rem)] w-[calc(100vw-5rem)]`} onScroll={onScrollEvent}>
        {currentKnowledgeGraph && <>
            <div className={`sticky z-40 h-12 ${isHeaderNormal ? 'top-1' : '-top-5'}`}>
                <div className={`bg-white flex-grow ${isHeaderNormal ? '' : 'shadow'}`}>
                    <div className={`flex-row justify-start items-center inline-block ${isHeaderNormal ? 'p-0' : 'flex py-2'}`} style={{ transition: 'all .25s ease-in-out' }}>
                        <a href={`/refinery/projects/${projectId}/knowledge-graphs`} onClick={(e) => {
                            e.preventDefault();
                            router.push(`/projects/${projectId}/knowledge-graphs`);
                            dispatch(setActiveKnowledgeGraph(null));
                        }} className="text-green-800 text-sm font-medium">
                            <MemoIconArrowLeft className="h-5 w-5 inline-block text-green-800" />
                            <span className="leading-5">Go back</span>
                        </a>
                        {!isHeaderNormal && <div className="mx-4 text-sm leading-5 font-medium text-gray-500 inline-block">{currentKnowledgeGraph.name}</div>}
                    </div>
                </div>
            </div>
            <div className="w-full">
                <div className={`grid gap-4 ${isHeaderNormal ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {isHeaderNormal && <div className="flex items-start mt-2">
                        <KernButton
                            text="Edit name"
                            onClick={() => openProperty(true, KnowledgeGraphProperty.NAME)}
                            className="mr-3"
                        />
                        <div className="flex-grow" onDoubleClick={() => openProperty(true, KnowledgeGraphProperty.NAME)}>
                            {isNameOpen
                                ? (<input type="text" value={currentKnowledgeGraph.name} ref={nameRef} onInput={(e: any) => changeKnowledgeGraph(e.target.value, KnowledgeGraphProperty.NAME)}
                                    onBlur={() => openProperty(false, KnowledgeGraphProperty.NAME)} onKeyDown={(e) => { if (e.key == 'Enter') openProperty(false, KnowledgeGraphProperty.NAME) }}
                                    className="h-8 w-full border-gray-300 rounded-md placeholder-italic border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />)
                                : (<div className="mr-4 text-sm leading-5 font-medium text-gray-500 inline-block " style={{ marginTop: '6px' }}>{currentKnowledgeGraph.name}</div>)}
                        </div>
                    </div>}
                    <div className="flex items-start mt-2">
                        <KernButton
                            text="Edit description"
                            onClick={() => openProperty(true, KnowledgeGraphProperty.DESCRIPTION)}
                            className="mr-3"
                        />
                        <div className="flex-grow" onDoubleClick={() => openProperty(true, KnowledgeGraphProperty.DESCRIPTION)}>
                            {isDescriptionOpen
                                ? (<input type="text" value={currentKnowledgeGraph.description} ref={descriptionRef} onInput={(e: any) => changeKnowledgeGraph(e.target.value, KnowledgeGraphProperty.DESCRIPTION)}
                                    onBlur={() => openProperty(false, KnowledgeGraphProperty.DESCRIPTION)} onKeyDown={(e) => { if (e.key == 'Enter') openProperty(false, KnowledgeGraphProperty.DESCRIPTION) }}
                                    className="h-8 w-full border-gray-300 rounded-md placeholder-italic border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />)
                                : (<div className="mr-4 text-sm leading-5 font-medium text-gray-500 inline-block " style={{ marginTop: '6px' }}>{currentKnowledgeGraph.description}</div>)}
                        </div>
                    </div>
                </div>
                <div className="p-4">
                    {currentKnowledgeGraph.type == KnowledgeGraphType.LIVE && <LiveKnowledgeGraphDetailsOverview />}
                    {currentKnowledgeGraph.type == KnowledgeGraphType.STABLE && <StableKnowledgeGraphDetailsOverview />}
                </div>
            </div>
        </>}
    </div>
    )
}