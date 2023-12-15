import ProjectsList from "@/src/components/projects/ProjectsList"
import { setCurrentPage, setDisplayIconComments } from "@/src/reduxStore/states/general"
import { CurrentPage } from "@/src/types/shared/general"
import { useEffect } from "react"
import { useDispatch } from "react-redux"

export default function ProjectsPage() {

    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.PROJECTS));
        dispatch(setDisplayIconComments(false));
    }, [])

    return (
        <ProjectsList />
    )
}