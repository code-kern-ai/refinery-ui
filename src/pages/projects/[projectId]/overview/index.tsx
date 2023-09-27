import ProjectOverview from "@/src/components/projects/projectId/overview/ProjectOverview";
import { setCurrentPage } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/src/types/shared/general";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function ProjectOverviewPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.PROJECT_OVERVIEW))
    }, [])

    return (
        <ProjectOverview />
    )
}