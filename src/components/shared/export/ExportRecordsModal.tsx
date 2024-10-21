import { ModalEnum } from "@/src/types/shared/modal";
import Modal from "../modal/Modal";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, selectModal } from "@/src/reduxStore/states/modal";
import { useCallback, useEffect, useState } from "react";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { ExportEnums, ExportFileType, ExportFormat, ExportPreset, ExportProps, ExportRowType } from "@/src/types/shared/export";
import { enumToArray, jsonCopy } from "@/submodules/javascript-functions/general";
import { caseType } from "@/submodules/javascript-functions/case-types-parser";
import { LabelSource } from "@/submodules/javascript-functions/enums/enums";
import { labelSourceToString } from "@/submodules/javascript-functions/enums/enum-functions";
import postProcessExportRecordData, { NONE_IN_PROJECT, buildForm, getExportTooltipFor } from "@/src/util/shared/export-helper";
import GroupDisplay from "./GroupDisplay";
import { IconDownload } from "@tabler/icons-react";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { Tooltip } from "@nextui-org/react";
import { DownloadState } from "@/src/types/components/projects/projectId/settings/project-export";
import LoadingIcon from "../loading/LoadingIcon";
import { ExportHelper } from "@/src/util/classes/export";
import { downloadFile } from "@/src/services/base/s3-service";
import { downloadByteDataNoStringify } from "@/submodules/javascript-functions/export";
import { timer } from "rxjs";
import { selectOrganizationId, selectUser } from "@/src/reduxStore/states/general";
import CryptedField from "../crypted-field/CryptedField";
import { extendArrayElementsByUniqueId } from "@/submodules/javascript-functions/id-prep";
import { useWebsocket } from "@/submodules/react-components/hooks/web-socket/useWebsocket";
import { getRecordExportFromData } from "@/src/services/base/project";
import { getLastRecordExportCredentials, prepareRecordExport } from "@/src/services/base/project-setting";
import { Application, CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";

export default function ExportRecordsModal(props: ExportProps) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const user = useSelector(selectUser)
    const modal = useSelector(selectModal(ModalEnum.EXPORT_RECORDS));

    const [recordExportCredentials, setRecordExportCredentials] = useState(null);
    const [enumArrays, setEnumArrays] = useState<Map<ExportEnums, any[]>>(null);
    const [formGroup, setFormGroup] = useState(null);
    const [downloadState, setDownloadState] = useState<DownloadState>(DownloadState.NONE);
    const [key, setKey] = useState('');
    const [prepareErrors, setPrepareErrors] = useState<string[]>([]);

    useEffect(() => {
        if (!modal || !modal.open) return;
        if (!projectId) return;
        requestRecordsExportCredentials();
        fetchSetupData();
    }, [modal, projectId]);

    useEffect(() => {
        if (!enumArrays) return;
        if (!formGroup) {
            buildForms();
        }
    }, [enumArrays]);

    useEffect(() => {
        if (!modal || !modal.open) return;
        setFormGroup(null);
        setEnumArrays(null);
        setRecordExportCredentials(null);
        setPrepareErrors([]);
        setDownloadState(DownloadState.NONE);
        setKey('');
    }, [modal]);

    function requestRecordsExportCredentials() {
        getLastRecordExportCredentials(projectId, (res) => {
            const recordExportCredentials = res.data['lastRecordExportCredentials'];
            if (!recordExportCredentials) setRecordExportCredentials(null);
            else {
                const credentials = JSON.parse(recordExportCredentials);
                const parts = credentials.objectName.split('/');
                credentials.downloadFileName = parts[parts.length - 1].substring(14); //without record_export_
                setRecordExportCredentials(credentials);
            }
        });
    }

    function fetchSetupData(force: boolean = false) {
        const enumArraysCopy = new Map<ExportEnums, any[]>();
        enumArraysCopy.set(ExportEnums.ExportPreset, enumToArray(ExportPreset, { caseType: caseType.CAPITALIZE_FIRST_PER_WORD }));
        enumArraysCopy.set(ExportEnums.ExportRowType, enumToArray(ExportRowType, { caseType: caseType.CAPITALIZE_FIRST_PER_WORD }));
        enumArraysCopy.set(ExportEnums.ExportFileType, enumToArray(ExportFileType, { caseType: caseType.LOWER }));
        enumArraysCopy.set(ExportEnums.ExportFormat, enumToArray(ExportFormat, { caseType: caseType.CAPITALIZE_FIRST_PER_WORD }));
        enumArraysCopy.set(ExportEnums.LabelSource, enumToArray(LabelSource, { nameFunction: labelSourceToString }));
        if (!force && enumArraysCopy[ExportEnums.Heuristics]) return;
        getRecordExportFromData(projectId, (res) => {
            const postProcessedRes = postProcessExportRecordData(res['data']['projectByProjectId']);
            enumArraysCopy.set(ExportEnums.Heuristics, postProcessedRes.informationSources);
            enumArraysCopy.set(ExportEnums.Attributes, postProcessedRes.attributes);
            enumArraysCopy.set(ExportEnums.LabelingTasks, postProcessedRes.labelingTasks);
            enumArraysCopy.set(ExportEnums.DataSlices, postProcessedRes.dataSlices);
            enumArraysCopy.forEach((v, k) => {
                v.forEach((v2: any) => {
                    const tooltip = getExportTooltipFor(k, v2);
                    if (tooltip) v2.tooltip = tooltip;
                });
                v = extendArrayElementsByUniqueId(v);
            });
            setEnumArrays(enumArraysCopy);
        });
    }

    function buildForms() {
        if (formGroup) return;
        const formGroupCopy = {};
        for (const [key, value] of enumArrays) {
            const group = buildForm(value);
            formGroupCopy[key] = group;
        }
        setFormGroup(formGroupCopy);
        setPresetValues(ExportPreset.DEFAULT, formGroupCopy);
    }

    function setPresetValues(preset: ExportPreset, formGroup: any) {
        let formGroupCopy = jsonCopy(formGroup);
        formGroupCopy = setOptionFormDisableState(preset, formGroupCopy);
        switch (preset) {
            case ExportPreset.DEFAULT:
                initForms(formGroupCopy);
                setPresetValuesCurrent(formGroupCopy);
                break;
            case ExportPreset.CUSTOM:
                setFormGroup(formGroupCopy);
                break; //nothing else to do
        }
    }

    function initForms(formGroup: any) {
        for (const [key, value] of Object.entries(formGroup)) {
            if (![ExportEnums.ExportRowType, ExportEnums.ExportFileType].includes(key as ExportEnums)) setActiveForAllInGroup(formGroup, key as ExportEnums, false);
        }
    }

    function setPresetValuesCurrent(formGroup: Map<ExportEnums, any>) {
        let formGroupCopy = jsonCopy(formGroup);
        formGroupCopy[ExportEnums.ExportPreset][ExportPreset.DEFAULT].active = true;
        formGroupCopy[ExportEnums.ExportFormat][ExportFormat.DEFAULT].active = true;
        formGroupCopy[ExportEnums.LabelSource][LabelSource.MANUAL].active = true;
        formGroupCopy[ExportEnums.LabelSource][LabelSource.WEAK_SUPERVISION].active = true;
        formGroupCopy = setActiveForAllInGroup(formGroupCopy, ExportEnums.Attributes, true);
        formGroupCopy = setActiveForAllInGroup(formGroupCopy, ExportEnums.LabelingTasks, true);
        setFormGroup(formGroupCopy);
    }

    function setActiveForAllInGroup(formGroupCopy: any, preset: ExportEnums, active: boolean) {
        if (!formGroupCopy[preset]) return formGroupCopy;
        for (const [key] of Object.entries(formGroupCopy[preset])) {
            formGroupCopy[preset][key]['active'] = active;
        }
        return formGroupCopy;
    }

    function setOptionFormDisableState(type: ExportPreset, formGroup: any) {
        if (type == ExportPreset.DEFAULT) {
            for (let [key, value] of Object.entries(formGroup)) {
                if (![ExportEnums.ExportPreset, ExportEnums.ExportFileType, ExportEnums.ExportRowType, ExportEnums.DataSlices].includes(key as ExportEnums)) {
                    for (let [key2, value2] of Object.entries(value)) {
                        const val: any = value2;
                        val.disabled = true;
                    }
                }
            }
        } else {
            for (let [key, value] of Object.entries(formGroup)) {
                for (let [key2, value2] of Object.entries(value)) {
                    const val: any = value2;
                    val.disabled = false;
                }
            }
        }
        const session = formGroup[ExportEnums.ExportRowType][ExportRowType.SESSION];
        if (props.sessionId) session.disabled = false;
        else session.disabled = true;

        formGroup = setNoneInProjectDisable(formGroup);
        return formGroup;
    }


    function setNoneInProjectDisable(formGroup) {
        if (!formGroup) return;
        for (let [key, value] of Object.entries(formGroup)) {
            for (let [key2, value2] of Object.entries(value)) {
                const val: any = value2;
                if (val.id == NONE_IN_PROJECT) val.disabled = true;
            }
        }
        return formGroup;
    }


    function exportViaFile() {
        if (!recordExportCredentials) return;
        setDownloadState(DownloadState.DOWNLOAD);
        const fileName = recordExportCredentials.downloadFileName;
        downloadFile(recordExportCredentials, false).subscribe((data) => {
            downloadByteDataNoStringify(data, fileName);
            timer(5000).subscribe(
                () => (setDownloadState(DownloadState.NONE))
            );
        });
    }

    function prepareDownload() {
        const jsonString = ExportHelper.buildExportData(props.sessionId, formGroup);
        setPrepareErrors(ExportHelper.error);
        if (ExportHelper.error.length > 0) return;
        setDownloadState(DownloadState.PREPARATION);
        let keyToSend = key;
        if (!keyToSend) keyToSend = null;
        prepareRecordExport(projectId, { exportOptions: jsonString, key: keyToSend }, (res) => {
            if (!res.data) {
                ExportHelper.error.push("Something went wrong in the backend:");
                ExportHelper.error.push(res.error);
                setPrepareErrors(ExportHelper.error);
            }
            setDownloadState(DownloadState.DOWNLOAD);
        });
    }

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        let somethingToRerequest = false;
        if ('calculate_attribute' == msgParts[1] && ['deleted', 'finished'].includes(msgParts[2])) {
            somethingToRerequest = true;
        } else if (['labeling_task_deleted', 'labeling_task_created', 'data_slice_created', 'data_slice_deleted', 'labeling_task_deleted', 'labeling_task_created'].includes(msgParts[1])) {
            somethingToRerequest = true;
        } else if (msgParts[1] == 'record_export' && user?.id == msgParts[2]) {
            setRecordExportCredentials(null);
            requestRecordsExportCredentials();
        }
        if (somethingToRerequest) fetchSetupData(true);
    }, [user, projectId]);

    const orgId = useSelector(selectOrganizationId);
    useWebsocket(orgId, Application.REFINERY, CurrentPage.EXPORT, handleWebsocketNotification, projectId);

    return (<Modal modalName={ModalEnum.EXPORT_RECORDS} hasOwnButtons={true}>
        <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium mb-2">Export record data </div>
        {formGroup && <div className="grid grid-cols-3 gap-2 items-center overflow-y-auto overflow-x-hidden pb-4" style={{ maxHeight: 'calc(80vh - 100px)' }}>
            {/* Export Preset */}
            <GroupDisplay type={ExportEnums.ExportPreset} hiddenCheckCtrl={null} formGroup={formGroup} enumArrays={enumArrays}
                heading="Export Presets" subText="Choose a preset to apply corresponding values" isCheckbox={false}
                setPresetValues={(val, control) => {
                    setPresetValues(val, control);
                }}
            />

            {/* Export RowType */}
            <GroupDisplay type={ExportEnums.ExportRowType} hiddenCheckCtrl={null} formGroup={formGroup} enumArrays={enumArrays}
                heading="Export Amount" subText="Choose what rows should be exported" isCheckbox={false}
                updateFormGroup={(control, type) => {
                    setFormGroup(control);
                }} />

            {/* Export DataSlices */}
            <GroupDisplay type={ExportEnums.DataSlices} hiddenCheckCtrl={formGroup[ExportEnums.ExportRowType][ExportRowType.SLICE]['active']} formGroup={formGroup} enumArrays={enumArrays}
                heading="Export data slice" subText={null} isCheckbox={false}
                updateFormGroup={(control, type) => {
                    setFormGroup(control);
                }} />

            {/* Export FileType */}
            <GroupDisplay type={ExportEnums.ExportFileType} hiddenCheckCtrl={null} formGroup={formGroup} enumArrays={enumArrays}
                heading="Export File" subText={null} isCheckbox={false}
                updateFormGroup={(control, type) => {
                    setFormGroup(control);
                }} />

            {/* Export Format */}
            <GroupDisplay type={ExportEnums.ExportFormat} hiddenCheckCtrl={null} formGroup={formGroup} enumArrays={enumArrays}
                heading="Export Format" subText={null} isCheckbox={false}
                updateFormGroup={(control, type) => {
                    setFormGroup(control);
                }} />

            {/* Export Attributes */}
            <GroupDisplay type={ExportEnums.Attributes} hiddenCheckCtrl={null} formGroup={formGroup} enumArrays={enumArrays}
                heading="Export Columns - Attributes" subText={null} isCheckbox={true}
                updateFormGroup={(control) => {
                    setFormGroup(control);
                }} />

            {/* Export LabelingTasks */}
            <GroupDisplay type={ExportEnums.LabelingTasks} hiddenCheckCtrl={null} formGroup={formGroup} enumArrays={enumArrays}
                heading="Export Columns - Labeling Tasks" subText={null} isCheckbox={true}
                updateFormGroup={(control) => {
                    setFormGroup(control);
                }} />

            {/* Export LabelSource */}
            <GroupDisplay type={ExportEnums.LabelSource} hiddenCheckCtrl={null} formGroup={formGroup} enumArrays={enumArrays}
                heading="Export Columns - Global" subText={null} isCheckbox={true}
                updateFormGroup={(control) => {
                    setFormGroup(control);
                }} />

            {/* Export Heuristics */}
            <GroupDisplay type={ExportEnums.Heuristics} hiddenCheckCtrl={formGroup[ExportEnums.LabelSource]['INFORMATION_SOURCE']['active']} formGroup={formGroup} enumArrays={enumArrays}
                heading="Export Columns - Heuristics" subText={null} isCheckbox={true}
                updateFormGroup={(control) => {
                    setFormGroup(control);
                }} />
        </div>}
        {prepareErrors.length > 0 && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-2">
            <strong className="font-semibold">Errors Detected!</strong>
            <pre className="text-sm">{prepareErrors.join("\n")}</pre>
        </div>}
        <CryptedField label="Encrypt zip file with password" keyChange={(key: string) => setKey(key)} />
        <div className="flex mt-6 justify-end">
            {recordExportCredentials && recordExportCredentials.downloadFileName && <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.LATEST_SNAPSHOT} color="invert">
                <button onClick={exportViaFile} className="bg-white text-gray-700 text-xs font-semibold mr-4 px-4 py-2 rounded-md border border-gray-300 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <IconDownload className="mr-1 h-5 w-5 inline-block" />
                    {recordExportCredentials.downloadFileName}
                </button>
            </Tooltip>}
            <button onClick={prepareDownload}
                disabled={downloadState == DownloadState.PREPARATION}
                className={`bg-green-100 flex items-center mr-4 text-green-700 border border-green-400 text-xs font-semibold px-4 rounded-md cursor-pointer hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                type="submit">
                Prepare download
                {downloadState == DownloadState.PREPARATION && <span className="ml-2"><LoadingIcon color="green" /></span>}
            </button>
            <button onClick={() => {
                dispatch(closeModal(ModalEnum.EXPORT_RECORDS));

            }}
                className="bg-white text-gray-700 text-xs font-semibold px-4 py-2 rounded border border-gray-300 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Close
            </button>
        </div>
    </Modal>)
}