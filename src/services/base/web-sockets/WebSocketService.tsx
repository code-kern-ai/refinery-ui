import { memo, useEffect, useState } from "react";
import { timer } from "rxjs";
import { webSocket } from "rxjs/webSocket";
import { MiscInfo, NotificationSubscription } from "./misc";
import { useLazyQuery } from "@apollo/client";
import { GET_ORGANIZATION } from "../../gql/queries/organizations";
import { useDispatch } from "react-redux";
import { setOrganization } from "@/src/reduxStore/states/general";

function getTimeout(iteration: number) {
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

function findWebsocketAddress() {
    let address = window.location.protocol == 'https:' ? 'wss:' : 'ws:';
    address += '//' + window.location.host + '/notify/ws';
    return address; //'ws://localhost:4455/notify/ws'
}


function handleError(err) {
    console.log("error", err)
}

function handleWsClosed() {
    console.log('ws closed')
}

function GetNotificationsServiceWrapper(props: React.PropsWithChildren) {
    const dispatch = useDispatch();
    const [dataLoaded, setDataLoaded] = useState(false);
    const [refetchOrganization] = useLazyQuery(GET_ORGANIZATION);


    function initWsNotifications() {
        const address = findWebsocketAddress();
        if (address) {
            MiscInfo.ws_connection = webSocket({
                url: address,
                deserializer: msg => msg.data,
                openObserver: {
                    next: () => {
                        if (MiscInfo.timeOutIteration) console.log("Websocket connected");
                        MiscInfo.timeOutIteration = 0;
                    }
                },
                closeObserver: {
                    next: (closeEvent) => {
                        const timeout = getTimeout(MiscInfo.timeOutIteration);
                        timer(timeout).subscribe(() => { MiscInfo.timeOutIteration++; initWsNotifications(); })
                    }
                }
            });
            MiscInfo.ws_connection.subscribe(
                msg => handleWebsocketNotificationMessage(msg),
                err => handleError(err),
                () => handleWsClosed()
            );
        }
    }

    function handleWebsocketNotificationMessage(msg: string) {
        if (MiscInfo.registeredNotificationListeners.size == 0) return;
        if (msg.includes("\n")) {
            msg.split("\n").forEach(element => handleWebsocketNotificationMessage(element));
            return;
        }


        const msgParts = msg.split(":");
        const projectId = msgParts[0];
        if (!MiscInfo.registeredNotificationListeners.has(projectId)) return;

        MiscInfo.registeredNotificationListeners.get(projectId).forEach((params, key) => {
            if (!params.whitelist || params.whitelist.includes(msgParts[1])) {
                params.func.call(key, msgParts);
            }
        });

    }


    function subscribeToNotification(key: Object, params: NotificationSubscription) {
        if (!params.projectId) params.projectId = "GLOBAL";
        if (!MiscInfo.registeredNotificationListeners.has(params.projectId)) {
            MiscInfo.registeredNotificationListeners.set(params.projectId, new Map<Object, NotificationSubscription>());
        }
        const innerMap = MiscInfo.registeredNotificationListeners.get(params.projectId);
        innerMap.set(key, params);
    }

    function unsubscribeFromNotification(key: Object, projectId: string = null) {
        if (!projectId) projectId = "GLOBAL"
        if (MiscInfo.registeredNotificationListeners.has(projectId)) {
            MiscInfo.registeredNotificationListeners.get(projectId).delete(key);
        }
    }

    useEffect(() => {
        refetchOrganization().then((res) => {
            if (res.data["userOrganization"]) {
                initWsNotifications();
                setDataLoaded(true);
                dispatch(setOrganization(res.data["userOrganization"]));
                MiscInfo.subscribeToNotifications = subscribeToNotification;
                MiscInfo.unsubscribeFromNotifications = unsubscribeFromNotification;
            } else {
                timer(60000).subscribe(() => location.reload())
            }
        })
    }, []);

    return props.children;
}

export const NotificationsServiceWrapper = memo(GetNotificationsServiceWrapper);