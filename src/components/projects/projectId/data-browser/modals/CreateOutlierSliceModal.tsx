import Modal from "@/src/components/shared/modal/Modal";
import { selectActiveSearchParams, selectSimilaritySearch } from "@/src/reduxStore/states/pages/data-browser";
import { selectEmbeddings } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { CREATE_OUTLIER_SLICE } from "@/src/services/gql/mutations/data-browser";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { useMutation } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Search', disabled: true, useButton: true }

export default function CreateOutlierSliceModal() {
    const projectId = useSelector(selectProjectId);

    const activeSearchParams = useSelector(selectActiveSearchParams);
    const similaritySearch = useSelector(selectSimilaritySearch);
    const embeddings = useSelector(selectEmbeddings);

    const [selectedEmbedding, setSelectedEmbedding] = useState<string>(null);
    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    const [createOutlierSliceMut] = useMutation(CREATE_OUTLIER_SLICE);

    const requestOutlierSlice = useCallback(() => {
        const embeddingId = embeddings.find((embedding) => embedding.name == selectedEmbedding).id;
        createOutlierSliceMut({ variables: { projectId: projectId, embeddingId: embeddingId } }).then((res) => { });
    }, [selectedEmbedding]);

    useEffect(() => {
        setAcceptButton({ ...ACCEPT_BUTTON, emitFunction: requestOutlierSlice, disabled: selectedEmbedding == null });
    }, [requestOutlierSlice, selectedEmbedding]);

    return (<Modal modalName={ModalEnum.CREATE_OUTLIER_SLICE} acceptButton={acceptButton}>
        <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium mb-3">Select embedding for outlier search </div>
        {(activeSearchParams.length > 0 || similaritySearch.recordsInDisplay) && <div className="text-red-500 mb-2 flex flex-grow justify-center text-sm">
            Warning: your current filter selection will be removed!</div>}

        <Dropdown options={embeddings} buttonName={selectedEmbedding ?? 'Select embedding'} selectedOption={(option: string) => setSelectedEmbedding(option)} />
    </Modal>)
}