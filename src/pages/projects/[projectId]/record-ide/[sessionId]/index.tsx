import RecordIDE from "@/src/components/projects/projectId/record-ide/RecordIDE";
import { setCurrentPage, setDisplayIconComments } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/submodules/react-components/hooks/web-socket/web-sockets-helper";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function RecordIdePage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.RECORD_IDE));
        dispatch(setDisplayIconComments(true));
    }, [])

    return (
        <RecordIDE />
    )
}