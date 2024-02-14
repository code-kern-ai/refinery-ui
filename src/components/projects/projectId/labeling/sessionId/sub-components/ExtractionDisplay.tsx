import { selectHoverGroupDict, selectSettings, selectTmpHighlightIds, selectTokenLookupSelected, setHoverGroupDict, tmpAddHighlightIds } from "@/src/reduxStore/states/pages/labeling";
import { LineBreaksType } from "@/src/types/components/projects/projectId/data-browser/data-browser";
import { ExtractionDisplayProps, LabelSourceHover } from "@/src/types/components/projects/projectId/labeling/labeling";
import { LabelingPageParts } from "@/src/types/components/projects/projectId/labeling/labeling-main-component";
import { Tooltip } from "@nextui-org/react";
import { useDispatch, useSelector } from "react-redux";
import style from '@/src/styles/components/projects/projectId/labeling.module.css';
import { useState, forwardRef, useEffect, useMemo } from "react";
import { useConsoleLog } from "@/submodules/react-components/hooks/useConsoleLog";

export function shouldHighlightOn(tmpHighlightIds: string[], comparedId: string[]) {
    return tmpHighlightIds.some((id) => comparedId.includes(id));
}

const ExtractionDisplay = forwardRef<HTMLInputElement, ExtractionDisplayProps>(function ExtractionDisplay(props, ref) {
    const dispatch = useDispatch();

    const settings = useSelector(selectSettings);
    const hoverGroupsDict = useSelector(selectHoverGroupDict);
    const tmpHighlightIds = useSelector(selectTmpHighlightIds);

    const [hoverBoxDict, setHoverGroupDictTmp] = useState({});

    // useConsoleLog(tokenLookupSelected)

    function deleteRecordLabelAssociation(rlaId: string) {
        props.deleteRla(rlaId);
    }

    function handleMouseEnter(rlaItem: any) {
        dispatch(tmpAddHighlightIds([rlaItem.rla.id]));
        onMouseEvent(true, rlaItem.labelId);
        setHoverGroupDictTmp((prevDict) => ({
            ...Object.fromEntries(Object.keys(prevDict).map((key) => [key, false])),
            [rlaItem.rla.id]: true,
        }));
    }

    function handleMouseLeave() {
        dispatch(tmpAddHighlightIds([]));
        onMouseEvent(false, null);
        setHoverGroupDictTmp((prevDict) =>
            Object.fromEntries(Object.keys(prevDict).map((key) => [key, false]))
        );
    }


    function onMouseEvent(update: boolean, labelId: string) {
        let hoverGroupsDictCopy = {};
        if (!hoverGroupsDictCopy[labelId] && update) {
            hoverGroupsDictCopy[labelId] = {
                [LabelingPageParts.TASK_HEADER]: true
            }
            dispatch(setHoverGroupDict(hoverGroupsDictCopy));
        } else {
            dispatch(setHoverGroupDict(null));
        }
    }

    return (<>
        {props.tokenLookup && <div ref={ref} className="flex flex-row flex-wrap items-start">
            {props.tokenLookup[props.attributeId] && props.tokenLookup[props.attributeId].token && props.tokenLookup[props.attributeId].token.map((token) => (<div key={token.idx} className={`relative z-10 ${token.countLineBreaks > 0 && settings.main.lineBreaks != LineBreaksType.NORMAL ? 'w-full' : ''}`}
                style={{ marginBottom: props.tokenLookup[props.attributeId][token.idx]?.tokenMarginBottom }}
                data-tokenidx={token.idx} data-attributeid={props.attributeId}>
                {token.countLineBreaks == 0 ? (<>
                    {token.type ? (<Tooltip content={'spaCy type: ' + token.type} color="invert" placement="top" onKeyDown={(e: any) => {
                        e.preventDefault();
                        e.target.blur();
                    }}>
                        <TokenValue token={token} attributeId={props.attributeId} setSelected={(e) => props.setSelected(token.idx, token.idx, e)} />
                    </Tooltip>) : (<>
                        <TokenValue token={token} attributeId={props.attributeId} setSelected={(e) => props.setSelected(token.idx, token.idx, e)} /></>)}
                    {props.tokenLookup[props.attributeId][token.idx] && <>
                        {props.tokenLookup[props.attributeId][token.idx].rlaArray.map((rlaItem: any) => (<div key={rlaItem.orderPos} className={`absolute left-0 right-0 top-0 flex items-end`} style={{ bottom: rlaItem.bottomPos, zIndex: shouldHighlightOn(tmpHighlightIds, [LabelSourceHover.MANUAL, rlaItem.rla.id, rlaItem.rla.createdBy, rlaItem.rla.labelingTaskLabel.labelingTask.id]) || (hoverGroupsDict[rlaItem.labelId] && hoverGroupsDict[rlaItem.labelId][LabelingPageParts.MANUAL]) || (hoverGroupsDict[rlaItem.labelId] && hoverGroupsDict[rlaItem.labelId][LabelingPageParts.WEAK_SUPERVISION]) || hoverBoxDict[rlaItem.rla.id] ? 1 : 0 }}
                            onMouseEnter={() => handleMouseEnter(rlaItem)}
                            onMouseLeave={handleMouseLeave}>
                            <div className={`h-px flex items-end w-full relative ${props.labelLookup[rlaItem.labelId].color.backgroundColor} ${props.labelLookup[rlaItem.labelId].color.textColor} ${props.labelLookup[rlaItem.labelId].color.borderColor} ${shouldHighlightOn(tmpHighlightIds, [LabelSourceHover.MANUAL, rlaItem.rla.id, rlaItem.rla.createdBy, rlaItem.rla.labelingTaskLabel.labelingTask.id]) || (hoverGroupsDict[rlaItem.labelId] && hoverGroupsDict[rlaItem.labelId][LabelingPageParts.MANUAL]) || (hoverGroupsDict[rlaItem.labelId] && hoverGroupsDict[rlaItem.labelId][LabelingPageParts.WEAK_SUPERVISION]) || hoverBoxDict[rlaItem.rla.id] ? 'heightHover' : ''}`}
                                style={{
                                    borderBottomWidth: '1px',
                                    borderTopWidth: '1px',
                                    left: '-2px',
                                    borderStyle: rlaItem.rla.sourceType == LabelSourceHover.MANUAL ? 'solid' : 'dashed',
                                    borderLeftWidth: rlaItem.isFirst ? '1px' : null,
                                    borderTopLeftRadius: rlaItem.isFirst ? '0.375rem' : null,
                                    borderBottomLeftRadius: rlaItem.isFirst ? '0.375rem' : null,
                                    borderRightWidth: rlaItem.isLast ? '1px' : null,
                                    borderTopRightRadius: rlaItem.isLast ? '0.375rem' : null,
                                    borderBottomRightRadius: rlaItem.isLast ? '0.375rem' : null,
                                }} >
                                {rlaItem.isFirst && rlaItem.canBeDeleted && <div className="pl-1 cursor-pointer absolute" style={{ bottom: '-11px', left: '-21px' }} onClick={() => deleteRecordLabelAssociation(rlaItem.rla.id)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block stroke-current" style={{ transform: 'rotate(180deg)' }} viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M6.707 4.879A3 3 0 018.828 4H15a3 3 0 013 3v6a3 3 0 01-3 3H8.828a3 3 0 01-2.12-.879l-4.415-4.414a1 1 0 010-1.414l4.414-4.414zm4 2.414a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L13.414 10l1.293-1.293a1 1 0 00-1.414-1.414L12 8.586l-1.293-1.293z"
                                            clipRule="evenodd" />
                                    </svg>
                                </div>}
                                <div className={`label-overlay-base ${((shouldHighlightOn(tmpHighlightIds, [LabelSourceHover.MANUAL, rlaItem.rla.id, rlaItem.rla.createdBy, rlaItem.rla.labelingTaskLabel.labelingTask.id]) && rlaItem.rla.sourceType == LabelingPageParts.MANUAL) || (hoverGroupsDict[rlaItem.labelId] && hoverGroupsDict[rlaItem.labelId][LabelingPageParts.MANUAL] && rlaItem.rla.sourceType == LabelingPageParts.MANUAL)) && style.labelOverlayManual} ${hoverGroupsDict[rlaItem.labelId] && hoverGroupsDict[rlaItem.labelId][LabelingPageParts.WEAK_SUPERVISION] && rlaItem.rla.sourceType == LabelingPageParts.WEAK_SUPERVISION && style.labelOverlayWeakSupervision} ${hoverBoxDict[rlaItem.rla.id] ? style.labelOverlayManual : ''}`}></div>
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
});

function TokenValue(props: any) {
    const tokenLookupSelected = useSelector(selectTokenLookupSelected);
    // const saveTokenData = useSelector(selectTokenData)

    useConsoleLog(tokenLookupSelected, 'tokenLookupSelected in tkoen value')

    const [findToken, setFindToken] = useState(null);
    const isSelected = useMemo(() => {
        if (!tokenLookupSelected || !props.attributeId) return false;
        // return props.token.idx >= tokenLookupSelected[props.attributeId].tokenStart && token.idx <= saveTokenData.tokenEnd;
        // const findToken = tokenLookupSelected[props.attributeId].token.find((token) => token.value == props.token.value && token.idx == props.token.idx);
        return false;
    }, [tokenLookupSelected, props.attributeId]);

    // useEffect(() => {
    //     if (!tokenLookupSelected || !props.attributeId) return;
    //     const findToken = tokenLookupSelected[props.attributeId].token.find((token) => token.value == props.token.value && token.idx == props.token.idx);
    //     setFindToken(findToken);
    // }, [tokenLookupSelected, props.attributeId]);

    return (<>
        {props.token && props.token.value != '\n' && <label onClick={(e) => props.setSelected(e)}
            className={`rounded-lg hover:bg-gray-200 text-sm text-gray-500 leading-5 relative font-normal ${!props.token.nextCloser ? 'pr-1' : ''}`}
            data-tokenidx={props.token.idx} data-attributeid={props.attributeId}
            style={{ backgroundColor: (findToken && findToken.selected) ? '#3399FF' : null, borderRadius: (findToken && findToken.selected) ? '0' : null, color: (findToken && findToken.selected) ? 'white' : null, zIndex: '100' }}>
            {props.token.value}
        </label>}
    </>)
}

export default ExtractionDisplay;