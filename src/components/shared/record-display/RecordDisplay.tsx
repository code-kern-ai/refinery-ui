import { selectConfiguration } from "@/src/reduxStore/states/pages/data-browser";
import { selectAttributes, selectAttributesDict, selectUsableAttributes } from "@/src/reduxStore/states/pages/settings";
import { LineBreaksType } from "@/src/types/components/projects/projectId/data-browser/data-browser";
import { Attribute } from "@/src/types/components/projects/projectId/settings/data-schema";
import { DataTypeEnum } from "@/src/types/shared/general";
import { postProcessAttributes, postProcessRecord } from "@/src/util/shared/record-display-helper";
import { IconAlertCircle } from "@tabler/icons-react";
import { use, useEffect, useState } from "react";
import { useSelector } from "react-redux";

export function RecordDisplay(props: any) {
    const attributes = useSelector(selectUsableAttributes);
    const attributesDict = useSelector(selectAttributesDict);
    const configuration = useSelector(selectConfiguration);

    const [preparedRecord, setPreparedRecord] = useState<any>(null);
    const [preparedAttributes, setPreparedAttributes] = useState<Attribute[]>(null);

    useEffect(() => {
        if (!props.record) return;
        if (!attributes) return;
        setPreparedRecord(postProcessRecord(props.record));
        setPreparedAttributes(postProcessAttributes(attributes));
    }, [props.record, attributes]);

    return (<>
        {preparedAttributes && preparedAttributes.map((attribute, index) => (<div key={attribute.id}>
            <div key={index} className="font-semibold text-sm text-gray-800">
                <div className="flex flex-row items-center">
                    <span className="font-dmMono">{attributesDict[attribute.id]?.name}</span>
                </div>
            </div>
            {attributesDict[attribute.id] && <div className="text-gray-800 text-sm mb-4 overflow-anywhere flex">
                {attribute.dataType == DataTypeEnum.EMBEDDING_LIST ? (<div className="flex flex-col gap-y-1 divide-y">
                    {preparedRecord.data[attributesDict[attribute.key].name].map((item) => (<div key={attributesDict[attribute.key].name} className="pt-1">
                        {/* TODO: add condition for highlighting after the component is implemented, the above part goes in else */}
                        <span className={configuration && configuration.lineBreaks != LineBreaksType.NORMAL ? (configuration.lineBreaks == LineBreaksType.IS_PRE_WRAP ? 'whitespace-pre-wrap' : 'whitespace-pre-line') : ''}>
                            {item != null && item !== '' ? item : <NotPresentInRecord />}
                        </span>
                    </div>))}
                </div>) : (<>
                    {/* TODO: add condition for highlighting after the component is implemented, the above part goes in else */}
                    <span className={configuration && configuration.lineBreaks != LineBreaksType.NORMAL ? (configuration.lineBreaks == LineBreaksType.IS_PRE_WRAP ? 'whitespace-pre-wrap' : 'whitespace-pre-line') : ''}>
                        {preparedRecord.data[attributesDict[attribute.key].name] != null && preparedRecord.data[attributesDict[attribute.key].name] !== '' ? preparedRecord.data[attributesDict[attribute.key].name] : <NotPresentInRecord />}
                    </span>
                </>)}
            </div>}
        </div>
        ))}

    </>);
}

function NotPresentInRecord() {
    return (<div className="flex items-center">
        <IconAlertCircle className="text-yellow-700" />
        <span className="text-gray-500 text-sm font-normal italic">Not present in the record</span>
    </div>
    )
}