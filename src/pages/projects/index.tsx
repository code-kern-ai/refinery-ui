import ProjectsList from "@/src/components/projects/ProjectsList"
import { setCurrentPage } from "@/src/reduxStore/states/general"
import { CurrentPage } from "@/src/types/shared/general"
import { useEffect } from "react"
import { useDispatch } from "react-redux"

export default function ProjectsPage() {

    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.PROJECTS))
    }, [])

    return (
        <ProjectsList />
    )
}