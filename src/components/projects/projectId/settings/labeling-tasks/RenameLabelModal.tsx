import Highlight from "@/src/components/shared/highlight/Highlight";
import Modal from "@/src/components/shared/modal/Modal";
import { initModal, openModal, selectModal } from "@/src/reduxStore/states/modal";
import { selectLabelingTasksAll, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { HANDLE_LABEL_RENAME_WARNING, UPDATE_LABEL_NAME } from "@/src/services/gql/mutations/project-settings";
import { CHECK_RENAME_LABEL } from "@/src/services/gql/queries/project-setting";
import { LabelType, LabelingTask, RenameLabelData } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { LabelHelper } from "@/src/util/classes/label-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { IconAlertTriangleFilled, IconInfoCircleFilled, IconTriangleInverted } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Rename', useButton: true }

export default function RenameLabelModal() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const labelingTasksSchema = useSelector(selectLabelingTasksAll);
    const modalRenameLabel = useSelector(selectModal(ModalEnum.RENAME_LABEL));

    const [renameLabelData, setRenameLabelData] = useState<RenameLabelData>(null);

    const [refetchCheckRenameLabel] = useLazyQuery(CHECK_RENAME_LABEL, { fetchPolicy: "no-cache" });
    const [updateLabelNameMut] = useMutation(UPDATE_LABEL_NAME);
    const [handleRenameWarningMut] = useMutation(HANDLE_LABEL_RENAME_WARNING);

    useEffect(() => {
        setRenameLabelData({
            checkResults: null,
            newLabelName: modalRenameLabel.label.name,
            canCheck: false
        });
    }, [modalRenameLabel]);

    const renameLabel = useCallback(() => {
        updateLabelNameMut({ variables: { projectId: projectId, labelId: modalRenameLabel.label.id, newName: renameLabelData.newLabelName } }).then((res) => {
            const labelingTasksSchemaCopy = jsonCopy(labelingTasksSchema);
            const labelingTask = labelingTasksSchemaCopy.find((task: LabelingTask) => task.id == modalRenameLabel.taskId);
            const label = labelingTask.labels.find((label: LabelType) => label.id == modalRenameLabel.label.id);
            label.name = renameLabelData.newLabelName;
            dispatch(setLabelingTasksAll(labelingTasksSchemaCopy));
            dispatch(initModal(ModalEnum.RENAME_LABEL));
        });
    }, [modalRenameLabel, renameLabelData]);

    useEffect(() => {
        if (!renameLabelData) return;
        setAcceptButtonRename({
            ...ACCEPT_BUTTON,
            emitFunction: renameLabel,
            buttonCaption: renameLabelData?.checkResults?.warnings.length > 0 ? 'Rename anyway' : 'Rename',
            disabled: !renameLabelData?.checkResults || renameLabelData?.checkResults?.errors.length > 0
        });
    }, [modalRenameLabel, renameLabelData]);

    const [acceptButtonRename, setAcceptButtonRename] = useState<ModalButton>(ACCEPT_BUTTON);

    function checkRenameLabel() {
        refetchCheckRenameLabel({ variables: { projectId: projectId, labelId: modalRenameLabel.label.id, newName: renameLabelData.newLabelName } }).then((res: any) => {
            const result = JSON.parse(res.data['checkRenameLabel']);
            const renameLabelDataCopy = { ...renameLabelData };
            result.warnings.forEach(e => {
                e.open = false;
                e.oldParsed = LabelHelper.prepareSourceCode(e.old, e.information_source_name);
                e.newParsed = LabelHelper.prepareSourceCode(e.new, e.information_source_name);
            });
            renameLabelDataCopy.checkResults = result;
            setRenameLabelData(renameLabelDataCopy);
            dispatch(openModal(ModalEnum.RENAME_LABEL));
        });
    }

    function handleLabelRenameWarning(warning: any) {
        if (warning == null) return;
        handleRenameWarningMut({ variables: { projectId: projectId, warningData: JSON.stringify(warning) } }).then((res) => {
            checkRenameLabel();
        });

    }
    function checkInputRenameLabel(event: any) {
        const input = event.target as HTMLInputElement;
        const renameLabelDataCopy = { ...renameLabelData };
        renameLabelDataCopy.checkResults = null;
        renameLabelDataCopy.canCheck = LabelHelper.isValidNewName(input.value);
        if (renameLabelDataCopy.canCheck && !LabelHelper.isLabelNameUnique(modalRenameLabel.taskId, input.value)) {
            renameLabelDataCopy.canCheck = false;
            renameLabelDataCopy.checkResults = { "errors": [{ "msg": "Label with name already exists" }], "warnings": [], "infos": [] };
        }
        renameLabelDataCopy.newLabelName = input.value;
        setRenameLabelData(renameLabelDataCopy);
    }

    return (
        <Modal modalName={ModalEnum.RENAME_LABEL} acceptButton={acceptButtonRename}>
            {renameLabelData && modalRenameLabel.label && <div className="flex flex-col gap-y-2">
                <div className="self-center flex flex-row flex-nowrap items-center justify-center">
                    <p className="mr-2 font-bold">Change label name:</p><span
                        className={`border rounded-md py-1 px-2 text-sm font-medium shadow-sm  text-center ${modalRenameLabel.label.color?.backgroundColor} ${modalRenameLabel.label.color?.textColor} ${modalRenameLabel.label.color?.borderColor} ${modalRenameLabel.label.color?.hoverColor}`}>{modalRenameLabel.label.name}</span>
                    <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.LABELING_TASK.INFO_RENAME_LABEL} color="invert" placeholder="top" className="ml-2">
                        <IconInfoCircleFilled className="h-6 w-6 text-blue-500" />
                    </Tooltip>
                </div>
                <div className="flex flex-col gap-y-2" style={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
                    <div className="flex flex-row flex-nowrap items-center">
                        <input value={renameLabelData.newLabelName ?? ''}
                            onChange={(event: any) => checkInputRenameLabel(event)} onKeyDown={(event: any) => {
                                if (event.key == 'Enter') checkRenameLabel();
                            }} className="h-8 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none " />
                        <button onClick={checkRenameLabel} disabled={!renameLabelData.canCheck}
                            className={`ml-2 flex-shrink-0 bg-green-100 text-green-700 border border-green-400 text-xs font-semibold px-4 py-2 rounded-md hover:bg-green-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}>
                            Check Rename {renameLabelData.canCheck}</button>
                    </div>
                    {renameLabelData?.checkResults?.errors?.length > 0 && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex flex-col">
                        <div className="self-center flex flex-row flex-nowrap items-center -mt-1 mb-1">
                            <strong className="font-bold">Errors detected</strong>
                            <IconAlertTriangleFilled className="h-5 w-5 text-red-400" />
                        </div>
                        {renameLabelData?.checkResults?.errors.map((error: any) => (
                            <pre key={error.msg} className="text-sm overflow-x-auto">{error.msg}</pre>
                        ))}
                    </div>}
                    {renameLabelData?.checkResults?.infos.length > 0 && <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative flex flex-col">
                        <div className="self-center flex flex-row flex-nowrap items-center -mt-1 mb-1">
                            <strong className="font-bold">Information</strong>
                            <IconInfoCircleFilled className="h-5 w-5 text-blue-400" />
                        </div>
                        {renameLabelData?.checkResults?.infos.map((info: any) => (
                            <pre key={info.msg} className="text-sm overflow-x-auto">{info.msg}</pre>
                        ))}
                    </div>}
                    {renameLabelData?.checkResults?.warnings?.length > 0 && <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative flex flex-col">
                        <div className="self-center flex flex-row flex-nowrap items-center -mt-1 mb-1">
                            <strong className="font-bold">Warning</strong>
                            <IconAlertTriangleFilled className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="self-center">
                            <span className="text-sm mb-2">
                                <p className="text-center">Inside each toggle is a suggestion how to fix the
                                    corresponding
                                    warning.</p>
                                <p className="text-center">Please check them carefully before applying!</p>
                            </span>
                        </div>
                        {renameLabelData?.checkResults?.warnings?.map((warning: any) => (
                            <div key={warning.msg} className={`flex flex-col gap-y-1 ${warning.open ? 'border border-yellow-400' : ''} `}>
                                <div className="flex flex-row items-center cursor-pointer" onClick={() => {
                                    const warnings = jsonCopy(renameLabelData.checkResults.warnings);
                                    const index = warnings.findIndex((e: any) => e.msg == warning.msg);
                                    warnings[index].open = !warnings[index].open;
                                    const checkResults = jsonCopy(renameLabelData.checkResults);
                                    checkResults.warnings = warnings;
                                    setRenameLabelData({ ...renameLabelData, checkResults: checkResults });
                                }}>
                                    <div className="mr-1">
                                        <IconTriangleInverted className={`h-3 w-3 ${warning.open ? 'transform rotate-180' : ''}`} />
                                    </div>
                                    <span className="text-sm overflow-x-auto">{warning.msg}</span>
                                </div>
                                <div className={`flex flex-col p-2 ${warning.open ? '' : 'hidden'}`}>
                                    {warning.key == 'KNOWLEDGE_BASE' && <div>
                                        <div className="flex flex-row">
                                            <span className="mr-2 font-bold text-sm">Current name:</span>
                                            <span className="text-sm">{warning.old}</span>
                                        </div>
                                        <div className="flex flex-row">
                                            <span className="mr-2 font-bold text-sm">New name:</span>
                                            <span className="text-sm">{warning.new}</span>
                                        </div></div>}
                                    {warning.key == 'HEURISTIC' && <div className="flex flex-col gap-y-2">
                                        <span className="text-sm">
                                            <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.LABELING_TASK.OPEN_HEURISTICS} placement="right" color="invert">
                                                <a href={'../heuristics/' + warning.id} target="_blank"
                                                    className="cursor-pointer underline font-bold">
                                                    Current source code:</a>
                                            </Tooltip>
                                        </span>
                                        <Highlight text={warning.oldParsed} searchFor={warning.old_highlighting} />
                                        <span className="text-sm font-bold text-left">Suggested changes:</span>
                                        <Highlight text={warning.newParsed} searchFor={warning.new_highlighting} />
                                    </div>}
                                    <button onClick={() => handleLabelRenameWarning(warning)}
                                        className="self-center mt-2 bg-green-100 text-green-700 border border-green-400 text-xs font-semibold px-4 py-2 rounded-md hover:bg-green-200 focus:outline-none">Change</button>
                                </div>
                            </div>
                        ))}
                    </div>}
                </div>
            </div >}
        </Modal >
    )
}