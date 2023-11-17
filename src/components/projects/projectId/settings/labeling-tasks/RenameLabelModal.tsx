import Modal from "@/src/components/shared/modal/Modal";
import { selectModal, setModalStates } from "@/src/reduxStore/states/modal";
import { selectLabelingTasksAll, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { HANDLE_LABEL_RENAME_WARNING, UPDATE_LABEL_NAME } from "@/src/services/gql/mutations/project-settings";
import { CHECK_RENAME_LABEL } from "@/src/services/gql/queries/project-setting";
import { LabelType, LabelingTask, LabelingTasksProps } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { LabelHelper } from "@/src/util/classes/label-helper";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { IconAlertTriangleFilled, IconInfoCircleFilled, IconTriangleInverted } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Rename', useButton: true }

export default function RenameLabelModal(props: LabelingTasksProps) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const labelingTasksSchema = useSelector(selectLabelingTasksAll);
    const modalRenameLabel = useSelector(selectModal(ModalEnum.RENAME_LABEL));

    const [newLabelName, setNewLabelName] = useState<string>('');

    const [refetchCheckRenameLabel] = useLazyQuery(CHECK_RENAME_LABEL, { fetchPolicy: "no-cache" });
    const [updateLabelNameMut] = useMutation(UPDATE_LABEL_NAME);
    const [handleRenameWarningMut] = useMutation(HANDLE_LABEL_RENAME_WARNING);

    const renameLabel = useCallback(() => {
        updateLabelNameMut({ variables: { projectId: projectId, labelId: modalRenameLabel.label.id, newName: newLabelName } }).then((res) => {
            const labelingTasksSchemaCopy = jsonCopy(labelingTasksSchema);
            const labelingTask = labelingTasksSchemaCopy.find((task: LabelingTask) => task.id == modalRenameLabel.taskId);
            const label = labelingTask.labels.find((label: LabelType) => label.id == modalRenameLabel.label.id);
            label.name = newLabelName;
            dispatch(setLabelingTasksAll(labelingTasksSchemaCopy));
        });
    }, [modalRenameLabel, newLabelName]);

    useEffect(() => {
        props.refetchWS();
    }, [renameLabel]);

    useEffect(() => {
        setAcceptButtonRename({ ...ACCEPT_BUTTON, emitFunction: renameLabel, disabled: LabelHelper.renameLabelData?.checkResults?.errors.length > 0 });
    }, [modalRenameLabel]);

    const [acceptButtonRename, setAcceptButtonRename] = useState<ModalButton>(ACCEPT_BUTTON);

    function checkRenameLabel() {
        refetchCheckRenameLabel({ variables: { projectId: projectId, labelId: modalRenameLabel.label.id, newName: newLabelName } }).then((res: any) => {
            const result = JSON.parse(res.data['checkRenameLabel']);
            result.warnings.forEach(e => {
                e.open = false;
                e.oldParsed = LabelHelper.prepareSourceCode(e.old, e.information_source_name);
                e.newParsed = LabelHelper.prepareSourceCode(e.new, e.information_source_name);
            });
            LabelHelper.renameLabelData.checkResults = result;
            dispatch(setModalStates(ModalEnum.RENAME_LABEL, { ...modalRenameLabel, checkResults: result, open: true }));
        });
    }

    function handleLabelRenameWarning(warning: any) {
        if (warning == null) return;
        handleRenameWarningMut({ variables: { projectId: projectId, warningData: JSON.stringify(warning) } }).then((res) => {
            checkRenameLabel();
        });
    }

    return (
        <Modal modalName={ModalEnum.RENAME_LABEL} acceptButton={acceptButtonRename}>
            {LabelHelper.renameLabelData && modalRenameLabel.label && <div className="flex flex-col gap-y-2">
                <div className="self-center flex flex-row flex-nowrap items-center justify-center">
                    <p className="mr-2 font-bold">Change label name:</p><span
                        className={`border rounded-md py-1 px-2 text-sm font-medium shadow-sm  text-center ${modalRenameLabel.label.color?.backgroundColor} ${modalRenameLabel.label.color?.textColor} ${modalRenameLabel.label.color?.borderColor} ${modalRenameLabel.label.color?.hoverColor}`}>{modalRenameLabel.label.name}</span>
                </div>
                <div className="flex flex-col gap-y-2" style={{ maxHeight: 'calc(80vh - 100px)' }}>
                    <div className="flex flex-row flex-nowrap items-center">
                        <input defaultValue={modalRenameLabel.label.name} onChange={(event) => setNewLabelName(event.target.value)}
                            onInput={(event: any) => LabelHelper.checkInputRenameLabel(event, modalRenameLabel)} onKeyDown={(event: any) => {
                                if (event.key == 'Enter') checkRenameLabel();
                            }}
                            className="h-8 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
                        <button onClick={checkRenameLabel} disabled={!LabelHelper.renameLabelData.canCheck}
                            className={`ml-2 flex-shrink-0 bg-green-100 text-green-700 border border-green-400 text-xs font-semibold px-4 py-2 rounded-md hover:bg-green-200 focus:outline-none ${LabelHelper.renameLabelData.canCheck ? 'opacity-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                            Check Rename</button>
                    </div>
                    {modalRenameLabel?.checkResults?.errors?.length > 0 && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex flex-col">
                        <div className="self-center flex flex-row flex-nowrap items-center -mt-1 mb-1">
                            <strong className="font-bold">Errors detected</strong>
                            <IconAlertTriangleFilled className="h-5 w-5 text-red-400" />
                        </div>
                        {modalRenameLabel?.checkResults?.errors.map((error: any) => (
                            <pre key={error.msg} className="text-sm overflow-x-auto">{error.msg}</pre>
                        ))}
                    </div>}
                    {modalRenameLabel?.checkResults?.infos.length > 0 && <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative flex flex-col">
                        <div className="self-center flex flex-row flex-nowrap items-center -mt-1 mb-1">
                            <strong className="font-bold">Information</strong>
                            <IconInfoCircleFilled className="h-5 w-5 text-blue-400" />
                        </div>
                        {modalRenameLabel?.checkResults?.infos.map((info: any) => (
                            <pre key={info.msg} className="text-sm overflow-x-auto">{info.msg}</pre>
                        ))}
                    </div>}
                    {modalRenameLabel?.checkResults?.warnings?.length > 0 && <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative flex flex-col">
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
                        {modalRenameLabel?.checkResults?.warnings?.map((warning: any) => (
                            <div key={warning.msg} className={`flex flex-col gap-y-1 ${warning.open ? 'border border-yellow-400' : ''} `}>
                                <div className="flex flex-row items-center cursor-pointer" onClick={() => {
                                    const warnings = jsonCopy(modalRenameLabel.checkResults.warnings);
                                    const index = warnings.findIndex((e: any) => e.msg == warning.msg);
                                    warnings[index].open = !warnings[index].open;
                                    const checkResults = jsonCopy(modalRenameLabel.checkResults);
                                    checkResults.warnings = warnings;
                                    dispatch(setModalStates(ModalEnum.RENAME_LABEL, { ...modalRenameLabel, checkResults: checkResults }));
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
                                            <Tooltip content="Open information source in new tab" placement="right" color="invert">
                                                <a href={'../heuristics/' + warning.id} target="_blank"
                                                    className="cursor-pointer underline font-bold">
                                                    Current source code:</a>
                                            </Tooltip>
                                        </span>
                                        <pre>{warning.oldParsed}</pre>
                                        <span className="text-sm font-bold text-left">Suggested changes:</span>
                                        <pre>{warning.newParsed}</pre>
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