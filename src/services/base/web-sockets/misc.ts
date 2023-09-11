
export class MiscInfo {

    public static ws_connection: any;
    public static timeOutIteration: number = 0;
    public static registeredNotificationListeners: Map<string, Map<Object, NotificationSubscription>> = new Map<string, Map<Object, NotificationSubscription>>();
    public static subscribeToNotifications = (key: Object, params: NotificationSubscription) => { };
    public static unsubscribeFromNotifications = (key: Object) => { };
}

export type NotificationSubscription = {
    projectId?: string;
    whitelist?: string[];
    func: (msg) => void;
};