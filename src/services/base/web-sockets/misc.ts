
export class WebSocketsService {

    public static ws_connection: any; //camelCase to match the rest of the code
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