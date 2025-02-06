import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { selectVisibleAttributesDataBrowser } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { createEvaluationGroups, getEvaluationSets } from "@/src/services/base/playground";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Create', useButton: true };

type CreateEvaluationGroupModalProps = {
    refetchEvaluationGroups: () => void;
}

export default function CreateEvaluationGroupModal(props: CreateEvaluationGroupModalProps) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);
    const [name, setName] = useState("");
    const [evaluationSets, setEvaluationSets] = useState([]);
    const [selectedSets, setSelectedSets] = useState([]);
    const evaluationGroupModalState = useSelector(selectModal(ModalEnum.EVALUATION_GROUP));

    const createEvaluationGroupPost = useCallback(() => {
        createEvaluationGroups(projectId, selectedSets.map((set) => set.id), name, (res) => {
            props.refetchEvaluationGroups();
        });
    }, [name, selectedSets, projectId]);

    useEffect(() => {
        if (!evaluationGroupModalState.open) {
            setName("");
            setSelectedSets([]);
        }
    }, [evaluationGroupModalState.open, dispatch]);

    useEffect(() => {
        setAcceptButton({ ...acceptButton, emitFunction: createEvaluationGroupPost, disabled: selectedSets.length === 0 || name === "" });
    }, [createEvaluationGroupPost, name, selectedSets]);

    useEffect(() => {
        if (!evaluationGroupModalState.open) return
        getEvaluationSets(projectId, (res) => {
            setEvaluationSets(res);
        });
    }, [projectId, evaluationGroupModalState.open]);

    return <Modal modalName={ModalEnum.EVALUATION_GROUP} acceptButton={acceptButton} className="md:max-w-6xl">
        <div className="h-full">
            <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">Create new evaluation group</div>
            <div className="bg-white grid overflow-hidden min-h-full grid-cols-2 h-[calc(100vh-200px)] overflow-y-scroll">
                <div className="flex flex-col gap-y-2 m-3">
                    <div className="flex items-center">
                        <span className="mr-4">Execution</span>
                    </div>
                    <input placeholder="Enter name..."
                        className="placeholder-italic w-full p-2 line-height-textarea border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                        onChange={(event: any) => { setName(event.target.value); }}
                        value={name}
                    />
                    <div className="flex items-center">
                        <span className="mr-4">Selected results</span>
                    </div>
                    {selectedSets && selectedSets.map((set, index) => (<div key={set.id} className="bg-white overflow-hidden shadow rounded-lg border p-2 relative hover:border-red-400 hover:border-opacity-50 cursor-pointer transition-all duration-200 ease-in-out"
                        onClick={() => {
                            setEvaluationSets([...evaluationSets, set]);
                            const newSelectedSets = selectedSets.filter((item) => item.id !== set.id);
                            setSelectedSets(newSelectedSets);
                        }}>
                        {set.question}
                    </div >))}
                </div>
                <div className="h-full border-gray-300 border-l">
                    <div>Evaluation sets</div>
                    {evaluationSets && evaluationSets.map((set, index) => (<div key={set.id} className="bg-white overflow-hidden shadow rounded-lg border m-4 p-2 relative hover:border-green-400 hover:border-opacity-30 cursor-pointer transition-all duration-200 ease-in-out"
                        onClick={() => {
                            setSelectedSets([...selectedSets, set]);
                            const newEvaluationSets = evaluationSets.filter((item) => item.id !== set.id);
                            setEvaluationSets(newEvaluationSets);
                        }}>
                        {set.question}
                    </div >))}
                </div>
            </div>
        </div>
    </Modal>
}