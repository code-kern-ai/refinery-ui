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

export default function CreateEvaluationRunModal({ evaluationGroups, setRefetchTrigger }) {
    const projectId = useSelector(selectProjectId);
    const onAttributeEmbeddings = useSelector(selectOnAttributeEmbeddings);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);
    const [selectedEmbedding, setSelectedEmbedding] = useState<Embedding>(null);
    const [evaluationGroup, setEvaluationGroup] = useState<EvaluationGroup>(null);

    const createEvaluationRunPost = useCallback(() => {
        createEvaluationRun(projectId, selectedEmbedding.id, evaluationGroup.id, (res) => {
            setEvaluationGroup(null);
            setSelectedEmbedding(null);
            setRefetchTrigger((prev => !prev));
        });
    }, [evaluationGroup, selectedEmbedding, projectId]);

    useEffect(() => {
        setAcceptButton({ ...acceptButton, emitFunction: createEvaluationRunPost, disabled: !selectedEmbedding || !evaluationGroup });
    }, [selectedEmbedding, evaluationGroup]);

    return <Modal modalName={ModalEnum.EVALUATION_RUN} acceptButton={acceptButton}>
        <div className="h-full">
            <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">Create new evaluation run</div>
            <div className={`bg-white grid min-h-full gap-2 items-center`} style={{ gridTemplateColumns: 'max-content auto' }}>
                <span className="mr-3">Embedding</span>
                <KernDropdown dropdownWidth={"w-full"} options={onAttributeEmbeddings} buttonName={selectedEmbedding ? selectedEmbedding.name : 'Select embedding'} selectedOption={(value) => setSelectedEmbedding(value)} dropdownClasses="my-2" />
                <span className="mr-3">Evaluation group</span>
                <KernDropdown dropdownWidth={"w-full"} options={evaluationGroups} buttonName={evaluationGroup ? evaluationGroup.name : 'Select group'} selectedOption={(value) => setEvaluationGroup(value)} dropdownClasses="my-2" />
            </div>
        </div>
    </Modal>
}