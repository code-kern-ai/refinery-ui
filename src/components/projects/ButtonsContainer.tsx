import { selectUser } from "@/src/reduxStore/states/general"
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
import { CurrentPage, CurrentPageSubKey } from "@/src/types/shared/general";
import { useWebsocket } from "@/src/services/base/web-sockets/useWebsocket";

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

    useWebsocket(CurrentPage.PROJECTS, handleWebsocketNotification, null, CurrentPageSubKey.BUTTONS_CONTAINER);

    return (
        user && user.role === UserRole.ENGINEER ? (<div>
            <button onClick={() => {
                dispatch(setUploadFileType(UploadFileType.RECORDS_NEW));
                router.push("/projects/new");
            }} className="bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-md mt-6 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                New project
            </button>
            <button onClick={() => {
                dispatch(openModal(ModalEnum.MODAL_UPLOAD));
                dispatch(setUploadFileType(UploadFileType.PROJECT));
            }} className="bg-blue-700 text-white text-xs font-semibold ml-6 mt-6 mr-6 xs:mr-0 px-4 py-2.5 rounded-md cursor-pointer hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Import snapshot
            </button>
            <SampleProjectsDropdown />
            <ModalUpload uploadOptions={uploadOptions} />
        </div>) : (<></>)
    )
}