export const VERSION_OVERVIEW_TABLE_COLUMNS = [{ column: 'Service', id: 'service' }, { column: 'Installed version', id: 'installedVersion' }, { column: 'Remote version', id: 'remoteVersion' }, { column: 'Last checked', id: 'parseDate' }, { column: 'Link', id: 'link' }];

export function prepareTableBodyVersionOverview(versionOverview) {
    let finalData = [];
    versionOverview.forEach(element => {
        const currentRow = [
            {
                type: 'text',
                value: element.service
            },
            {
                type: 'text',
                value: element.installedVersion
            },
            {
                type: 'Component',
                component: 'RemoteVersionCell',
                service: element
            },
            {
                type: 'text',
                value: element.parseDate
            },
            {
                type: 'Component',
                component: 'ExternalLinkCell',
                link: element.link
            }
        ];
        finalData.push(currentRow);
    });
    return finalData;
}