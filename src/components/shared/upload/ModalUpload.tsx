import { ModalEnum } from "@/src/types/shared/modal";
import Modal from "../modal/Modal";
import { UploadFileType, UploadOptions, UploadProps } from "@/src/types/shared/upload";
import { getSubtitle, getTitle } from "@/src/util/shared/upload/modal-upload-helper";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectAllProjects } from "@/src/reduxStore/states/project";
import Upload from "./Upload";
import { selectUploadData } from "@/src/reduxStore/states/upload";

export default function ModalUpload(props: UploadProps) {
    const projects = useSelector(selectAllProjects);
    const uploadFileType = useSelector(selectUploadData).uploadFileType;

    const [projectName, setProjectName] = useState<string>("");
    const [isProjectTitleDuplicate, setProjectTitleDuplicate] = useState<boolean>(false);
    const [startUpload, setStartUpload] = useState<boolean>(false);
    const [acceptButton, setAcceptButton] = useState({ buttonCaption: "Upload", closeAfterClick: false, useButton: true, disabled: true, emitFunction: () => { submitUpload() } });

    const title = getTitle(uploadFileType);
    const subTitle = getSubtitle(uploadFileType);

    const uploadOptions: UploadOptions = {
        deleteProjectOnFail: props.uploadOptions.deleteProjectOnFail,
        reloadOnFinish: props.uploadOptions.reloadOnFinish,
        knowledgeBaseId: uploadFileType == UploadFileType.KNOWLEDGE_BASE ? props.uploadOptions.knowledgeBaseId : null,
        isModal: props.uploadOptions.isModal,
        tokenizer: props.uploadOptions.tokenizer,
        showBadPasswordMsg: props.uploadOptions.showBadPasswordMsg,
        projectName: projectName,
    }

    function checkIfProjectNameDuplicate() {
        setProjectTitleDuplicate(projects.some(project => project.name == projectName));
    }

    function submitUpload() {
        if (isProjectTitleDuplicate) return;
        setStartUpload(true);
    }


    return (
        <Modal modalName={ModalEnum.MODAL_UPLOAD} acceptButton={acceptButton}>
            <h1 className="flex flex-grow justify-center text-lg text-gray-900 font-bold">{title}</h1>
            <div className="text-sm text-gray-500 mb-4 text-center">
                {subTitle}
            </div>
            {uploadFileType == UploadFileType.PROJECT && (
                <div className="form-control text-left">
                    <label className="text-gray-500 text-sm font-normal">Project title<em> - optional</em></label>
                    <input value={projectName} type="text" onInput={(e: any) => {
                        setProjectName(e.target.value);
                        checkIfProjectNameDuplicate();
                    }} onKeyDown={(e: any) => {
                        if (e.key == "Enter") submitUpload();
                    }}
                        className="h-8 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" placeholder="Enter some title here..." />
                    {isProjectTitleDuplicate && (<div className="text-red-700 text-xs mt-2">Project title exists</div>)}
                    <div className="flex flex-row mt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-alert-triangle text-yellow-700"
                            width="20" height="20" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M10.24 3.957l-8.422 14.06a1.989 1.989 0 0 0 1.7 2.983h16.845a1.989 1.989 0 0 0 1.7 -2.983l-8.423 -14.06a1.989 1.989 0 0 0 -3.4 0z" />
                            <path d="M12 9v4" />
                            <path d="M12 17h.01" />
                        </svg>
                        <label className="text-yellow-700 text-xs italic ml-2">If no project title is specified, the title mentioned in
                            the uploaded data will be used, potentially leading to a duplication of project titles.</label>
                    </div>
                </div>
            )}
            <Upload uploadOptions={uploadOptions} startUpload={startUpload} isFileUploaded={(isFileUploaded: boolean) => {
                const acceptButtonCopy = { ...acceptButton };
                acceptButtonCopy.disabled = isFileUploaded ? false : true;
                setAcceptButton(acceptButtonCopy);
            }} />
        </Modal>
    );
}
