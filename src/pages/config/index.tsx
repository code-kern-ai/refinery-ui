import Config from "@/src/components/config/Config"
import ModelsDownload from "@/src/components/models-download/ModelsDownload"
import { setCurrentPage, setDisplayIconComments } from "@/src/reduxStore/states/general"
import { CurrentPage } from "@/src/types/shared/general"
import { useEffect } from "react"
import { useDispatch } from "react-redux"

export default function ConfigPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.CONFIG));
        dispatch(setDisplayIconComments(false));
    }, [])

    return (
        <Config />
    )
}