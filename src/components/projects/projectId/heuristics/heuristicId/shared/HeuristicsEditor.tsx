import { selectHeuristic } from "@/src/reduxStore/states/pages/heuristics";
import { HeuristicsEditorProps } from "@/src/types/components/projects/projectId/heuristics/heuristicId/heuristics-details";
import { InformationSourceCodeLookup } from "@/src/util/classes/heuristics";
import { InformationSourceType } from "@/submodules/javascript-functions/enums/enums";
import { Editor } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const EDITOR_OPTIONS = { theme: 'vs-light', language: 'python', readOnly: false };

export default function HeuristicsEditor(props: HeuristicsEditorProps) {
    const currentHeuristic = useSelector(selectHeuristic);

    const [isInitial, setIsInitial] = useState(null);  //null as add state to differentiate between initial, not and unchecked

    useEffect(() => {
        if (!currentHeuristic) return;
        if (currentHeuristic.informationSourceType == InformationSourceType.LABELING_FUNCTION) {
            setIsInitial(InformationSourceCodeLookup.isCodeStillTemplate(currentHeuristic.sourceCode) != null)
        } else {
            setIsInitial(InformationSourceCodeLookup.isCodeStillTemplate(currentHeuristic.sourceCode.replace(props.embedding, '@@EMBEDDING@@')) != null)
        }
    }, [currentHeuristic]);

    function openBricksIntegrator() {
        document.getElementById('bricks-integrator-open-button').click();
    }

    return (
        <div className="border mt-1 relative">
            {isInitial && <div
                className="absolute top-0 bottom-0 left-0 right-0 bg-gray-200 flex items-center justify-center z-10" style={{ opacity: '0.9' }}>
                <div className="flex flex-col gap-2">
                    <button onClick={openBricksIntegrator}
                        className="bg-white text-gray-900 text font-semibold px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none">
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
                options={EDITOR_OPTIONS}
                onChange={(value) => {
                    props.updatedSourceCode(value);
                }}
            />
        </div>)
}