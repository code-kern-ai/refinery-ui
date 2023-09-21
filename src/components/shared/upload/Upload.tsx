import { UploadFileType, UploadProps, UploadState, UploadStates, UploadTask, UploadType } from "@/src/types/shared/upload";
import { useDispatch, useSelector } from "react-redux";
import UploadField from "./helper-components/UploadField";
import CryptedField from "./helper-components/CryptedField";
import { useEffect, useState } from "react";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import UploadWrapper from "./helper-components/UploadWrapper";
import { selectUploadData } from "@/src/reduxStore/states/upload";
import { useLazyQuery, useMutation } from "@apollo/client";
import { CREATE_PROJECT, DELETE_PROJECT, GET_UPLOAD_CREDENTIALS_AND_ID, GET_UPLOAD_TASK_BY_TASK_ID, UPDATE_PROJECT_STATUS, UPDATE_PROJECT_TOKENIZER } from "@/src/services/gql/mutations/projects";
import { setActiveProject } from "@/src/reduxStore/states/project";
import { ProjectStatus } from "@/src/types/components/projects/projects-list";
import { timer } from "rxjs";
import { uploadFile } from "@/src/services/base/s3-service";


const SELECTED_TOKENIZER_RECORD_NEW = 'English (en_core_web_sm)';
const SELECTED_TOKENIZER_PROJECT = '(en_core_web_sm)';

