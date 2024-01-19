import Modal from "@/src/components/shared/modal/Modal";
import { selectHoverGroupDict, selectSettings, selectTmpHighlightIds, setHoverGroupDict, tmpAddHighlightIds } from "@/src/reduxStore/states/pages/labeling";
import { LabelingPageParts } from "@/src/types/components/projects/projectId/labeling/labeling-main-component";
import { LabelingInfoTableModalProps } from "@/src/types/components/projects/projectId/labeling/overview-table";
import { ModalEnum } from "@/src/types/shared/modal";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { IconSearch } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import style from '@/src/styles/components/projects/projectId/labeling.module.css';

function shouldHighLight(tmpHighlightIds: string[], comparedIds: string[], additionalComparedIds?: string[]) {
    if (additionalComparedIds) {
        return tmpHighlightIds.some(id => comparedIds.includes(id)) || tmpHighlightIds.some(id => additionalComparedIds.includes(id));
    }
    return tmpHighlightIds.some(id => comparedIds.includes(id));
}

export default function LabelingInfoTableModal(props: LabelingInfoTableModalProps) {
    const dispatch = useDispatch();

    const hoverGroupsDict = useSelector(selectHoverGroupDict);
    const tmpHighlightIds = useSelector(selectTmpHighlightIds);
    const settings = useSelector(selectSettings);

    function onMouseEnter(ids: string[], labelId?: string) {
        dispatch(tmpAddHighlightIds(ids));
        if (labelId) onMouseEvent(true, labelId);
    }

    function onMouseLeave(labelId?: string) {
        dispatch(tmpAddHighlightIds([]));
        if (labelId) onMouseEvent(false, labelId);
    }

    function onMouseEvent(update: boolean, labelId: string) {
        const hoverGroupsDictCopy = jsonCopy(hoverGroupsDict);
        for (const labelIdKey in hoverGroupsDictCopy) {
            if (labelIdKey == labelId) {
                hoverGroupsDictCopy[labelIdKey][LabelingPageParts.OVERVIEW_TABLE] = update;
                hoverGroupsDictCopy[labelIdKey][LabelingPageParts.TASK_HEADER] = update;
                hoverGroupsDictCopy[labelIdKey][LabelingPageParts.TABLE_MODAL] = update;
                hoverGroupsDictCopy[labelIdKey][LabelingPageParts.MANUAL] = update;
                hoverGroupsDictCopy[labelIdKey][LabelingPageParts.WEAK_SUPERVISION] = update;
                hoverGroupsDictCopy[labelIdKey][LabelingPageParts.MANUAL_GOLD] = update;
            } else {
                hoverGroupsDictCopy[labelIdKey][LabelingPageParts.OVERVIEW_TABLE] = false;
                hoverGroupsDictCopy[labelIdKey][LabelingPageParts.TASK_HEADER] = false;
                hoverGroupsDictCopy[labelIdKey][LabelingPageParts.TABLE_MODAL] = false;
                hoverGroupsDictCopy[labelIdKey][LabelingPageParts.MANUAL] = false;
                hoverGroupsDictCopy[labelIdKey][LabelingPageParts.WEAK_SUPERVISION] = false;
                hoverGroupsDictCopy[labelIdKey][LabelingPageParts.MANUAL_GOLD] = false;
            }
        }
        dispatch(setHoverGroupDict(hoverGroupsDictCopy));
    }

    return (<Modal modalName={ModalEnum.LABELING_INFO_TABLE}>
        <h1 className="text-lg text-gray-900 text-center font-bold">Info</h1>
        {props.dataToDisplay[0] && <div className="flex flex-col items-center">
            <div className="flex flex-row gap-x-2 items-center">
                <div className="text-gray-500 my-2 text-center mb-2">
                    Every label stores a lot of data.<br /><br />This can be the label type, the corresponding task, creation user or heuristic as well as the label itself.
                    Now to get a better overview over every label placed on a record we group the labels by these different criteria.<br /><br />This means
                    there is a group for e.g. type <span className={`underline ${shouldHighLight(tmpHighlightIds, props.dataToDisplay[0].shouldHighlightOn) || hoverGroupsDict[props.dataToDisplay[0].label.id][LabelingPageParts.TABLE_MODAL] ? settings.main.hoverGroupBackgroundColorClass : ''}`} onMouseEnter={() => onMouseEnter([props.dataToDisplay[0].sourceTypeKey])} onMouseLeave={() => onMouseLeave()}>{props.dataToDisplay[0].sourceType}</span>.If you hover the element
                    everything with the same type will be highlighted. <br />If you hover over a task (e.g. <span className={`underline ${shouldHighLight(tmpHighlightIds, props.dataToDisplay[0].shouldHighlightOn) || hoverGroupsDict[props.dataToDisplay[0].label.id][LabelingPageParts.TABLE_MODAL] ? settings.main.hoverGroupBackgroundColorClass : ''}`} onMouseEnter={() => onMouseEnter([props.dataToDisplay[0].taskName])} onMouseLeave={() => onMouseLeave()}>{props.dataToDisplay[0].taskName}</span>) everything with the same task
                    will be highlighted. The same goes for the other groups.<br />Note that the magnifying glass highlights
                    only the specific label entry.<br /><br />Feel free to try it out in the table below and focus on the background.
                </div>

            </div>
            <table className="min-w-full border divide-y divide-gray-300">
                <tbody className="divide-y divide-gray-200 bg-white">
                    <tr className="bg-white">
                        <td onMouseEnter={() => onMouseEnter([props.dataToDisplay[0].sourceTypeKey])} onMouseLeave={() => onMouseLeave()}
                            className={`whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-500 sm:pl-6 ${shouldHighLight(tmpHighlightIds, props.dataToDisplay[0].shouldHighlightOn) || hoverGroupsDict[props.dataToDisplay[0].label.id][LabelingPageParts.TABLE_MODAL] ? settings.main.hoverGroupBackgroundColorClass : ''}`}>{props.dataToDisplay[0].sourceType}</td>
                        <td onMouseEnter={() => onMouseEnter([props.dataToDisplay[0].taskName])} onMouseLeave={() => onMouseLeave()}
                            className={`whitespace-nowrap px-3 py-2 text-sm text-gray-500 ${shouldHighLight(tmpHighlightIds, props.dataToDisplay[0].shouldHighlightOn) || hoverGroupsDict[props.dataToDisplay[0].label.id][LabelingPageParts.TABLE_MODAL] ? settings.main.hoverGroupBackgroundColorClass : ''}`}>{props.dataToDisplay[0].taskName}</td>
                        <td onMouseEnter={() => onMouseEnter([props.dataToDisplay[0].createdBy])} onMouseLeave={() => onMouseLeave()}
                            className={`whitespace-nowrap px-3 py-2 text-sm text-gray-500 ${shouldHighLight(tmpHighlightIds, props.dataToDisplay[0].shouldHighlightOn) || hoverGroupsDict[props.dataToDisplay[0].label.id][LabelingPageParts.TABLE_MODAL] ? settings.main.hoverGroupBackgroundColorClass : ''}`}>{props.dataToDisplay[0].createdBy}</td>
                        <td onMouseEnter={() => onMouseEnter([props.dataToDisplay[0].label.id], props.dataToDisplay[0].label.id)} onMouseLeave={() => onMouseLeave(props.dataToDisplay[0].label.id)}
                            className={`whitespace-nowrap px-3 py-2 text-sm text-gray-500 ${shouldHighLight(tmpHighlightIds, props.dataToDisplay[0].shouldHighlightOn) || hoverGroupsDict[props.dataToDisplay[0].label.id][LabelingPageParts.OVERVIEW_TABLE] ? settings.main.hoverGroupBackgroundColorClass : ''}`}>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-sm font-medium cursor-default relative ${props.dataToDisplay[0].label.backgroundColor} ${props.dataToDisplay[0].label.textColor} ${props.dataToDisplay[0].label.borderColor}`}>
                                {props.dataToDisplay[0].label.name}
                                <div className={`label-overlay-base ${hoverGroupsDict[props.dataToDisplay[0].label.id][LabelingPageParts.MANUAL] && props.dataToDisplay[0].sourceTypeKey == LabelingPageParts.MANUAL && style.labelOverlayManual} ${hoverGroupsDict[props.dataToDisplay[0].label.id][LabelingPageParts.WEAK_SUPERVISION] && props.dataToDisplay[0].sourceTypeKey == LabelingPageParts.WEAK_SUPERVISION && style.labelOverlayWeakSupervision} ${hoverGroupsDict[props.dataToDisplay[0].label.id][LabelingPageParts.MANUAL_GOLD] && props.dataToDisplay[0].sourceTypeKey == LabelingPageParts.MANUAL_GOLD && style.labelOverlayManual}`}></div>
                            </span>
                            {props.dataToDisplay[0].label.value && <div className="ml-2">{props.dataToDisplay[0].label.value}</div>}
                        </td>
                        <td onMouseEnter={() => onMouseEnter([props.dataToDisplay[0].rla.id])} onMouseLeave={() => onMouseLeave()}
                            className={`${shouldHighLight(tmpHighlightIds, props.dataToDisplay[0].shouldHighlightOn) || hoverGroupsDict[props.dataToDisplay[0].label.id][LabelingPageParts.TABLE_MODAL] ? settings.main.hoverGroupBackgroundColorClass : ''}`}>
                            <IconSearch className="w-6 h-6 text-gray-700" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>}
    </Modal>)
}