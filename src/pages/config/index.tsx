import Config from "@/src/components/config/Config"
import { setCurrentPage, setDisplayIconComments } from "@/src/reduxStore/states/general"
import { CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";
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