import Modal from "@/src/components/shared/modal/Modal";
import { selectOnAttributeEmbeddings } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { createEvaluationRun } from "@/src/services/base/playground";
import { Embedding } from "@/src/types/components/projects/projectId/settings/embeddings";
import { EvaluationGroup } from "@/src/types/components/projects/projectId/settings/playground";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Create', useButton: true };
const EVALUATION_RUN_THRESHOLD_DEFAULT = -9999;

export default function CreateEvaluationRunModal({ evaluationGroups, setRefetchTrigger }) {
    const projectId = useSelector(selectProjectId);
    const onAttributeEmbeddings = useSelector(selectOnAttributeEmbeddings);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);
    const [selectedEmbedding, setSelectedEmbedding] = useState<Embedding>(null);
    const [threshold, setThreshold] = useState<number>(EVALUATION_RUN_THRESHOLD_DEFAULT);
    const [evaluationGroup, setEvaluationGroup] = useState<EvaluationGroup>(null);

    const createEvaluationRunPost = useCallback(() => {
        createEvaluationRun(projectId, selectedEmbedding.id, evaluationGroup.id, threshold, (res) => {
            setEvaluationGroup(null);
            setSelectedEmbedding(null);
            setRefetchTrigger((prev => !prev));
        });
    }, [evaluationGroup, selectedEmbedding, projectId, threshold]);

    useEffect(() => {
        setAcceptButton({ ...acceptButton, emitFunction: createEvaluationRunPost, disabled: !selectedEmbedding || !evaluationGroup });
    }, [selectedEmbedding, evaluationGroup]);

    return <Modal modalName={ModalEnum.EVALUATION_RUN} acceptButton={acceptButton}>
        <div className="h-full">
            <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">Create new evaluation run</div>
            <div className="bg-white grid min-h-full gap-2 items-center" style={{ gridTemplateColumns: 'max-content auto' }}>
                <span className="mr-3">Embedding</span>
                <KernDropdown dropdownWidth="w-full" options={onAttributeEmbeddings} buttonName={selectedEmbedding ? selectedEmbedding.name : 'Select embedding'} selectedOption={(value) => setSelectedEmbedding(value)} dropdownClasses="my-2" />
                <span className="mr-3">Evaluation group</span>
                <KernDropdown dropdownWidth="w-full" options={evaluationGroups} buttonName={evaluationGroup ? evaluationGroup.name : 'Select group'} selectedOption={(value) => setEvaluationGroup(value)} dropdownClasses="my-2" />
                <span className="mr-3">Threshold</span>
                <input className="bg-white text-gray-700 text-sm font-semibold px-2 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" type="number" value={threshold} onChange={(e) => setThreshold(parseFloat(e.target.value))} />
            </div>
        </div>
    </Modal>
}