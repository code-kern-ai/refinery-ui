import { selectOrganizationId, selectUser } from "@/src/reduxStore/states/general"
import { openModal } from "@/src/reduxStore/states/modal";
import { setUploadFileType } from "@/src/reduxStore/states/upload";
import { ModalEnum } from "@/src/types/shared/modal";
import { UserRole } from "@/src/types/shared/sidebar";
import { UploadFileType, UploadOptions } from "@/src/types/shared/upload";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import ModalUpload from "../shared/upload/ModalUpload";
import SampleProjectsDropdown from "./SampleProjectsDropdown";
import { useWebsocket } from "@/submodules/react-components/hooks/web-socket/useWebsocket";
import { Application, CurrentPage, CurrentPageSubKey } from "@/submodules/react-components/hooks/web-socket/constants";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";

const BASE_OPTIONS = { reloadOnFinish: false, deleteProjectOnFail: true, closeModalOnClick: false, isModal: true, navigateToProject: true, showBadPasswordMsg: null };

export default function ButtonsContainer() {
    const router = useRouter();
    const dispatch = useDispatch();

    const user = useSelector(selectUser);

    const [uploadOptions, setUploadOptions] = useState<UploadOptions>(BASE_OPTIONS);
    const [showBadPasswordMsg, setShowBadPasswordMsg] = useState(false);

    useEffect(() => {
        setUploadOptions({ ...BASE_OPTIONS, showBadPasswordMsg: showBadPasswordMsg });
    }, [showBadPasswordMsg]);

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (msgParts[1] == 'bad_password') {
            setShowBadPasswordMsg(true);
        }
    }, []);

    const orgId = useSelector(selectOrganizationId);
    useWebsocket(orgId, Application.REFINERY, CurrentPage.PROJECTS, handleWebsocketNotification, null, CurrentPageSubKey.BUTTONS_CONTAINER);

    return (
        user && user.role === UserRole.ENGINEER ? (<div className="flex flex-row items-start gap-x-4 mt-4">
            <KernButton
                text='New project'
                buttonColor="blue"
                solidTheme={true}
                textColor="white"
                onClick={() => {
                    dispatch(setUploadFileType(UploadFileType.RECORDS_NEW));
                    router.push("/projects/new");
                }}
            />
            <KernButton
                text="Import snapshot"
                buttonColor="blue"
                solidTheme={true}
                textColor="white"
                onClick={() => {
                    dispatch(openModal(ModalEnum.MODAL_UPLOAD));
                    dispatch(setUploadFileType(UploadFileType.PROJECT));
                }}
            />
            <SampleProjectsDropdown />
            <ModalUpload uploadOptions={uploadOptions} />
        </div>) : (<></>)
    )
}