import { KnowledgeGraphsOverview } from "@/src/components/projects/projectId/knowledge-graphs/KnowledgeGraphsOverview";
import { setCurrentPage, setDisplayIconComments } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function KnowledgeGraphsPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.KNOWLEDGE_GRAPHS));
        dispatch(setDisplayIconComments(false));
    }, []);

    return (
        <KnowledgeGraphsOverview />
    )
}