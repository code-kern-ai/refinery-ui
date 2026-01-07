import { executeQuestion } from "@/src/services/base/knowledge-graphs";
import { QuestionCatalogueOptions, QuestionType } from "@/src/types/components/projects/projectId/knowledge-graphs/knowledge-graphs";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { useCallback, useEffect, useState } from "react";

type KnowledgeGraphDetailsProps = {
    knowledgeGraphId: string;
}

export default function LiveKnowledgeGraphDetailsOverview(props: KnowledgeGraphDetailsProps) {
    const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.CATALOGUE);
    const [question, setQuestion] = useState("");
    const [questionData, setQuestionData] = useState<any>(null);

    useEffect(() => {
        setQuestion("");
    }, [questionType]);

    const executeQuestionFunc = useCallback(() => {
        executeQuestion(props.knowledgeGraphId, question, (res) => setQuestionData(res));
    }, [props.knowledgeGraphId, question]);

    return <>
        <div className="flex items-center gap-x-4">
            <div className="flex gap-1 items-center">
                <input type="radio" id="question-catalogue" name="question-type" value="dynamic"
                    onChange={() => setQuestionType(QuestionType.CATALOGUE)} checked={questionType === QuestionType.CATALOGUE}
                    style={{ accentColor: 'rgb(29,78,216)' }} className="h-4 w-4" />
                <label htmlFor="question-catalogue" className=" border-gray-200 cursor-pointer" >
                    Question catalogue
                </label>
            </div>
            <div className="flex gap-1 items-center">
                <input type="radio" id="question-custom" name="question-type" value="static"
                    onChange={() => setQuestionType(QuestionType.CUSTOM)} checked={questionType === QuestionType.CUSTOM}
                    style={{ accentColor: 'rgb(180,83,9)' }} className="h-4 w-4" />
                <label htmlFor="question-custom" className=" border-gray-200 cursor-pointer" >
                    Custom question
                </label>
            </div>
        </div>
        {questionType === QuestionType.CATALOGUE && <div className="mt-4 p-4 border border-gray-200 rounded bg-gray-50">
            <p className="text-sm text-gray-700">
                Use the question catalogue to explore pre-defined questions that are relevant to your knowledge graph. This feature helps you quickly find insights without needing to formulate your own questions.
            </p>
            <KernDropdown options={Object.values(QuestionCatalogueOptions)} buttonName={question !== '' ? question : 'Select a question'} selectedOption={setQuestion} />
        </div>}
        {questionType === QuestionType.CUSTOM && <div className="mt-4 p-4 border border-gray-200 rounded bg-gray-50">
            <p className="text-sm text-gray-700">
                Use the custom question feature to ask specific questions about your knowledge graph. This allows for more tailored inquiries, enabling you to extract precise information based on your unique needs.
            </p>
            <textarea
                className="mt-2 w-full p-2 border border-gray-300 rounded placeholder-italic"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your custom question here..."
            />
        </div>}
        <KernButton text="Execute" onClick={executeQuestionFunc} disabled={question === ''} className="mt-4" buttonColor="indigo" textColor="white" solidTheme />
    </>
}