import { dateAsUTCDate, timeDiffCalc } from "@/submodules/javascript-functions/date-parser";

export function postProcessNotifications(notifications, projectNames: any) {
    const prepareNotifications = [];
    notifications.forEach(notification => {
        notification = { ...notification };
        const convertDateAsUTCDate = dateAsUTCDate(new Date(notification.createdAt));
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
    });
    return prepareNotifications
}

function applyPageChanges(notification) {
    if (notification.type == "CUSTOM" && notification.message == 'Continuation of your previous session.') {
        notification.page = "labeling"
    }
}