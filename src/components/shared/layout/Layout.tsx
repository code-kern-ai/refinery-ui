import Header from "../header/Header";
import Sidebar from "../sidebar/Sidebar";
import { Fragment, useCallback, useEffect, useState } from "react";
import { NotificationLevel } from "@/src/types/shared/notification-center";
import { IconAlertTriangleFilled, IconCircleCheckFilled, IconInfoCircleFilled } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentPage, selectOrganizationId, selectUser } from "@/src/reduxStore/states/general";
import { interval } from "rxjs";
import { setNotificationId } from "@/src/reduxStore/states/tmp";
import { AdminMessage } from "@/submodules/react-components/types/admin-messages";
import { postProcessAdminMessages } from "@/submodules/react-components/helpers/admin-messages-helper";
import SizeWarningModal from "./SizeWarningModal";
import { closeModal, openModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { postProcessNotificationsUser } from "@/src/util/shared/notification-center-helper";
import { useWebsocket } from "@/submodules/react-components/hooks/web-socket/useWebsocket";
import { useRouter } from "next/router";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { getNotificationsByUser } from "@/src/services/base/notification";
import { getAllActiveAdminMessages } from "@/src/services/base/organization";
import { Application, CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";
import AdminMessages from "@/submodules/react-components/components/AdminMessages";

const MIN_WIDTH = 1250;

export default function Layout({ children }) {
    const router = useRouter();
    const dispatch = useDispatch();

    const user = useSelector(selectUser);
    const projectId = useSelector(selectProjectId);
    const currentPage = useSelector(selectCurrentPage);

    const [deletionTimer, setDeletionTimer] = useState(null);
    const [activeAdminMessages, setActiveAdminMessages] = useState<AdminMessage[]>([]);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [notificationsState, setNotificationsState] = useState([]);

    useEffect(() => {
        refetchNotificationsAndProcess();
        refetchAdminMessagesAndProcess();
    }, []);

    function handleResize() {
        setWindowWidth(window.innerWidth);
        if (window.innerWidth < MIN_WIDTH) {
            dispatch(openModal(ModalEnum.SIZE_WARNING));
        } else {
            dispatch(closeModal(ModalEnum.SIZE_WARNING));
        }
    }

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (deletionTimer != null) return;
        const saveDelTimer = interval(500).subscribe((x) => {
            if (notificationsState.length > 0) {
                setNotificationsState(notificationsState.filter((notification) => new Date().getTime() - notification.savedToStore < 5000));

            } else {
                unsubscribeDeletionTimer(deletionTimer);
                setDeletionTimer(null);

            }
        });
        return () => {
            saveDelTimer.unsubscribe();
        };
    }, [notificationsState, deletionTimer]);



    function refetchNotificationsAndProcess() {
        getNotificationsByUser((res) => {
            setNotificationsState(postProcessNotificationsUser(res['data']['notificationsByUserId'], notificationsState));
        });
    }

    function refetchAdminMessagesAndProcess() {
        getAllActiveAdminMessages((res) => setActiveAdminMessages(postProcessAdminMessages(res['data']['allActiveAdminMessages'])));
    }

    function unsubscribeDeletionTimer(deletionTimer) {
        if (deletionTimer != null) {
            deletionTimer.unsubscribe();
            setDeletionTimer(null);
        }
    }

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (msgParts[1] == 'notification_created') {
            if (msgParts[2] != user?.id) return;
            refetchNotificationsAndProcess();
        } else if (msgParts[1] == 'admin_message') {
            refetchAdminMessagesAndProcess();
        } else if (msgParts[1] == 'project_deleted' && msgParts[3] != null && user?.id != msgParts[3] && projectId == msgParts[2]) {
            alert('Project deleted');
            setTimeout(() => {
                router.push('/projects');
            }, 1000);
        }
    }, [user?.id, notificationsState, projectId]);

    const orgId = useSelector(selectOrganizationId);
    useWebsocket(orgId, Application.REFINERY, CurrentPage.NOTIFICATION_CENTER, handleWebsocketNotification);

    return (
        <>
            <div className="h-screen bg-gray-100 flex overflow-hidden flex-col"
                style={{ width: windowWidth < MIN_WIDTH ? MIN_WIDTH + 'px' : '100%', overflowX: windowWidth < MIN_WIDTH ? 'auto' : 'hidden' }}>
                <div className="h-screen flex overflow-hidden">
                    <Sidebar />
                    <div className="h-full w-full flex flex-col">
                        <Header />
                        <div className={`block flex-grow h-full w-full ${currentPage == CurrentPage.DATA_BROWSER ? '' : 'overflow-y-auto'}`}>
                            <main>{children}</main>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute flex flex-col z-50 bottom-0 left-24 mb-7 cursor-pointer content-start" id="notifications">
                {notificationsState.map((notification, index) => (<Fragment key={index}>
                    {notification.level === NotificationLevel.INFO && <div onClick={() => dispatch(setNotificationId(notification.id))}>
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <IconInfoCircleFilled className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-blue-700">{notification.message}</p>
                                </div>
                            </div>
                        </div>
                    </div>}
                    {notification.level === NotificationLevel.WARNING && <div onClick={() => dispatch(setNotificationId(notification.id))}>
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <IconAlertTriangleFilled className="h-5 w-5 text-yellow-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">{notification.message}</p>
                                </div>
                            </div>
                        </div>
                    </div>}
                    {notification.level === NotificationLevel.ERROR && <div onClick={() => dispatch(setNotificationId(notification.id))}>
                        <div className="bg-red-50 border-l-4 border-red-400 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <IconAlertTriangleFilled className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{notification.message}</p>
                                </div>
                            </div>
                        </div>
                    </div>}
                    {notification.level === NotificationLevel.SUCCESS && <div onClick={() => dispatch(setNotificationId(notification.id))}>
                        <div className="bg-green-50 border-l-4 border-green-400 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <IconCircleCheckFilled className="h-5 w-5 text-green-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-700">{notification.message}</p>
                                </div>
                            </div>
                        </div>
                    </div>}
                </Fragment>))}
            </div>
            <AdminMessages
                adminMessages={activeAdminMessages}
                setActiveAdminMessages={setActiveAdminMessages}
                currentPage={currentPage} />
            <SizeWarningModal minWidth={MIN_WIDTH} />
        </>
    )
}