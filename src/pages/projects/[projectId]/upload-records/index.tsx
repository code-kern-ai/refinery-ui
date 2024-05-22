import UploadRecords from "@/src/components/projects/projectId/upload-records/UploadRecords";
import { setCurrentPage, setDisplayIconComments } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";
import { useEffect } from "react";
import { useDispatch } from "react-redux"

export default function UploadRecordsPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.UPLOAD_RECORDS));
        dispatch(setDisplayIconComments(false));
    }, []);

    return (<UploadRecords></UploadRecords>)
}