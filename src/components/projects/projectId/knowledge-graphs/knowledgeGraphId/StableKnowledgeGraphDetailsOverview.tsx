import { selectProjectId } from "@/src/reduxStore/states/project";
import { getKnowledgeGraphsDataStable } from "@/src/services/base/knowledge-graphs";
import { useConsoleLog } from "@/submodules/react-components/hooks/useConsoleLog";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function StableKnowledgeGraphDetailsOverview() {
    const projectId = useSelector(selectProjectId);

    const [stableData, setStableData] = useState(null);

    useEffect(() => {
        if (!projectId) return;
        getKnowledgeGraphsDataStable(projectId, (result) => {
            setStableData(result);
        });
    }, [projectId]);

    useConsoleLog(stableData)

    return <div>Stable Knowledge Graph Details Overview Component</div>
}