import Modal from "@/src/components/shared/modal/Modal";
import { selectActiveSearchParams, selectSimilaritySearch } from "@/src/reduxStore/states/pages/data-browser";
import { selectEmbeddings, selectOnAttributeEmbeddings } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { createOutlierSlice } from "@/src/services/base/data-browser";
import { Embedding } from "@/src/types/components/projects/projectId/settings/embeddings";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Search', disabled: true, useButton: true }

export default function CreateOutlierSliceModal() {
    const projectId = useSelector(selectProjectId);

    const activeSearchParams = useSelector(selectActiveSearchParams);
    const similaritySearch = useSelector(selectSimilaritySearch);
    const embeddings = useSelector(selectEmbeddings);
    const onAttributeEmbeddings = useSelector(selectOnAttributeEmbeddings);

    const [selectedEmbedding, setSelectedEmbedding] = useState<Embedding>(null);
    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    const requestOutlierSlice = useCallback(() => {
        createOutlierSlice(projectId, selectedEmbedding.id, (result: any) => { });
    }, [selectedEmbedding]);

    useEffect(() => {
        setAcceptButton({ ...ACCEPT_BUTTON, emitFunction: requestOutlierSlice, disabled: selectedEmbedding == null });
    }, [requestOutlierSlice, selectedEmbedding]);

    return (<Modal modalName={ModalEnum.CREATE_OUTLIER_SLICE} acceptButton={acceptButton}>
        <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium mb-3">Select embedding for outlier search </div>
        {(activeSearchParams.length > 0 || similaritySearch.recordsInDisplay) && <div className="text-red-500 mb-2 flex flex-grow justify-center text-sm">
            Warning: your current filter selection will be removed!</div>}

        <KernDropdown options={onAttributeEmbeddings} buttonName={selectedEmbedding ? selectedEmbedding.name : 'Select embedding'} selectedOption={(option: any) => setSelectedEmbedding(option)} />
    </Modal>)
}