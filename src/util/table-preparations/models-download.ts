export const MODELS_DOWNLOAD_TABLE_COLUMNS = [{ column: 'Name', id: 'name' }, { column: 'Revision', id: 'revision' }, { column: 'Link', id: 'link' }, { column: 'Download date', id: 'downloadDate' }, { column: 'Size', id: 'size' }, { column: 'Status', id: 'status' }, { column: '', id: 'delete' }];

export function prepareTableBodyModelsDownload(modelsDownload, onClick, isAdmin) {
    let finalData = [];
    modelsDownload.forEach(model => {
        const currentRow = [
            {
                type: 'text',
                value: model.name
            },
            {
                type: 'text',
                value: model.revision
            },
            {
                type: 'Component',
                component: 'ExternalLinkCell',
                link: model.link
            },
            {
                type: 'Component',
                component: 'ModelDateCell',
                model: model
            },
            {
                type: 'Component',
                component: 'FileSizeCell',
                model: model
            },
            {
                type: 'Component',
                component: 'StatusModelCell',
                model: model
            },
            {
                type: 'Component',
                component: 'DeleteModelCell',
                model: model,
                isAdmin: isAdmin,
                onClick: () => onClick(model)

            }
        ];
        finalData.push(currentRow);
    });
    return finalData;
}