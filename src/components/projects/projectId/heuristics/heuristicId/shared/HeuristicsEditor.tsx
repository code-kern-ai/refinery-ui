import { selectHeuristic } from "@/src/reduxStore/states/pages/heuristics";
import { getPythonFunctionRegExMatch } from "@/submodules/javascript-functions/python-functions-parser";
import { Editor } from "@monaco-editor/react";
import { useState } from "react";
import { useSelector } from "react-redux";

const EDITOR_OPTIONS = { theme: 'vs-light', language: 'python', readOnly: false };

export default function HeuristicsEditor() {
    const currentHeuristic = useSelector(selectHeuristic);

    const [isInitial, setIsInitial] = useState(null);  //null as add state to differentiate between initial, not and unchecked
    const [editorOptions, setEditorOptions] = useState(EDITOR_OPTIONS);

    function openBricksIntegrator() {
        // TODO: open bricks integrator
    }

    return (
        <div className="border mt-1 relative">
            {isInitial && <div
                className="absolute top-0 bottom-0 left-0 right-0 bg-gray-200 flex items-center justify-center z-10" style={{ opacity: '0.7' }}>
                <div className="flex flex-col gap-2">
                    <button onClick={openBricksIntegrator}
                        className="bg-white text-gray-700 text font-semibold px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none">
                        Search in bricks
                    </button>
                    <button onClick={() => setIsInitial(false)}
                        className="bg-white text-gray-900 text font-semibold px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none">
                        Start from scratch
                    </button>
                </div>
            </div>}
            <Editor
                height="400px"
                defaultLanguage={'python'}
                value={currentHeuristic.sourceCodeToDisplay}
                options={editorOptions}
                onChange={(value) => {
                    const regMatch: any = getPythonFunctionRegExMatch(value);
                    // changeAttributeName(regMatch ? regMatch[2] : '');
                    // setCurrentAttribute({ ...currentAttribute, sourceCode: value });
                    // updateSourceCode(value);
                }}
            />
        </div>)
}