import ProjectAdmin from "@/src/components/projects/projectId/admin/ProjectAdmin";
import { setCurrentPage, setDisplayIconComments } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/src/types/shared/general";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function ProjectAdminPage() {

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.ADMIN_PAGE));
        dispatch(setDisplayIconComments(true));
    }, [])

    return (
        <ProjectAdmin />
    )
}