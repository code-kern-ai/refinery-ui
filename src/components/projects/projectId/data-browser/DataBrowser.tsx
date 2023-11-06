import { selectProject } from "@/src/reduxStore/states/project"
import { useDispatch, useSelector } from "react-redux"
import DataBrowserSidebar from "./DataBrowserSidebar";
import { useLazyQuery } from "@apollo/client";
import { DATA_SLICES } from "@/src/services/gql/queries/data-slices";
import { useEffect } from "react";
import { setDataSlices } from "@/src/reduxStore/states/pages/data-browser";
import { postProcessDataSlices } from "@/src/util/components/projects/projectId/data-browser-helper";

export default function DataBrowser() {
    const dispatch = useDispatch();
    const project = useSelector(selectProject);

    const [refetchDataSlices] = useLazyQuery(DATA_SLICES, { fetchPolicy: 'network-only' });

    useEffect(() => {
        if (!project) return;
        refetchDataSlices({ variables: { projectId: project.id } }).then((res) => {
            dispatch(setDataSlices(postProcessDataSlices(res.data.dataSlices)));
        });
    }, [project]);

    return (<>
        {project && <div className="flex flex-row h-full">
            <DataBrowserSidebar />
        </div>}
    </>)
}