import { UploadFileType, UploadProps, UploadState, UploadStates, UploadTask, UploadType } from "@/src/types/shared/upload";
import { useDispatch, useSelector } from "react-redux";
import UploadField from "./helper-components/UploadField";
import { useCallback, useEffect, useState } from "react";
import UploadWrapper from "./helper-components/UploadWrapper";
import { selectUploadData, setImportOptions } from "@/src/reduxStore/states/upload";
import { useMutation } from "@apollo/client";
import { CREATE_PROJECT, UPDATE_PROJECT_STATUS, UPDATE_PROJECT_TOKENIZER } from "@/src/services/gql/mutations/projects";
import { ProjectStatus } from "@/src/types/components/projects/projects-list";
import { timer } from "rxjs";
import { uploadFile } from "@/src/services/base/s3-service";
import { CurrentPage, CurrentPageSubKey } from "@/src/types/shared/general";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { useRouter } from "next/router";
import { extendAllProjects, removeFromAllProjectsById, selectAllProjects, selectProjectId } from "@/src/reduxStore/states/project";
import { UPLOAD_TOKENIZERS } from "@/src/util/constants";
import { UploadHelper, ZIP_TYPE } from "@/src/util/classes/upload-helper";
import CryptedField from "../crypted-field/CryptedField";
import { closeModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import Dropdown2 from "@/submodules/react-components/components/Dropdown2";
import { useWebsocket } from "@/src/services/base/web-sockets/useWebsocket";
import { getUploadCredentialsAndId, getUploadTaskById, deleteProject as dlp } from "@/src/services/base/project";

export default function Upload(props: UploadProps) {
    const router = useRouter();
    const dispatch = useDispatch();

    const uploadFileType = useSelector(selectUploadData).uploadFileType;
    const importOptions = useSelector(selectUploadData).importOptions;
    const projects = useSelector(selectAllProjects);
    const projectId = useSelector(selectProjectId);

    const [selectedFile, setSelectedFile] = useState(null as File);
    const [projectTitle, setProjectTitle] = useState<string>("");
    const [projectDescription, setProjectDescription] = useState<string>("");
    const [tokenizer, setTokenizer] = useState<string>(UPLOAD_TOKENIZERS.ENGLISH.FULL_NAME);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [uploadStarted, setUploadStarted] = useState<boolean>(false);
    const [doingSomething, setDoingSomething] = useState<boolean>(false);
    const [progressState, setProgressState] = useState<UploadState>(null);
    const [isProjectTitleDuplicate, setIsProjectTitleDuplicate] = useState<boolean>(false);
    const [isProjectTitleEmpty, setIsProjectTitleEmpty] = useState<boolean>(false);
    const [prepareTokenizedValues, setPrepareTokenizedValues] = useState<any[]>([]);
    const [key, setKey] = useState("");
    const [fileEndsWithZip, setFileEndsWithZip] = useState<boolean>(false);

    const [createProjectMut] = useMutation(CREATE_PROJECT);
    const [updateProjectTokenizerMut] = useMutation(UPDATE_PROJECT_TOKENIZER);
    const [updateProjectStatusMut] = useMutation(UPDATE_PROJECT_STATUS);

    useEffect(() => {
        if (!props.uploadOptions || !props.uploadOptions.tokenizerValues) return;
        const tokenizerValuesDisplay = [...props.uploadOptions.tokenizerValues];
        tokenizerValuesDisplay.forEach((tokenizer: any, index: number) => {
            const tokenizerNameContainsBrackets = tokenizer.name.includes('(') && tokenizer.name.includes(')');
            const tokenizerCopy = { ...tokenizer };
            tokenizerCopy.name = tokenizer.name + (tokenizer.configString != undefined && !tokenizerNameContainsBrackets ? ` (${tokenizer.configString})` : '');
            tokenizerValuesDisplay[index] = tokenizerCopy;
        });
        setPrepareTokenizedValues(tokenizerValuesDisplay);
    }, [props.uploadOptions]);

    useEffect(() => {
        if (props.startUpload) {
            submitUpload();
        }
    }, [props.startUpload]);

    useEffect(() => {
        if (props.isFileUploaded)
            props.isFileUploaded(selectedFile != null);
    }, [selectedFile]);

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        const uploadTask = UploadHelper.getUploadTask();
        const projectId = UploadHelper.getProjectId();
        if (!uploadTask) return;
        if (msgParts[2] != uploadTask.id) return;
        if (msgParts[3] == 'state') {
            if (msgParts[4] == UploadStates.DONE) {
                getUploadTaskById(projectId, uploadTask.id, (res) => {
                    const task = res.data['uploadTaskById'];
                    handleUploadTaskResult(task);
                });
            }
            else if (msgParts[4] == UploadStates.ERROR) {
                resetUpload();
                if (props.uploadOptions.deleteProjectOnFail) {
                    deleteExistingProject();
                    setSubmitted(false);
                    setDoingSomething(false);
                }
            } else {
                const uploadTaskSave = { ...uploadTask };
                uploadTaskSave.state = msgParts[4];
                UploadHelper.setUploadTask(uploadTaskSave);
            }
        } else if (msgParts[3] == 'progress') {
            if (msgParts[4] == "100") {
                getUploadTaskById(projectId, uploadTask.id, (res) => {
                    const task = res.data['uploadTaskById'];
                    handleUploadTaskResult(task);
                });
            }
            else {
                const uploadTaskSave = jsonCopy(uploadTask);
                uploadTaskSave.progress = msgParts[4];
                UploadHelper.setUploadTask(uploadTaskSave);
            }
        } else {
            console.log("unknown websocket message in part 3:" + msgParts[3], "full message:", msgParts)
        }
    }, [props.uploadOptions?.deleteProjectOnFail, props.uploadOptions?.reloadOnFinish]);

    function submitUpload() {
        setSubmitted(true);
        if (!selectedFile || isProjectTitleDuplicate || isProjectTitleEmpty) return;
        if (uploadFileType == UploadFileType.RECORDS_NEW) {
            if (projectTitle.trim() == "") {
                setIsProjectTitleEmpty(true);
                return;
            }
            createProjectMut({ variables: { name: projectTitle, description: projectDescription } }).then((res) => {
                const project = res.data.createProject['project'];
                dispatch(extendAllProjects(project));
                UploadHelper.setProjectId(project.id);
                executeUploadFile();
            })
        } else if (uploadFileType == UploadFileType.PROJECT) {
            createProjectMut({ variables: { name: props.uploadOptions.projectName, description: "Created during file upload " + selectedFile?.name } }).then((res) => {
                const project = res.data.createProject['project'];
                dispatch(extendAllProjects(project));
                UploadHelper.setProjectId(project.id);
                executeUploadFile();
            });
        } else if (uploadFileType == UploadFileType.RECORDS_ADD) {
            UploadHelper.setProjectId(projectId);
            executeUploadFile();
        } else if (uploadFileType == UploadFileType.KNOWLEDGE_BASE) {
            UploadHelper.setProjectId(projectId);
            executeUploadFile();
        }
    }

    function executeUploadFile() {
        updateTokenizerAndProjectStatus();
        const finalFinalName = getFileNameBasedOnType();
        const importOptionsPrep = uploadFileType == UploadFileType.RECORDS_NEW ? importOptions : '';
        finishUpUpload(finalFinalName, importOptionsPrep);
    }

    function updateTokenizerAndProjectStatus() {
        let tokenizerPrep = "";
        if (uploadFileType == UploadFileType.RECORDS_NEW || uploadFileType == UploadFileType.RECORDS_ADD) {
            tokenizerPrep = tokenizer.split('(')[1].split(')')[0];
        } else {
            tokenizerPrep = UPLOAD_TOKENIZERS.ENGLISH.TOKENIZER; // dummy tokenizer, actual value is set during import of project
        }

        updateProjectTokenizerMut({ variables: { projectId: UploadHelper.getProjectId(), tokenizer: tokenizerPrep } }).then((res) => {
            updateProjectStatusMut({ variables: { projectId: UploadHelper.getProjectId(), newStatus: ProjectStatus.INIT_COMPLETE } })
        });
    }

    function getFileNameBasedOnType() {
        const fileName = selectedFile?.name;
        switch (uploadFileType) {
            case UploadFileType.RECORDS_ADD:
            case UploadFileType.RECORDS_NEW:
                return fileName + "_SCALE";
            case UploadFileType.KNOWLEDGE_BASE:
                return fileName + "_" + props.uploadOptions.knowledgeBaseId;
            default:
                return fileName;
        }
    }

    function finishUpUpload(finalFinalName: string, importOptionsPrep: string) {
        let keyToSend = key;
        if (!keyToSend) keyToSend = null;
        getUploadCredentialsAndId(UploadHelper.getProjectId(), finalFinalName, uploadFileType, importOptionsPrep, UploadType.DEFAULT, keyToSend, (results) => {
            const credentialsAndUploadId = JSON.parse(JSON.parse(results.data['uploadCredentialsAndId']));
            uploadFileToMinio(credentialsAndUploadId, finalFinalName);
        });
    }

    function uploadFileToMinio(credentialsAndUploadId: any, fileName: string) {
        setUploadStarted(true);
        setDoingSomething(true);
        getUploadTaskById(UploadHelper.getProjectId(), credentialsAndUploadId.uploadTaskId, (res) => {
            const task = res.data['uploadTaskById'];
            handleUploadTaskResult(task);
            uploadFile(credentialsAndUploadId, selectedFile, fileName).subscribe((progress) => {
                setProgressState(progress);
                if (progress.state === UploadStates.DONE || progress.state === UploadStates.ERROR) {
                    timer(500).subscribe(() => {
                        setSelectedFile(null);
                        setSubmitted(false);
                        dispatch(setImportOptions(""));
                        if (props.uploadOptions.isModal) {
                            dispatch(closeModal(ModalEnum.MODAL_UPLOAD));
                            if (props.closeModalEvent) props.closeModalEvent();
                        }
                    });
                    if (progress.state === UploadStates.ERROR && props.uploadOptions.deleteProjectOnFail) {
                        deleteExistingProject();
                        setSubmitted(false);
                    }
                }
            });
        })
    }

    function handleUploadTaskResult(task: UploadTask) {
        UploadHelper.setUploadTask(task);
        if (task.state == UploadStates.DONE || task.progress == 100) {
            clearUploadTask();
            if (props.uploadOptions && props.uploadOptions.reloadOnFinish) location.reload();
            else setUploadStarted(false);
            router.push('/projects/' + UploadHelper.getProjectId() + '/settings');
        }
    }

    function clearUploadTask() {
        UploadHelper.setUploadTask(null);
        setProgressState(null);
        setDoingSomething(false);
    }

    function resetUpload() {
        setSelectedFile(null);
        clearUploadTask();
        setUploadStarted(false);
        setProjectTitle("");
        setProjectDescription("");
        setTokenizer(UPLOAD_TOKENIZERS.ENGLISH.FULL_NAME);
        dispatch(setImportOptions(""));
    }

    function deleteExistingProject() {
        const projectId = UploadHelper.getProjectId();
        dlp(projectId, (res) => {
            dispatch(removeFromAllProjectsById(projectId));
        });
    }

    function checkIfProjectTitleExists(projectTitle: string) {
        const findProjectName = projects.find((project) => project.name == projectTitle);
        if (findProjectName) setIsProjectTitleDuplicate(true);
        else setIsProjectTitleDuplicate(false);
    }
    useWebsocket(CurrentPage.PROJECTS, handleWebsocketNotification, null, CurrentPageSubKey.FILE_UPLOAD);
    useWebsocket(CurrentPage.UPLOAD_RECORDS, handleWebsocketNotification, UploadHelper.getProjectId());

    return <>
        {props.uploadOptions && <section className={`${!props.uploadOptions.isModal ? 'p-4' : ''}`}>
            {uploadFileType == UploadFileType.PROJECT && (<>
                <UploadField isFileCleared={selectedFile == null} uploadStarted={uploadStarted} doingSomething={doingSomething} progressState={progressState} sendSelectedFile={(file) => {
                    setSelectedFile(file);
                    if (file) {
                        setFileEndsWithZip(file.name.endsWith('.zip'));
                    }
                }} />
                {selectedFile && (selectedFile.type == ZIP_TYPE || fileEndsWithZip) &&
                    <CryptedField placeholder="Enter password if zip file is protected..." keyChange={(key) => setKey(key)} />}
                {props.uploadOptions.showBadPasswordMsg && (<div className="text-red-700 text-xs mt-2 text-center">Wrong password</div>)}
            </>
            )}
            {uploadFileType == UploadFileType.RECORDS_NEW && (<div className="min-h-full h-[calc(100vh-7rem)] overflow-y-auto">
                <div className="form-control">
                    <label className="text-gray-500 text-sm font-normal">Project title</label>
                    <div className="flex flex-row">
                        <input type="text" value={projectTitle} onInput={(e: any) => {
                            if (e.target.value == "") setIsProjectTitleEmpty(true); else setIsProjectTitleEmpty(false);
                            checkIfProjectTitleExists(e.target.value);
                            setProjectTitle(e.target.value);
                        }} onKeyDown={(e) => { if (e.key == 'Enter') submitUpload() }}
                            className="h-9 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" placeholder="Enter some title here..." />
                    </div>
                </div>
                {isProjectTitleDuplicate && (<div className="text-red-700 text-xs mt-2">Project title exists</div>)}
                {isProjectTitleEmpty && (<div className="text-red-700 text-xs mt-2">Project title is required</div>)}
                <div className="form-control mt-6">
                    <label className="text-gray-500 text-sm font-normal">Project description <em>- optional</em></label>
                    <textarea value={projectDescription} onInput={(e: any) => setProjectDescription(e.target.value)}
                        className="h-9 w-full border-gray-300 rounded-md leading-8 placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" placeholder="Enter some description here..."></textarea>
                </div>
                <div className="form-control mt-6">
                    <label className="text-gray-500 text-sm font-normal">
                        Please choose a tokenizer for your project. See our <a
                            href="https://docs.kern.ai/refinery/project-creation-and-data-upload" target="_blank"><span
                                className="underline cursor-pointer">documentation</span></a> for further
                        details.
                    </label>
                    <Dropdown2 buttonName={tokenizer} options={prepareTokenizedValues} disabledOptions={prepareTokenizedValues.map((tokenizer: any) => tokenizer.disabled)}
                        selectedOption={(option) => setTokenizer(option.name)} dropdownItemsClasses="max-h-80 overflow-y-auto" />
                </div>
                <UploadWrapper uploadStarted={uploadStarted} doingSomething={doingSomething} progressState={progressState} submitted={submitted} isFileCleared={selectedFile == null}
                    isModal={props.uploadOptions.isModal} submitUpload={submitUpload} sendSelectedFile={(file) => {
                        setSelectedFile(file);
                    }} setKey={(key) => setKey(key)} />
            </div>
            )}

            {uploadFileType == UploadFileType.RECORDS_ADD && (<div className="min-h-full h-[calc(100vh-7rem)] overflow-y-auto">
                <div className="text-lg leading-6 text-gray-900 font-medium inline-block">
                    Record upload
                </div>
                <div className="text-sm text-gray-500 font-normal mt-2">Add additional records to your project</div>
                <UploadWrapper uploadStarted={uploadStarted} doingSomething={doingSomething} progressState={progressState} submitted={submitted} isFileCleared={selectedFile == null}
                    isModal={props.uploadOptions.isModal} submitUpload={submitUpload} sendSelectedFile={(file) => {
                        setSelectedFile(file);
                    }} setKey={(key) => setKey(key)} /></div>)}

            {uploadFileType == UploadFileType.KNOWLEDGE_BASE && (
                <UploadWrapper uploadStarted={uploadStarted} doingSomething={doingSomething} progressState={progressState} submitted={submitted} isFileCleared={selectedFile == null}
                    isModal={props.uploadOptions.isModal} submitUpload={submitUpload} sendSelectedFile={(file) => {
                        setSelectedFile(file);
                    }} setKey={(key) => setKey(key)} />)
            }
        </section >}
    </>
}
