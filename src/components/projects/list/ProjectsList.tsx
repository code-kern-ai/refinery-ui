import { selectIsManaged, selectOrganization } from "@/src/reduxStore/states/general"
import { selectAllProjects, setAllProjects } from "@/src/reduxStore/states/project";
import { MiscInfo } from "@/src/services/base/web-sockets/misc";
import { GET_OVERVIEW_STATS, GET_PROJECT_LIST } from "@/src/services/gql/queries/projects";
import { Project, ProjectStatistics, ProjectStatus } from "@/src/types/components/projects/list/projects-list";
import { CurrentPage } from "@/src/types/shared/general";
import { parseUTC } from "@/submodules/javascript-functions/date-parser";
import { jsonCopy, percentRound } from "@/submodules/javascript-functions/general";
import { useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import YoutubeIntroduction from "./YoutubeIntroduction";
import ButtonsContainer from "./ButtonsContainer";
import { useRouter } from "next/router";
import ProjectCard from "./ProjectCard";

export default function ProjectsList() {
    const dispatch = useDispatch();
    const router = useRouter();

    const organization = useSelector(selectOrganization);
    const isManaged = useSelector(selectIsManaged);
    const projects = useSelector(selectAllProjects);
    const [organizationInactive, setOrganizationInactive] = useState(null);
    const [projectStatisticsById, setProjectStatisticsById] = useState({});
    const [canCreateOrg, setCanCreateOrg] = useState(false);

    const [refetchProjects] = useLazyQuery(GET_PROJECT_LIST, { fetchPolicy: "no-cache" });
    const [refetchStats] = useLazyQuery(GET_OVERVIEW_STATS, { fetchPolicy: "cache-and-network" });

    useEffect(() => {
        setOrganizationInactive(organization == null);
    }, [organization]);

    useEffect(() => {
        if (organizationInactive == null) return;
        if (!organizationInactive) {
            initData();
        } else {
            createDefaultOrg(null);
        }
    }, [organizationInactive]);


    function initData() {
        refetchProjects().then((res) => {
            let projects = res.data["allProjects"].edges.map((edge: any) => edge.node);
            projects.sort((a, b) => a.name.localeCompare(b.name));
            projects = projects.filter(a => a.status != ProjectStatus.IN_DELETION);
            projects = projects.map((project: Project) => {
                const projectItemCopy = jsonCopy(project);
                projectItemCopy.timeStamp = parseUTC(projectItemCopy.createdAt);
                const splitDateTime = projectItemCopy.timeStamp.split(',');
                projectItemCopy.date = splitDateTime[0].trim();
                projectItemCopy.time = splitDateTime[1];
                return projectItemCopy;
            })
            dispatch(setAllProjects(projects));
        });

        refetchStats().then((res) => {
            const stats = JSON.parse(res.data["overviewStats"]);
            const statsDict = {};
            if (stats == null) return;
            stats.forEach((stat: ProjectStatistics) => {
                const statCopy = jsonCopy(stat);
                stat.manuallyLabeled = percentRound(statCopy.numDataScaleManual / statCopy.numDataScaleUploaded, 2);
                stat.weaklySupervised = percentRound(statCopy.numDataScaleProgrammatical / statCopy.numDataScaleUploaded, 2);
                statsDict[stat.projectId] = stat;
            });
            setProjectStatisticsById(statsDict);
        });

        MiscInfo.subscribeToNotifications(CurrentPage.PROJECTS, {
            whitelist: ['project_created', 'project_deleted', 'project_update', 'file_upload', 'bad_password'],
            func: handleWebsocketNotification
        });
    }

    function handleWebsocketNotification(msgParts: any) {

    }

    function createDefaultOrg(user: any) {
    }

    return (
        <div>
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
                                <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
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
                                            In the meantime, feel free to take a look at a product demo or check out our &nbsp;
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
                                    <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                                        <div className="text-gray-500 font-semibold text-base uppercase">Ready to launch!</div>
                                        <div className="font-extrabold text-gray-900 text-5xl mt-1">
                                            Start your <span className="text-green-800">first project</span>
                                        </div>
                                        <div className="font-normal text-xl text-gray-500 mt-5">
                                            Feel free to take a look at a product demo or check out our &nbsp;
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
                    <div className="h-screen overflow-y-scroll mt-3">
                        <div className="scrollable-size">
                            {projects && projects.map((project: Project) => (
                                <ProjectCard project={project} projectStatisticsById={projectStatisticsById}></ProjectCard>
                            ))}
                        </div>
                    </div>
                </div>)}
            </>)
            }
        </div >
    )
}