export default function Upload(props: UploadProps) {
    const dispatch = useDispatch();
    const uploadFileType = useSelector(selectUploadData).uploadFileType;
    const importOptions = useSelector(selectUploadData).importOptions;

    const [selectedFile, setSelectedFile] = useState(null as File);
    const [projectTitle, setProjectTitle] = useState<string>("");
    const [projectDescription, setProjectDescription] = useState<string>("");
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [uploadStarted, setUploadStarted] = useState<boolean>(false);
    const [doingSomething, setDoingSomething] = useState<boolean>(false);
    const [progressState, setProgressState] = useState<UploadState>(null);
    const [uploadTask, setUploadTask] = useState<any>(null);

    const [createProjectMut] = useMutation(CREATE_PROJECT);
    const [deleteProjectMut] = useMutation(DELETE_PROJECT);
    const [updateProjectTokenizerMut] = useMutation(UPDATE_PROJECT_TOKENIZER);
    const [updateProjectStatusMut] = useMutation(UPDATE_PROJECT_STATUS);
    const [uploadCredentialsMut] = useLazyQuery(GET_UPLOAD_CREDENTIALS_AND_ID);
    const [getUploadTaskId] = useLazyQuery(GET_UPLOAD_TASK_BY_TASK_ID, { fetchPolicy: 'network-only' });

    useEffect(() => {
        if (props.startUpload) {
            submitUpload();
        }
    }, [props.startUpload]);

    function submitUpload() {
        setSubmitted(true);
        if (uploadFileType == UploadFileType.RECORDS_NEW) {
            createProjectMut({ variables: { name: projectTitle, description: projectDescription } }).then((res) => {
                const project = res.data.createProject['project'];
                dispatch(setActiveProject(project));
                executeUploadFile(project.id);
            })
        } else if (uploadFileType == UploadFileType.PROJECT) {
            createProjectMut({ variables: { name: props.uploadOptions.projectName, description: "Created during file upload " + selectedFile?.name } }).then((res) => {
                const project = res.data.createProject['project'];
                dispatch(setActiveProject(project));
                executeUploadFile(project.id);
            });
        }
    }

    function executeUploadFile(projectId: string) {
        updateTokenizerAndProjectStatus(projectId);
        reSubscribeToNotifications();
        const finalFinalName = getFileNameBasedOnType();
        const importOptionsPrep = uploadFileType == UploadFileType.RECORDS_NEW ? importOptions : '';
        finishUpUpload(finalFinalName, importOptionsPrep, projectId);
    }

    function updateTokenizerAndProjectStatus(projectId: string) {
        let tokenizer = "";
        if (uploadFileType == UploadFileType.RECORDS_NEW) {
            tokenizer = SELECTED_TOKENIZER_RECORD_NEW.split('(')[1].split(')')[0];
        } else {
            tokenizer = SELECTED_TOKENIZER_PROJECT;
        }
        updateProjectTokenizerMut({ variables: { projectId: projectId, tokenizer: tokenizer } }).then((res) => {
            updateProjectStatusMut({ variables: { projectId: projectId, newStatus: ProjectStatus.INIT_COMPLETE } })
        });
    }

    function reSubscribeToNotifications() {

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

    function finishUpUpload(finalFinalName: string, importOptionsPrep: string, projectId: string) {
        let keyTosend = null; // TODO: update this with the key once the crypted key component is implemented
        // if(!keyTosend) keyToSend = null;
        uploadCredentialsMut({ variables: { projectId: projectId, fileName: finalFinalName, fileType: uploadFileType, fileImportOptions: importOptionsPrep, uploadType: UploadType.DEFAULT, key: keyTosend } }).then((results) => {
            const credentialsAndUploadId = JSON.parse(JSON.parse(results.data['uploadCredentialsAndId']));
            uploadFileToMinio(credentialsAndUploadId, finalFinalName, projectId);
        });
    }

    function uploadFileToMinio(credentialsAndUploadId: any, fileName: string, projectId: string) {
        setUploadStarted(true);
        setDoingSomething(true);
        getUploadTaskId({ variables: { projectId: projectId, uploadTaskId: credentialsAndUploadId.uploadTaskId, } }).then((res) => {
            const task = res.data['uploadTaskById'];
            handleUploadTaskResult(task);
            uploadFile(credentialsAndUploadId, selectedFile, fileName).subscribe((progress) => {
                setProgressState(progress);
                if (progress.state === UploadStates.DONE || progress.state === UploadStates.ERROR) {
                    timer(500).subscribe(() => {
                        setSubmitted(false);
                    });
                    if (progress.state === UploadStates.ERROR && props.uploadOptions.deleteProjectOnFail) {
                        deleteExistingProject(projectId);
                        setSubmitted(false);
                    }
                }
                getUploadTaskId({ variables: { projectId: projectId, uploadTaskId: credentialsAndUploadId.uploadTaskId, } }).then((res) => {
                    const task = res.data['uploadTaskById'];
                    handleUploadTaskResult(task);
                });
            });
        })
    }

    function handleUploadTaskResult(task: UploadTask) {
        setUploadTask(task);
        setDoingSomething(true);
        if (task.state == UploadStates.DONE || task.progress == 100) {
            clearUploadTask();
            if (props.uploadOptions.reloadOnFinish) location.reload();
            else setUploadStarted(false);
        }
    }

    function clearUploadTask() {
        setUploadTask(null);
        setProgressState(null);
        setDoingSomething(false);
    }


    function deleteExistingProject(projectId: string) {
        deleteProjectMut({ variables: { projectId: projectId } }).then((res) => {
            props.refetchProjects();
        });
    }

    return (
        <section className={`${!props.uploadOptions.isModal ? 'p-4' : ''}`}>
            {uploadFileType == UploadFileType.PROJECT && (<>
                <UploadField uploadStarted={uploadStarted} doingSomething={doingSomething} uploadTask={uploadTask} progressState={progressState} sendSelectedFile={(file) => setSelectedFile(file)} />
                <CryptedField />
                {props.uploadOptions.showBadPasswordMsg && (<div className="text-red-700 text-xs mt-2 text-center">Wrong password</div>)}
            </>
            )}
            {uploadFileType == UploadFileType.RECORDS_NEW && (<>
                <div className="form-control">
                    <label className="text-gray-500 text-sm font-normal">Project title</label>

                    <div className="flex flex-row">
                        {/* TODO : add on enter to create a new project */}
                        <input type="text" value={projectTitle} onInput={(e: any) => setProjectTitle(e.target.value)}
                            className="h-9 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" placeholder="Enter some title here..." />
                    </div>
                </div>
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
                    {/* TODO add missing properties */}
                    <Dropdown buttonName={SELECTED_TOKENIZER_RECORD_NEW} options={props.uploadOptions.tokenizerValues} />
                </div>
                <UploadWrapper uploadStarted={uploadStarted} doingSomething={doingSomething} uploadTask={uploadTask} progressState={progressState} isModal={props.uploadOptions.isModal} submitUpload={submitUpload} sendSelectedFile={(file) => setSelectedFile(file)} />
            </>
            )}
        </section>
    )
}
