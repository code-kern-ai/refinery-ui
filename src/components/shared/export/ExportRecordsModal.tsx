import { ModalEnum } from "@/src/types/shared/modal";
import Modal from "../modal/Modal";
import { useSelector } from "react-redux";
import { selectModal } from "@/src/reduxStore/states/modal";
import { useEffect, useState } from "react";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { GET_RECORD_EXPORT_FORM_DATA, LAST_RECORD_EXPORT_CREDENTIALS } from "@/src/services/gql/queries/project-setting";
import { useLazyQuery } from "@apollo/client";
import { ExportEnums, ExportFileType, ExportFormat, ExportPreset, ExportRowType } from "@/src/types/shared/export";
import { enumToArray } from "@/submodules/javascript-functions/general";
import { caseType } from "@/submodules/javascript-functions/case-types-parser";
import { LabelSource } from "@/submodules/javascript-functions/enums/enums";
import { labelSourceToString } from "@/submodules/javascript-functions/enums/enum-functions";
import postProcessExportRecordData, { buildForm } from "@/src/util/shared/export-helper";
import GroupDisplay from "./GroupDisplay";

export default function ExportRecordsModal() {
    const projectId = useSelector(selectProjectId);
    const modal = useSelector(selectModal(ModalEnum.EXPORT_RECORDS));

    const [recordExportCredentials, setRecordExportCredentials] = useState(null);
    const [enumArrays, setEnumArrays] = useState<Map<ExportEnums, any[]>>(null);
    const [formGroup, setFormGroup] = useState(null);

    const [refetchLastRecordsExportCredentials] = useLazyQuery(LAST_RECORD_EXPORT_CREDENTIALS, { fetchPolicy: "no-cache" });
    const [refetchRecordExportFromData] = useLazyQuery(GET_RECORD_EXPORT_FORM_DATA, { fetchPolicy: "no-cache" });

    useEffect(() => {
        if (!modal || !modal.open) return;
        if (!projectId) return;
        requestRecordsExportCredentials();
        fetchSetupData();
    }, [modal, projectId]);

    useEffect(() => {
        if (!enumArrays) return;
        refreshForms();
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
            enumArraysCopy.set(ExportEnums.Heuristics, postProcessedRes.heuristics);
            enumArraysCopy.set(ExportEnums.Attributes, postProcessedRes.attributes);
            enumArraysCopy.set(ExportEnums.LabelingTasks, postProcessedRes.labelingTasks);
            enumArraysCopy.set(ExportEnums.DataSlices, postProcessedRes.dataSlices);
            setEnumArrays(enumArraysCopy);
        });
    }

    function refreshForms() {
        if (!formGroup) {
            buildForms();
            return;
        }
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
        // this.setOptionFormDisableState(preset);
        switch (preset) {
            case ExportPreset.DEFAULT:
                initForms(formGroup);
                setPresetValuesCurrent(formGroup);
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
        return formGroupCopy
    }

    return (<Modal modalName={ModalEnum.EXPORT_RECORDS}>
        <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium mb-2">Export record data </div>
        {formGroup && <div className="grid grid-cols-3 gap-2 items-center overflow-y-auto overflow-x-hidden pb-4" style={{ maxHeight: 'calc(80vh - 100px)' }}>
            <GroupDisplay type={ExportEnums.ExportPreset} hiddenCheckCtrl={null} formGroup={formGroup} enumArrays={enumArrays}
                heading="Export Presets" subText="Choose a preset to apply corresponding values" isCheckbox={false}
                setPresetValues={(control) => setPresetValues(control, formGroup)}
                updateFormGroup={(control, type) => {
                    const formGroupCopy = new Map<ExportEnums, any>(formGroup);
                    formGroupCopy[type] = control;
                    setFormGroup(formGroupCopy);
                }} />
        </div>}
    </Modal>)
}