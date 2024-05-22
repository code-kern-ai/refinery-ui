import ProjectSettings from "@/src/components/projects/projectId/settings/ProjectSettings";
import { setCurrentPage, setDisplayIconComments } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function ProjectSettingsPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.PROJECT_SETTINGS));
        dispatch(setDisplayIconComments(true));
    }, [])

    return (<ProjectSettings />)
}