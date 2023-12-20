import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import Modal from "@/src/components/shared/modal/Modal";
import { selectIsManaged } from "@/src/reduxStore/states/general";
import { openModal, selectModal, setModalStates } from "@/src/reduxStore/states/modal";
import { removeFromAllEmbeddingsById, selectAttributes, selectEmbeddings, selectUsableNonTextAttributes } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { WebSocketsService } from "@/src/services/base/web-sockets/WebSocketsService";
import { DELETE_EMBEDDING, DELETE_FROM_TASK_QUEUE, UPDATE_EMBEDDING_PAYLOAD } from "@/src/services/gql/mutations/project-settings";
import { Embedding, EmbeddingProps, EmbeddingState } from "@/src/types/components/projects/projectId/settings/embeddings";
import { CurrentPage } from "@/src/types/shared/general";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { DATA_TYPES, getColorForDataType } from "@/src/util/components/projects/projectId/settings/data-schema-helper";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { IconAlertTriangleFilled, IconArrowAutofitDown, IconCircleCheckFilled, IconNotes, IconPlus, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddNewEmbedding from "./AddNewEmbedding";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { unsubscribeWSOnDestroy } from "@/src/services/base/web-sockets/web-sockets-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";

const ABORT_BUTTON = { useButton: true, disabled: false };
const EDIT_BUTTON = { buttonCaption: 'Edit', useButton: true, disabled: false, closeAfterClick: false };
const ACCEPT_BUTTON = { buttonCaption: 'Save', useButton: false, disabled: false, closeAfterClick: false };

export default function Embeddings(props: EmbeddingProps) {
    const dispatch = useDispatch();
    const router = useRouter();

    const modalDeleteEmbedding = useSelector(selectModal(ModalEnum.DELETE_EMBEDDING));
    const modalFilteredAttributes = useSelector(selectModal(ModalEnum.FILTERED_ATTRIBUTES));
    const attributes = useSelector(selectAttributes);
    const usableAttributes = useSelector(selectUsableNonTextAttributes);
    const isManaged = useSelector(selectIsManaged);
    const embeddings = useSelector(selectEmbeddings);
    const projectId = useSelector(selectProjectId);

    const [somethingLoading, setSomethingLoading] = useState(false);
    const [loadingEmbeddingsDict, setLoadingEmbeddingsDict] = useState<{ [key: string]: boolean }>({});
    const [showEditOption, setShowEditOption] = useState(false);
    const [filterAttributesUpdate, setFilterAttributesUpdate] = useState([]);
    const [checkedAttributes, setCheckedAttributes] = useState([]);

    const [refetchDeleteEmbedding] = useMutation(DELETE_EMBEDDING);
    const [refetchDeleteTaskQueue] = useMutation(DELETE_FROM_TASK_QUEUE);
    const [updateEmbeddingPayloadMut] = useMutation(UPDATE_EMBEDDING_PAYLOAD);

    useEffect(unsubscribeWSOnDestroy(router, [CurrentPage.PROJECT_SETTINGS]), []);

    useEffect(() => {
        if (!projectId) return;
        setSomethingLoading(false);
        WebSocketsService.subscribeToNotification(CurrentPage.PROJECT_SETTINGS, {
            projectId: projectId,
            whitelist: ['embedding_updated', 'upload_embedding_payload'],
            func: handleWebsocketNotification
        });
    }, []);

    const deleteEmbedding = useCallback(() => {
        const embeddingId = modalDeleteEmbedding.embeddingId;
        if (!embeddingId) return;
        if (modalDeleteEmbedding.isQueuedElement) {
            refetchDeleteTaskQueue({ variables: { projectId: projectId, taskId: embeddingId } }).then((res) => {
                dispatch(removeFromAllEmbeddingsById(embeddingId));
            });
        } else {
            refetchDeleteEmbedding({ variables: { projectId: projectId, embeddingId: embeddingId } }).then((res) => {
                dispatch(removeFromAllEmbeddingsById(embeddingId));
            });
        }
    }, [modalDeleteEmbedding]);

    useEffect(() => {
        const abortButtonCopy = jsonCopy(abortButton);
        abortButtonCopy.buttonCaption = modalDeleteEmbedding.isQueuedElement ? 'Dequeue embedding' : 'Delete embedding';
        abortButtonCopy.emitFunction = deleteEmbedding;
        setAbortButton(abortButtonCopy);
    }, [modalDeleteEmbedding]);

    const saveFilteredAttributes = useCallback(() => {
        setShowEditOption(false);
        dispatch(setModalStates(ModalEnum.FILTERED_ATTRIBUTES, { showEditOption: false }));
        updateEmbeddingPayloadMut({ variables: { projectId: projectId, embeddingId: modalFilteredAttributes.embeddingId, filterAttributes: JSON.stringify(filterAttributesUpdate) } }).then((res) => { });
    }, [filterAttributesUpdate]);

    const editFilteredAttributes = useCallback(() => {
        setShowEditOption(true);
        dispatch(setModalStates(ModalEnum.FILTERED_ATTRIBUTES, { showEditOption: true }));
    }, [modalFilteredAttributes]);

    useEffect(() => {
        const editButtonCopy = jsonCopy(editButton);
        editButtonCopy.emitFunction = editFilteredAttributes;
        setEditButton(editButtonCopy);
    }, [modalFilteredAttributes]);

    useEffect(() => {
        const editButtonCopy = jsonCopy(editButton);
        editButtonCopy.useButton = !showEditOption;
        setEditButton(editButtonCopy);
        const acceptButtonCopy = jsonCopy(acceptButton);
        acceptButtonCopy.useButton = showEditOption;
        acceptButtonCopy.emitFunction = saveFilteredAttributes;
        setAcceptButton(acceptButtonCopy);
    }, [showEditOption]);

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);
    const [editButton, setEditButton] = useState<ModalButton>(EDIT_BUTTON);
    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);


    useEffect(() => {
        if (!usableAttributes) return;
        if (!modalFilteredAttributes.attributeNames) return;
        const updated = usableAttributes.map((attribute) => {
            const attributeCopy = jsonCopy(attribute);
            attributeCopy.checked = modalFilteredAttributes.attributeNames.find((a) => a.name == attribute.name) != undefined;
            return attributeCopy;
        });
        setCheckedAttributes(updated);
    }, [usableAttributes, modalFilteredAttributes]);

    function prepareAttributeDataByNames(attributesNames: string[]) {
        if (!attributesNames) return [];
        const attributesNew = [];
        for (let name of attributesNames) {
            const attribute = attributes.find((a) => a.name == name);
            const attributeCopy = jsonCopy(attribute);
            attributeCopy.color = getColorForDataType(attribute.dataType);
            attributeCopy.dataTypeName = DATA_TYPES.find((type) => type.value === attribute.dataType).name;
            attributeCopy.checked = true;
            attributesNew.push(attributeCopy);
        }
        setFilterAttributesUpdate(attributesNames);
        return attributesNew;
    }

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (msgParts[1] == 'embedding_updated') {
            const loadingEmbeddingsDictCopy = jsonCopy(loadingEmbeddingsDict);
            delete loadingEmbeddingsDictCopy[msgParts[2]];
            setLoadingEmbeddingsDict(loadingEmbeddingsDictCopy);
        } else if (msgParts[1] == 'upload_embedding_payload') {
            if (loadingEmbeddingsDict[msgParts[2]] == undefined) {
                const loadingEmbeddingsDictCopy = jsonCopy(loadingEmbeddingsDict);
                loadingEmbeddingsDictCopy[msgParts[2]] = true;
                setLoadingEmbeddingsDict(loadingEmbeddingsDictCopy);
            }
        }
    }, []);

    useEffect(() => {
        if (!projectId) return;
        WebSocketsService.updateFunctionPointer(projectId, CurrentPage.PROJECT_SETTINGS, handleWebsocketNotification)
    }, [handleWebsocketNotification, projectId]);

    return (<div className="mt-8">
        <div className="text-lg leading-6 text-gray-900 font-medium inline-block w-full">
            <label>Embeddings</label>
            <div className="mt-1">
                <div className="text-sm leading-5 font-medium text-gray-700 inline-block">You can enrich your records
                    with
                    embeddings, e.g. to use them for vector search or active transfer learning.</div>
                <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col"
                                        className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Name</th>
                                    <th scope="col"
                                        className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Filter attributes</th>
                                    <th scope="col"
                                        className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Type</th>
                                    <th scope="col"
                                        className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Status</th>
                                    <th scope="col"
                                        className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Dimensionality</th>
                                    <th scope="col"
                                        className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Count</th>
                                    <th scope="col"
                                        className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                    </th>
                                </tr>
                            </thead>
                            {!somethingLoading ? <tbody className="divide-y divide-gray-200">
                                {embeddings.map((embedding: Embedding, index: number) => (
                                    <tr key={embedding.id} className={`${index % 2 != 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                        <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                            {embedding.name}
                                        </td>
                                        {!loadingEmbeddingsDict[embedding.id] ?
                                            <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500 flex justify-center">
                                                <Tooltip content={embedding.filterAttributes && embedding.filterAttributes.length > 0 ? TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS.HAS_FILTER_ATTRIBUTES : TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS.NO_FILTER_ATTRIBUTES} color="invert" >
                                                    <IconNotes onClick={() => dispatch(setModalStates(ModalEnum.FILTERED_ATTRIBUTES, { embeddingId: embedding.id, open: true, attributeNames: prepareAttributeDataByNames(embedding.filterAttributes), showEditOption: showEditOption }))}
                                                        className={`h-6 w-6 ${embedding.filterAttributes && embedding.filterAttributes.length > 0 ? 'text-gray-700' : 'text-gray-300'}`} />
                                                </Tooltip>
                                            </td> : <td><LoadingIcon /></td>}
                                        <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                            <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                {embedding.state == EmbeddingState.QUEUED ? '' : embedding.type == 'ON_ATTRIBUTE' ? 'Attribute Specific' : 'Token Specific'}
                                            </div>
                                        </td>
                                        <td className={`text-center px-3 text-sm text-gray-500 ${embedding.state != EmbeddingState.FINISHED && embedding.state != EmbeddingState.FAILED ? 'py-0' : 'whitespace-nowrap py-2 flex justify-center'}`}>
                                            {embedding.state != EmbeddingState.FINISHED && embedding.state != EmbeddingState.FAILED && <div>
                                                <div className="items-center">
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                                        <div className="bg-green-500 h-2.5 rounded-full" style={{ 'width': (embedding.progress * 100) + '%' }}>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs italic">{embedding.state}</p>
                                            </div>}
                                            {embedding.state == EmbeddingState.FINISHED && <Tooltip content={TOOLTIPS_DICT.GENERAL.SUCCESSFULLY_CREATED} color="invert" className="cursor-auto">
                                                <IconCircleCheckFilled className="h-6 w-6 text-green-500" />
                                            </Tooltip>}
                                            {embedding.state == EmbeddingState.FAILED && <Tooltip content={TOOLTIPS_DICT.GENERAL.ERROR} color="invert" className="cursor-auto">
                                                <IconAlertTriangleFilled className="h-6 w-6 text-red-500" />
                                            </Tooltip>}
                                        </td>
                                        <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                            {embedding.dimension}
                                        </td>
                                        <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                            {embedding.count}
                                        </td>
                                        <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                            <IconTrash onClick={() => dispatch(setModalStates(ModalEnum.DELETE_EMBEDDING, { embeddingId: embedding.id, open: true, isQueuedElement: embedding.state == EmbeddingState.QUEUED }))}
                                                className="h-6 w-6 text-red-700 cursor-pointer" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody> : <tbody>
                                <tr>
                                    <td colSpan={6} className="text-center p-1">
                                        <LoadingIcon />
                                    </td>
                                </tr>
                            </tbody>}
                        </table>
                    </div>
                </div>
            </div>
            <div className="mt-1 flex items-center gap-1">
                <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS.GENERATE_EMBEDDING} color="invert" placement="right">
                    <button onClick={() => dispatch(openModal(ModalEnum.ADD_EMBEDDING))}
                        className="inline-block items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                        <IconPlus className="h-5 w-5 inline-block mr-1" />
                        Generate embedding
                    </button>
                </Tooltip>
                <Tooltip content={!isManaged ? TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS.HOSTED_VERSION : TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS.NAVIGATE_MODELS_DOWNLOADED} color="invert" placement="right">
                    <button disabled={!isManaged} onClick={() => router.push('/models-download')}
                        className={`"ml-1 inline-block items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer ${!isManaged ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}>
                        <IconArrowAutofitDown className="h-5 w-5 inline-block mr-1" />
                        See downloaded models
                    </button>
                </Tooltip>
            </div>
        </div>
        <Modal modalName={ModalEnum.FILTERED_ATTRIBUTES} acceptButton={acceptButton} backButton={editButton}>
            <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">Edit embedding with filter attributes</div>
            <div className="my-2 flex flex-grow justify-center text-sm text-gray-500 text-center">
                List of filter attributes selected when creating an embedding</div>
            {modalFilteredAttributes.attributeNames && modalFilteredAttributes.attributeNames.length == 0 ? <div className="text-xs text-gray-500 text-center italic">No filter attributes selected</div> : <div className="flex justify-center items-center">
                {modalFilteredAttributes.attributeNames.map((attribute) => (
                    <Tooltip content={attribute.dataType} color="invert" placement="top" key={attribute.id} className="cursor-auto">
                        <span className={`border items-center px-2 py-0.5 rounded text-xs font-medium text-center mr-2 bg-${attribute.color}-100 text-${attribute.color}-700 border-${attribute.color}-400 hover:bg-${attribute.color}-200`}>{attribute.name}</span>
                    </Tooltip>
                ))}
            </div>}
            {modalFilteredAttributes.showEditOption && <div className="mt-3">
                <div className="text-xs text-gray-500 text-center italic">Add or remove filter attributes</div>
                <Dropdown options={usableAttributes.map(a => a.name)} buttonName={filterAttributesUpdate.length == 0 ? 'None selected' : filterAttributesUpdate.join(',')} hasCheckboxes={true}
                    selectedCheckboxes={checkedAttributes.map(a => a.checked)} hasSelectAll={true}
                    selectedOption={(option: any) => {
                        const attributes = option.filter((o: any) => o.checked).map((o: any) => o.name);
                        setFilterAttributesUpdate(attributes);
                    }} />
            </div>}
        </Modal>
        <Modal modalName={ModalEnum.DELETE_EMBEDDING} abortButton={abortButton}>
            <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
                Warning </div>
            <p className="mt-2 text-gray-500 text-sm">Are you sure you want to {modalDeleteEmbedding.isQueuedElement ? 'dequeue' : 'delete'} this embedding?</p>
            {!modalDeleteEmbedding.isQueuedElement && <p className="mt-2 text-gray-500 text-sm">This will delete all corresponding tensors!</p>}

        </Modal>
        <AddNewEmbedding refetchWS={props.refetchWS} />
    </div>);
}