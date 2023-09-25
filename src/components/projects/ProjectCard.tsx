import { selectIsAdmin, selectIsDemo, selectUser } from "@/src/reduxStore/states/general";
import { closeModal, openModal } from "@/src/reduxStore/states/modal";
import { removeFromAllProjectsById } from "@/src/reduxStore/states/project";
import { DELETE_PROJECT } from "@/src/services/gql/mutations/projects";
import { Project, ProjectCardProps, ProjectStatus } from "@/src/types/components/projects/projects-list";
import { ModalEnum } from "@/src/types/shared/modal";
import { isStringTrue } from "@/submodules/javascript-functions/general";
import { useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import Modal from "../shared/modal/Modal";
import { useState } from "react";

const UNKNOWN_USER: string = '<unknown user>';

export default function ProjectCard(props: ProjectCardProps) {
    const router = useRouter();
    const dispatch = useDispatch();

    const isDemo = useSelector(selectIsDemo);
    const isAdmin = useSelector(selectIsAdmin);
    const user = useSelector(selectUser);

    const [saveProjectId, setSaveProjectId] = useState<string | null>(null);

    const [deleteProjectByIdMut] = useMutation(DELETE_PROJECT, { fetchPolicy: "no-cache" });

    const acceptButton = { buttonCaption: "Delete and never show again", useButton: true, emitFunction: () => { adminStoreInstantAndDelete() } }
    const abortButton = { buttonCaption: "Delete", useButton: true, emitFunction: () => { adminDeleteProject() } };

    function adminOpenOrDeleteProject(project: Project) {
        if (!isAdmin) return;
        const deleteInstant = isStringTrue(localStorage.getItem("adminInstantDelete"));
        setSaveProjectId(project.id);
        if (deleteInstant) adminDeleteProject();
        else {
            dispatch(openModal(ModalEnum.ADMIN_DELETE_PROJECT));
        }
    }

    function adminStoreInstantAndDelete() {
        localStorage.setItem("adminInstantDelete", "X");
        adminDeleteProject();
    }

    function adminDeleteProject() {
        if (!isAdmin || saveProjectId == null) return;
        deleteProjectByIdMut({ variables: { projectId: saveProjectId } }).then(() => {
            dispatch(closeModal(ModalEnum.ADMIN_DELETE_PROJECT));
            dispatch(removeFromAllProjectsById(saveProjectId));
        })
    }

    function manageProject(projectId: string, recordsInProject: Number): void {
        if (user?.role == 'ENGINEER') {
            if (recordsInProject == 0) {
                router.push(`/projects/${projectId}/settings`);
            } else {
                router.push(`/projects/${projectId}/overview`);
            }
        } else {
            router.push(`/projects/${projectId}/labeling`);
        }
    }

    return (
        <div key={props.project.id} className="relative card shadow bg-white m-4 rounded-2xl">
            {props.project.status != ProjectStatus.IN_DELETION ? (
                <div className="card-body p-6">
                    {props.project.timeStamp != null && <div className="absolute top-0 left-2/4 flex flex-row flex-nowrap gap-x-1 bg-gray-100 px-1 rounded-br rounded-bl" style={{ 'transform': 'translate(-50%' }}>
                        <span className="text-sm text-gray-500">Created by</span>
                        <Tooltip content={props.project.user.firstName && props.project.user.lastName ? props.project.user.mail : ''} placement="bottom" color="invert">
                            <span className="text-sm text-gray-900">{props.project.user.firstName && props.project.user.lastName ? props.project.user.firstName + ' ' + props.project.user.lastName : UNKNOWN_USER}</span>
                        </Tooltip>
                        {!isDemo && isAdmin && <>
                            <span className="text-sm text-gray-500">on</span>
                            <span className="text-sm text-gray-900 ">{props.project.date}</span>
                            <span className="text-sm text-gray-500">at</span>
                            <span className="text-sm text-gray-900 ">{props.project.time}</span>
                        </>}
                    </div>}
                    {isAdmin &&
                        <div className="absolute top-0 left-0 cursor-pointer" onClick={() => adminOpenOrDeleteProject(props.project)}>
                            <Tooltip content="Admin function: Quick delete project" color="invert" offset={2} placement="right">
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </Tooltip>
                        </div>
                    }
                    <div className="my-2 grid grid-cols-3 gap-4 items-center lg:grid-cols-6">
                        <div className="col-span-2">
                            <div className="text-sm text-gray-900 font-medium">{props.project.name}</div>
                            {props.project.description ? (<div className="text-sm text-gray-500 font-normal">{props.project.description}</div>) : (<div className="text-sm text-gray-500 font-normal italic">No description</div>)}
                        </div>
                        <div>
                            <div className="text-sm text-gray-900 font-medium">Records</div>
                            <div className="text-sm text-gray-500 font-normal">
                                {props.projectStatisticsById && props.projectStatisticsById[props.project.id]?.numDataScaleUploaded ? (props.projectStatisticsById[props.project.id]?.numDataScaleUploaded) : '0'}
                                &nbsp;records
                            </div>
                        </div>
                        <div>
                            {props.projectStatisticsById && props.projectStatisticsById[props.project.id]?.numDataScaleManual != 0 && <div>
                                <div className="text-sm text-gray-900 font-medium">Manually labeled</div>
                                <div className="text-sm text-gray-500 font-normal">
                                    {props.projectStatisticsById[props.project.id]?.numDataScaleManual}
                                    &nbsp;records
                                    ({props.projectStatisticsById[props.project.id]?.manuallyLabeled})
                                </div>
                            </div>}
                        </div>
                        <div>
                            {props.projectStatisticsById && props.projectStatisticsById[props.project.id]?.numDataScaleProgrammatical != 0 && <div>
                                <div className="text-sm text-gray-900 font-medium">Weakly supervised</div>
                                <div className="text-sm text-gray-500 font-normal">
                                    {props.projectStatisticsById[props.project.id]?.numDataScaleProgrammatical}
                                    &nbsp;records
                                    ({props.projectStatisticsById[props.project.id]?.weaklySupervised})
                                </div>
                            </div>}
                        </div>
                        <div>
                            {props.project.status !== ProjectStatus.INIT_SAMPLE_PROJECT && <button onClick={() => manageProject(props.project.id, props.project.numDataScaleUploaded)}
                                className="text-green-800 text-sm font-medium">
                                <span className="leading-5">Continue project</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>}
                        </div>
                    </div>
                </div>
            ) : (<></>)}
            <Modal modalName={ModalEnum.ADMIN_DELETE_PROJECT} acceptButton={acceptButton} abortButton={abortButton}>
                <div className="flex flex-row items-center justify-center">
                    <span className="text-lg leading-6 text-gray-900 font-medium">
                        Admin Function - Quick delete
                    </span>
                </div>
                Are you sure?<div>This will delete the project and all its data.</div>
            </Modal>
        </div>
    )
}