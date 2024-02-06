import { selectUser } from "@/src/reduxStore/states/general";
import { openModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { UserRole } from "@/src/types/shared/sidebar";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { Tooltip } from "@nextui-org/react";
import { IconSettings, IconTrash } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import DeleteRecordModal from "./DeleteRecordModal";
import { selectRecordRequestsRecord, selectSettings, updateSettings } from "@/src/reduxStore/states/pages/labeling";
import { ComponentType } from "@/src/types/components/projects/projectId/labeling/settings";
import LabelingSettingsModal from "./LabelingSettingsModal";

export default function NavigationBarBottom() {
    const dispatch = useDispatch();

    const settings = useSelector(selectSettings);
    const user = useSelector(selectUser);
    const record = useSelector(selectRecordRequestsRecord);

    function toggleAutoNextRecord() {
        dispatch(updateSettings(ComponentType.MAIN, 'autoNextRecord'));
        const getSettings = localStorage.getItem('labelingSettings');
        let settings = getSettings ? JSON.parse(getSettings) : {};
        settings.main.autoNextRecord = !settings.main.autoNextRecord;
        localStorage.setItem('labelingSettings', JSON.stringify(settings));
    }

    function setShowNLabelButtonFunc(event: any) {
        const valueInt = event.target.value;
        dispatch(updateSettings(ComponentType.LABELING, 'showNLabelButton', valueInt));
        const getSettings = localStorage.getItem('labelingSettings');
        let settings = getSettings ? JSON.parse(getSettings) : {};
        settings.labeling.showNLabelButton = valueInt;
        localStorage.setItem('labelingSettings', JSON.stringify(settings));
    }

    return (<>
        {user && <div className="w-full px-4 border-gray-200 border-t h-16">
            <div className="relative flex-shrink-0 bg-white shadow-sm flex justify-between items-center h-full">
                <div className="flex flex-row flex-nowrap items-center">
                    <div className="flex justify-center overflow-visible">
                        {user.role == UserRole.ENGINEER && <Tooltip content={TOOLTIPS_DICT.LABELING.DELETE_CURRENT_RECORD} color="invert" placement="top">
                            <button onClick={() => dispatch(openModal(ModalEnum.DELETE_RECORD))} disabled={record == null}
                                className="bg-red-100 text-red-700 border border-red-400 text-xs font-semibold mr-3 px-4 py-2 rounded-md flex hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                <IconTrash className="mr-2" size={16} />
                                Delete record
                            </button>
                        </Tooltip>}
                    </div>
                    <div className="flex justify-center overflow-visible items-center cursor-pointer">
                        {record && record.id != "deleted" && <> <label htmlFor="autoNextRecord"
                            className="flex-shrink-0 group relative inline-flex items-center justify-center cursor-pointer focus:outline-none" role="switch" aria-checked="false">
                            <input name='autoNextRecord' className="h-5 w-5 cursor-pointer" type="checkbox" checked={settings.main.autoNextRecord}
                                onChange={toggleAutoNextRecord} />
                        </label>
                            <span className="flex-grow flex flex-col ml-3 flex-shrink-0 mr-6" onClick={toggleAutoNextRecord}>
                                <span className="text-sm font-medium text-gray-900">Automatically get next record</span>
                                <span className="text-sm text-gray-500">Apply this if you
                                    want to load the next record after setting a label</span>
                            </span></>}
                    </div>
                    <div className="flex justify-center overflow-visible items-center cursor-pointer">
                        {record && record.id != "deleted" && <>
                            <input value={settings.labeling.showNLabelButton} type="number" min="0" step="1"
                                onChange={(event) => setShowNLabelButtonFunc(event)}
                                onBlur={(event) => setShowNLabelButtonFunc(event)}
                                onKeyDown={(event) => {
                                    if (event.key == 'Enter') setShowNLabelButtonFunc(event)
                                }} className="h-9 w-12 text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
                            <span className="flex-grow flex flex-col flex-shrink-0 ml-3 cursor-auto">
                                <span className="text-sm font-medium text-gray-900" id="availability-label">Display of label options</span>
                                <span className="text-sm text-gray-500" id="availability-description">Nr. of options shown by default</span>
                            </span>
                        </>}
                    </div>
                </div>
                {user.role !== UserRole.ANNOTATOR && <Tooltip onClick={() => dispatch(openModal(ModalEnum.LABELING_SETTINGS))}
                    content={<div className="w-32">Open Labeling Suite settings</div>} color="invert" placement="left">
                    <div className="p-2 border border-gray-300 rounded-md">
                        <IconSettings className="h-6 w-6" />
                    </div>
                </Tooltip>}
            </div>
            <DeleteRecordModal />
            <LabelingSettingsModal />
        </div>}
    </>)
}