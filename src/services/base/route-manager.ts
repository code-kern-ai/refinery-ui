import { jsonCopy } from "@/submodules/javascript-functions/general";

export class RouteManager {

    public static currentUrl: string;
    public static currentPage: string;

    public static routeColor = {
        overview: { active: false, checkFor: ['overview'] },
        data: { active: false, checkFor: ['data-browser', 'edit-records'] },
        labeling: { active: false, checkFor: ['labeling', 'record-ide'] },
        heuristics: { active: false, checkFor: ['heuristics', 'lookup-lists', 'model-callbacks', 'zero-shot', 'crowd-labeler', 'labeling-function', 'active-learning'] },
        settings: { active: false, checkFor: ['settings', 'attributes', 'upload-records'] },
        admin: { active: false, checkFor: ['admin'] },
    }

    public static checkRouteHighlight(url: string) {
        url = url.split('?')[0];
        RouteManager.currentPage = '';
        const routeColor = jsonCopy(RouteManager.routeColor);
        for (const key in routeColor) {
            const checkForPages = routeColor[key].checkFor;
            routeColor[key].active = checkForPages.some(s => {
                const splitUrf = url.split('/');
                return splitUrf.includes(s);;
            });
            if (!RouteManager.currentPage && routeColor[key].active) {
                for (const checkFor of routeColor[key].checkFor) {
                    if (url.includes(checkFor)) {
                        RouteManager.currentPage = checkFor;
                        break;
                    }
                }
            }
        }
        return routeColor;
    }
}

