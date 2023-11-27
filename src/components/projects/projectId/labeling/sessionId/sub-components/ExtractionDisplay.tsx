import { selectSettings } from "@/src/reduxStore/states/pages/labeling";
import { LineBreaksType } from "@/src/types/components/projects/projectId/data-browser/data-browser";
import { ExtractionDisplayProps } from "@/src/types/components/projects/projectId/labeling/labeling";
import { LabelSource } from "@/submodules/javascript-functions/enums/enums";
import { Tooltip } from "@nextui-org/react";
import { useSelector } from "react-redux";

export default function ExtractionDisplay(props: ExtractionDisplayProps) {
    const settings = useSelector(selectSettings);

    function deleteRecordLabelAssociation(rlaItem: any) { }

    return (<>
        {props.tokenLookup && <div className="flex flex-row flex-wrap items-start">
            {props.tokenLookup[props.attributeId] && props.tokenLookup[props.attributeId].token.map((token, index) => (<div key={token.value} className={`relative z-10 ${token.countLineBreaks > 0 && settings.main.lineBreaks != LineBreaksType.NORMAL ? 'w-full' : ''}`}
                style={{ marginBottom: props.tokenLookup[props.attributeId][token.idx]?.tokenMarginBottom }}>
                {token.countLineBreaks == 0 ? (<>
                    {token.type ? (<Tooltip content={'spaCy type: ' + token.type} color="invert" placement="top"><TokenValue token={token} /></Tooltip>) : (<>
                        <TokenValue token={token} /></>)}
                    {props.tokenLookup[props.attributeId][token.idx] && <>
                        {props.tokenLookup[props.attributeId][token.idx].rlaArray.map((rlaItem, index) => (<div className={`absolute left-0 right-0 top-0 flex items-end z-n-2`} style={{ bottom: rlaItem.bottomPos }}>
                            <div className={`h-px flex items-end w-full relative ${props.labelLookup[rlaItem.labelId].color.backgroundColor} ${props.labelLookup[rlaItem.labelId].color.textColor} ${props.labelLookup[rlaItem.labelId].color.borderColor}`}
                                style={{
                                    borderBottomWidth: '1px',
                                    borderTopWidth: '1px',
                                    left: '-2px',
                                    borderStyle: rlaItem.rla.sourceType == LabelSource.MANUAL ? 'solid' : 'dashed',
                                    borderLeftWidth: rlaItem.isFirst ? '1px' : null,
                                    borderTopLeftRadius: rlaItem.isFirst ? '0.375rem' : null,
                                    borderBottomLeftRadius: rlaItem.isFirst ? '0.375rem' : null,
                                    borderRightWidth: rlaItem.isLast ? '1px' : null,
                                    borderTopRightRadius: rlaItem.isLast ? '0.375rem' : null,
                                    borderBottomRightRadius: rlaItem.isLast ? '0.375rem' : null,
                                }}>
                                {rlaItem.isFirst && rlaItem.canBeDeleted && <div className="pl-1 cursor-pointer absolute" style={{ bottom: '-11px', left: '-21px' }} onClick={() => deleteRecordLabelAssociation(rlaItem)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block stroke-current" style={{ transform: 'rotate(180deg)' }} viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M6.707 4.879A3 3 0 018.828 4H15a3 3 0 013 3v6a3 3 0 01-3 3H8.828a3 3 0 01-2.12-.879l-4.415-4.414a1 1 0 010-1.414l4.414-4.414zm4 2.414a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L13.414 10l1.293-1.293a1 1 0 00-1.414-1.414L12 8.586l-1.293-1.293z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </div>}
                            </div>
                        </div>
                        ))}
                    </>}
                </>) : (<>
                    {settings.main.lineBreaks != LineBreaksType.NORMAL ? (<>
                        {token.countLineBreaksArray.map((item, index) => (<div key={item}><br /></div>))}
                    </>) : (<>&nbsp;</>)}
                </>)}
            </div>))}
        </div>}
    </>);
}

function TokenValue(props: any) {
    return (<>
        {props.token && props.token.value != '\n' && <label
            className={`rounded-lg hover:bg-gray-200 text-sm text-gray-500 leading-5 font-normal ${!props.token.nextCloser ? 'pr-1' : ''}`}
            style={{ backgroundColor: props.token.selected ? '#3399FF' : null, borderRadius: props.token.selected ? '0' : null, color: props.token.selected ? 'white' : null }}>
            {props.token.value}
        </label>}
    </>)
}