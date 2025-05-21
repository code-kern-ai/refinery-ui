import { selectProjectId } from "@/src/reduxStore/states/project";
import { deleteQuestionFromHistory, getPlaygroundQuestions } from "@/src/services/base/playground";
import { PlaygroundQuestion } from "@/src/types/components/projects/projectId/settings/playground";
import IconButton from "@/submodules/react-components/components/kern-button/IconButton";
import { MemoIconHistory, MemoIconTrash } from "@/submodules/react-components/components/kern-icons/icons";
import useOnClickOutside from "@/submodules/react-components/hooks/useHooks/useOnClickOutside";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

export type QuestionHistoryProps = {
    setQuestion: (question: string) => void;
    refetchHistory: boolean;
}

export default function QuestionHistory(props: QuestionHistoryProps) {
    const projectId = useSelector(selectProjectId);

    const [questionHistory, setQuestionHistory] = useState<PlaygroundQuestion[]>();
    const [showHistory, setShowHistory] = useState(false);

    const dropdownRef = useRef(null);
    useOnClickOutside(dropdownRef, () => { setShowHistory(false) });

    useEffect(() => {
        if (!projectId) return;
        refetchQuestionMemory();
    }, [projectId, props.refetchHistory]);

    function handleHistoryClick(entry: string) {
        props.setQuestion(entry);
        setShowHistory(false);
    }

    function refetchQuestionMemory() {
        getPlaygroundQuestions(projectId, (result) => {
            setQuestionHistory(result);
        });
    }

    function deleteQuestionFromHistoryFunc(questionId: string) {
        deleteQuestionFromHistory(projectId, questionId, (result) => {
            refetchQuestionMemory();
        });
    }

    return (
        <>
            <IconButton
                icon={MemoIconHistory}
                tooltip="History"
                tooltipPlacement="bottom"
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowHistory(!showHistory);
                }}
            />
            {showHistory && (
                <div ref={dropdownRef} className="absolute top-8 right-0 w-80 bg-gray-100 border border-gray-300 shadow-lg rounded-md p-2 z-50 max-h-96 overflow-y-auto">
                    <div className="ml-1 text-md text-black mb-1">Last questions</div>
                    <ul>
                        {questionHistory && questionHistory.map((questionEntry) => (
                            <div key={questionEntry.id} onClick={() => handleHistoryClick(questionEntry.question)}
                                className="p-2 flex items-center rounded-md border-2 border-white cursor-pointer transition duration-150 bg-white my-2 hover:border-black">
                                <li className=" text-gray-700">
                                    {questionEntry.question}
                                </li>
                                <MemoIconTrash onClick={() => deleteQuestionFromHistoryFunc(questionEntry.id)}
                                    className="h-6 w-6 text-red-700 cursor-pointer ml-auto" />
                            </div>
                        ))}
                    </ul>
                </div>
            )}
        </>
    )
}