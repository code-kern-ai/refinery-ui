import { selectProjectId } from "@/src/reduxStore/states/project"
import { useState } from "react";
import { useSelector } from "react-redux"
import style from '@/src/styles/components/projects/projectId/playground.module.css';
import { PlaygroundSearch } from "./PlaygroundSearch";
import { ExecutionSets } from "./ExecutionSets";
import { ExecutionGroups } from "./ExecutionGroups";

const PLAYGROUND_TABS = ['Playground', 'Sets', 'Groups'];

export default function QuestionPlayground() {
    const projectId = useSelector(selectProjectId);

    const [openTab, setOpenTab] = useState(0);

    function toggleTabs(index: number) {
        setOpenTab(index);
    }

    return <>
        {projectId && <div className={`grid overflow-hidden min-h-full grid-cols-2 p-4`}>
            <div className={`flex max-w-full overflow-x-auto border-b-2 border-b-gray-200`}>
                {PLAYGROUND_TABS.map((tab, index) => <div key={tab}>
                    <div className={`cursor-pointer text-sm leading-5 font-medium mr-10 py-5 ${openTab == index ? 'text-indigo-700 ' + style.borderBottom : 'text-gray-500'}`} onClick={() => toggleTabs(index)}>{tab}</div>
                </div>)}
            </div>
        </div>}
        {openTab == 0 && <PlaygroundSearch />}
        {openTab == 1 && <ExecutionSets />}
        {openTab == 2 && <ExecutionGroups />}
    </>
}