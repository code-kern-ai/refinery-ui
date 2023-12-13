import { useDispatch, useSelector } from "react-redux";
import DataSchema from "./DataSchema";
import { selectProject, setActiveProject } from "@/src/reduxStore/states/project";
import { useLazyQuery, useMutation } from "@apollo/client";
import { CHECK_COMPOSITE_KEY, GET_ATTRIBUTES_BY_PROJECT_ID, GET_EMBEDDING_SCHEMA_BY_PROJECT_ID, GET_PROJECT_TOKENIZATION, GET_QUEUED_TASKS, GET_RECOMMENDED_ENCODERS_FOR_EMBEDDINGS } from "@/src/services/gql/queries/project-setting";
import { useCallback, useEffect, useState } from "react";
import { selectAttributes, selectEmbeddings, setAllAttributes, setAllEmbeddings, setAllRecommendedEncodersDict, setRecommendedEncodersAll } from "@/src/reduxStore/states/pages/settings";
import { timer } from "rxjs";
import { IconCamera, IconCheck, IconDots, IconPlus, IconUpload } from "@tabler/icons-react";
import Modal from "@/src/components/shared/modal/Modal";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { openModal, selectModal, setModalStates } from "@/src/reduxStore/states/modal";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { CREATE_USER_ATTRIBUTE } from "@/src/services/gql/mutations/project-settings";
import { useRouter } from "next/router";
import { toPythonFunctionName } from "@/submodules/javascript-functions/python-functions-parser";
import { setUploadFileType } from "@/src/reduxStore/states/upload";
import { UploadFileType } from "@/src/types/shared/upload";
import { GET_PROJECT_BY_ID, REQUEST_COMMENTS } from "@/src/services/gql/queries/projects";
import { WebSocketsService } from "@/src/services/base/web-sockets/WebSocketsService";
import { CurrentPage } from "@/src/types/shared/general";
import ProjectSnapshotExport from "./ProjectSnapshotExport";
import { Tooltip } from "@nextui-org/react";
import ProjectMetaData from "./ProjectMetaData";
import GatesIntegration from "./GatesIntegration";
import { selectAllUsers, selectIsManaged, setComments, setCurrentPage } from "@/src/reduxStore/states/general";
import Embeddings from "./embeddings/Embeddings";
import { DATA_TYPES, findFreeAttributeName, postProcessingAttributes } from "@/src/util/components/projects/projectId/settings/data-schema-helper";
import { postProcessingEmbeddings, postProcessingRecommendedEncoders } from "@/src/util/components/projects/projectId/settings/embeddings-helper";
import { AttributeState } from "@/src/types/components/projects/projectId/settings/data-schema";
import { RecommendedEncoder } from "@/src/types/components/projects/projectId/settings/embeddings";
import LabelingTasks from "./labeling-tasks/LabelingTasks";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { unsubscribeWSOnDestroy } from "@/src/services/base/web-sockets/web-sockets-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import Export from "@/src/components/shared/export/Export";
import { CommentType } from "@/src/types/shared/comments";
import { CommentDataManager } from "@/src/util/classes/comments";

const ACCEPT_BUTTON = { buttonCaption: "Accept", useButton: true, disabled: true }

