import KnowledgeGraphsDetailsOverview from "@/src/components/projects/projectId/knowledge-graphs/knowledgeGraphId/KnowledgeGraphsDetailsOverview";
import { setCurrentPage, setDisplayIconComments } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function KnowledgeGraphsDetailsPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.KNOWLEDGE_GRAPHS_DETAILS));
        dispatch(setDisplayIconComments(false));
    }, []);

    return (
        <KnowledgeGraphsDetailsOverview />
    )
}