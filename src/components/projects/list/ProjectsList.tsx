import { selectIsManaged, selectOrganization } from "@/src/reduxStore/states/general"
import { selectAllProjects, setAllProjects } from "@/src/reduxStore/states/project";
import { MiscInfo } from "@/src/services/base/web-sockets/misc";
import { GET_OVERVIEW_STATS, GET_PROJECT_LIST } from "@/src/services/gql/queries/projects";
import { Project, ProjectStatistics, ProjectStatus } from "@/src/types/components/projects/list/projects-list";
import { CurrentPage } from "@/src/types/shared/general";
import { parseUTC } from "@/submodules/javascript-functions/date-parser";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from 'next/image';

const YOUTUBE_URL = "https://www.youtube.com/embed/Hwlu6GWzDH8?autoplay=1&enablejsapi=1";

export default function ProjectsList() {
    const dispatch = useDispatch();
    const organization = useSelector(selectOrganization);
    const isManaged = useSelector(selectIsManaged);
    const projects = useSelector(selectAllProjects);

    const [organizationInactive, setOrganizationInactive] = useState(null);
    const [projectStatisticsById, setProjectStatisticsById] = useState<any>({});
    const [saveUrl, setSaveUrl] = useState(null);
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

    function startPlayback() {
        setSaveUrl(YOUTUBE_URL);
    }

    return (
        <div>
            {organizationInactive ? (
                <>{isManaged ? (
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
                            <main className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24 sm:px-6 lg:mt-32">
                                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                                    <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
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
                                    </div>
                                    <div className="overflow-hidden relative" style={{ width: '560px', height: '315px' }}>
                                        {saveUrl ? (<>
                                            <iframe width="560" height="315" src={saveUrl} title="YouTube video player"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen></iframe></>) : (
                                            <div>
                                                <div style={{ width: '100%', position: 'relative' }}>
                                                    <Image
                                                        alt=""
                                                        src="/refinery/images/thumbnail.jpg"
                                                        layout="fill"
                                                        objectFit="contain"
                                                    />
                                                </div>
                                                <span className="absolute inset-0 w-full h-full flex items-center justify-center"
                                                    aria-hidden="true">
                                                    <svg onClick={startPlayback} className="cursor-pointer h-20 w-20 text-indigo-500" fill="currentColor"
                                                        viewBox="0 0 84 84">
                                                        <circle opacity="0.9" cx="42" cy="42" r="42" fill="white" />
                                                        <path
                                                            d="M55.5039 40.3359L37.1094 28.0729C35.7803 27.1869 34 28.1396 34 29.737V54.263C34 55.8604 35.7803 56.8131 37.1094 55.9271L55.5038 43.6641C56.6913 42.8725 56.6913 41.1275 55.5039 40.3359Z" />
                                                    </svg>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </main>
                        </div>
                    </div>
                ) : (
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
                            <main className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24 sm:px-6 lg:mt-32">
                                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                                    <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
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
                                    <div style={{ width: '560px', height: '315px' }} className="overflow-hidden relative">
                                        {saveUrl ? (<iframe width="560" height="315" src={saveUrl} title="YouTube video player"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen></iframe>) : (
                                            <div>
                                                <div style={{ width: '100%', position: 'relative' }}>
                                                    <Image
                                                        alt=""
                                                        src="/refinery/images/thumbnail.jpg"
                                                        layout="fill"
                                                        objectFit="contain"
                                                    />
                                                </div>
                                                <span className="absolute inset-0 w-full h-full flex items-center justify-center"
                                                    aria-hidden="true">
                                                    <svg onClick={startPlayback} className="cursor-pointer h-20 w-20 text-indigo-500" fill="currentColor"
                                                        viewBox="0 0 84 84">
                                                        <circle opacity="0.9" cx="42" cy="42" r="42" fill="white" />
                                                        <path
                                                            d="M55.5039 40.3359L37.1094 28.0729C35.7803 27.1869 34 28.1396 34 29.737V54.263C34 55.8604 35.7803 56.8131 37.1094 55.9271L55.5038 43.6641C56.6913 42.8725 56.6913 41.1275 55.5039 40.3359Z" />
                                                    </svg>
                                                </span>
                                            </div>)}
                                    </div>
                                </div>
                            </main>
                        </div>
                    </div >
                )}</>
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
                            <main className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24 sm:px-6 lg:mt-32">
                                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                                    <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                                        <div className="text-gray-500 font-semibold text-base uppercase">Ready to launch!</div>
                                        <div className="font-extrabold text-gray-900 text-5xl mt-1">
                                            Start your <span className="text-green-800">first project</span>
                                        </div>
                                        <div className="font-normal text-xl text-gray-500 mt-5">
                                            Feel free to take a look at a product demo or check out our
                                            <a href="https://docs.kern.ai/" target="_blank"><span
                                                className="underline cursor-pointer">documentation</span></a>. If you have any
                                            questions, you can reach out to us.
                                        </div>
                                        {/* <ng-container *ngTemplateOutlet="buttonsProject"></ng-container> */}
                                    </div>
                                    <div style={{ width: '560px', height: '315px' }} className="overflow-hidden relative">
                                        {saveUrl ? (<iframe width="560" height="315" src={saveUrl} title="YouTube video player"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen></iframe>) : (
                                            <div>
                                                <div style={{ width: '100%', position: 'relative' }}>
                                                    <Image
                                                        alt=""
                                                        src="/refinery/images/thumbnail.jpg"
                                                        layout="fill"
                                                        objectFit="contain"
                                                    />
                                                </div>
                                                <span className="absolute inset-0 w-full h-full flex items-center justify-center"
                                                    aria-hidden="true">
                                                    <svg onClick={startPlayback} className="cursor-pointer h-20 w-20 text-indigo-500" fill="currentColor"
                                                        viewBox="0 0 84 84">
                                                        <circle opacity="0.9" cx="42" cy="42" r="42" fill="white" />
                                                        <path
                                                            d="M55.5039 40.3359L37.1094 28.0729C35.7803 27.1869 34 28.1396 34 29.737V54.263C34 55.8604 35.7803 56.8131 37.1094 55.9271L55.5038 43.6641C56.6913 42.8725 56.6913 41.1275 55.5039 40.3359Z" />
                                                    </svg>
                                                </span>
                                            </div>)}
                                    </div>
                                </div>
                            </main>
                        </div>
                    </div>
                ) : (<></>)}
            </>)}
        </div>
    )
}