export default function ProjectSettings() {
    const dispatch = useDispatch();
    const router = useRouter();

    const project = useSelector(selectProject);
    const attributes = useSelector(selectAttributes);
    const isManaged = useSelector(selectIsManaged);
    const embeddings = useSelector(selectEmbeddings);
    const modalCreateNewAtt = useSelector(selectModal(ModalEnum.CREATE_NEW_ATTRIBUTE));
    const allUsers = useSelector(selectAllUsers);

    const [pKeyValid, setPKeyValid] = useState<boolean | null>(null);
    const [pKeyCheckTimer, setPKeyCheckTimer] = useState(null);
    const [isAcRunning, setIsAcRunning] = useState(false);
    const [tokenizationProgress, setTokenizationProgress] = useState(0);
    const [checkIfAcUploadedRecords, setCheckIfAcUploadedRecords] = useState(false);

    const [refetchAttributes] = useLazyQuery(GET_ATTRIBUTES_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchPrimaryKey] = useLazyQuery(CHECK_COMPOSITE_KEY, { fetchPolicy: "no-cache" });
    const [createAttributeMut] = useMutation(CREATE_USER_ATTRIBUTE);
    const [refetchProjectByProjectId] = useLazyQuery(GET_PROJECT_BY_ID, { fetchPolicy: "no-cache" });
    const [refetchProjectTokenization] = useLazyQuery(GET_PROJECT_TOKENIZATION, { fetchPolicy: "no-cache" });
    const [refetchEmbeddings] = useLazyQuery(GET_EMBEDDING_SCHEMA_BY_PROJECT_ID, { fetchPolicy: "no-cache" });
    const [refetchQueuedTasks] = useLazyQuery(GET_QUEUED_TASKS, { fetchPolicy: "no-cache" });
    const [refetchRecommendedEncodersForEmbeddings] = useLazyQuery(GET_RECOMMENDED_ENCODERS_FOR_EMBEDDINGS, { fetchPolicy: "no-cache" });
    const [refetchComments] = useLazyQuery(REQUEST_COMMENTS, { fetchPolicy: "no-cache" });

    useEffect(unsubscribeWSOnDestroy(router, [CurrentPage.PROJECT_SETTINGS]), []);

    useEffect(() => {
        if (!project) return;
        refetchAttributesAndPostProcess();
        refetchEmbeddingsAndPostProcess();
        checkProjectTokenization();
        WebSocketsService.subscribeToNotification(CurrentPage.PROJECT_SETTINGS, {
            projectId: project.id,
            whitelist: ['project_update', 'tokenization', 'calculate_attribute', 'embedding', 'attributes_updated'],
            func: handleWebsocketNotification
        });
    }, [project]);

    useEffect(() => {
        if (!project) return;
        requestPKeyCheck();
        refetchRecommendedEncodersForEmbeddings({ variables: { projectId: project.id } }).then((encoder) => {
            dispatch(setRecommendedEncodersAll(encoder['data']['recommendedEncoders'] as RecommendedEncoder[]));
            dispatch(setAllRecommendedEncodersDict(postProcessingRecommendedEncoders(attributes, project.tokenizer, encoder['data']['recommendedEncoders'])));
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
        refetchComments({ variables: { requested: requestJsonString } }).then((res) => {
            CommentDataManager.parseCommentData(JSON.parse(res.data['getAllComments']));
            CommentDataManager.parseToCurrentData(allUsers);
            dispatch(setComments(CommentDataManager.currentDataOrder));
        });
    }

    const createUserAttribute = useCallback(() => {
        const attributeTypeFinal = DATA_TYPES.find((type) => type.name === modalCreateNewAtt.attributeType).value;
        createAttributeMut({ variables: { projectId: project.id, name: modalCreateNewAtt.attributeName, dataType: attributeTypeFinal } }).then((res) => {
            const id = res?.data?.createUserAttribute.attributeId;
            if (id) {
                localStorage.setItem('isNewAttribute', "X");
                dispatch(setCurrentPage(CurrentPage.ATTRIBUTE_CALCULATION));
                router.push(`/projects/${project.id}/attributes/${id}`);
            }
        });
    }, [modalCreateNewAtt]);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    function refetchAttributesAndPostProcess() {
        refetchAttributes({ variables: { projectId: project.id, stateFilter: ['ALL'] } }).then((res) => {
            dispatch(setAllAttributes(postProcessingAttributes(res.data['attributesByProjectId'])));
        });
    }

    function refetchEmbeddingsAndPostProcess() {
        refetchEmbeddings({ variables: { projectId: project.id } }).then((res) => {
            refetchQueuedTasks({ variables: { projectId: project.id, taskType: "EMBEDDING" } }).then((queuedTasks) => {
                const queuedEmbeddings = queuedTasks.data['queuedTasks'].map((task) => {
                    const copy = { ...task };
                    copy.taskInfo = JSON.parse(task.taskInfo);
                    return copy;
                })
                dispatch(setAllEmbeddings(postProcessingEmbeddings(res.data['projectByProjectId']['embeddings']['edges'].map((e) => e['node']), queuedEmbeddings)));
            });
        });
    }

    function handleAttributeName(value: string) {
        const checkName = attributes.some(attribute => attribute.name == value);
        dispatch(setModalStates(ModalEnum.CREATE_NEW_ATTRIBUTE, { attributeName: toPythonFunctionName(value), duplicateNameExists: checkName }))
    }

    useEffect(() => {
        setAcceptButton({ ...acceptButton, emitFunction: createUserAttribute, disabled: modalCreateNewAtt.duplicateNameExists || modalCreateNewAtt.attributeName.trim() == "" || modalCreateNewAtt.attributeType == null });
    }, [modalCreateNewAtt]);

    function requestPKeyCheck() {
        if (!project) return;
        setPKeyValid(null);
        if (pKeyCheckTimer) pKeyCheckTimer.unsubscribe();
        const tmpTimer = timer(500).subscribe(() => {
            refetchPrimaryKey({ variables: { projectId: project.id } }).then((res) => {
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
        refetchProjectTokenization({ variables: { projectId: project.id } }).then((res) => {
            setTokenizationProgress(res.data['projectTokenization']?.progress);
            setIsAcRunning(checkIfAcRunning());
        });
    }

    function checkIfAcRunning() {
        return attributes.some(a => a.state == AttributeState.RUNNING) || checkIfAcUploadedRecords;
    }

    function handleWebsocketNotification(msgParts: string[]) {
        if (msgParts[1] == 'embedding') {
            if (!embeddings) return;
            if (["queued", "dequeued"].includes(msgParts[2])) {
                refetchAttributesAndPostProcess();
                refetchEmbeddingsAndPostProcess();
                return;
            }
            if (msgParts[4] == "INITIALIZING" || msgParts[4] == "WAITING") {
                timer(100).subscribe(() => refetchEmbeddingsAndPostProcess());
            }
            for (let e of embeddings) {
                if (e.id == msgParts[2]) {
                    if (msgParts[3] == "state") {
                        if (msgParts[4] == "FINISHED") {
                            refetchEmbeddingsAndPostProcess();
                        }
                        else {
                            const embedding = jsonCopy(e);
                            embedding.state = msgParts[4];
                            dispatch(setAllEmbeddings(embeddings.map((e) => e.id == embedding.id ? embedding : e)));
                        }
                    }
                    else if (msgParts[3] == "progress") {
                        const embedding = jsonCopy(e);
                        embedding.progress = Number(msgParts[4]);
                        dispatch(setAllEmbeddings(embeddings.map((e) => e.id == embedding.id ? embedding : e)));
                    }
                    else console.log("unknown websocket message in part 3:" + msgParts[3], "full message:", msgParts)
                    return;
                }
            }
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
            refetchProjectByProjectId({ variables: { projectId: project.id } }).then((res) => {
                dispatch(setActiveProject(res.data["projectByProjectId"]));
            });
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
                refetchAttributes({ variables: { projectId: project.id, stateFilter: ['ALL'] } }).then((res) => {
                    dispatch(setAllAttributes(postProcessingAttributes(res.data['attributesByProjectId'])));
                    setIsAcRunning(checkIfAcRunning());
                });
                if (msgParts[2] == 'finished') timer(5000).subscribe(() => checkProjectTokenization());
            }
        }
    }

    function refetchWS() {
        WebSocketsService.subscribeToNotification(CurrentPage.PROJECT_SETTINGS, {
            projectId: project.id,
            whitelist: ['project_update', 'tokenization', 'calculate_attribute', 'embedding', 'attributes_updated'],
            func: handleWebsocketNotification
        });
    }

    return (<div>
        {project != null && <div className="p-4 bg-gray-100 pb-10 h-screen overflow-y-auto flex-1 flex flex-col">
            <DataSchema isAcOrTokenizationRunning={isAcRunning || tokenizationProgress < 1} pKeyValid={pKeyValid} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-1 align-top">
                <div className="items-center flex flex-row">
                    <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.ADD_NEW_ATTRIBUTE} color="invert" placement="bottom">
                        <button onClick={() => dispatch(setModalStates(ModalEnum.CREATE_NEW_ATTRIBUTE, { open: true, attributeName: findFreeAttributeName(attributes) }))} className="mr-1 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                            <IconPlus className="mr-1 h-5 w-5 inline-block" />
                            Add new attribute
                        </button>
                    </Tooltip>
                    <Tooltip content={isAcRunning ? 'Attribute calculation in progress' : tokenizationProgress < 1 ? 'Tokenization in progress' : 'Upload more records to the project'} placement="right" color="invert">
                        <button disabled={isAcRunning || tokenizationProgress < 1} onClick={() => {
                            dispatch(setUploadFileType(UploadFileType.RECORDS_ADD));
                            router.push(`/projects/${project.id}/upload-records`);
                        }}
                            className={`mr-1 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer ${isAcRunning || tokenizationProgress < 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}>
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
                    <Tooltip content={project.tokenizer} color="invert" placement="bottom">
                        <div className="font-medium inline-block">
                            <span className="cursor-help underline filtersUnderline">Tokenization</span>
                        </div>
                    </Tooltip>
                    <div className="ml-2 w-8/12 items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white relative">
                        {tokenizationProgress != 0 && <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="bg-green-300 h-2.5 rounded-full" style={{ 'width': (tokenizationProgress * 100) + '%' }}>
                            </div>
                        </div>}
                        {tokenizationProgress == 1 && <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-row items-center justify-center" style={{ backgroundColor: '#f4f4f5bf' }}>
                            <IconCheck className="h-4 w-4 text-green-700" />
                            <span className="text-sm font-medium text-green-700">Completed</span>
                        </div>}
                        {tokenizationProgress == -1 && <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-row items-center justify-center" style={{ backgroundColor: '#f4f4f5bf' }}>
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

            <Embeddings refetchWS={refetchWS} />
            <LabelingTasks />
            {isManaged && <GatesIntegration />}
            <ProjectMetaData />

            <Modal modalName={ModalEnum.CREATE_NEW_ATTRIBUTE} acceptButton={acceptButton}>
                <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
                    Add new attribute </div>
                <div className="mb-2 flex flex-grow justify-center text-sm text-gray-500">
                    Choose a name for your attribute and pick a datatype you want to use</div>
                <div className="grid grid-cols-2  gap-2 items-center" style={{ gridTemplateColumns: 'max-content auto' }}>
                    <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.ATTRIBUTE_NAME} color="invert" placement="right">
                        <span className="cursor-help  card-title mb-0 label-text font-normal"><span className="underline filtersUnderline">Attribute name</span></span>
                    </Tooltip>
                    <input type="text" defaultValue={modalCreateNewAtt.attributeName} onInput={(e: any) => handleAttributeName(e.target.value)}
                        onKeyDown={(e) => { if (e.key == 'Enter') createUserAttribute() }}
                        className="h-9 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" placeholder="Enter an attribute name..." />
                    <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.SELECT_ATTRIBUTE_TYPE} color="invert" placement="right">
                        <span className="cursor-help card-title mb-0 label-text font-normal"><span className="underline filtersUnderline">Attribute type</span></span>
                    </Tooltip>
                    <Dropdown buttonName={modalCreateNewAtt.attributeType ?? 'Select type'} options={DATA_TYPES} selectedOption={(option: string) => dispatch(setModalStates(ModalEnum.CREATE_NEW_ATTRIBUTE, { attributeType: option }))} />
                </div>
                {modalCreateNewAtt.duplicateNameExists && <div className="text-red-700 text-xs mt-2">Attribute name exists</div>}
                {modalCreateNewAtt.attributeType == 'Embedding List' && <div className="border border-gray-300 text-xs text-gray-500 p-2.5 rounded-lg text-justify mt-2 max-w-2xl">
                    <label className="text-gray-700">
                        Embedding lists are special. They can only be used for similarity search. If a list
                        entry is matched, the whole record is considered matched.
                    </label>
                </div>}
            </Modal>

            <ProjectSnapshotExport ></ProjectSnapshotExport>
        </div >}
    </div >)
}