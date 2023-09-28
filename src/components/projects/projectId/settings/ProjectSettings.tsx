import { useDispatch, useSelector } from "react-redux";
import DataSchema from "./DataSchema";
import { selectProject } from "@/src/reduxStore/states/project";
import { useLazyQuery } from "@apollo/client";
import { CHECK_COMPOSITE_KEY, GET_ATTRIBUTES_BY_PROJECT_ID } from "@/src/services/gql/queries/project";
import { useEffect, useState } from "react";
import { selectAttributes, setAllAttributes } from "@/src/reduxStore/states/pages/settings";
import { postProcessingAttributes } from "@/src/util/components/projects/projectId/settings-helper";
import { timer } from "rxjs";

export default function ProjectSettings() {
    const dispatch = useDispatch();
    const project = useSelector(selectProject);
    const attributes = useSelector(selectAttributes);

    const [pKeyValid, setPKeyValid] = useState<boolean | null>(null);
    const [pKeyCheckTimer, setPKeyCheckTimer] = useState(null);

    const [refetchAttributes] = useLazyQuery(GET_ATTRIBUTES_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchPrimaryKey] = useLazyQuery(CHECK_COMPOSITE_KEY, { fetchPolicy: "no-cache" });

    useEffect(() => {
        if (!project) return;
        refetchAttributes({ variables: { projectId: project.id, stateFilter: ['ALL'] } }).then((res) => {
            dispatch(setAllAttributes(postProcessingAttributes(res.data['attributesByProjectId'])));
        });
    }, [project]);

    useEffect(() => {
        requestPKeyCheck();
    }, [attributes]);

    function requestPKeyCheck() {
        if (!project) return;
        setPKeyValid(null);
        if (pKeyCheckTimer) pKeyCheckTimer.unsubscribe();
        const tmpTimer = timer(500).subscribe(() => {
            refetchPrimaryKey({ variables: { projectId: project.id } }).then((res) => {
                setPKeyCheckTimer(null);
                if (anyPKey()) setPKeyValid(res.data['checkCompositeKey']);
                else setPKeyValid(null);
            });
        });
        setPKeyCheckTimer(tmpTimer);
    }

    function anyPKey() {
        if (!attributes) return false;
        for (let i = 0; i < attributes.length; i++) {
            if (attributes[i].isPrimaryKey) return true;
        }
        return false;
    }

    return (<div>
        {project != null && <div className="p-4 bg-gray-100 h-screen overflow-y-auto flex-1 flex flex-col">
            {/* TODO: update the isAcOrTokenizationRunning when the tokenization is added */}
            <DataSchema isAcOrTokenizationRunning={false} pKeyValid={pKeyValid} />
        </div>}
    </div>)
}