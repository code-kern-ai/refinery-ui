import { UploadFileType, UploadProps, UploadState, UploadStates, UploadTask, UploadType } from "@/src/types/shared/upload";
import { useDispatch, useSelector } from "react-redux";
import UploadField from "./helper-components/UploadField";
import { useEffect, useState } from "react";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import UploadWrapper from "./helper-components/UploadWrapper";
import { selectUploadData, setImportOptions } from "@/src/reduxStore/states/upload";
import { useLazyQuery, useMutation } from "@apollo/client";
import { CREATE_PROJECT, DELETE_PROJECT, GET_UPLOAD_CREDENTIALS_AND_ID, GET_UPLOAD_TASK_BY_TASK_ID, UPDATE_PROJECT_STATUS, UPDATE_PROJECT_TOKENIZER } from "@/src/services/gql/mutations/projects";
import { ProjectStatus } from "@/src/types/components/projects/projects-list";
import { timer } from "rxjs";
import { uploadFile } from "@/src/services/base/s3-service";
import { CurrentPage } from "@/src/types/shared/general";
import { WebSocketsService } from "@/src/services/base/web-sockets/misc";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { useRouter } from "next/router";
import { extendAllProjects, removeFromAllProjectsById, selectAllProjects } from "@/src/reduxStore/states/project";
import CryptedField from "../crypted-field/CryptedField";


const SELECTED_TOKENIZER_RECORD_NEW = 'English (en_core_web_sm)';
const SELECTED_TOKENIZER_PROJECT = '(en_core_web_sm)';

export class UploadHelper {
    private static projectId: string | null = null;
    private static uploadTask: UploadTask | null = null;
    public static setProjectId(projectId: string) {
        UploadHelper.projectId = projectId;
    }

    public static getProjectId() {
        return UploadHelper.projectId;
    }

    public static setUploadTask(uploadTask: UploadTask) {
        UploadHelper.uploadTask = uploadTask;
    }

    public static getUploadTask() {
        return UploadHelper.uploadTask;
    }
}


