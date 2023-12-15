import ModelsDownload from "@/src/components/models-download/ModelsDownload"
import { setCurrentPage, setDisplayIconComments } from "@/src/reduxStore/states/general"
import { CurrentPage } from "@/src/types/shared/general"
import { useEffect } from "react"
import { useDispatch } from "react-redux"

export default function ModelsDownloadPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.MODELS_DOWNLOAD));
        dispatch(setDisplayIconComments(false));
    }, [])

    return (
        <ModelsDownload />
    )
}