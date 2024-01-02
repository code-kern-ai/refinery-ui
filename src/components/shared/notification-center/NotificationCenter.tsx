import { selectNotifications } from "@/src/reduxStore/states/general";
import { NotificationLevel } from "@/src/types/shared/notification-center";
import { useSelector } from "react-redux";
import style from "@/src/styles/shared/notification-center.module.css";
import { IconAlertTriangleFilled, IconCircleCheckFilled, IconInfoCircleFilled } from "@tabler/icons-react";
import NotificationData from "./NotificationData";

export default function NotificationCenter() {
    const notifications = useSelector(selectNotifications);


    return (<div className="h-full w-full flex-1 flex flex-col overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        <div className="h-full flex flex-col p-2">
            {notifications && notifications.length === 0 && <div className="text-gray-400 text-sm">No notifications</div>}
            {notifications && notifications.length > 0 && notifications.map((notification, index) => (<div key={notification.array[0].id}>
                {notification.array[0].level === NotificationLevel.WARNING && <div className={`mb-2 rounded-md border border-yellow-300 bg-yellow-50 p-3 ${notification.highlightMe ? style.outlineKern : ''}`}>
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <IconAlertTriangleFilled className="h-5 w-5 text-yellow-400" />
                        </div>
                        <NotificationData notification={notification.array} textColor="yellow" />
                    </div>
                </div>}
                {notification.array[0].level === NotificationLevel.SUCCESS && <div className={`mb-2 rounded-md border border-green-300 bg-green-50 p-3 ${notification.highlightMe ? style.outlineKern : ''}`}>
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <IconCircleCheckFilled className="h-5 w-5 text-green-400" />
                        </div>
                        <NotificationData notification={notification.array} textColor="green" />
                    </div>
                </div>}
                {notification.array[0].level === NotificationLevel.INFO && <div className={`mb-2 rounded-md border border-blue-300 bg-blue-50 p-3 ${notification.highlightMe ? style.outlineKern : ''}`}>
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <IconInfoCircleFilled className="h-5 w-5 text-blue-400" />
                        </div>
                        <NotificationData notification={notification.array} textColor="blue" />
                    </div>
                </div>}
                {notification.array[0].level === NotificationLevel.ERROR && <div className={`mb-2 rounded-md border border-red-300 bg-red-50 p-3 ${notification.highlightMe ? style.outlineKern : ''}`}>
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <IconAlertTriangleFilled className="h-6 w-6 text-red-400" />
                        </div>
                        <NotificationData notification={notification.array} textColor="red" />
                    </div>
                </div>}
            </div>))}
        </div>
    </div>);
}