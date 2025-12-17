import { selectProjectId } from "@/src/reduxStore/states/project";
import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { selectOrganizationId } from "@/src/reduxStore/states/general";
import { useWebsocket } from "@/submodules/react-components/hooks/web-socket/useWebsocket";
import { Application, CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";
import { selectKnowledgeGraphsAll, setAllKnowledgeGraphs } from "@/src/reduxStore/states/pages/knowledge-graphs";
import KnowledgeGraphsHeader from "./KnowledgeGraphsHeader";
import { getKnowledgeGraphs } from "@/src/services/base/knowledge-graphs";
import KnowledgeGraphsGridCards from "./KnowledgeGraphsGridCards";

export function KnowledgeGraphsOverview() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const knowledgeGraphs = useSelector(selectKnowledgeGraphsAll);

    const refetchKnowledgeGraphs = useCallback(() => {
        getKnowledgeGraphs(projectId, (res) => {
            dispatch(setAllKnowledgeGraphs(res));
        });
    }, [projectId]);
    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (['knowledge_graphs_created', 'knowledge_graphs_updated', 'knowledge_graphs_deleted'].includes(msgParts[1])) {
            refetchKnowledgeGraphs();
        }
    }, [projectId]);

    const orgId = useSelector(selectOrganizationId);
    useWebsocket(orgId, Application.REFINERY, CurrentPage.KNOWLEDGE_GRAPHS, handleWebsocketNotification, projectId);

    return (projectId && <div className="p-4 bg-gray-100 h-full flex-1 flex flex-col">
        <div className="w-full h-full -mr-4">
            <KnowledgeGraphsHeader refetch={refetchKnowledgeGraphs} />

            {knowledgeGraphs && knowledgeGraphs.length == 0 ? (
                <div>
                    <div className="text-gray-500 font-normal mt-8">
                        <p className="text-sm leading-7">Seems like your project has no knowledge graphs yet.</p>
                    </div>
                </div>
            ) : (<>
                <div className="overflow-y-auto">
                    <div className="mt-8 grid gap-6 grid-cols-3">
                        <KnowledgeGraphsGridCards />
                    </div>
                </div>
            </>)}
        </div >
    </div >)
}