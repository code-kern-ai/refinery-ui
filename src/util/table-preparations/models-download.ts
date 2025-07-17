import { ModelsDownloaded } from "@/src/types/components/models-downloaded/models-downloaded";
import { toTableColumnComponent, toTableColumnText } from "@/submodules/react-components/helpers/kern-table-helper";

export const MODELS_DOWNLOAD_TABLE_COLUMNS = [
    { column: 'Name', id: 'name' },
    { column: 'Revision', id: 'revision' },
    { column: 'Link', id: 'link' },
    { column: 'Download date', id: 'downloadDate' },
    { column: 'Size', id: 'size' },
    { column: 'Status', id: 'status' },
    { column: '', id: 'delete' }];

export function prepareTableBodyModelsDownload(modelsDownload: ModelsDownloaded[], onClick: (model: ModelsDownloaded) => void, isAdmin: boolean) {
    if (!modelsDownload || modelsDownload.length === 0) return [];

    return modelsDownload.map(model => [
        toTableColumnText(model.name),
        toTableColumnText(model.revision),
        toTableColumnComponent('ExternalLinkCell', undefined, { link: model.link }),
        toTableColumnComponent('ModelDateCell', undefined, { model: model }),
        toTableColumnComponent('FileSizeCell', undefined, { model: model }),
        toTableColumnComponent('StatusModelCell', undefined, { model: model }),
        toTableColumnComponent('DeleteModelCell', undefined, { model: model, isAdmin: isAdmin, onClick: () => onClick(model) }),
    ]);
}