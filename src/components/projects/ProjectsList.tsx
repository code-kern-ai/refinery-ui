import { selectInactiveOrganization, selectIsDemo, selectIsManaged, selectUser, setComments } from "@/src/reduxStore/states/general"
import { selectAllProjects, setAllProjects } from "@/src/reduxStore/states/project";
import { Project, ProjectStatistics } from "@/src/types/components/projects/projects-list";
import { percentRoundString } from "@/submodules/javascript-functions/general";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import YoutubeIntroduction from "./YoutubeIntroduction";
import ButtonsContainer from "./ButtonsContainer";
import ProjectCard from "./ProjectCard";
import style from "@/src/styles/components/projects/projects-list.module.css";
import AdminDeleteProjectModal from "./AdminDeleteProjectModal";
import { setAllAttributes, setAllEmbeddings, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { setOverviewFilters } from "@/src/reduxStore/states/tmp";
import { setDataSlices, setFullSearchStore, setSearchGroupsStore } from "@/src/reduxStore/states/pages/data-browser";
import { SearchGroup } from "@/submodules/javascript-functions/enums/enums";
import { useWebsocket } from "@/submodules/react-components/hooks/web-socket/useWebsocket";
import { getAllProjects } from "@/src/services/base/project";
import { addUserToOrganization, createOrganization, getCanCreateLocalOrg, getOverviewStats } from "@/src/services/base/organization";
import { Application, CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";

export default function ProjectsList() {
    const dispatch = useDispatch();

    const organizationInactive = useSelector(selectInactiveOrganization);
    const isManaged = useSelector(selectIsManaged);
    const isDemo = useSelector(selectIsDemo);
    const projects = useSelector(selectAllProjects);
    const user = useSelector(selectUser);

    const [projectStatisticsById, setProjectStatisticsById] = useState({});
    const [canCreateOrg, setCanCreateOrg] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        dispatch(setLabelingTasksAll(null));
        dispatch(setOverviewFilters(null));
        dispatch(setSearchGroupsStore(null));
        dispatch(setFullSearchStore({ [SearchGroup.DRILL_DOWN]: false }));
        dispatch(setAllAttributes([]));
        dispatch(setAllEmbeddings([]));
        dispatch(setDataSlices([]));
        dispatch(setComments(null));
    }, []);

    useEffect(() => {
        if (organizationInactive == null || !user) return;
        if (!organizationInactive) {
            refetchProjectsAndPostProcess();
            refetchStatsAndPostProcess();
        } else {
            createDefaultOrg();
        }
    }, [organizationInactive, user]);

    function refetchProjectsAndPostProcess() {
        getAllProjects((res) => {
            const projects = res.data["allProjects"].edges.map((edge: any) => edge.node);
            dispatch(setAllProjects(projects));
            setDataLoaded(true);
        });
    }

    function refetchStatsAndPostProcess() {
        getOverviewStats((res) => {
            const stats = res.data["overviewStats"];
            const statsDict = {};
            if (stats == null) return;
            stats.forEach((stat: ProjectStatistics) => {
                const statCopy = { ...stat };
                stat.manuallyLabeled = percentRoundString(statCopy.numDataScaleManual / statCopy.numDataScaleUploaded, 2);
                stat.weaklySupervised = percentRoundString(statCopy.numDataScaleProgrammatical / statCopy.numDataScaleUploaded, 2);
                statsDict[stat.projectId] = stat;
            });
            setProjectStatisticsById(statsDict);
        });
    }

    function createDefaultOrg() {
        if (isManaged || isDemo) {
            setDataLoaded(true);
            return;
        }
        getCanCreateLocalOrg(res => {
            const canCreate = res.data["canCreateLocalOrg"]
            setCanCreateOrg(canCreate);
            if (!canCreate) return;
            const localhostOrg = "localhost";
            createOrganization(localhostOrg, () => {
                addUserToOrganization(user.mail, localhostOrg, () => {
                    location.reload();
                    setDataLoaded(true);
                });
            })
        });
    }

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (['project_created', 'project_deleted', 'project_update'].includes(msgParts[1])) {
            refetchProjectsAndPostProcess();
            refetchStatsAndPostProcess();
        }
    }, []);

    useWebsocket(Application.REFINERY, CurrentPage.PROJECTS, handleWebsocketNotification);

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
                                                <a href="https://www.kern.ai/schedule-demo" target="_blank"><span
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
                            <div className="h-full overflow-y-auto my-3">
                                <div className={style.scrollableSize}>
                                    {projects && projects.map((project: Project) => (
                                        <ProjectCard project={project} projectStatisticsById={projectStatisticsById} key={project.id}></ProjectCard>
                                    ))}
                                </div>
                                <AdminDeleteProjectModal />
                            </div>
                        </div>)}
                    </>) : (<></>)}
                </>)
                }
            </>) : (<></>)}
        </div >
    )
}