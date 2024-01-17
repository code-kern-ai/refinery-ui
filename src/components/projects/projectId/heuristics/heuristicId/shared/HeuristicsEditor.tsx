import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import { selectHeuristic } from "@/src/reduxStore/states/pages/heuristics";
import { selectLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { HeuristicsEditorProps } from "@/src/types/components/projects/projectId/heuristics/heuristicId/heuristics-details";
import { getClassLine } from "@/src/util/components/projects/projectId/heuristics/heuristicId/heuristics-details-helper";
import { InformationSourceType } from "@/submodules/javascript-functions/enums/enums";
import { Editor } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const EDITOR_OPTIONS = { theme: 'vs-light', language: 'python', readOnly: false };

export default function HeuristicsEditor(props: HeuristicsEditorProps) {
    const currentHeuristic = useSelector(selectHeuristic);

    const [editorValue, setEditorValue] = useState('');
    const [checkUnsavedChanges, setCheckUnsavedChanges] = useState(false);

    useEffect(() => {
        if (!currentHeuristic) return;
        setEditorValue(currentHeuristic.sourceCodeToDisplay);
    }, [currentHeuristic]);

    useEffect(() => {
        setCheckUnsavedChanges(hasUnsavedChanges());
    }, [editorValue]);

    useEffect(() => {
        const delayInputTimeoutId = setTimeout(() => {
            props.updatedSourceCode(editorValue);
            setCheckUnsavedChanges(hasUnsavedChanges());
        }, 1000);
        return () => clearTimeout(delayInputTimeoutId);
    }, [editorValue, 1000]);

    function openBricksIntegrator() {
        document.getElementById('bricks-integrator-open-button').click();
    }

    function hasUnsavedChanges() {
        if (!currentHeuristic) return false;
        if (currentHeuristic.informationSourceType === InformationSourceType.LABELING_FUNCTION) {
            if (editorValue != currentHeuristic.sourceCodeToDisplay) return true;
        } else if (currentHeuristic.informationSourceType === InformationSourceType.ACTIVE_LEARNING) {
            if (editorValue != currentHeuristic.sourceCodeToDisplay) return true;
        }
        return false;
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
            {checkUnsavedChanges && <div className="flex items-center absolute mt-2">
                <div className="text-sm font-normal">Saving...</div>
                <LoadingIcon color="indigo" />
            </div>}
        </>

    )
}