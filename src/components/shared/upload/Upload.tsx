import { selectModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { UploadFileType, UploadOptions, UploadProps } from "@/src/types/shared/upload";
import { useSelector } from "react-redux";
import UploadField from "./helper-components/UploadField";
import CryptedField from "./helper-components/CryptedField";

export default function Upload(props: UploadProps) {
    const modal = useSelector(selectModal(ModalEnum.MODAL_UPLOAD));
    const uploadFileType = modal.uploadFileType;

    return (
        <section>
            {uploadFileType == UploadFileType.PROJECT && (<>
                <UploadField />
                <CryptedField />
                {props.uploadOptions.showBadPasswordMsg && (<div className="text-red-700 text-xs mt-2 text-center">Wrong password</div>)}
            </>
            )}
        </section>
    )
}
