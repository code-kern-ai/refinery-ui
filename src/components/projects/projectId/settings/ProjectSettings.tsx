import { useDispatch, useSelector } from "react-redux";
import DataSchema from "./DataSchema";
import { selectProject, setActiveProject } from "@/src/reduxStore/states/project";
import { useLazyQuery, useMutation } from "@apollo/client";
import { CHECK_COMPOSITE_KEY, GET_ATTRIBUTES_BY_PROJECT_ID, GET_PROJECT_SIZE } from "@/src/services/gql/queries/project";
import { useCallback, useEffect, useState } from "react";
import { selectAttributes, setAllAttributes } from "@/src/reduxStore/states/pages/settings";
import { DATA_TYPES, postProcessingAttributes, postProcessingFormGroups } from "@/src/util/components/projects/projectId/settings-helper";
import { timer } from "rxjs";
import { IconCamera, IconInfoCircle, IconPlus, IconUpload } from "@tabler/icons-react";
import Modal from "@/src/components/shared/modal/Modal";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { openModal } from "@/src/reduxStore/states/modal";
import { Tooltip } from "@nextui-org/react";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { CREATE_USER_ATTRIBUTE } from "@/src/services/gql/mutations/project";
import { useRouter } from "next/router";
import { toPythonFunctionName } from "@/submodules/javascript-functions/python-functions-parser";
import { setUploadFileType } from "@/src/reduxStore/states/upload";
import { UploadFileType } from "@/src/types/shared/upload";
import { GET_PROJECT_BY_ID } from "@/src/services/gql/queries/projects";
import { WebSocketsService } from "@/src/services/base/web-sockets/WebSocketsService";
import { CurrentPage } from "@/src/types/shared/general";
import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import { ProjectSize } from "@/src/types/components/projects/projectId/settings";
import { formatBytes } from "@/submodules/javascript-functions/general";

const ACCEPT_BUTTON = { buttonCaption: "Accept", useButton: true, disabled: true }

