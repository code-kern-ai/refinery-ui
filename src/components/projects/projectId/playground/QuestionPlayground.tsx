import { selectProjectId } from "@/src/reduxStore/states/project"
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import style from '@/src/styles/components/projects/projectId/playground.module.css';
import { PlaygroundSearch } from "./PlaygroundSearch";
import { EvaluationSets } from "./EvaluationSets";
import { EvaluationGroups } from "./EvaluationGroups";
import EvaluationRuns from "./EvaluationRuns";
import { getAttributes } from "@/src/services/base/attribute";
import { setAllAttributes, setAllEmbeddings } from "@/src/reduxStore/states/pages/settings";
import { getEmbeddings } from "@/src/services/base/embedding";
import { postProcessingEmbeddings } from "@/src/util/components/projects/projectId/settings/embeddings-helper";

const PLAYGROUND_TABS = ['Playground', 'Sets', 'Groups', 'Runs'];

export default function QuestionPlayground() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);

    const [openTab, setOpenTab] = useState(0);

    useEffect(() => {
        if (!projectId) return;
        refetchAttributesAndProcess();
        refetchEmbeddingsAndPostProcess();
    }, [projectId]);

    function toggleTabs(index: number) {
        setOpenTab(index);
    }

    function refetchAttributesAndProcess() {
        getAttributes(projectId, ['ALL'], (res) => {
            dispatch(setAllAttributes(res));
        });
    }

    function refetchEmbeddingsAndPostProcess() {
        getEmbeddings(projectId, (res) => {
            const embeddings = postProcessingEmbeddings(res, []);
            dispatch(setAllEmbeddings(embeddings));
        });
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
        {openTab == 1 && <EvaluationSets />}
        {openTab == 2 && <EvaluationGroups />}
        {openTab == 3 && <EvaluationRuns />}
    </>
}