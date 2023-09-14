import { selectUser } from "@/src/reduxStore/states/general"
import { openModal, setModalStates } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { UserRole } from "@/src/types/shared/sidebar";
import { UploadFileType } from "@/src/types/shared/upload";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux"

export default function ButtonsContainer() {
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);

    return (
        user && user.role === UserRole.ENGINEER ? (<div>
            <button onClick={() => router.push("/projects/new")}
                className="bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-md mt-6 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                New project
            </button>
            <button onClick={() => {
                dispatch(setModalStates(ModalEnum.MODAL_UPLOAD, { uploadFileType: UploadFileType.PROJECT, open: true }))
            }}
                className="bg-blue-700 text-white text-xs font-semibold ml-6 mt-6 mr-6 xs:mr-0 px-4 py-2.5 rounded-md cursor-pointer hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Import snapshot
            </button>
            {/* TODO: Add dropdown for sample projects */}
        </div>) : (<></>)
    )
}