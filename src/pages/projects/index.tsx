import { setCurrentPage } from "@/src/reduxStore/states/general"
import { CurrentPage } from "@/src/types/shared/general"
import { useEffect } from "react"
import { useDispatch } from "react-redux"

export default function Projects() {

    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.PROJECTS))
    }, [])

    return (
        <h1>Go to lookup lists</h1>
    )
}