
export class MiscInfo {

    public static ws_subject: any;
    public static timeOutIteration: number = 0;
    public static registeredNotificationListeners: Map<string, Map<Object, NotificationSubscription>> = new Map<string, Map<Object, NotificationSubscription>>();

}

export type NotificationSubscription = {
    projectId?: string;
    whitelist?: string[];
    func: (msg) => void;
};