export default function ProjectSettings() {
    const dispatch = useDispatch();
    const router = useRouter();

    const project = useSelector(selectProject);
    const attributes = useSelector(selectAttributes);

    const [pKeyValid, setPKeyValid] = useState<boolean | null>(null);
    const [pKeyCheckTimer, setPKeyCheckTimer] = useState(null);
    const [attributeName, setAttributeName] = useState("");
    const [attributeType, setAttributeType] = useState("Text");
    const [duplicateNameExists, setDuplicateNameExists] = useState(false);
    const [isAcRunning, setIsAcRunning] = useState(false);
    const [tokenizationProgress, setTokenizationProgress] = useState(1);
    const [projectSize, setProjectSize] = useState(null);
    const [projectExportArray, setProjectExportArray] = useState<ProjectSize[]>(null);
    const [downloadSizeText, setDownloadSizeText] = useState('');

    const [refetchAttributes] = useLazyQuery(GET_ATTRIBUTES_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchPrimaryKey] = useLazyQuery(CHECK_COMPOSITE_KEY, { fetchPolicy: "no-cache" });
    const [createAttributeMut] = useMutation(CREATE_USER_ATTRIBUTE);
    const [refetchProjectByProjectId] = useLazyQuery(GET_PROJECT_BY_ID, { fetchPolicy: "no-cache" });
    const [refetchProjectSize] = useLazyQuery(GET_PROJECT_SIZE, { fetchPolicy: "network-only" })

    useEffect(() => {
        if (!project) return;
        refetchAttributes({ variables: { projectId: project.id, stateFilter: ['ALL'] } }).then((res) => {
            dispatch(setAllAttributes(postProcessingAttributes(res.data['attributesByProjectId'])));
        });
        WebSocketsService.subscribeToNotification(CurrentPage.PROJECT_SETTINGS, {
            whitelist: ['project_update'],
            func: handleWebsocketNotification
        });
    }, [project]);

    useEffect(() => {
        requestPKeyCheck();
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

    function requestProjectSize() {
        refetchProjectSize({ variables: { projectId: project.id } }).then((res) => {
            setProjectSize(res.data['projectSize']);
            setProjectExportArray(postProcessingFormGroups(res.data['projectSize']));
        });
    }

    useEffect(() => {
        if (!projectExportArray) return;
        let downloadSize: number = 0;
        for (let i = 0; i < projectExportArray.length; i++) {
            if (projectExportArray[i].export) downloadSize += projectExportArray[i].sizeNumber;
        }
        setDownloadSizeText(downloadSize ? formatBytes(downloadSize, 2) : "O bytes");
    }, [projectExportArray]);


    function requestProjectExportCredentials() { }

    function handleWebsocketNotification(msgParts: string[]) {
        if (msgParts[1] == 'project_update' && msgParts[2] == project.id) {
            refetchProjectByProjectId({ variables: { projectId: project.id } }).then((res) => {
                dispatch(setActiveProject(res.data["projectByProjectId"]));
            });
        }
    }

    return (<div>
        {project != null && <div className="p-4 bg-gray-100 h-screen overflow-y-auto flex-1 flex flex-col">
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
                    <Tooltip content={isAcRunning ? 'Attribute calculation in progress' : tokenizationProgress < 1 ? 'Tokenization in progress' : 'Upload more records to the project'} placement="bottom" color="invert">
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
                        <button onClick={() => {
                            dispatch(openModal(ModalEnum.PROJECT_SNAPSHOT));
                            requestProjectSize();
                            requestProjectExportCredentials();
                        }}
                            className="mr-1 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                            <IconCamera className="mr-1 h-5 w-5 inline-block" />
                            Create project snapshot
                        </button>
                    </Tooltip>
                </div>
            </div>

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

            <Modal modalName={ModalEnum.PROJECT_SNAPSHOT}>
                <div className="text-lg leading-6 text-gray-900 font-medium text-center">
                    Project export </div>
                <div className="mt-1 text-sm leading-5 font-medium text-gray-700">See the size of each
                    export item.</div>
                <div className="flex flex-col">
                    {projectSize ? <div>
                        <form>
                            <div className="grid items-center p-2 gap-x-4" style={{ gridTemplateColumns: 'auto 25px auto auto' }}>
                                <div className="flex">
                                    <span className="card-title mb-0 label-text">Name</span>
                                </div>
                                <div></div>
                                <div className="flex">
                                    <span className="card-title mb-0 label-text">Size estimate</span>
                                </div>
                                <div className="flex flex-row justify-center items-center gap-2">
                                    <span className="card-title mb-0 label-text">Export</span>
                                </div>
                                {projectExportArray.map((item: ProjectSize, index: number) => (<>
                                    <div className="contents" key={index}>
                                        <div className="flex">
                                            <p className={`break-words cursor-default capitalize-first ${item.moveRight ? 'ml-4' : null}`}>{item.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-items-center">
                                        {item.desc && <Tooltip content={item.desc} color="invert" placement="top">
                                            <IconInfoCircle className="h-6 w-6 text-gray-900" />
                                        </Tooltip>}
                                    </div>
                                    <div className="flex">{item.sizeReadable}</div>
                                    <div className="flex justify-center">
                                        <div className="form-control">
                                            <label className="card-title mb-0 cursor-pointer label p-0">
                                                <input type="checkbox" className="cursor-pointer" checked={item.export} onChange={(e: any) => {
                                                    const tmpArray = [...projectExportArray];
                                                    tmpArray[index].export = e.target.checked;
                                                    setProjectExportArray(tmpArray);
                                                }} />
                                            </label>
                                        </div>
                                    </div>
                                </>
                                ))}
                            </div>
                        </form>
                    </div> : <div className="flex flex-col items-center justify-items-center mb-8 mt-4">
                        <LoadingIcon />
                    </div>}
                </div>
                {projectSize && <div className="mt-4" style={{ borderTop: '1px solid #ddd' }}>
                    <div></div>
                    <div className="my-2 mr-2 flex flex-row flex-nowrap justify-end">
                        <span className="card-title mb-0 label-text">Final size estimate:</span>
                        <span className="card-title mb-0 label-text ml-2">{downloadSizeText}</span>
                    </div>
                    {/* TODO: Add crypted field */}
                </div>}

            </Modal>
        </div >}
    </div >)
}