import { ModalEnum } from "@/src/types/shared/modal";
import Modal from "../modal/Modal";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, selectModal } from "@/src/reduxStore/states/modal";
import { useEffect, useState } from "react";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { GET_RECORD_EXPORT_FORM_DATA, LAST_RECORD_EXPORT_CREDENTIALS, PREPARE_RECORD_EXPORT } from "@/src/services/gql/queries/project-setting";
import { useLazyQuery } from "@apollo/client";
import { ExportEnums, ExportFileType, ExportFormat, ExportPreset, ExportProps, ExportRowType } from "@/src/types/shared/export";
import { enumToArray } from "@/submodules/javascript-functions/general";
import { caseType } from "@/submodules/javascript-functions/case-types-parser";
import { LabelSource } from "@/submodules/javascript-functions/enums/enums";
import { labelSourceToString } from "@/submodules/javascript-functions/enums/enum-functions";
import postProcessExportRecordData, { buildForm, getExportTooltipFor } from "@/src/util/shared/export-helper";
import GroupDisplay from "./GroupDisplay";
import { IconDownload } from "@tabler/icons-react";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { Tooltip } from "@nextui-org/react";
import { DownloadState } from "@/src/types/components/projects/projectId/settings/project-export";
import LoadingIcon from "../loading/LoadingIcon";
import { ExportHelper } from "@/src/util/classes/export";
import { downloadFile } from "@/src/services/base/s3-service";
import { downloadByteData } from "@/submodules/javascript-functions/export";
import { timer } from "rxjs";

