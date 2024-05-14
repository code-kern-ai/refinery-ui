import { selectIsAdmin, selectIsDemo, selectUser } from "@/src/reduxStore/states/general";
import { closeModal, setModalStates } from "@/src/reduxStore/states/modal";
import { removeFromAllProjectsById } from "@/src/reduxStore/states/project";
import { Project, ProjectCardProps, ProjectStatus } from "@/src/types/components/projects/projects-list";
import { ModalEnum } from "@/src/types/shared/modal";
import { isStringTrue } from "@/submodules/javascript-functions/general";
import { Tooltip } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { NOT_AVAILABLE, UNKNOWN_USER } from "@/src/util/constants";
import { IconArrowRight, IconX } from "@tabler/icons-react";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { deleteProjectPost } from "@/src/services/base/project";

export default function ProjectCard(props: ProjectCardProps) {
    console.log("Reached ProjectCard.tsx")
    const router = useRouter();
    const dispatch = useDispatch();

    const isDemo = useSelector(selectIsDemo);
    const isAdmin = useSelector(selectIsAdmin);
    const user = useSelector(selectUser);

    function adminOpenOrDeleteProject(project: Project) {
        if (!isAdmin) return;
        const deleteInstant = isStringTrue(localStorage.getItem("adminInstantDelete"));
        if (deleteInstant) {
            deleteProjectPost(project.id, (res) => {
                dispatch(closeModal(ModalEnum.ADMIN_DELETE_PROJECT));
                dispatch(removeFromAllProjectsById(project.id));
            })
        }
        else {
            dispatch(setModalStates(ModalEnum.ADMIN_DELETE_PROJECT, { projectId: project.id, open: true }));
        }
    }

    function manageProject(): void {
        const projectId = props.project.id;
        if (user?.role == 'ENGINEER') {
            if (props.project.numDataScaleUploaded == 0) {
                router.push(`/projects/${projectId}/settings`)
            } else {
                router.push(`/projects/${projectId}/overview`)
            }
        } else {
            router.push(`/projects/${projectId}/labeling`)
        }
    }

    return (
        <div key={props.project.id} className="relative card shadow bg-white m-4 rounded-2xl">
            {(props.project.status != ProjectStatus.IN_DELETION && props.project.status != ProjectStatus.HIDDEN) && (
                <div className="card-body p-6">
                    {props.project.timeStamp != null && <div className="absolute top-0 left-2/4 flex flex-row flex-nowrap gap-x-1 bg-gray-100 px-1 rounded-br rounded-bl" style={{ 'transform': 'translate(-50%' }}>
                        <span className="text-sm text-gray-500">Created by</span>
                        <Tooltip content={props.project.user.firstName && props.project.user.lastName ? props.project.user.mail : ''} placement="bottom" color="invert" className="cursor-auto">
                            <span className="text-sm text-gray-900">{props.project.user.firstName && props.project.user.lastName ? props.project.user.firstName + ' ' + props.project.user.lastName : UNKNOWN_USER}</span>
                        </Tooltip>
                        {!isDemo && isAdmin && <>
                            <span className="text-sm text-gray-500">on</span>
                            <span className="text-sm text-gray-900 ">{props.project.date}</span>
                            <span className="text-sm text-gray-500">at</span>
                            <span className="text-sm text-gray-900 ">{props.project.time}</span>
                        </>}
                    </div>}
                    {(isAdmin && props.project.status !== ProjectStatus.INIT_SAMPLE_PROJECT) &&
                        <div className="absolute top-0 left-0 cursor-pointer" onClick={() => adminOpenOrDeleteProject(props.project)}>
                            <Tooltip content={TOOLTIPS_DICT.PROJECTS.QUICK_DELETE} color="invert" offset={2} placement="right">
                                <IconX className="h-6 w-6 text-gray-500" />
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
                                    ({props.projectStatisticsById[props.project.id]?.manuallyLabeled || NOT_AVAILABLE})
                                </div>
                            </div>}
                        </div>
                        <div>
                            {props.projectStatisticsById && props.projectStatisticsById[props.project.id]?.numDataScaleProgrammatical != 0 && <div>
                                <div className="text-sm text-gray-900 font-medium">Weakly supervised</div>
                                <div className="text-sm text-gray-500 font-normal">
                                    {props.projectStatisticsById[props.project.id]?.numDataScaleProgrammatical}
                                    &nbsp;records
                                    ({props.projectStatisticsById[props.project.id]?.weaklySupervised || NOT_AVAILABLE})
                                </div>
                            </div>}
                        </div>
                        <div>
                            {props.project.status !== ProjectStatus.INIT_SAMPLE_PROJECT && <button onClick={manageProject}
                                className="text-green-800 text-sm font-medium">
                                <span className="leading-5">Continue project</span>
                                <IconArrowRight className="h-5 w-5 inline-block text-green-800" />
                            </button>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}