import { useDispatch, useSelector } from "react-redux";
import { KnowledgeGraph } from "@/src/types/components/projects/projectId/knowledge-graphs/knowledge-graphs";
import { selectKnowledgeGraphsAll, setAllKnowledgeGraphs } from "@/src/reduxStore/states/pages/knowledge-graphs";
import { useCallback } from "react";
import { jsonCopy } from "@/submodules/javascript-functions/general";

export default function KnowledgeGraphsGridCards() {
    const dispatch = useDispatch();
    const knowledgeGraphs = useSelector(selectKnowledgeGraphsAll);

    const toggleKnowledgeGraph = useCallback((knowledgeGraphId: string) => {
        const knowledgeGraphsCopy = jsonCopy(knowledgeGraphs);

        knowledgeGraphsCopy.forEach((knowledgeGraph, index) => {
            if (knowledgeGraph.id === knowledgeGraphId) {
                knowledgeGraphsCopy[index].selected = !knowledgeGraphs[index].selected;
            }
        });
        dispatch(setAllKnowledgeGraphs(knowledgeGraphsCopy));
    }, [knowledgeGraphs]);

    return (<>
        {knowledgeGraphs.map((knowledgeGraph: KnowledgeGraph, index: number) => (<div key={knowledgeGraph.id}>
            <div className="relative flex space-x-3 items-center rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400">
                <div className="h-full flex flex-col gap-2 items-center self-start">
                    <label htmlFor="knowledge-graph-checkbox" className="cursor-pointer flex justify-center">
                        <input type="checkbox" className="cursor-pointer" name="knowledge-graph-checkbox" checked={knowledgeGraph.selected} onChange={() => toggleKnowledgeGraph(knowledgeGraph.id)} />
                    </label>
                </div>

                <div className="flex-1 min-w-0 text-sm leading-5">
                    <div className="flow-root font-medium">
                        <div className="text-gray-900 float-left"> {knowledgeGraph.name}</div>
                    </div>
                    <div className="flow-root font-normal">
                        <div className="text-gray-500 float-left line-clamp-3" style={{ maxWidth: '250px' }}>
                            {knowledgeGraph.description}
                        </div>
                    </div>
                    <div className="flow-root font-normal mt-2">
                        <div className="float-left text-xs">
                            Type: {knowledgeGraph.type}
                        </div>
                    </div>
                </div>
            </div>
        </div >))
        }
    </ >);
}