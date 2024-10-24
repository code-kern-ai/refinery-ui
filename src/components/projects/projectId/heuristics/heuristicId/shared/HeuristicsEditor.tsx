import { selectHeuristic } from "@/src/reduxStore/states/pages/heuristics";
import { HeuristicsEditorProps } from "@/src/types/components/projects/projectId/heuristics/heuristicId/heuristics-details";
import { Editor } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { debounceTime, distinctUntilChanged, fromEvent } from "rxjs";

const EDITOR_OPTIONS = { theme: 'vs-light', language: 'python', readOnly: false };

export default function HeuristicsEditor(props: HeuristicsEditorProps) {
    const currentHeuristic = useSelector(selectHeuristic);

    const [editorValue, setEditorValue] = useState(currentHeuristic.sourceCodeToDisplay);

    useEffect(() => {
        setEditorValue(currentHeuristic.sourceCodeToDisplay);
    }, [currentHeuristic]);

    useEffect(() => {
        if (!currentHeuristic) return;
        props.setCheckUnsavedChanges(hasUnsavedChanges());
    }, [editorValue, currentHeuristic]);

    useEffect(() => {
        if (!currentHeuristic || currentHeuristic.sourceCodeToDisplay == editorValue) return;
        const observer = fromEvent(document, 'keyup');
        const subscription = observer.pipe(
            debounceTime(2000),
            distinctUntilChanged()
        ).subscribe(() => {
            props.updatedSourceCode(editorValue);
            props.setCheckUnsavedChanges(hasUnsavedChanges());
        });
        return () => subscription.unsubscribe();
    }, [editorValue, currentHeuristic]);

    function openBricksIntegrator() {
        document.getElementById('bricks-integrator-open-button').click();
    }

    function hasUnsavedChanges() {
        if (!currentHeuristic) return false;
        return editorValue != currentHeuristic.sourceCodeToDisplay;
    }

    return (
        <>
            <div className="border mt-1 relative">
                {props.isInitial && <div
                    className="absolute top-0 bottom-0 left-0 right-0 bg-gray-200 flex items-center justify-center z-10" style={{ opacity: '0.9' }}>
                    <div className="flex flex-col gap-2">
                        <button onClick={openBricksIntegrator}
                            className="bg-white text-gray-900 text font-semibold px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none">
                            Search in bricks
                        </button>
                        <button onClick={() => props.setIsInitial(false)}
                            className="bg-white text-gray-900 text font-semibold px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none">
                            Start from scratch
                        </button>
                    </div>
                </div>}
                <Editor
                    height="400px"
                    defaultLanguage={'python'}
                    value={editorValue}
                    options={EDITOR_OPTIONS}
                    onChange={(value) => {
                        setEditorValue(value);
                    }}
                />
            </div>

        </>

    )
}