import { selectProjectId } from "@/src/reduxStore/states/project"
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import { PlaygroundSearch } from "./PlaygroundSearch";
import { EvaluationSets } from "./EvaluationSets";
import { EvaluationGroups } from "./EvaluationGroups";
import EvaluationRuns from "./EvaluationRuns";
import { getAttributes } from "@/src/services/base/attribute";
import { setAllAttributes, setAllEmbeddings } from "@/src/reduxStore/states/pages/settings";
import { getEmbeddings } from "@/src/services/base/embedding";
import { postProcessingEmbeddings } from "@/src/util/components/projects/projectId/settings/embeddings-helper";
import { IconCategoryPlus } from "@tabler/icons-react";

const STEPS = [
    { id: 0, name: 'Playground' },
    { id: 1, name: 'Sets' },
    { id: 2, name: 'Groups' },
    { id: 3, name: 'Runs' },
]

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
        {projectId && <>
            <div className={`overflow-hidden min-h-full p-4 flex items-center`}>
                <nav aria-label="Progress" className="flex items-center w-full">
                    <ol role="list" className="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0">
                        <li className="relative md:flex md:flex-1 cursor-pointer" onClick={() => toggleTabs(0)}>
                            {openTab == 0 ? (
                                <div className="flex items-center px-6 py-2 text-sm font-medium" aria-current="step">
                                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-purple-600">
                                        <IconCategoryPlus className="text-purple-600 h-5 w-5" />
                                    </span>
                                    <span className="ml-4 text-sm font-medium text-purple-600">{STEPS[0].name}</span>
                                </div>
                            ) : (
                                <div className="group flex items-center">
                                    <span className="flex items-center px-6 py-2 text-sm font-medium">
                                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300">
                                            <IconCategoryPlus className="text-gray-500 h-5 w-5" />
                                        </span>
                                        <span className="ml-4 text-sm font-medium text-gray-500">{STEPS[0].name}</span>
                                    </span>
                                </div>
                            )}
                        </li>
                    </ol>
                    <ol className="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0 ml-auto">
                        {STEPS.slice(1).map((step, stepIdx) => (
                            <li key={step.name} className="relative md:flex md:flex-1 cursor-pointer" onClick={() => toggleTabs(stepIdx + 1)}>
                                {openTab == step.id ? (
                                    <div className="flex items-center px-6 py-2 text-sm font-medium" aria-current="step">
                                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-purple-600">
                                            <span className="text-purple-600">{step.id}</span>
                                        </span>
                                        <span className="ml-4 text-sm font-medium text-purple-600">{step.name}</span>
                                    </div>
                                ) : (
                                    <div className="group flex items-center">
                                        <span className="flex items-center px-6 py-2 text-sm font-medium">
                                            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300">
                                                <span className="text-gray-500">{step.id}</span>
                                            </span>
                                            <span className="ml-4 text-sm font-medium text-gray-500">{step.name}</span>
                                        </span>
                                    </div>
                                )}
                                {stepIdx !== STEPS.length - 2 ? (
                                    <>
                                        <div className="absolute right-0 top-0 hidden h-full w-3 md:block" aria-hidden="true">
                                            <svg
                                                className="h-full w-full text-gray-300"
                                                viewBox="0 0 12 82"
                                                fill="none"
                                                preserveAspectRatio="none"
                                            >
                                                <path d="M0.5 0V31L10.5 41L0.5 51V82" stroke="currentcolor" vectorEffect="non-scaling-stroke" />
                                            </svg>
                                        </div>
                                    </>
                                ) : null}
                            </li>
                        ))}
                    </ol>
                </nav>
            </div>
            {openTab === 0 && <PlaygroundSearch />}
            {openTab === 1 && <EvaluationSets />}
            {openTab === 2 && <EvaluationGroups />}
            {openTab === 3 && <EvaluationRuns />}
        </>
        }
    </>
}