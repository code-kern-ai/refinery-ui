import ProjectAdmin from "@/src/components/projects/projectId/admin/ProjectAdmin";
import { setCurrentPage } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/src/types/shared/general";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function ProjectAdminPage() {

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.ADMIN_PAGE));
    }, [])

    return (
        <ProjectAdmin />
    )
}