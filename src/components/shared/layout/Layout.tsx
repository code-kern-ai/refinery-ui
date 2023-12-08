import { useLazyQuery } from "@apollo/client";
import Header from "../header/Header";
import Sidebar from "../sidebar/Sidebar";
import { NOTIFICATIONS_BY_USER } from "@/src/services/gql/queries/projects";
import { Fragment, useCallback, useEffect, useState } from "react";
import { NotificationLevel } from "@/src/types/shared/notification-center";
import { IconAlertTriangleFilled, IconCircleCheckFilled, IconInfoCircleFilled } from "@tabler/icons-react";
import { WebSocketsService } from "@/src/services/base/web-sockets/WebSocketsService";
import { CurrentPage } from "@/src/types/shared/general";
import { useSelector } from "react-redux";
import { selectUser } from "@/src/reduxStore/states/general";
import { interval, timer } from "rxjs";

export default function Layout({ children }) {
    const user = useSelector(selectUser);

    const [notifications, setNotifications] = useState([]);
    const [refetchTimer, setRefetchTimer] = useState(null);
    const [deletionTimer, setDeletionTimer] = useState(null);

    const [refetchNotificationsByUser] = useLazyQuery(NOTIFICATIONS_BY_USER, { fetchPolicy: 'network-only' });

    useEffect(() => {
        refetchNotificationsAndProcess();
        WebSocketsService.subscribeToNotification(CurrentPage.NOTIFICATION_CENTER, {
            whitelist: ['notification_created', 'project_deleted', 'config_updated', 'admin_message'],
            func: handleWebsocketNotification
        });
        initializeNotificationDeletion();
    }, []);

    function refetchNotificationsAndProcess() {
        refetchNotificationsByUser().then((res) => {
            setNotifications(res['data']['notificationsByUserId']);
        });
    }

    function initializeNotificationDeletion() {
        if (deletionTimer == null) {
            const saveDelTimer = interval(3000).subscribe((x) => {
                if (notifications.length > 0) {
                    const notificationsCopy = [...notifications];
                    notificationsCopy.shift();
                    setNotifications(notificationsCopy);
                    if (notificationsCopy.length == 0)
                        unsubscribeDeletionTimer();
                } else {
                    unsubscribeDeletionTimer();
                }
            });
            setDeletionTimer(saveDelTimer);
        }
    }

    function unsubscribeDeletionTimer() {
        if (deletionTimer != null) {
            deletionTimer.unsubscribe();
            setDeletionTimer(null);
        }
    }

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (msgParts[1] == 'notification_created') {
            if (msgParts[2] != user?.id) return;
            if (refetchTimer) return;
            const timerSaved = timer(500).subscribe(() => {
                refetchNotificationsAndProcess();
                setRefetchTimer(null);
            });
            setRefetchTimer(timerSaved);
        }
    }, [user?.id]);

    useEffect(() => {
        WebSocketsService.updateFunctionPointer(null, CurrentPage.NOTIFICATION_CENTER, handleWebsocketNotification)
    }, [handleWebsocketNotification]);

    return (
        <>
            <div className="h-screen bg-gray-100 flex overflow-hidden">
                <Sidebar />
                <div className="h-full w-full flex-1 flex flex-col">
                    <Header />
                    <div className="block flex-grow h-full w-full bg-gray-100">
                        <main>{children}</main>
                    </div>
                </div>
            </div>
            <div className="absolute flex flex-col z-50 bottom-0 left-24 mb-7 cursor-pointer content-start" id="notifications">
                {notifications.map((notification) => (<Fragment key={notification.id}>
                    {notification.level === NotificationLevel.INFO && <div>
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
                    {notification.level === NotificationLevel.WARNING && <div>
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
                    {notification.level === NotificationLevel.ERROR && <div>
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
                    {notification.level === NotificationLevel.SUCCESS && <div>
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
        </>
    )
}