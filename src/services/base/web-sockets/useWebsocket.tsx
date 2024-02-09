import { CurrentPage } from '@/src/types/shared/general';
import { useEffect, useMemo, } from 'react';
import { WebSocketsService } from './WebSocketsService';
import { NotificationSubscription, unsubscribeWSOnDestroy2 } from './web-sockets-helper';

export function useWebsocket(currentPage: CurrentPage, handleFunction: (msgParts: string[]) => void, projectId?: string) {

    const _projectId = useMemo(() => projectId || "GLOBAL", []);

    useEffect(() => {
        const nos: NotificationSubscription = {
            whitelist: WHITELIST_LOOKUP[currentPage],
            func: handleFunction
        }
        if (projectId) nos.projectId = projectId;

        WebSocketsService.subscribeToNotification(currentPage, nos);
        return unsubscribeWSOnDestroy2(currentPage, projectId);
    }, [_projectId]);

    useEffect(() => {
        WebSocketsService.updateFunctionPointer(projectId, currentPage, handleFunction)
    }, [handleFunction]);

}

const WHITELIST_LOOKUP = {
    [CurrentPage.PROJECTS]: ['project_created', 'project_deleted', 'project_update', 'file_upload'],
}