import { NextRouter } from "next/router";
import { WebSocketsService } from "./WebSocketsService";
import { CurrentPage, CurrentPageSubKey } from "@/src/types/shared/general";

export function unsubscribeWSOnDestroy(router: NextRouter, pages: CurrentPage[], projectId?: string): () => void {
    return () => {
        // console.log("effect")
        const handleRouteChange = (url, { shallow }) => {
            console.log("route change")
            // for (const pageName of pages) {
            //     WebSocketsService.unsubscribeFromNotification(pageName, projectId);
            // }
        };
        router.events.on('routeChangeStart', handleRouteChange);
        return () => {
            console.log("on destroy")
            for (const pageName of pages) {
                WebSocketsService.unsubscribeFromNotification(pageName, projectId);
            }
            router.events.off('routeChangeStart', handleRouteChange);
        };
    }
}

export function unsubscribeWSOnDestroy2(pages: CurrentPage, projectId?: string): () => void {
    return () => WebSocketsService.unsubscribeFromNotification(pages, projectId);
}

export type NotificationSubscription = {
    projectId?: string;
    whitelist?: string[];
    func: (msg) => void;
};

export type NotificationScope = {
    projectId: string // uuid | "GLOBAL";
    page: CurrentPage,
    subKey?: CurrentPageSubKey | string
};


const stablePageKeyCache = new Map<string, NotificationScope>();

export function getStableWebsocketPageKey(projectId: string, page: CurrentPage, subKey?: CurrentPageSubKey | string): NotificationScope {
    const _subKey = subKey || "NONE";
    const lookupKey = `${projectId}_${page}_${_subKey}`;
    if (!stablePageKeyCache.has(lookupKey)) {
        stablePageKeyCache.set(lookupKey, { projectId, page, subKey: _subKey });
    }

    return stablePageKeyCache.get(lookupKey);

}