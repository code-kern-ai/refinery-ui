import { LabelSelectionBoxProps } from "@/src/types/components/projects/projectId/labeling/labeling";
import { useConsoleLog } from "@/submodules/react-components/hooks/useConsoleLog";

export default function LabelSelectionBox(props: LabelSelectionBoxProps) {

    useConsoleLog({ props: props });

    return (<div id="label-selection-box" style={{ top: props.position.top, left: props.position.left, minWidth: '270px' }}
        className={`flex flex-col rounded-lg bg-white shadow absolute z-10 border border-gray-300 ${props.activeTasks ? null : 'hidden'}`}>
        {props.activeTasks && <div className="max-h-80 overflow-y-auto">
            {props.activeTasks && props.activeTasks.map((task, index) => <>
                <div key={index} className={`flex flex-grow flex-row justify-center p-2 ${index != 0 ? 'border-t borders-gray' : null}`}>
                    <label className="mr-1 text-sm">Task:</label>
                    <label className="italic font-bold text-sm truncate pr-0.5" style={{ maxWidth: '12rem' }}>{task.task.name}</label>
                </div>
                <div className="flex flex-row gap-x-1 flex-nowrap p-2.5 border borders-gray"></div>
                <div className={`flex-grow flex flex-col justify-center ${index == props.activeTasks.length - 1 ? 'p-3' : 'px-3 pt-3'}`}>
                    {props.activeTasks && task.labels && task.labels.map((label, index) =>
                        <button key={label.id} className={`text-sm font-medium px-2 py-0.5 rounded-md border mb-2 focus:outline-none ${props.labelLookup[label.id].color.backgroundColor}  ${props.labelLookup[label.id].color.textColor}  ${props.labelLookup[label.id].color.borderColor}`} role="button"
                            style={{ display: props.labelLookup[label.id].visibleInSearch ? null : 'none' }}>
                            <span className="truncate" style={{ maxWidth: '260px' }}>{label.name}
                                {label.hotkey && <kbd className="ml-1 uppercase inline-flex items-center border bg-white border-gray-200 rounded px-2 text-sm font-sans font-medium text-gray-400">{label.hotkey}</kbd>}
                            </span>
                        </button>)}
                </div>
            </>)}
        </div>}
    </div>);
}