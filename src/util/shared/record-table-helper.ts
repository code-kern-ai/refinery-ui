import { jsonCopy } from "@/submodules/javascript-functions/general";
import { extendArrayElementsByUniqueId } from "@/submodules/javascript-functions/id-prep";

export const WEAK_SUPERVISION = 'Weak Supervision';

export function prepareColumnsData(columnsData: any[] | {}): any[] {
    if (!columnsData ||
        (!Array.isArray(columnsData) && Object.keys(columnsData).length == 0) ||
        (Array.isArray(columnsData) && columnsData.length == 0)) {
        return [];
    }
    const finalArray = [];
    let defaultKeyField = 'field';
    let defaultKeyDisplayName = 'displayName';
    let defaultKeyOrder = 'order';
    const firstEl = Array.isArray(columnsData) ? columnsData[0] : Object.values(columnsData)[0];
    if (!firstEl.hasOwnProperty(defaultKeyField)) {
        defaultKeyField = getDefaultFieldKey(firstEl);
    }
    if (!firstEl.hasOwnProperty(defaultKeyDisplayName)) {
        defaultKeyDisplayName = getDefaultFieldKey(firstEl);
    }
    if (!firstEl.hasOwnProperty(defaultKeyOrder)) {
        defaultKeyDisplayName = getDefaultFieldKey(firstEl, false);
    }
    if (Array.isArray(columnsData)) {
        if (typeof firstEl === 'object') {
            finalArray.push(...columnsData.map(columnData => ({
                field: columnData[defaultKeyField],
                displayName: columnData[defaultKeyDisplayName],
                order: columnData[defaultKeyOrder]
            })));
        } else {
            let i = 0;
            finalArray.push(...columnsData.map(columnData => ({
                field: columnData,
                displayName: columnData,
                order: i++
            })));
        }
    } else {
        finalArray.push(...Object.keys(columnsData).map(key => ({
            field: columnsData[key][defaultKeyField],
            displayName: columnsData[key][defaultKeyDisplayName],
            order: columnsData[key][defaultKeyOrder]
        })));
    }
    finalArray.sort((a, b) => a.order - b.order);
    return finalArray;
}

export function getDefaultFieldKey(columnData: any, isString: boolean = true): string {
    if (isString) {
        if (columnData.name) return 'name';
        if (columnData.text) return 'text';

        for (const key of Object.keys(columnData)) {
            if (typeof columnData[key] == 'string') return key;
        }
    } else {
        if (columnData.order) return 'order';
        if (columnData.position) return 'position';
        if (columnData.id) return 'id';

        for (const key of Object.keys(columnData)) {
            if (typeof columnData[key] == 'number') return key;
        }
    }
    throw new Error("Cant find text in given array - record-table");
}

export function prepareTableData(tableData: any[] | {}): any[] {
    const finalArraySize = Array.isArray(tableData) ? tableData.length : Object.keys(tableData).length;
    let finalArray = Array(finalArraySize);
    if (Array.isArray(tableData)) {
        let i = 0;
        for (const element of tableData) {
            fillColorInfo(element);
            finalArray[i++] = element;
        }
    } else {
        let i = 0;
        for (const [key] of Object.entries(tableData)) {
            fillColorInfo(tableData[key]);
            finalArray[i++] = tableData[key];
        }
    }
    return finalArray;
}

export function fillColorInfo(element: any): void {
    const elementCopy = { ...element };
    if (!elementCopy.color) return;
    const color = elementCopy.color;
    if (!elementCopy.hasOwnProperty('backgroundColor')) {
        elementCopy.backgroundColor = 'bg-' + color + '-100';
    }
    if (!elementCopy.hasOwnProperty('textColor')) {
        elementCopy.textColor = 'text-' + color + '-700';
    }
    if (!elementCopy.hasOwnProperty('borderColor')) {
        elementCopy.borderColor = 'border-' + color + '-400';
    }
}