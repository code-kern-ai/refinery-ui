import UploadRecords from "@/src/components/projects/projectId/upload-records/UploadRecords";
import { selectOrganizationId, setCurrentPage, setDisplayIconComments } from "@/src/reduxStore/states/general";
import { selectProjectId, setActiveProject } from "@/src/reduxStore/states/project";
import { getProjectByProjectId } from "@/src/services/base/project";
import { Application, CurrentPage, CurrentPageSubKey } from "@/submodules/react-components/hooks/web-socket/constants";
import { useWebsocket } from "@/submodules/react-components/hooks/web-socket/useWebsocket";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"

export default function UploadRecordsPage() {
    const dispatch = useDispatch();
    const projectId = useSelector(selectProjectId);
    const orgId = useSelector(selectOrganizationId);

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.UPLOAD_RECORDS));
        dispatch(setDisplayIconComments(false));
    }, []);


    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (!projectId) return;
        if (msgParts[1] == 'project_update' && msgParts[2] == projectId) {
            getProjectByProjectId(projectId, (res) => {
                dispatch(setActiveProject(res));
            })
        }

    }, [projectId]);

    useWebsocket(orgId, Application.REFINERY, CurrentPage.PROJECT_SETTINGS, handleWebsocketNotification, undefined, CurrentPageSubKey.FILE_UPLOAD);

    return <UploadRecords />
}