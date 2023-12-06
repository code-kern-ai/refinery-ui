import { EditFieldProps } from "@/src/types/components/projects/projectId/edit-records";
import { DataTypeEnum } from "@/src/types/shared/general";
import { buildAccessKey } from "@/src/util/components/projects/projectId/edit-records-helper";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { useRef, useState } from "react";

export default function EditField(props: EditFieldProps) {

    const [inputValue, setInputValue] = useState(props.record.data[props.attribute.name]);

    const inputRef = useRef(null);

    function addCache(recordId: string, attributeName: string, newValue: any, subKey?: number) {
        const erdDataCopy = jsonCopy(props.erdData);
        const idx2 = erdDataCopy.displayRecords.findIndex((record) => record.id == recordId);
        if (idx2 == -1) {
            console.error("record not found (addCache)")
            return;
        }
        if (subKey != undefined && erdDataCopy.displayRecords[idx2].data[attributeName][subKey] == newValue) return;
        if (subKey == undefined && erdDataCopy.displayRecords[idx2].data[attributeName] == newValue) return;

        const accessKey = buildAccessKey(recordId, attributeName, subKey);
        const current = erdDataCopy.cachedRecordChanges[accessKey];

        if (!current) {
            const record = erdDataCopy.data.records.find((record) => record.id == recordId);
            const cacheItem: any = {
                recordId: recordId,
                attributeName: attributeName,
                newValue: newValue,
                subKey: subKey,
                display: {
                    record: record.data[erdDataCopy.data.attributes[0].name],
                    oldValue: record.data[attributeName],
                }
            };
            if (subKey != undefined) {
                cacheItem.display.oldValue = cacheItem.display.oldValue[subKey];
                cacheItem.display.subKeyAdd = "[" + subKey + "]";
            }
            erdDataCopy.cachedRecordChanges[accessKey] = cacheItem;
            if (!erdDataCopy.modals.hideExplainModal && Object.keys(erdDataCopy.cachedRecordChanges).length == 1) {
                erdDataCopy.modals.explainModalOpen = true;
                erdDataCopy.modals.hideExplainModal = true;
            }

        } else {
            erdDataCopy.cachedRecordChanges[accessKey].newValue = newValue;
        }
        if (subKey != undefined) erdDataCopy.displayRecords[idx2].data[attributeName][subKey] = newValue;
        else erdDataCopy.displayRecords[idx2].data[attributeName] = newValue;
        props.setErdData(erdDataCopy);
    }

    function setDynamicStyles() {
        if (inputRef.current) {
            const scrollHeight = inputRef.current.scrollHeight;
            const overflowStyle = scrollHeight < 400 ? 'hidden' : 'auto';

            inputRef.current.style.height = `${scrollHeight + 2}px`;
            inputRef.current.style.overflowY = overflowStyle;
        }
    }

    return (<>
        {props.attribute.dataType == DataTypeEnum.TEXT &&
            <textarea value={inputValue} ref={inputRef}
                onChange={(e) => setInputValue(e.target.value)}
                onInput={setDynamicStyles}
                onBlur={(e) => addCache(props.record.id, props.attribute.name, e.target.value)}
                style={{ height: 'auto', overflowY: 'hidden' }}
                className="h-9 w-full border-gray-300 rounded-md leading-8 placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
            >{props.record.data[props.attribute.name]}</textarea>}
        {props.attribute.dataType == DataTypeEnum.CATEGORY &&
            <input value={inputValue} ref={inputRef}
                onChange={(e) => setInputValue(e.target.value)}
                onInput={setDynamicStyles}
                onBlur={(e) => addCache(props.record.id, props.attribute.name, e.target.value)}
                style={{ height: 'auto', overflowY: 'hidden' }} type="text" autoComplete="off"
                className="h-9 w-full border-gray-300 rounded-md leading-8 placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
            />}
        {props.attribute.dataType == DataTypeEnum.INTEGER &&
            <input value={inputValue} ref={inputRef}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={(e) => addCache(props.record.id, props.attribute.name, e.target.value)}
                type="number" step="1" autoComplete="off"
                className="h-9 w-full border-gray-300 rounded-md leading-8 placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
            />}
        {props.attribute.dataType == DataTypeEnum.FLOAT &&
            <input value={inputValue} ref={inputRef}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={(e) => addCache(props.record.id, props.attribute.name, e.target.value)}
                type="number" step="any" autoComplete="off"
                className="h-9 w-full border-gray-300 rounded-md leading-8 placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
            />}
        {props.attribute.dataType == DataTypeEnum.BOOLEAN &&
            <input checked={inputValue} ref={inputRef}
                onChange={(e) => setInputValue(e.target.checked)}
                onBlur={(e) => addCache(props.record.id, props.attribute.name, e.target.checked)}
                type="checkbox"
                className="w-6 "
            />}
        {props.attribute.dataType == DataTypeEnum.EMBEDDING_LIST &&
            <textarea value={inputValue} ref={inputRef}
                onChange={(e) => setInputValue(e.target.value)}
                onInput={setDynamicStyles}
                onBlur={(e) => addCache(props.record.id, props.attribute.name, e.target.value, props.subKey)}
                style={{ height: 'auto', overflowY: 'hidden' }}
                className="h-9 w-full border-gray-300 rounded-md leading-8 placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
            >{props.record.data[props.attribute.name][props.subKey]}</textarea>}
    </>)
}