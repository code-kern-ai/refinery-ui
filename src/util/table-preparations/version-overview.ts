import { VersionOverview } from "@/src/types/shared/sidebar";
import { toTableColumnComponent, toTableColumnText } from "@/submodules/react-components/helpers/kern-table-helper";

export const VERSION_OVERVIEW_TABLE_COLUMNS = [
    { column: 'Service', id: 'service' },
    { column: 'Installed version', id: 'installedVersion' },
    { column: 'Remote version', id: 'remoteVersion' },
    { column: 'Last checked', id: 'parseDate' },
    { column: 'Link', id: 'link' }];

export function prepareTableBodyVersionOverview(versionOverview: VersionOverview[]) {
    if (!versionOverview || versionOverview.length === 0) return [];

    return versionOverview.map(element => [
        toTableColumnText(element.service),
        toTableColumnText(element.installedVersion),
        toTableColumnComponent('RemoteVersionCell', undefined, { service: element }),
        toTableColumnText(element.parseDate),
        toTableColumnComponent('ExternalLinkCell', undefined, { link: element.link })
    ]);
}