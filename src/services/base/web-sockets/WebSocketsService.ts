import { timer } from "rxjs";
import { webSocket } from "rxjs/webSocket";
import { NotificationSubscription } from "./web-sockets-helper";
import { CurrentPage } from "@/src/types/shared/general";

export class WebSocketsService {

    private static wsConnection: any;
    private static timeOutIteration: number = 0;
    private static registeredNotificationListeners: Map<string, Map<CurrentPage, NotificationSubscription>> = new Map<string, Map<CurrentPage, NotificationSubscription>>()
    private static connectionOpened: boolean = false;

    public static getConnectionOpened() {
        return WebSocketsService.connectionOpened;
    }

    public static setConnectionOpened(value: boolean) {
        WebSocketsService.connectionOpened = value;
    }

    public static updateFunctionPointer(projectId: string, page: CurrentPage, funcPointer: (msg: string[]) => void) {
        if (!projectId) projectId = "GLOBAL";
        if (!WebSocketsService.registeredNotificationListeners.has(projectId)) {
            console.error("Nothing registered for projectId: " + projectId);
            return;
        }
        const innerMap = WebSocketsService.registeredNotificationListeners.get(projectId);
        if (!innerMap.has(page)) {
            console.error("Nothing registered for page: " + page);
            return;
        }
        const params = innerMap.get(page);
        params.func = funcPointer;
    }

    public static initWsNotifications() {
        const address = WebSocketsService.findWebsocketAddress();
        if (address) {
            WebSocketsService.wsConnection = webSocket({
                url: address,
                deserializer: msg => msg.data,
                openObserver: {
                    next: () => {
                        if (WebSocketsService.timeOutIteration) console.log("Websocket connected");
                        WebSocketsService.timeOutIteration = 0;
                    }
                },
                closeObserver: {
                    next: (closeEvent) => {
                        const timeout = WebSocketsService.getTimeout(WebSocketsService.timeOutIteration);
                        timer(timeout).subscribe(() => { WebSocketsService.timeOutIteration++; WebSocketsService.initWsNotifications(); })
                    }
                }
            });
            WebSocketsService.wsConnection.subscribe(
                msg => WebSocketsService.handleWebsocketNotificationMessage(msg),
                err => WebSocketsService.handleError(err),
                () => WebSocketsService.handleWsClosed()
            );
        }
    }

    private static getTimeout(iteration: number) {
        if (iteration <= 0) return 1000;
        else {
            switch (iteration) {
                case 1: return 2000;
                case 2: return 5000;
                case 3: return 15000;
                case 4: return 30000;
                case 5: return 60000;
                default:
                    return 60 * 5 * 1000; //5 min
            }
        }
    }

    private static findWebsocketAddress() {
        let address = window.location.protocol == 'https:' ? 'wss:' : 'ws:';
        address += '//' + window.location.host + '/notify/ws';
        return address; //'ws://localhost:4455/notify/ws'
    }


    private static handleError(err) {
        console.log("error", err)
    }

    private static handleWsClosed() {
        console.log('ws closed')
    }


    private static handleWebsocketNotificationMessage(msg: string) {
        if (WebSocketsService.registeredNotificationListeners.size == 0) return;
        if (msg.includes("\n")) {
            msg.split("\n").forEach(element => WebSocketsService.handleWebsocketNotificationMessage(element));
            return;
        }

        const msgParts = msg.split(":");
        const projectId = msgParts[0];
        if (!WebSocketsService.registeredNotificationListeners.has(projectId)) return;

        WebSocketsService.registeredNotificationListeners.get(projectId).forEach((params, key) => {
            if (!params.whitelist || params.whitelist.includes(msgParts[1])) {
                params.func.call(key, msgParts);
            }
        });
    }

    public static subscribeToNotification(key: CurrentPage, params: NotificationSubscription) {
        if (!params.projectId) params.projectId = "GLOBAL";
        if (!WebSocketsService.registeredNotificationListeners.has(params.projectId)) {
            WebSocketsService.registeredNotificationListeners.set(params.projectId, new Map<CurrentPage, NotificationSubscription>());
        }
        const innerMap = WebSocketsService.registeredNotificationListeners.get(params.projectId);
        innerMap.set(key, params);
    }

    public static unsubscribeFromNotification(key: CurrentPage, projectId: string = null) {
        if (!projectId) projectId = "GLOBAL"
        if (WebSocketsService.registeredNotificationListeners.has(projectId)) {
            WebSocketsService.registeredNotificationListeners.get(projectId).delete(key);
        }
    }
}

