import { useDispatch, useSelector } from "react-redux";
import DataSchema from "./DataSchema";
import { selectProject, setActiveProject } from "@/src/reduxStore/states/project";
import { useLazyQuery, useMutation } from "@apollo/client";
import { CHECK_COMPOSITE_KEY, GET_ATTRIBUTES_BY_PROJECT_ID, GET_EMBEDDING_SCHEMA_BY_PROJECT_ID, GET_PROJECT_TOKENIZATION, GET_QUEUED_TASKS, GET_RECOMMENDED_ENCODERS_FOR_EMBEDDINGS } from "@/src/services/gql/queries/project";
import { useCallback, useEffect, useState } from "react";
import { selectAttributes, selectEmbeddings, setAllAttributes, setAllEmbeddings, setAllRecommendedEncodersDict, setRecommendedEncodersAll, setUseableEmbedableAttributes, setUseableNonTextAttributes } from "@/src/reduxStore/states/pages/settings";
import { timer } from "rxjs";
import { IconCamera, IconCheck, IconDots, IconPlus, IconUpload } from "@tabler/icons-react";
import Modal from "@/src/components/shared/modal/Modal";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { openModal } from "@/src/reduxStore/states/modal";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { CREATE_USER_ATTRIBUTE } from "@/src/services/gql/mutations/project";
import { useRouter } from "next/router";
import { toPythonFunctionName } from "@/submodules/javascript-functions/python-functions-parser";
import { setUploadFileType } from "@/src/reduxStore/states/upload";
import { UploadFileType } from "@/src/types/shared/upload";
import { GET_PROJECT_BY_ID } from "@/src/services/gql/queries/projects";
import { WebSocketsService } from "@/src/services/base/web-sockets/WebSocketsService";
import { CurrentPage } from "@/src/types/shared/general";
import ProjectSnapshotExport from "./ProjectSnapshotExport";
import { Tooltip } from "@nextui-org/react";
import ProjectMetaData from "./ProjectMetaData";
import GatesIntegration from "./GatesIntegration";
import { selectIsManaged } from "@/src/reduxStore/states/general";
import Embeddings from "./embeddings/Embeddings";
import { DATA_TYPES, postProcessingAttributes } from "@/src/util/components/projects/projectId/settings/data-schema-helper";
import { postProcessingEmbeddings, postProcessingRecommendedEncoders } from "@/src/util/components/projects/projectId/settings/embeddings-helper";
import { AttributeState } from "@/src/types/components/projects/projectId/settings/data-schema";
import { RecommendedEncoder } from "@/src/types/components/projects/projectId/settings/embeddings";

const ACCEPT_BUTTON = { buttonCaption: "Accept", useButton: true, disabled: true }

