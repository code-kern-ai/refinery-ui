import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import { selectIsManaged, selectOrganizationId } from "@/src/reduxStore/states/general";
import { closeModal, openModal, setModalStates } from "@/src/reduxStore/states/modal";
import { selectAttributes, selectEmbeddings } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { Embedding, EmbeddingState, EmbeddingType } from "@/src/types/components/projects/projectId/settings/embeddings";
import { ModalEnum } from "@/src/types/shared/modal";
import { DATA_TYPES, getColorForDataType } from "@/src/util/components/projects/projectId/settings/data-schema-helper";
import { Tooltip } from "@nextui-org/react";
import { IconAlertTriangleFilled, IconArrowAutofitDown, IconCircleCheckFilled, IconNotes, IconPlus, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import AddNewEmbeddingModal from "./AddNewEmbeddingModal";
import FilterAttributesModal from "./FilterAttributesModal";
import DeleteEmbeddingModal from "./DeleteEmbeddingModal";
import { useWebsocket } from "@/submodules/react-components/hooks/web-socket/useWebsocket";
import { Application, CurrentPage, CurrentPageSubKey } from "@/submodules/react-components/hooks/web-socket/constants";


export default function Embeddings(props: { refetchEmbeddings: () => void }) {
    const dispatch = useDispatch();
    const router = useRouter();

    const attributes = useSelector(selectAttributes);
    const isManaged = useSelector(selectIsManaged);
    const embeddings = useSelector(selectEmbeddings);
    const projectId = useSelector(selectProjectId);

    const [somethingLoading, setSomethingLoading] = useState(false);
    const [loadingEmbeddingsDict, setLoadingEmbeddingsDict] = useState<{ [key: string]: boolean }>({});
    const [showEditOption, setShowEditOption] = useState(false);
    const [filterAttributesUpdate, setFilterAttributesUpdate] = useState([]);

    useEffect(() => {
        if (!projectId) return;
        setSomethingLoading(false);
    }, []);

    function prepareAttributeDataByNames(attributesNames: string[]) {
        if (!attributesNames) return [];
        const attributesNew = [];
        for (let name of attributesNames) {
            const attribute = attributes.find((a) => a.name == name);
            const attributeCopy = { ...attribute };
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
            const loadingEmbeddingsDictCopy = { ...loadingEmbeddingsDict }
            delete loadingEmbeddingsDictCopy[msgParts[2]];
            setLoadingEmbeddingsDict(loadingEmbeddingsDictCopy);
            props.refetchEmbeddings();
        } else if (msgParts[1] == 'upload_embedding_payload') {
            if (loadingEmbeddingsDict[msgParts[2]] == undefined) {
                const loadingEmbeddingsDictCopy = { ...loadingEmbeddingsDict };
                loadingEmbeddingsDictCopy[msgParts[2]] = true;
                setLoadingEmbeddingsDict(loadingEmbeddingsDictCopy);
            }
        }
    }, []);

    const orgId = useSelector(selectOrganizationId);
    useWebsocket(orgId, Application.REFINERY, CurrentPage.PROJECT_SETTINGS, handleWebsocketNotification, projectId, CurrentPageSubKey.EMBEDDINGS);

    return (<div className="mt-8">
        <div className="text-lg leading-6 text-gray-900 font-medium inline-block w-full">
            <label>Embeddings</label>
            <div className="mt-1">
                <div className="text-sm leading-5 font-medium text-gray-700 inline-block">You can enrich your records
                    with
                    embeddings, e.g. to use them for vector search or active transfer learning.</div>
                <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg" style={{ padding: '3px' }}>
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
                                                <Tooltip content={!embedding.onQdrant ? TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS.NOT_YET_ON_QDRANT : (
                                                    embedding.filterAttributes && embedding.filterAttributes.length > 0 ?
                                                        TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS.HAS_FILTER_ATTRIBUTES :
                                                        TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS.NO_FILTER_ATTRIBUTES)
                                                } color="invert" >
                                                    <IconNotes onClick={() => embedding.onQdrant ? dispatch(setModalStates(ModalEnum.FILTERED_ATTRIBUTES, { embeddingId: embedding.id, open: true, attributeNames: prepareAttributeDataByNames(embedding.filterAttributes), showEditOption: showEditOption })) : null}
                                                        className={`h-6 w-6 ${embedding.filterAttributes && embedding.filterAttributes.length > 0 ? 'text-gray-700' : 'text-gray-300'} ${embedding.onQdrant ? "" : "cursor-not-allowed opacity-50"}`} />
                                                </Tooltip>
                                            </td> : <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500 flex justify-center"><LoadingIcon /></td>}
                                        <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                            <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                {embedding.type == EmbeddingType.ON_ATTRIBUTE ? 'Attribute Specific' : 'Token Specific'}
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
                        className={`"ml-1 inline-block items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}>
                        <IconArrowAutofitDown className="h-5 w-5 inline-block mr-1" />
                        See downloaded models
                    </button>
                </Tooltip>
            </div>
        </div>

        <FilterAttributesModal
            showEditOption={showEditOption}
            setShowEditOption={(value) => setShowEditOption(value)}
            filterAttributesUpdate={filterAttributesUpdate}
            setFilterAttributesUpdate={(value) => setFilterAttributesUpdate(value)} />

        <DeleteEmbeddingModal />
        <AddNewEmbeddingModal />
    </div>);
}