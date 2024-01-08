import { NextRouter } from "next/router";
import { WebSocketsService } from "./WebSocketsService";
import { CurrentPage } from "@/src/types/shared/general";

export function unsubscribeWSOnDestroy(router: NextRouter, pages: CurrentPage[], projectId?: string): () => void {
    return () => {
        const handleRouteChange = (url, { shallow }) => {
            for (const pageName of pages) {
                WebSocketsService.unsubscribeFromNotification(pageName, projectId);
            }
        };
        router.events.on('routeChangeStart', handleRouteChange);
        return () => {
            router.events.off('routeChangeStart', handleRouteChange);
        };
    }
}

export type NotificationSubscription = {
    projectId?: string;
    whitelist?: string[];
    func: (msg) => void;
};