export default function ProjectSettings() {
    const dispatch = useDispatch();
    const router = useRouter();

    const project = useSelector(selectProject);
    const attributes = useSelector(selectAttributes);
    const isManaged = useSelector(selectIsManaged);
    const embeddings = useSelector(selectEmbeddings);

    const [pKeyValid, setPKeyValid] = useState<boolean | null>(null);
    const [pKeyCheckTimer, setPKeyCheckTimer] = useState(null);
    const [attributeName, setAttributeName] = useState("");
    const [attributeType, setAttributeType] = useState("Text");
    const [duplicateNameExists, setDuplicateNameExists] = useState(false);
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

    const createUserAttribute = useCallback((attributeName: string) => {
        const attributeTypeFinal = DATA_TYPES.find((type) => type.name === attributeType).value;
        createAttributeMut({ variables: { projectId: project.id, name: attributeName, dataType: attributeTypeFinal } }).then((res) => {
            const id = res?.data?.createUserAttribute.attributeId;
            if (id) {
                localStorage.setItem('isNewAttribute', "X");
                router.push(`/projects/${project.id}/attributes/${id}`);
            }
        });
    }, [attributeName, attributeType, duplicateNameExists]);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    function refetchAttributesAndPostProcess() {
        refetchAttributes({ variables: { projectId: project.id, stateFilter: ['ALL'] } }).then((res) => {
            dispatch(setAllAttributes(postProcessingAttributes(res.data['attributesByProjectId'])));
            dispatch(setUseableEmbedableAttributes(attributes));
            dispatch(setUseableNonTextAttributes(attributes));
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
        setDuplicateNameExists(checkName);
        setAcceptButton({ ...acceptButton, disabled: checkName || value.trim() == "" })
        setAttributeName(toPythonFunctionName(value));
    }

    useEffect(() => {
        setAcceptButton({ ...acceptButton, emitFunction: () => createUserAttribute(attributeName) });
    }, [attributeName, attributeType, duplicateNameExists]);

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
                        else e.state = msgParts[4];
                    }
                    else if (msgParts[3] == "progress") e.progress = Number(msgParts[4])
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
                    dispatch(setUseableEmbedableAttributes(attributes));
                    dispatch(setUseableNonTextAttributes(attributes));
                    setIsAcRunning(checkIfAcRunning());
                });
                if (msgParts[2] == 'finished') timer(5000).subscribe(() => checkProjectTokenization());
            }
        }
    }


    return (<div>
        {project != null && <div className="p-4 bg-gray-100 pb-10 h-screen overflow-y-auto flex-1 flex flex-col">
            <DataSchema isAcOrTokenizationRunning={isAcRunning || tokenizationProgress < 1} pKeyValid={pKeyValid} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-1 align-top">
                <div className="items-center flex flex-row">
                    <Tooltip content="Add new attribute" color="invert" placement="bottom">
                        <label onClick={() => dispatch(openModal(ModalEnum.CREATE_NEW_ATTRIBUTE))}
                            className="mr-1 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                            <IconPlus className="mr-1 h-5 w-5 inline-block" />
                            Add new attribute
                        </label>
                    </Tooltip>
                    <Tooltip content={isAcRunning ? 'Attribute calculation in progress' : tokenizationProgress < 1 ? 'Tokenization in progress' : 'Upload more records to the project'} placement="right" color="invert">
                        <button disabled={isAcRunning || tokenizationProgress < 1} onClick={() => {
                            dispatch(setUploadFileType(UploadFileType.RECORDS_ADD));
                            router.push(`/projects/${project.id}/upload-records`);
                        }}
                            className={`mr-1 inline-flex items-center px-2.5 py-2 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer ${isAcRunning || tokenizationProgress < 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}>
                            <IconUpload className="mr-1 h-4 w-4 inline-block" />
                            Upload records
                        </button>
                    </Tooltip>
                    {/* TODO: Add option to export records */}
                    <Tooltip content="Creates a snapshot compressed file of your current project" placement="bottom" color="invert">
                        <button onClick={() => dispatch(openModal(ModalEnum.PROJECT_SNAPSHOT))}
                            className="mr-1 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                            <IconCamera className="mr-1 h-5 w-5 inline-block" />
                            Create project snapshot
                        </button>
                    </Tooltip>
                </div>
                <div className="text-left lg:text-right flex flex-row items-center">
                    <Tooltip content={project.tokenizer} color="invert" placement="bottom">
                        <div className="font-medium inline-block">
                            <span className="cursor-help underline filtersUnderline">Tokenization</span>
                        </div>
                    </Tooltip>
                    <div className="ml-2 w-full items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white relative">
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

            <Embeddings />
            {isManaged && <GatesIntegration />}
            <ProjectMetaData />

            <Modal modalName={ModalEnum.CREATE_NEW_ATTRIBUTE} acceptButton={acceptButton}>
                <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
                    Add new attribute </div>
                <div className="mb-2 flex flex-grow justify-center text-sm text-gray-500">
                    Choose a name for your attribute and pick a datatype you want to use</div>
                <div className="grid grid-cols-2  gap-2 items-center" style={{ gridTemplateColumns: 'max-content auto' }}>
                    <Tooltip content="Enter an attribute name" color="invert" placement="right">
                        <span className="cursor-help  card-title mb-0 label-text font-normal"><span className="underline filtersUnderline">Attribute name</span></span>
                    </Tooltip>
                    <input type="text" value={attributeName} onInput={(e: any) => {
                        handleAttributeName(e.target.value);
                    }} onKeyDown={(e) => { if (e.key == 'Enter') createUserAttribute(attributeName) }}
                        className="h-9 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" placeholder="Enter an attribute name..." />
                    {duplicateNameExists && <div className="text-red-700 text-xs mt-2">Attribute name exists</div>}
                    <Tooltip content="Select an attribute type" color="invert" placement="right">
                        <span className="cursor-help card-title mb-0 label-text font-normal"><span className="underline filtersUnderline">Attribute type</span></span>
                    </Tooltip>
                    <Dropdown buttonName={attributeType} options={DATA_TYPES} selectedOption={(option: string) => setAttributeType(option)} />
                </div>
                {/* TODO: Add condition for embedding lists */}
            </Modal>

            <ProjectSnapshotExport ></ProjectSnapshotExport>
        </div >}
    </div >)
}