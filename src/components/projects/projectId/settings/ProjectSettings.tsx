import { useDispatch, useSelector } from "react-redux";
import DataSchema from "./DataSchema";
import { selectProject, setActiveProject } from "@/src/reduxStore/states/project";
import { useCallback, useEffect, useState } from "react";
import { selectAttributes, selectEmbeddings, setAllAttributes, setAllEmbeddings, setAllRecommendedEncodersDict, setLabelingTasksAll, setRecommendedEncodersAll } from "@/src/reduxStore/states/pages/settings";
import { timer } from "rxjs";
import { IconCamera, IconCheck, IconDots, IconPlus, IconUpload } from "@tabler/icons-react";
import { ModalEnum } from "@/src/types/shared/modal";
import { openModal, setModalStates } from "@/src/reduxStore/states/modal";
import { useRouter } from "next/router";
import { setUploadFileType } from "@/src/reduxStore/states/upload";
import { UploadFileType } from "@/src/types/shared/upload";
import { Tooltip } from "@nextui-org/react";
import ProjectMetaData from "./ProjectMetaData";
import { selectAllUsers, selectIsManaged, selectOrganizationId, setBricksIntegrator, setComments } from "@/src/reduxStore/states/general";
import Embeddings from "./embeddings/Embeddings";
import { postProcessingEmbeddings, postProcessingRecommendedEncoders } from "@/src/util/components/projects/projectId/settings/embeddings-helper";
import { AttributeState } from "@/src/types/components/projects/projectId/settings/data-schema";
import { RecommendedEncoder } from "@/src/types/components/projects/projectId/settings/embeddings";
import LabelingTasks from "./labeling-tasks/LabelingTasks";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import Export from "@/src/components/shared/export/Export";
import { CommentType } from "@/src/types/shared/comments";
import { CommentDataManager } from "@/src/util/classes/comments";
import CreateNewAttributeModal from "./CreateNewAttributeModal";
import ProjectSnapshotExportModal from "./ProjectSnapshotExportModal";
import { postProcessLabelingTasks, postProcessLabelingTasksSchema } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { getEmptyBricksIntegratorConfig } from "@/src/util/shared/bricks-integrator-helper";
import { useWebsocket } from "@/submodules/react-components/hooks/web-socket/useWebsocket";
import { getLabelingTasksByProjectId, getProjectByProjectId, getProjectTokenization } from "@/src/services/base/project";
import { getAllComments } from "@/src/services/base/comment";
import { getAttributes, getCheckCompositeKey } from "@/src/services/base/attribute";
import { getEmbeddings, getRecommendedEncoders } from "@/src/services/base/embedding";
import { getQueuedTasks } from "@/src/services/base/project-setting";
import { Application, CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";

export default function ProjectSettings() {
    const dispatch = useDispatch();
    const router = useRouter();

    const project = useSelector(selectProject);
    const attributes = useSelector(selectAttributes);
    const embeddings = useSelector(selectEmbeddings);
    const allUsers = useSelector(selectAllUsers);

    const [pKeyValid, setPKeyValid] = useState<boolean | null>(null);
    const [pKeyCheckTimer, setPKeyCheckTimer] = useState(null);
    const [isAcRunning, setIsAcRunning] = useState(false);
    const [tokenizationProgress, setTokenizationProgress] = useState(null);
    const [checkIfAcUploadedRecords, setCheckIfAcUploadedRecords] = useState(false);

    useEffect(() => {
        if (!project) return;
        refetchAttributesAndPostProcess();
        refetchEmbeddingsAndPostProcess();
        refetchLabelingTasksAndProcess();
        checkProjectTokenization();

        const openModal = JSON.parse(localStorage.getItem("openModal"));
        if (openModal) {
            dispatch(setModalStates(ModalEnum.ADD_LABELING_TASK, { open: true }));
            localStorage.removeItem("openModal");
        }
        dispatch(setBricksIntegrator(getEmptyBricksIntegratorConfig()));
    }, [project]);

    useEffect(() => {
        if (!project) return;
        requestPKeyCheck();
        getRecommendedEncoders(project.id, (res) => {
            const encoderSuggestions = res['data']['recommendedEncoders'].filter(e => e.tokenizers.includes("all") || e.tokenizers.includes(project.tokenizer));
            dispatch(setRecommendedEncodersAll(encoderSuggestions as RecommendedEncoder[]));
            dispatch(setAllRecommendedEncodersDict(postProcessingRecommendedEncoders(attributes, project.tokenizer, res['data']['recommendedEncoders'])));
        });

    }, [attributes]);

    useEffect(() => {
        if (!project || allUsers.length == 0) return;
        setUpCommentsRequests();
    }, [allUsers, project]);

    function setUpCommentsRequests() {
        const requests = [];
        requests.push({ commentType: CommentType.LABELING_TASK, projectId: project.id });
        requests.push({ commentType: CommentType.ATTRIBUTE, projectId: project.id });
        requests.push({ commentType: CommentType.EMBEDDING, projectId: project.id });
        requests.push({ commentType: CommentType.LABEL, projectId: project.id });
        CommentDataManager.unregisterCommentRequests(CurrentPage.PROJECT_SETTINGS);
        CommentDataManager.registerCommentRequests(CurrentPage.PROJECT_SETTINGS, requests);
        const requestJsonString = CommentDataManager.buildRequestJSON();
        getAllComments(requestJsonString, (res) => {
            CommentDataManager.parseCommentData(res.data['getAllComments']);
            CommentDataManager.parseToCurrentData(allUsers);
            dispatch(setComments(CommentDataManager.currentDataOrder));
        });
    }

    function refetchAttributesAndPostProcess() {
        getAttributes(project.id, ['ALL'], (res) => {
            dispatch(setAllAttributes(res.data['attributesByProjectId']));
        });
    }

    function refetchEmbeddingsAndPostProcess() {
        getEmbeddings(project.id, (res) => {
            getQueuedTasks(project.id, "EMBEDDING", (queuedTasks) => {
                const queuedEmbeddings = queuedTasks.data['queuedTasks'].map((task) => {
                    const copy = { ...task };
                    return copy;
                })
                dispatch(setAllEmbeddings(postProcessingEmbeddings(res.data['projectByProjectId']['embeddings']['edges'].map((e) => e['node']), queuedEmbeddings)));
            });
        });
    }

    function requestPKeyCheck() {
        if (!project) return;
        setPKeyValid(null);
        if (pKeyCheckTimer) pKeyCheckTimer.unsubscribe();
        const tmpTimer = timer(500).subscribe(() => {
            getCheckCompositeKey(project.id, (res) => {
                setPKeyCheckTimer(null);
                if (anyPKey()) setPKeyValid(res.data['checkCompositeKey']);
                else setPKeyValid(null);
            });
        });
        setPKeyCheckTimer(tmpTimer);
    }

    function anyPKey() {
        if (!attributes) return false;
        for (let i = 0; i < attributes.length; i++) {
            if (attributes[i].isPrimaryKey) return true;
        }
        return false;
    }

    function checkProjectTokenization() {
        getProjectTokenization(project.id, (res) => {
            setTokenizationProgress(res.data['projectTokenization']?.progress);
            setIsAcRunning(checkIfAcRunning());
        });
    }

    function checkIfAcRunning() {
        return attributes.some(a => a.state == AttributeState.RUNNING) || checkIfAcUploadedRecords;
    }

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (!project.id) return;
        if (msgParts[1] == 'embedding') {
            if (!embeddings) return;
            if (["queued", "dequeued"].includes(msgParts[2])) {
                refetchAttributesAndPostProcess();
                refetchEmbeddingsAndPostProcess();
                return;
            }
            if (msgParts[4] == "INITIALIZING" || msgParts[4] == "WAITING") {
                timer(100).subscribe(() => refetchEmbeddingsAndPostProcess());
                return;
            }

            getEmbeddings(project.id, (res) => {
                getQueuedTasks(project.id, "EMBEDDING", (queuedTasks) => {
                    const queuedEmbeddings = queuedTasks.data['queuedTasks'].map((task) => {
                        const copy = { ...task };
                        return copy;
                    })
                    const newEMbeddings = postProcessingEmbeddings(res.data['projectByProjectId']['embeddings']['edges'].map((e) => e['node']), queuedEmbeddings);
                    for (let e of newEMbeddings) {
                        if (e.id == msgParts[2]) {
                            if (msgParts[3] == "state") {
                                if (msgParts[4] == "FINISHED") {
                                    refetchEmbeddingsAndPostProcess();
                                }
                                else {
                                    const embedding = { ...e };
                                    embedding.state = msgParts[4];
                                    dispatch(setAllEmbeddings(newEMbeddings.map((e) => e.id == embedding.id ? embedding : e)));
                                }
                            }
                            else if (msgParts[3] == "progress") {
                                const embedding = { ...e };
                                embedding.progress = Number(msgParts[4]);
                                dispatch(setAllEmbeddings(newEMbeddings.map((e) => e.id == embedding.id ? embedding : e)));
                            }
                            else console.log("unknown websocket message in part 3:" + msgParts[3], "full message:", msgParts)
                            return;
                        }
                    }
                });
            });

        } else if (msgParts[1] == 'tokenization' && msgParts[2] == 'docbin') {
            if (msgParts[3] == 'progress') {
                setTokenizationProgress(Number(msgParts[4]));
            } else if (msgParts[3] == 'state') {
                if (msgParts[4] == 'IN_PROGRESS') setTokenizationProgress(0);
                else if (msgParts[4] == 'FINISHED') {
                    timer(5000).subscribe(() => checkProjectTokenization());
                }
            }
        } else if (msgParts[1] == 'attributes_updated') {
            refetchAttributesAndPostProcess();
        } else if (msgParts[1] == 'project_update' && msgParts[2] == project.id) {
            getProjectByProjectId(project.id, (res) => {
                dispatch(setActiveProject(res.data["projectByProjectId"]));
            })
        }
        else if (msgParts[1] == 'calculate_attribute') {
            if (msgParts[2] == 'started' && msgParts[3] == 'all') {
                setCheckIfAcUploadedRecords(true);
                setIsAcRunning(checkIfAcRunning());

            } else if (msgParts[2] == 'finished' && msgParts[3] == 'all') {
                setCheckIfAcUploadedRecords(false);
                setIsAcRunning(checkIfAcRunning());
                timer(5000).subscribe(() => checkProjectTokenization());
            } else {
                getAttributes(project.id, ['ALL'], (res) => {
                    dispatch(setAllAttributes(res.data['attributesByProjectId']));
                    setIsAcRunning(checkIfAcRunning());
                });
                if (msgParts[2] == 'finished') timer(5000).subscribe(() => checkProjectTokenization());
            }
        } else if (msgParts[1] == 'embedding_deleted') {
            refetchEmbeddingsAndPostProcess();
        } else if (['label_created', 'label_deleted', 'labeling_task_deleted', 'labeling_task_updated', 'labeling_task_created'].includes(msgParts[1])) {
            refetchLabelingTasksAndProcess();
        }
    }, [project, embeddings, isAcRunning, tokenizationProgress]);

    function refetchLabelingTasksAndProcess() {
        getLabelingTasksByProjectId(project.id, (res) => {
            const labelingTasks = postProcessLabelingTasks(res['data']['projectByProjectId']['labelingTasks']['edges']);
            dispatch(setLabelingTasksAll(postProcessLabelingTasksSchema(labelingTasks)));
        });
    }

    const orgId = useSelector(selectOrganizationId);
    useWebsocket(orgId, Application.REFINERY, CurrentPage.PROJECT_SETTINGS, handleWebsocketNotification, project?.id);

    return (<div>
        {project != null && <div className="p-4 bg-gray-100 h-full flex-1 flex flex-col overflow-y-auto">
            <DataSchema isAcOrTokenizationRunning={isAcRunning || tokenizationProgress < 1} pKeyValid={pKeyValid} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-1 align-top">
                <div className="items-center flex flex-row">
                    <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.ADD_NEW_ATTRIBUTE} color="invert" placement="bottom">
                        <button onClick={() => dispatch(openModal(ModalEnum.CREATE_NEW_ATTRIBUTE))} className="mr-1 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                            <IconPlus className="mr-1 h-5 w-5 inline-block" />
                            Add new attribute
                        </button>
                    </Tooltip>
                    <Tooltip content={isAcRunning ? 'Attribute calculation in progress' : tokenizationProgress < 1 ? 'Tokenization in progress' : 'Upload more records to the project'} placement="right" color="invert">
                        <button disabled={isAcRunning || tokenizationProgress < 1} onClick={() => {
                            dispatch(setUploadFileType(UploadFileType.RECORDS_ADD));
                            router.push(`/projects/${project.id}/upload-records`);
                        }}
                            className={`mr-1 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}>
                            <IconUpload className="mr-1 h-5 w-5 inline-block" />
                            Upload records
                        </button>
                    </Tooltip>
                    <Export />
                    <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.PROJECT_SNAPSHOT} placement="bottom" color="invert">
                        <button onClick={() => dispatch(openModal(ModalEnum.PROJECT_SNAPSHOT))}
                            className="mr-1 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                            <IconCamera className="mr-1 h-5 w-5 inline-block" />
                            Create project snapshot
                        </button>
                    </Tooltip>
                </div>
                <div className="text-left lg:text-right flex flex-row items-center justify-end">
                    <Tooltip content={project.tokenizer} color="invert" placement="bottom" className="cursor-auto">
                        <div className="font-medium inline-block">
                            <span className="cursor-help underline filtersUnderline">Tokenization</span>
                        </div>
                    </Tooltip>
                    <div className="ml-2 w-8/12 items-center px-2.5 py-1.5 border border-gray-300 shadow text-xs font-medium rounded-md text-gray-700 bg-white relative">
                        {tokenizationProgress != 0 && <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="bg-green-300 h-2.5 rounded-full" style={{ 'width': (tokenizationProgress * 100) + '%' }}>
                            </div>
                        </div>}
                        {tokenizationProgress == 1 && <div className="absolute md:rounded-lg top-0 left-0 right-0 bottom-0 flex flex-row items-center justify-center" style={{ backgroundColor: '#f4f4f5bf' }}>
                            <IconCheck className="h-4 w-4 text-green-700" />
                            <span className="text-sm font-medium text-green-700">Completed</span>
                        </div>}
                        {tokenizationProgress == -1 && <div className="absolute md:rounded-lg top-0 left-0 right-0 bottom-0 flex flex-row items-center justify-center" style={{ backgroundColor: '#f4f4f5bf' }}>
                            <IconDots className="h-4 w-4 text-gray-700" />
                            <span className="text-sm font-medium text-gray-700">Queued</span>
                        </div>}
                        {!tokenizationProgress && <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="bg-green-300 h-2.5 rounded-full" style={{ 'width': '0%' }}>
                            </div>
                        </div>}
                    </div>
                </div>
            </div>

            <Embeddings refetchEmbeddings={refetchEmbeddingsAndPostProcess} />
            <LabelingTasks />
            <ProjectMetaData />
            <CreateNewAttributeModal />
            <ProjectSnapshotExportModal ></ProjectSnapshotExportModal>
        </div >}
    </div >)
}