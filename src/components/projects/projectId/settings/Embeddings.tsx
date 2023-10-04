import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import Modal from "@/src/components/shared/modal/Modal";
import { selectIsManaged } from "@/src/reduxStore/states/general";
import { openModal, setModalStates } from "@/src/reduxStore/states/modal";
import { selectEmbeddings } from "@/src/reduxStore/states/pages/settings";
import { WebSocketsService } from "@/src/services/base/web-sockets/WebSocketsService";
import { Embedding, EmbeddingState } from "@/src/types/components/projects/projectId/settings";
import { CurrentPage } from "@/src/types/shared/general";
import { ModalEnum } from "@/src/types/shared/modal";
import { DATA_TYPES, getColorForDataType } from "@/src/util/components/projects/projectId/settings-helper";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { Tooltip } from "@nextui-org/react";
import { IconAlertTriangleFilled, IconArrowAutofitContent, IconArrowAutofitDown, IconCircleCheckFilled, IconNotes, IconPlus, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Embeddings() {
    const dispatch = useDispatch();
    const router = useRouter();

    const isManaged = useSelector(selectIsManaged);
    const embeddings = useSelector(selectEmbeddings);

    const [somethingLoading, setSomethingLoading] = useState(false);
    const [loadingEmbeddingsDict, setLoadingEmbeddingsDict] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        setSomethingLoading(false); // TODO add the condition
        WebSocketsService.subscribeToNotification(CurrentPage.SETTINGS, {
            whitelist: ['embedding_updated', 'upload_embedding_payload'],
            func: handleWebsocketNotification
        });
    }, []);

    function handleWebsocketNotification(msgParts: string[]) {
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
    }

    function prepareAttributeDataByNames(attributesNames: string[]) {
        if (!attributesNames) return [];
        const attributes = [];
        for (let name of attributesNames) {
            const attribute = attributes.find((a) => a.name == name);
            attribute.color = getColorForDataType(attribute.dataType);
            attribute.dataTypeName = DATA_TYPES.find((type) => type.value === attribute.dataType).name;
            attributes.push(attribute);
        }
        return attributes;
    }

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
                                                <Tooltip content={embedding.filterAttributes && embedding.filterAttributes.length > 0 ? 'Has filtered attributes' : 'No filter attributes'} color="invert" >
                                                    <IconNotes onClick={() => dispatch(setModalStates(ModalEnum.FILTERED_ATTRIBUTES, { embeddingId: embedding.id, open: true, attributeName: prepareAttributeDataByNames(embedding.filterAttributes) }))}
                                                        className={`h-6 w-6 ${embedding.filterAttributes ? 'text-gray-700' : 'text-gray-300'}`} />
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
                                                        <div className="bg-green-300 h-2.5 rounded-full" style={{ 'width': (embedding.progress * 100) + '%' }}>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs italic">{embedding.state}</p>
                                            </div>}
                                            {embedding.state == EmbeddingState.FINISHED && <Tooltip content="Successfully created" color="invert">
                                                <IconCircleCheckFilled className="h-6 w-6 text-green-500" />
                                            </Tooltip>}
                                            {embedding.state == EmbeddingState.FAILED && <Tooltip content="Embedding creation ran into errors" color="invert">
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
                <Tooltip content="Vectorize your attributes. Integration to Hugging Face available" color="invert" placement="right">
                    <button onClick={() => dispatch(openModal(ModalEnum.ADD_EMBEDDING))}
                        className="inline-block items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                        <IconPlus className="h-5 w-5 inline-block mr-1" />
                        Generate embedding
                    </button>
                </Tooltip>
                <Tooltip content={!isManaged ? 'Check out our hosted version to use this function' : 'See which models are downloaded'} color="invert" placement="right">
                    <button disabled={!isManaged} onClick={() => router.push('/model-download')}
                        className={`"ml-1 inline-block items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer ${!isManaged ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}>
                        <IconArrowAutofitDown className="h-5 w-5 inline-block mr-1" />
                        See downloaded models
                    </button>
                </Tooltip>
            </div>
        </div>
        <Modal modalName={ModalEnum.FILTERED_ATTRIBUTES}>

        </Modal>
        <Modal modalName={ModalEnum.DELETE_EMBEDDING}>

        </Modal>
        <Modal modalName={ModalEnum.ADD_EMBEDDING}>
        </Modal>
    </div>);
}