import { selectCurrentPage, selectDisplayIconComments, selectIsDemo, selectIsManaged, selectOrganization, selectUser, setNotifications } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/src/types/shared/general";
import { UserRole } from "@/src/types/shared/sidebar";
import { Tooltip } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from "@/src/styles/shared/header.module.css";
import LogoutDropdown from "./LogoutDropdown";
import { useRouter } from "next/router";
import { IconBell, IconHexagons, IconHome, IconPlayCard } from "@tabler/icons-react";
import { selectAllProjectsNamesDict, selectProject, setAllProjects } from "@/src/reduxStore/states/project";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import NotificationCenterModal from "../notification-center/NotificationCenterModal";
import { openModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { useLazyQuery } from "@apollo/client";
import { GET_PROJECT_LIST, NOTIFICATIONS } from "@/src/services/gql/queries/projects";
import { postProcessNotifications } from "@/src/util/shared/notification-center-helper";
import { selectNotificationId } from "@/src/reduxStore/states/tmp";
import Comments from "../comments/Comments";
import { arrayToDict } from "@/submodules/javascript-functions/general";

export default function Header() {
    const router = useRouter();
    const dispatch = useDispatch();

    const isDemo = useSelector(selectIsDemo);
    const isManaged = useSelector(selectIsManaged);
    const currentPage = useSelector(selectCurrentPage);
    const organization = useSelector(selectOrganization);
    const user = useSelector(selectUser);
    const project = useSelector(selectProject);
    const projectsNames = useSelector(selectAllProjectsNamesDict);
    const notificationId = useSelector(selectNotificationId);
    const displayComments = useSelector(selectDisplayIconComments);

    const [organizationInactive, setOrganizationInactive] = useState(null);

    const [refetchNotifications] = useLazyQuery(NOTIFICATIONS, { fetchPolicy: 'network-only' });
    const [refetchProjects] = useLazyQuery(GET_PROJECT_LIST, { fetchPolicy: "no-cache" });

    useEffect(() => {
        if (!projectsNames) return;
        document.getElementById('notifications').addEventListener('click', () => {
            openModalAndRefetchNotifications();
        });
    }, [projectsNames]);

    useEffect(() => {
        setOrganizationInactive(organization == null);
    }, [organization]);

    useEffect(() => {
        if (!notificationId) return;
        openModalAndRefetchNotifications();
    }, [notificationId]);

    function openModalAndRefetchNotifications() {
        refetchProjects().then((res) => {
            const projects = res.data["allProjects"].edges.map((edge: any) => edge.node);
            dispatch(setAllProjects(projects));
            refetchNotifications().then((res) => {
                dispatch(setNotifications(postProcessNotifications(res.data['notifications'], arrayToDict(projects, 'id'), notificationId)));
                dispatch(openModal(ModalEnum.NOTIFICATION_CENTER));
            });
        });
    }

    return (
        <header className="sticky top-0 z-50 w-full">
            <div className="relative z-10 flex-shrink-0 h-16 bg-white border-b border-gray-200 shadow-sm flex justify-between items-center">
                {isDemo ? (<div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center pointer-events-none">
                    <span className="inline-flex items-center px-2 py-0.5 rounded font-medium bg-red-100 text-red-800">
                        <IconPlayCard className="w-6 h-6 mr-2" />
                        Demo Playground - Everything will be reset on the hour
                    </span>
                </div>) : (<></>)}
                <div className="flex items-center">
                    {currentPage == CurrentPage.PROJECTS || currentPage == CurrentPage.USERS ? (<div className="ml-6 text-gray-500 text-sm font-normal">
                        {!organizationInactive && <> Welcome, <span className="font-bold text-gray-900">{user?.firstName}</span>! See your projects at <span className="font-bold text-gray-900">{organization?.name}</span>.</>}
                        {organizationInactive && <> Welcome, <span className="font-bold text-gray-900">{user?.firstName}</span>! {!isManaged ? 'Switch to your main account to continue labeling...' : 'You are currently on the waitlist.'}
                        </>}
                    </div>) : (<></>)}
                    {currentPage == CurrentPage.NEW_PROJECT && <div className="ml-6 text-gray-500 text-sm font-normal">
                        Add a new project to <span className="font-bold text-gray-900">{organization?.name}</span>.
                    </div>}
                    {!(currentPage == CurrentPage.PROJECTS || currentPage == CurrentPage.USERS || currentPage == CurrentPage.NEW_PROJECT || currentPage == CurrentPage.MODELS_DOWNLOAD || currentPage == CurrentPage.CONFIG) && <div className="ml-6 text-gray-700 text-sm font-normal">
                        {project?.name} - <span className="text-gray-500 font-normal">{project?.numDataScaleUploaded} records</span>
                    </div>}
                    {currentPage == CurrentPage.MODELS_DOWNLOAD && <div className="ml-6 text-gray-500 text-sm font-normal">
                        Welcome <span className="font-bold text-gray-900">{user?.firstName}</span>! See your downloaded models.
                    </div>}
                    {currentPage == CurrentPage.CONFIG && <div className="ml-6 text-gray-500 text-sm font-normal">
                        {!organizationInactive && user && <>Welcome, <span className="font-bold text-gray-900">{user?.firstName}</span>! Change your app configuration <span className="font-bold text-gray-900">here</span>.</>}
                        {organizationInactive && <>Welcome, <span className="font-bold text-gray-900">{user?.firstName}</span>!
                            {!isManaged ? 'Switch to your main account to continue labeling...' : 'You are currently on the waitlist.'}</>}
                    </div>}
                </div>
                <div className="flex flex-row flex-nowrap items-center">
                    <div className="flex items-center justify-center">
                        <Tooltip placement="left" trigger="hover" color="invert" content={TOOLTIPS_DICT.GENERAL.PROJECTS}>
                            <a className="flex mr-6" onClick={() => router.push('/projects')}>
                                <IconHome className="w-6 h-6" />
                            </a>
                        </Tooltip>
                    </div>
                    {user?.role == UserRole.ENGINEER ? (
                        <div className="flex items-center justify-center">
                            <Tooltip placement="left" trigger="hover" color="invert" content={TOOLTIPS_DICT.GENERAL.USERS}>
                                <a className="flex mr-6" onClick={() => router.push('/users')}>
                                    <IconHexagons className="w-6 h-6" />
                                </a>
                            </Tooltip>
                        </div>
                    ) : (<></>)}
                    <div className="flex items-center justify-center">
                        {displayComments && <Comments />}
                    </div>
                    {user?.role == UserRole.ENGINEER && <div className="flex items-center justify-center">
                        <Tooltip content={TOOLTIPS_DICT.GENERAL.NOTIFICATION_CENTER} placement="left" color="invert">
                            <button className="flex mr-6 cursor-pointer" onClick={openModalAndRefetchNotifications}>
                                <IconBell className="w-6 h-6" />
                            </button>
                        </Tooltip>
                    </div>}
                    {user?.role == UserRole.ENGINEER ? (
                        <div className="flex items-center justify-center">
                            <div className={`${style.widget} ${style.widgetLg}`}><a className={style.btnx} href="https://github.com/code-kern-ai/refinery"
                                rel="noopener" target="_blank" aria-label="Star code-kern-ai/refinery on GitHub"><svg
                                    viewBox="0 0 16 16" width="16" height="16" className="octicon octicon-star" aria-hidden="true">
                                    <path fillRule="evenodd"
                                        d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z">
                                    </path>
                                </svg>&nbsp;<span>Star on GitHub</span></a></div>
                        </div>
                    ) : (<></>)}
                    <LogoutDropdown />
                </div>
            </div >
            <NotificationCenterModal />
        </header >
    )
}