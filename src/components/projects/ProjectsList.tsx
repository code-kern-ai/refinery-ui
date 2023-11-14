import { selectInactiveOrganization, selectIsAdmin, selectIsDemo, selectIsManaged, selectUser } from "@/src/reduxStore/states/general"
import { removeFromAllProjectsById, selectAllProjects, setAllProjects } from "@/src/reduxStore/states/project";
import { WebSocketsService } from "@/src/services/base/web-sockets/WebSocketsService";
import { GET_OVERVIEW_STATS, GET_PROJECT_LIST } from "@/src/services/gql/queries/projects";
import { Project, ProjectStatistics } from "@/src/types/components/projects/projects-list";
import { CurrentPage } from "@/src/types/shared/general";
import { jsonCopy, percentRoundString } from "@/submodules/javascript-functions/general";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import YoutubeIntroduction from "./YoutubeIntroduction";
import ButtonsContainer from "./ButtonsContainer";
import ProjectCard from "./ProjectCard";
import { GET_CAN_CREATE_LOCAL_ORG } from "@/src/services/gql/queries/organizations";
import { ADD_USER_TO_ORGANIZATION, CREATE_ORGANIZATION } from "@/src/services/gql/mutations/organizations";
import style from "@/src/styles/components/projects/projects-list.module.css";
import { useRouter } from "next/router";
import Modal from "../shared/modal/Modal";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { DELETE_PROJECT } from "@/src/services/gql/mutations/projects";
import { closeModal, selectModal } from "@/src/reduxStore/states/modal";
import { unsubscribeWSOnDestroy } from "@/src/services/base/web-sockets/web-sockets-helper";
import { postProcessProjectsList } from "@/src/util/components/projects/projects-list-helper";

const ACCEPT_BUTTON = { buttonCaption: "Delete and never show again", useButton: true };
const ABORT_BUTTON = { buttonCaption: "Delete", useButton: true };

