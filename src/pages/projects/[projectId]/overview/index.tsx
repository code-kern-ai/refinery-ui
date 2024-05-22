import ProjectOverview from "@/src/components/projects/projectId/overview/ProjectOverview";
import { setCurrentPage, setDisplayIconComments } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/submodules/react-components/hooks/web-socket/web-sockets-helper";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function ProjectOverviewPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.PROJECT_OVERVIEW));
        dispatch(setDisplayIconComments(true));
    }, [])

    return (
        <ProjectOverview />
    )
}