export default function ExportRecordsModal(props: ExportProps) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const modal = useSelector(selectModal(ModalEnum.EXPORT_RECORDS));

    const [recordExportCredentials, setRecordExportCredentials] = useState(null);
    const [enumArrays, setEnumArrays] = useState<Map<ExportEnums, any[]>>(null);
    const [formGroup, setFormGroup] = useState(null);
    const [downloadState, setDownloadState] = useState<DownloadState>(DownloadState.NONE);

    const [refetchLastRecordsExportCredentials] = useLazyQuery(LAST_RECORD_EXPORT_CREDENTIALS, { fetchPolicy: "no-cache" });
    const [refetchRecordExportFromData] = useLazyQuery(GET_RECORD_EXPORT_FORM_DATA, { fetchPolicy: "no-cache" });
    const [refetchPrepareRecordExport] = useLazyQuery(PREPARE_RECORD_EXPORT, { fetchPolicy: "no-cache" })

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

    function requestRecordsExportCredentials() {
        refetchLastRecordsExportCredentials({ variables: { projectId: projectId } }).then((res) => {
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
        if (!force && enumArraysCopy.get(ExportEnums.Heuristics)) return;
        refetchRecordExportFromData({ variables: { projectId: projectId } }).then((res) => {
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
            });
            setEnumArrays(enumArraysCopy);
        });
    }

    function buildForms() {
        if (formGroup) return;
        const formGroupCopy = new Map<ExportEnums, any>();
        for (const [key, value] of enumArrays) {
            const group = buildForm(value);
            formGroupCopy.set(key, group);
        }
        setFormGroup(formGroupCopy);
        setPresetValues(ExportPreset.DEFAULT, formGroupCopy);
    }

    function setPresetValues(preset: ExportPreset, formGroup: Map<ExportEnums, any>) {
        let formGroupCopy = new Map<ExportEnums, any>(formGroup);
        formGroupCopy = setOptionFormDisableState(preset, formGroupCopy);
        switch (preset) {
            case ExportPreset.DEFAULT:
                initForms(formGroupCopy);
                setPresetValuesCurrent(formGroupCopy);
                break;
            case ExportPreset.CUSTOM:
                break; //nothing else to do
        }
    }

    function initForms(formGroup: Map<ExportEnums, any>) {
        for (const [key, value] of formGroup) {
            if (![ExportEnums.ExportRowType, ExportEnums.ExportFileType].includes(key)) setActiveForAllInGroup(formGroup, key, false);
        }
    }

    function setPresetValuesCurrent(formGroup: Map<ExportEnums, any>) {
        let formGroupCopy = new Map<ExportEnums, any>(formGroup);
        formGroupCopy.get(ExportEnums.ExportPreset)[ExportPreset.DEFAULT].active = true;
        formGroupCopy.get(ExportEnums.ExportFormat)[ExportFormat.DEFAULT].active = true;
        formGroupCopy.get(ExportEnums.LabelSource)[LabelSource.MANUAL].active = true;
        formGroupCopy.get(ExportEnums.LabelSource)[LabelSource.WEAK_SUPERVISION].active = true;
        formGroupCopy = setActiveForAllInGroup(formGroupCopy, ExportEnums.Attributes, true);
        formGroupCopy = setActiveForAllInGroup(formGroupCopy, ExportEnums.LabelingTasks, true);
        setFormGroup(formGroupCopy);
    }

    function setActiveForAllInGroup(formGroupCopy: any, preset: ExportEnums, active: boolean) {
        if (!formGroupCopy.get(preset)) return formGroupCopy;
        for (const [key] of Object.entries(formGroupCopy.get(preset))) {
            formGroupCopy.get(preset)[key]['active'] = active;
        }
        return formGroupCopy;
    }

    function setOptionFormDisableState(type: ExportPreset, formGroup: Map<ExportEnums, any>) {
        if (type == ExportPreset.DEFAULT) {
            for (let [key, value] of formGroup) {
                if (![ExportEnums.ExportPreset, ExportEnums.ExportFileType, ExportEnums.ExportRowType, ExportEnums.DataSlices].includes(key)) {
                    for (let [key2, value2] of Object.entries(value)) {
                        const val: any = value2;
                        val.disabled = true;
                    }
                }
            }
        } else {
            for (let [key, value] of formGroup) {
                for (let [key2, value2] of Object.entries(value)) {
                    const val: any = value2;
                    val.disabled = false;
                }
            }
        }
        const session = formGroup.get(ExportEnums.ExportRowType)[ExportRowType.SESSION];
        if (props.sessionId) session.disabled = false;
        else session.disabled = true;
        return formGroup;
    }

    function exportViaFile() {
        if (!recordExportCredentials) return;
        setDownloadState(DownloadState.DOWNLOAD);
        const fileName = recordExportCredentials.downloadFileName;
        downloadFile(recordExportCredentials, false).subscribe((data) => {
            downloadByteData(data, fileName);
            timer(5000).subscribe(
                () => (setDownloadState(DownloadState.NONE))
            );
        });
    }

    function prepareDownload() {
        const jsonString = ExportHelper.buildExportData(props.sessionId, formGroup);
        if (ExportHelper.error.length > 0) return;
        setDownloadState(DownloadState.PREPARATION);
        //TODO : add key to send
        refetchPrepareRecordExport({ variables: { projectId: projectId, exportOptions: jsonString, key: null } }).then((res) => {
            if (res.data['prepareRecordExport'] != "") {
                ExportHelper.error.push("Something went wrong in the backend:");
                ExportHelper.error.push(res.data['prepareRecordExport']);
            }
            setDownloadState(DownloadState.DOWNLOAD);
        });
    }

    return (<Modal modalName={ModalEnum.EXPORT_RECORDS} hasOwnButtons={true}>
        <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium mb-2">Export record data </div>
        {formGroup && <div className="grid grid-cols-3 gap-2 items-center overflow-y-auto overflow-x-hidden pb-4" style={{ maxHeight: 'calc(80vh - 100px)' }}>
            {/* Export Preset */}
            <GroupDisplay type={ExportEnums.ExportPreset} hiddenCheckCtrl={null} formGroup={formGroup} enumArrays={enumArrays}
                heading="Export Presets" subText="Choose a preset to apply corresponding values" isCheckbox={false}
                setPresetValues={(control) => setPresetValues(control, formGroup)}
                updateFormGroup={(control, type) => {
                    const formGroupCopy = new Map<ExportEnums, any>(formGroup);
                    formGroupCopy[type] = control;
                    setFormGroup(formGroupCopy);
                }} />

            {/* Export RowType */}
            <GroupDisplay type={ExportEnums.ExportRowType} hiddenCheckCtrl={null} formGroup={formGroup} enumArrays={enumArrays}
                heading="Export Amount" subText="Choose what rows should be exported" isCheckbox={false}
                setPresetValues={(control) => setPresetValues(control, formGroup)}
                updateFormGroup={(control, type) => {
                    const formGroupCopy = new Map<ExportEnums, any>(formGroup);
                    formGroupCopy[type] = control;
                    setFormGroup(formGroupCopy);
                }} />

            {/* Export DataSlices */}
            <GroupDisplay type={ExportEnums.DataSlices} hiddenCheckCtrl={formGroup.get(ExportEnums.ExportRowType)[ExportRowType.SLICE]['active']} formGroup={formGroup} enumArrays={enumArrays}
                heading="Export data slice" subText={null} isCheckbox={false}
                setPresetValues={(control) => setPresetValues(control, formGroup)}
                updateFormGroup={(control, type) => {
                    const formGroupCopy = new Map<ExportEnums, any>(formGroup);
                    formGroupCopy[type] = control;
                    setFormGroup(formGroupCopy);
                }} />

            {/* Export FileType */}
            <GroupDisplay type={ExportEnums.ExportFileType} hiddenCheckCtrl={null} formGroup={formGroup} enumArrays={enumArrays}
                heading="Export File" subText={null} isCheckbox={false}
                setPresetValues={(control) => setPresetValues(control, formGroup)}
                updateFormGroup={(control, type) => {
                    const formGroupCopy = new Map<ExportEnums, any>(formGroup);
                    formGroupCopy[type] = control;
                    setFormGroup(formGroupCopy);
                }} />

            {/* Export Format */}
            <GroupDisplay type={ExportEnums.ExportFormat} hiddenCheckCtrl={null} formGroup={formGroup} enumArrays={enumArrays}
                heading="Export Format" subText={null} isCheckbox={false}
                setPresetValues={(control) => setPresetValues(control, formGroup)}
                updateFormGroup={(control, type) => {
                    const formGroupCopy = new Map<ExportEnums, any>(formGroup);
                    formGroupCopy[type] = control;
                    setFormGroup(formGroupCopy);
                }} />

            {/* Export Attributes */}
            <GroupDisplay type={ExportEnums.Attributes} hiddenCheckCtrl={null} formGroup={formGroup} enumArrays={enumArrays}
                heading="Export Columns - Attributes" subText={null} isCheckbox={true}
                setPresetValues={(control) => setPresetValues(control, formGroup)}
                updateFormGroup={(control, type) => {
                    const formGroupCopy = new Map<ExportEnums, any>(formGroup);
                    formGroupCopy[type] = control;
                    setFormGroup(formGroupCopy);
                }} />

            {/* Export LabelingTasks */}
            <GroupDisplay type={ExportEnums.LabelingTasks} hiddenCheckCtrl={null} formGroup={formGroup} enumArrays={enumArrays}
                heading="Export Columns - Labeling Tasks" subText={null} isCheckbox={true}
                setPresetValues={(control) => setPresetValues(control, formGroup)}
                updateFormGroup={(control, type) => {
                    const formGroupCopy = new Map<ExportEnums, any>(formGroup);
                    formGroupCopy[type] = control;
                    setFormGroup(formGroupCopy);
                }} />

            {/* Export LabelSource */}
            <GroupDisplay type={ExportEnums.LabelSource} hiddenCheckCtrl={null} formGroup={formGroup} enumArrays={enumArrays}
                heading="Export Columns - Global" subText={null} isCheckbox={true}
                setPresetValues={(control) => setPresetValues(control, formGroup)}
                updateFormGroup={(control, type) => {
                    const formGroupCopy = new Map<ExportEnums, any>(formGroup);
                    formGroupCopy[type] = control;
                    setFormGroup(formGroupCopy);
                }} />

            {/* Export Heuristics */}
            <GroupDisplay type={ExportEnums.Heuristics} hiddenCheckCtrl={formGroup.get(ExportEnums.LabelSource)['INFORMATION_SOURCE']['active']} formGroup={formGroup} enumArrays={enumArrays}
                heading="Export Columns - Heuristics" subText={null} isCheckbox={true}
                setPresetValues={(control) => setPresetValues(control, formGroup)}
                updateFormGroup={(control, type) => {
                    const formGroupCopy = new Map<ExportEnums, any>(formGroup);
                    formGroupCopy[type] = control;
                    setFormGroup(formGroupCopy);
                }} />
        </div>}
        {ExportHelper.error.length > 0 && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-2">
            <strong className="font-bold">Errors Detected!</strong>
            <pre className="text-sm">{ExportHelper.error.join("\n")}</pre>
        </div>}
        <div className="flex mt-6 justify-end">
            {recordExportCredentials && recordExportCredentials.downloadFileName && <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.LATEST_SNAPSHOT} color="invert">
                <button onClick={exportViaFile} className="bg-white text-gray-700 text-xs font-semibold mr-4 px-4 py-2 rounded-md border border-gray-300 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <IconDownload className="mr-1 h-5 w-5 inline-block" />
                    {recordExportCredentials.downloadFileName}
                </button>
            </Tooltip>}
            <button onClick={prepareDownload}
                disabled={downloadState == DownloadState.PREPARATION || downloadState == DownloadState.DOWNLOAD}
                className={`bg-green-100 flex items-center mr-4 text-green-700 border border-green-400 text-xs font-semibold px-4 rounded-md cursor-pointer hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                type="submit">
                Prepare download
                {downloadState == DownloadState.PREPARATION && <span className="ml-2"><LoadingIcon color="green" /></span>}
            </button>
            <button onClick={() => dispatch(closeModal(ModalEnum.EXPORT_RECORDS))}
                className="bg-white text-gray-700 text-xs font-semibold px-4 py-2 rounded border border-gray-300 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Close
            </button>
        </div>
    </Modal>)
}