export default function ProjectsList() {
    const router = useRouter();
    const dispatch = useDispatch();

    const organizationInactive = useSelector(selectInactiveOrganization);
    const isManaged = useSelector(selectIsManaged);
    const isDemo = useSelector(selectIsDemo);
    const isAdmin = useSelector(selectIsAdmin);
    const projects = useSelector(selectAllProjects);
    const user = useSelector(selectUser);
    const modal = useSelector(selectModal(ModalEnum.ADMIN_DELETE_PROJECT));

    const [projectStatisticsById, setProjectStatisticsById] = useState({});
    const [canCreateOrg, setCanCreateOrg] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);

    const [refetchProjects] = useLazyQuery(GET_PROJECT_LIST, { fetchPolicy: "no-cache" });
    const [refetchStats] = useLazyQuery(GET_OVERVIEW_STATS, { fetchPolicy: "cache-and-network" });
    const [refetchCanCreateOrg] = useLazyQuery(GET_CAN_CREATE_LOCAL_ORG, { fetchPolicy: "no-cache" });
    const [createOrgMut] = useMutation(CREATE_ORGANIZATION);
    const [addUserToOrgMut] = useMutation(ADD_USER_TO_ORGANIZATION);
    const [deleteProjectByIdMut] = useMutation(DELETE_PROJECT, { fetchPolicy: "no-cache" });

    useEffect(unsubscribeWSOnDestroy(router, [CurrentPage.PROJECTS]), []);

    useEffect(() => {
        if (organizationInactive == null) return;
        if (!organizationInactive) {
            initData();
        } else {
            createDefaultOrg();
        }
    }, [organizationInactive]);

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
    }, [modal]);

    function initData() {
        refetchProjectsAndPostProcess();
        refetchStatsAndPostProcess();

        WebSocketsService.subscribeToNotification(CurrentPage.PROJECTS, {
            whitelist: ['project_created', 'project_deleted', 'project_update', 'file_upload', 'bad_password'],
            func: handleWebsocketNotification
        });
    }

    function refetchProjectsAndPostProcess() {
        refetchProjects().then((res) => {
            const projects = res.data["allProjects"].edges.map((edge: any) => edge.node);
            dispatch(setAllProjects(postProcessProjectsList(projects)));
            setDataLoaded(true);
        });
    }

    function refetchStatsAndPostProcess() {
        refetchStats().then((res) => {
            const stats = JSON.parse(res.data["overviewStats"]);
            const statsDict = {};
            if (stats == null) return;
            stats.forEach((stat: ProjectStatistics) => {
                const statCopy = jsonCopy(stat);
                stat.manuallyLabeled = percentRoundString(statCopy.numDataScaleManual / statCopy.numDataScaleUploaded, 2);
                stat.weaklySupervised = percentRoundString(statCopy.numDataScaleProgrammatical / statCopy.numDataScaleUploaded, 2);
                statsDict[stat.projectId] = stat;
            });
            setProjectStatisticsById(statsDict);
        });
    }

    function handleWebsocketNotification(msgParts: string[]) {
        if (['project_created', 'project_deleted', 'project_update'].includes(msgParts[1])) {
            refetchProjectsAndPostProcess();
            refetchStatsAndPostProcess();
        }
        // TODO: add logic for bad password
    }

    function createDefaultOrg() {
        if (isManaged || isDemo) {
            setDataLoaded(true);
            return;
        }
        refetchCanCreateOrg().then((res) => {
            setCanCreateOrg(res.data["canCreateLocalOrg"]);
            if (!canCreateOrg) return;
            const localhostOrg = "localhost";
            createOrgMut({ variables: { name: localhostOrg } }).then((res) => {
                addUserToOrgMut({ variables: { userMail: user.mail, organizationName: localhostOrg } }).then((res) => {
                    location.reload();
                    setDataLoaded(true);
                });
            });
        });
    }

    return (
        <div>
            {dataLoaded ? (<>
                {organizationInactive ? (
                    <div className="h-screen relative bg-white overflow-hidden">
                        <div className="hidden lg:block lg:absolute lg:inset-0" aria-hidden="true">
                            <svg className="h-screen absolute top-0 left-1/2 transform translate-x-64 -translate-y-8" width="640"
                                height="784" fill="none" viewBox="0 0 640 784">
                                <defs>
                                    <pattern id="9ebea6f4-a1f5-4d96-8c4e-4c2abf658047" x="118" y="0" width="20" height="20"
                                        patternUnits="userSpaceOnUse">
                                        <rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" />
                                    </pattern>
                                </defs>
                                <rect y="72" width="640" height="640" className="text-gray-50" fill="currentColor" />
                                <rect x="118" width="404" height="784" fill="url(#9ebea6f4-a1f5-4d96-8c4e-4c2abf658047)" />
                            </svg>
                        </div>
                        <div className="relative pt-6 pb-16 sm:pb-24 lg:pb-32">
                            <main className="mt-16 mx-auto px-4 sm:mt-24 sm:px-6 lg:mt-32">
                                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                                    <div className="sm:text-center md:mx-auto lg:col-span-6 lg:text-left">
                                        {isManaged ? (<div>
                                            <div className="text-gray-500 font-semibold text-base uppercase">You&apos;re now on the waitlist!
                                            </div>
                                            <div className="font-extrabold text-gray-900 text-5xl mt-1">
                                                You don&apos;t want to <span className="text-green-800">wait?</span>
                                            </div>
                                            <div className="font-normal text-xl text-gray-500 mt-5">
                                                In a 15 minute onboarding call, we can directly assign you access. Reach out to us &nbsp;
                                                <a href="https://www.kern.ai/waitlist" target="_blank"><span
                                                    className="underline cursor-pointer">here</span></a>.
                                            </div>
                                            <div className="text-gray-500 mt-5">
                                                In the meantime, feel free to take a look at a product demo or check out our&nbsp;
                                                <a href="https://docs.kern.ai/" target="_blank"><span
                                                    className="underline cursor-pointer">documentation</span></a>. If you have any
                                                questions, contact us any time.
                                            </div>
                                        </div>) : (
                                            <div>
                                                {canCreateOrg ? (<div className="text-gray-500 font-semibold text-base uppercase">
                                                    Preparing your account. Please reload the page.
                                                </div>) : (<div className="text-gray-500 font-semibold text-base uppercase">
                                                    Maximum number of users reached. Please look into our managed version.</div>)}

                                                <div className="font-normal text-xl text-gray-500 mt-5">
                                                    {canCreateOrg ? (<span>
                                                        In the meantime, feel free to take a look at a product demo or check out our
                                                        <a href="https://docs.kern.ai/" target="_blank"><span
                                                            className="underline cursor-pointer">documentation</span></a>. If you have
                                                        any
                                                        questions, you can reach out to us.
                                                    </span>) : (<span> If you are interested in working with multiple users take a look at our <a
                                                        href="./users"><span className="underline cursor-pointer">options</span></a></span>)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <YoutubeIntroduction />
                                </div>
                            </main>
                        </div>
                    </div>
                ) : (<>
                    {projects != null ? (<>
                        {projects.length == 0 ? (
                            <div className="h-screen relative bg-white overflow-hidden">
                                <div className="hidden lg:block lg:absolute lg:inset-0" aria-hidden="true">
                                    <svg className="h-screen absolute top-0 left-1/2 transform translate-x-64 -translate-y-8" width="640"
                                        height="784" fill="none" viewBox="0 0 640 784">
                                        <defs>
                                            <pattern id="9ebea6f4-a1f5-4d96-8c4e-4c2abf658047" x="118" y="0" width="20" height="20"
                                                patternUnits="userSpaceOnUse">
                                                <rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" />
                                            </pattern>
                                        </defs>
                                        <rect y="72" width="640" height="640" className="text-gray-50" fill="currentColor" />
                                        <rect x="118" width="404" height="784" fill="url(#9ebea6f4-a1f5-4d96-8c4e-4c2abf658047)" />
                                    </svg>
                                </div>
                                <div className="relative pt-6 pb-16 sm:pb-24 lg:pb-32">
                                    <main className="mt-16 mx-auto px-4 sm:mt-24 sm:px-6 lg:mt-32">
                                        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                                            <div className="sm:text-center md:mx-auto lg:col-span-6 lg:text-left">
                                                <div className="text-gray-500 font-semibold text-base uppercase">Ready to launch!</div>
                                                <div className="font-extrabold text-gray-900 text-5xl mt-1">
                                                    Start your <span className="text-green-800">first project</span>
                                                </div>
                                                <div className="font-normal text-xl text-gray-500 mt-5">
                                                    Feel free to take a look at a product demo or check out our&nbsp;
                                                    <a href="https://docs.kern.ai/" target="_blank"><span
                                                        className="underline cursor-pointer">documentation</span></a>. If you have any
                                                    questions, you can reach out to us.
                                                </div>
                                                <ButtonsContainer />
                                            </div>
                                            <YoutubeIntroduction />
                                        </div>
                                    </main>
                                </div>
                            </div>
                        ) : (<div>
                            <div className="ml-4">
                                <ButtonsContainer />
                            </div>
                            <div className="h-screen overflow-y-scroll my-3">
                                <div className={style.scrollableSize}>
                                    {projects && projects.map((project: Project, index: number) => (
                                        <ProjectCard project={project} projectStatisticsById={projectStatisticsById} key={index}></ProjectCard>
                                    ))}
                                </div>
                                <Modal modalName={ModalEnum.ADMIN_DELETE_PROJECT} acceptButton={acceptButton} abortButton={abortButton}>
                                    <div className="flex flex-row items-center justify-center">
                                        <span className="text-lg leading-6 text-gray-900 font-medium">
                                            Admin Function - Quick delete
                                        </span>
                                    </div>
                                    Are you sure?<div>This will delete the project and all its data.</div>
                                </Modal>
                            </div>
                        </div>)}
                    </>) : (<></>)}
                </>)
                }
            </>) : (<></>)}
        </div >
    )
}