export default function Upload(props: UploadProps) {
    const router = useRouter();
    const dispatch = useDispatch();

    const uploadFileType = useSelector(selectUploadData).uploadFileType;
    const importOptions = useSelector(selectUploadData).importOptions;
    const projects = useSelector(selectAllProjects);

    const [selectedFile, setSelectedFile] = useState(null as File);
    const [projectTitle, setProjectTitle] = useState<string>("");
    const [projectDescription, setProjectDescription] = useState<string>("");
    const [tokenizer, setTokenizer] = useState<string>(SELECTED_TOKENIZER_RECORD_NEW);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [uploadStarted, setUploadStarted] = useState<boolean>(false);
    const [doingSomething, setDoingSomething] = useState<boolean>(false);
    const [progressState, setProgressState] = useState<UploadState>(null);
    const [isProjectTitleDuplicate, setIsProjectTitleDuplicate] = useState<boolean>(false);
    const [isProjectTitleEmpty, setIsProjectTitleEmpty] = useState<boolean>(false);
    const [prepareTokenizedValues, setPrepareTokenizedValues] = useState<any[]>([]);

    const [createProjectMut] = useMutation(CREATE_PROJECT);
    const [deleteProjectMut] = useMutation(DELETE_PROJECT);
    const [updateProjectTokenizerMut] = useMutation(UPDATE_PROJECT_TOKENIZER);
    const [updateProjectStatusMut] = useMutation(UPDATE_PROJECT_STATUS);
    const [uploadCredentialsMut] = useLazyQuery(GET_UPLOAD_CREDENTIALS_AND_ID);
    const [getUploadTaskId] = useLazyQuery(GET_UPLOAD_TASK_BY_TASK_ID, { fetchPolicy: 'network-only' });

    useEffect(() => {
        const handleRouteChange = (url, { shallow }) => {
            WebSocketsService.unsubscribeFromNotifications(CurrentPage.PROJECTS);
            WebSocketsService.unsubscribeFromNotifications(CurrentPage.NEW_PROJECT);
        };
        router.events.on('routeChangeStart', handleRouteChange);
        return () => {
            router.events.off('routeChangeStart', handleRouteChange);
        };
    }, []);


    useEffect(() => {
        const tokenizerValuesDisplay = [];
        props.uploadOptions.tokenizerValues?.forEach((tokenizer: any, index: number) => {
            const tokenizerNameContainsBrackets = tokenizer.name.includes('(') && tokenizer.name.includes(')');
            tokenizer.name = tokenizer.name + (tokenizer.configString != undefined && !tokenizerNameContainsBrackets ? ` (${tokenizer.configString})` : '');
            tokenizerValuesDisplay[index] = tokenizer;
        });
        setPrepareTokenizedValues(tokenizerValuesDisplay);
    }, [props.uploadOptions.tokenizerValues]);

    useEffect(() => {
        if (props.startUpload) {
            submitUpload();
        }
    }, [props.startUpload]);

    function subscribeToNotifications(): void {
        if (uploadFileType == UploadFileType.PROJECT) {
            WebSocketsService.subscribeToNotifications(CurrentPage.PROJECTS, {
                whitelist: ['file_upload'],
                func: handleWebsocketNotification
            });
        } else {
            WebSocketsService.subscribeToNotifications(CurrentPage.NEW_PROJECT, {
                projectId: UploadHelper.getProjectId(),
                whitelist: ['file_upload'],
                func: handleWebsocketNotification
            });
        }
    }

    function handleWebsocketNotification(msgParts: string[]) {
        const uploadTask = UploadHelper.getUploadTask();
        const projectId = UploadHelper.getProjectId();
        if (!uploadTask) return;
        if (msgParts[2] != uploadTask.id) return;
        if (msgParts[3] == 'state') {
            if (msgParts[4] == UploadStates.DONE) {
                getUploadTaskId({ variables: { projectId: projectId, uploadTaskId: uploadTask.id, } }).then((res) => {
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
                const uploadTaskSave = jsonCopy(uploadTask);
                uploadTaskSave.state = msgParts[4];
                UploadHelper.setUploadTask(uploadTaskSave);
            }
        } else if (msgParts[3] == 'progress') {
            if (msgParts[4] == "100") {
                getUploadTaskId({ variables: { projectId: projectId, uploadTaskId: uploadTask.id, } }).then((res) => {
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
    }

    function submitUpload() {
        setSubmitted(true);
        if (!selectedFile) return;
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
        }
    }

    function executeUploadFile() {
        updateTokenizerAndProjectStatus();
        reSubscribeToNotifications();
        const finalFinalName = getFileNameBasedOnType();
        const importOptionsPrep = uploadFileType == UploadFileType.RECORDS_NEW ? importOptions : '';
        finishUpUpload(finalFinalName, importOptionsPrep);
    }

    function updateTokenizerAndProjectStatus() {
        let tokenizerPrep = "";
        if (uploadFileType == UploadFileType.RECORDS_NEW) {
            tokenizerPrep = tokenizer.split('(')[1].split(')')[0];
        } else {
            tokenizerPrep = SELECTED_TOKENIZER_PROJECT;
        }
        updateProjectTokenizerMut({ variables: { projectId: UploadHelper.getProjectId(), tokenizer: tokenizerPrep } }).then((res) => {
            updateProjectStatusMut({ variables: { projectId: UploadHelper.getProjectId(), newStatus: ProjectStatus.INIT_COMPLETE } })
        });
    }

    function reSubscribeToNotifications() {
        WebSocketsService.unsubscribeFromNotifications(CurrentPage.PROJECTS);
        WebSocketsService.unsubscribeFromNotifications(CurrentPage.NEW_PROJECT);
        subscribeToNotifications();
    }

    function getFileNameBasedOnType() {
        const fileName = selectedFile?.name;
        switch (uploadFileType) {
            case UploadFileType.RECORDS_NEW || UploadFileType.RECORDS_ADD:
                return fileName + "_SCALE";
            case UploadFileType.KNOWLEDGE_BASE:
                return fileName + "_KB"; // TODO : add knowledge base id
            default:
                return fileName;
        }
    }

    function finishUpUpload(finalFinalName: string, importOptionsPrep: string) {
        let keyTosend = null; // TODO: update this with the key once the crypted key component is implemented
        // if(!keyTosend) keyToSend = null;
        uploadCredentialsMut({ variables: { projectId: UploadHelper.getProjectId(), fileName: finalFinalName, fileType: uploadFileType, fileImportOptions: importOptionsPrep, uploadType: UploadType.DEFAULT, key: keyTosend } }).then((results) => {
            const credentialsAndUploadId = JSON.parse(JSON.parse(results.data['uploadCredentialsAndId']));
            uploadFileToMinio(credentialsAndUploadId, finalFinalName);
        });
    }

    function uploadFileToMinio(credentialsAndUploadId: any, fileName: string) {
        setUploadStarted(true);
        setDoingSomething(true);
        getUploadTaskId({ variables: { projectId: UploadHelper.getProjectId(), uploadTaskId: credentialsAndUploadId.uploadTaskId, } }).then((res) => {
            const task = res.data['uploadTaskById'];
            handleUploadTaskResult(task);
            uploadFile(credentialsAndUploadId, selectedFile, fileName).subscribe((progress) => {
                setProgressState(progress);
                if (progress.state === UploadStates.DONE || progress.state === UploadStates.ERROR) {
                    timer(500).subscribe(() => {
                        setSelectedFile(null);
                        setSubmitted(false);
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
            if (props.uploadOptions.reloadOnFinish) location.reload();
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
        setTokenizer(SELECTED_TOKENIZER_RECORD_NEW);
        dispatch(setImportOptions(""));
    }

    function deleteExistingProject() {
        const projectId = UploadHelper.getProjectId();
        deleteProjectMut({ variables: { projectId: projectId } }).then((res) => {
            dispatch(removeFromAllProjectsById(projectId));
        });
    }

    function checkIfProjectTitleExists() {
        const findProjectName = projects.find((project) => project.name == projectTitle);
        if (findProjectName) setIsProjectTitleDuplicate(true);
        else setIsProjectTitleDuplicate(false);
    }

    return (
        <section className={`${!props.uploadOptions.isModal ? 'p-4' : ''}`}>
            {uploadFileType == UploadFileType.PROJECT && (<>
                <UploadField isFileCleared={selectedFile == null} uploadStarted={uploadStarted} doingSomething={doingSomething} progressState={progressState} sendSelectedFile={(file) => setSelectedFile(file)} />
                {/* TODO: Add crypted field */}
                {/* <CryptedField /> */}
                {props.uploadOptions.showBadPasswordMsg && (<div className="text-red-700 text-xs mt-2 text-center">Wrong password</div>)}
            </>
            )}
            {uploadFileType == UploadFileType.RECORDS_NEW && (<>
                <div className="form-control">
                    <label className="text-gray-500 text-sm font-normal">Project title</label>
                    <div className="flex flex-row">
                        <input type="text" value={projectTitle} onInput={(e: any) => {
                            if (e.target.value == "") setIsProjectTitleEmpty(true); else setIsProjectTitleEmpty(false);
                            setProjectTitle(e.target.value);
                            checkIfProjectTitleExists();
                        }} onKeyDown={(e) => { if (e.key == 'Enter') submitUpload() }}
                            className="h-9 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" placeholder="Enter some title here..." />
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
                    <Dropdown buttonName={tokenizer} options={prepareTokenizedValues} disabledOptions={props.uploadOptions.tokenizerValues.map((tokenizer: any) => tokenizer.disabled)}
                        selectedOption={(option) => setTokenizer(option)} />
                </div>
                <UploadWrapper uploadStarted={uploadStarted} doingSomething={doingSomething} progressState={progressState} submitted={submitted} isFileCleared={selectedFile == null}
                    isModal={props.uploadOptions.isModal} submitUpload={submitUpload} sendSelectedFile={(file) => setSelectedFile(file)} />
            </>
            )}
        </section>
    )
}
