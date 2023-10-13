export class RouteManager {

    public static currentUrl: string;
    public static currentPage: string;

    public static routeColor = {
        overview: { active: false, checkFor: ['overview'] },
        data: { active: false, checkFor: ['data', 'edit-records'] },
        labeling: { active: false, checkFor: ['labeling', 'record-ide'] },
        heuristics: { active: false, checkFor: ['heuristics', 'lookup-lists', 'model-callbacks', 'zero-shot', 'crowd-labeler'] },
        settings: { active: false, checkFor: ['settings', 'attributes', 'upload-records'] },
        admin: { active: false, checkFor: ['admin'] },
    }

    public static initRouterListener() {
        RouteManager.checkRouteHighlight(location.pathname);
    }

    // TODO: discuss the router.push and the href navigation
    private static checkRouteHighlight(url: string) {
        url = url.split('?')[0];
        RouteManager.currentPage = '';
        for (const key in RouteManager.routeColor) {
            RouteManager.routeColor[key].active = RouteManager.routeColor[key].checkFor.some(s => url.includes(s));
            if (!RouteManager.currentPage && RouteManager.routeColor[key].active) {
                for (const checkFor of RouteManager.routeColor[key].checkFor) {
                    if (url.includes(checkFor)) {
                        RouteManager.currentPage = checkFor;
                        break;
                    }
                }
            }
        }
    }
}

