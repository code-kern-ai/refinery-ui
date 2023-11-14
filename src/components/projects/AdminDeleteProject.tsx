import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import Modal from "../shared/modal/Modal";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectIsAdmin } from "@/src/reduxStore/states/general";
import { closeModal, selectModal } from "@/src/reduxStore/states/modal";
import { useMutation } from "@apollo/client";
import { DELETE_PROJECT } from "@/src/services/gql/mutations/projects";
import { removeFromAllProjectsById } from "@/src/reduxStore/states/project";

const ACCEPT_BUTTON = { buttonCaption: "Delete and never show again", useButton: true };
const ABORT_BUTTON = { buttonCaption: "Delete", useButton: true };

export default function AdminDeleteProject() {
    const dispatch = useDispatch();

    const isAdmin = useSelector(selectIsAdmin);
    const modal = useSelector(selectModal(ModalEnum.ADMIN_DELETE_PROJECT));

    const [deleteProjectByIdMut] = useMutation(DELETE_PROJECT, { fetchPolicy: "no-cache" });


    const adminDeleteProject = useCallback(() => {
        if (!isAdmin) return;
        const projectId = modal.projectId;
        deleteProjectByIdMut({ variables: { projectId: projectId } }).then(() => {
            dispatch(closeModal(ModalEnum.ADMIN_DELETE_PROJECT));
            dispatch(removeFromAllProjectsById(projectId));
        })
    }, [isAdmin, modal]);

    const adminStoreInstantAndDelete = useCallback(() => {
        localStorage.setItem("adminInstantDelete", "X");
        adminDeleteProject();
    }, [adminDeleteProject]);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);
    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    useEffect(() => {
        setAcceptButton({ ...ACCEPT_BUTTON, emitFunction: adminStoreInstantAndDelete });
        setAbortButton({ ...ABORT_BUTTON, emitFunction: adminDeleteProject });
    }, [adminDeleteProject, adminStoreInstantAndDelete]);
    return (
        <Modal modalName={ModalEnum.ADMIN_DELETE_PROJECT} acceptButton={acceptButton} abortButton={abortButton}>
            <div className="flex flex-row items-center justify-center">
                <span className="text-lg leading-6 text-gray-900 font-medium">
                    Admin Function - Quick delete
                </span>
            </div>
            Are you sure?<div>This will delete the project and all its data.</div>
        </Modal>
    )
}