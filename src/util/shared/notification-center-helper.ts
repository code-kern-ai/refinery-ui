import { dateAsUTCDate } from "@/submodules/javascript-functions/date-parser";

export function postProcessNotifications(notifications, projectNames: any, notificationId: string = null) {
    const prepareNotifications = [];
    notifications.forEach(notification => {
        notification = { ...notification };
        const tmpCreateDate = new Date(notification.createdAt);
        const convertDateAsUTCDate = dateAsUTCDate(tmpCreateDate);
        notification.date = convertDateAsUTCDate.toLocaleString();
        notification.timePassed = timeDiffCalc(convertDateAsUTCDate);
        if (Object.keys(projectNames).length != 0) notification.projectName = projectNames[notification.projectId]?.name;
        applyPageChanges(notification)
        if (!(prepareNotifications.length)) {
            prepareNotifications.push({
                highlightMe: false,
                array: [notification]
            });
        } else if (prepareNotifications[prepareNotifications.length - 1].array[0].type === notification.type && prepareNotifications[prepareNotifications.length - 1].array[0].projectId === notification.projectId) {
            prepareNotifications[prepareNotifications.length - 1].array.push(notification);
        }
        else {
            prepareNotifications.push({
                highlightMe: false,
                array: [notification]
            });
        }
        if (notificationId && notificationId === notification.id) {
            prepareNotifications[prepareNotifications.length - 1].highlightMe = true;
        }
    });
    return prepareNotifications
}

function applyPageChanges(notification) {
    if (notification.type == "CUSTOM" && notification.message == 'Continuation of your previous session.') {
        notification.page = "labeling"
    }
}

function timeDiffCalc(date: any) {
    let diffInMilliSeconds = Math.abs(Date.now() - date) / 1000;

    // calculate days
    const days = Math.floor(diffInMilliSeconds / 86400);
    diffInMilliSeconds -= days * 86400;
    if (days > 0) {
        return (days === 1) ? `${days} day` : `${days} days`;
    }

    // calculate hours
    const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
    diffInMilliSeconds -= hours * 3600;
    if (hours > 0) {
        return (hours === 1) ? `${hours} hour` : `${hours} hours`;
    }

    // calculate minutes
    const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
    diffInMilliSeconds -= minutes * 60;
    if (minutes > 0) {
        return (minutes === 1) ? `${minutes} minute` : `${minutes} minutes`;
    }
    return `less than a minute`
}

export function postProcessNotificationsUser(notifications, notificationsState): any {
    let final = [];
    const toBeAddedValues = notifications.map((n) => ({ ...n, savedToStore: new Date().getTime() }));
    if (notificationsState.length > 0) {
        final = [...notificationsState, ...toBeAddedValues];
    } else {
        final = toBeAddedValues;
    }
    return final;
}
