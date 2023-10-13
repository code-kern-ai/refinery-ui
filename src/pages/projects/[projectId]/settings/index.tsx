import ProjectSettings from "@/src/components/projects/projectId/settings/ProjectSettings";
import { setCurrentPage } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/src/types/shared/general";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function ProjectSettingsPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.PROJECT_SETTINGS))
    }, [])

    return (<ProjectSettings />)
}