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
    function hasUnsavedChanges() {
        if (!currentHeuristic) return false;
        return editorValue != currentHeuristic.sourceCodeToDisplay;
    }

    return (
        <>
            <div className="border mt-1 relative">
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