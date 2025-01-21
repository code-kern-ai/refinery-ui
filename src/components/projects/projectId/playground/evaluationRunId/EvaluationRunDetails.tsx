import { selectProjectId } from "@/src/reduxStore/states/project"
import { getEvaluationRunById, getEvaluationSets } from "@/src/services/base/playground"
import { arrayToDict } from "@/submodules/javascript-functions/general"
import { useConsoleLog } from "@/submodules/react-components/hooks/useConsoleLog"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

export default function EvaluationRunDetails() {
    const router = useRouter()

    const projectId = useSelector(selectProjectId)

    const [evaluationRun, setEvaluationRun] = useState(null)
    const [evaluationSetsDict, setEvaluationSetsDict] = useState(null)

    useEffect(() => {
        if (!projectId || !router.query.evaluationRunId) return;
        getEvaluationRunById(projectId, router.query.evaluationRunId as string, (res) => {
            setEvaluationRun(res)
        })
        getEvaluationSets(projectId, (res) => {
            setEvaluationSetsDict(arrayToDict(res, "id", "question"))
        })
    }, [projectId, router.query.evaluationRunId])

    useConsoleLog(evaluationSetsDict)

    return <>
        {projectId && <div className={`grid overflow-hidden min-h-full p-4`}>
            <div>
                <label className="text-lg leading-6 text-gray-900 font-medium"> Evaluation Run Results</label>
                <div className="my-1">
                    <div className="text-sm leading-5 font-normal text-gray-500 inline-block">You can see the results of the evaluation run</div>
                </div>
            </div>
            {(evaluationRun && evaluationSetsDict) && <div>
                {Object.entries(evaluationRun.results).map(([key, value]) => {
                    return <div key={key} className="my-2">
                        <div className="text-sm leading-5 font-normal text-gray-500 inline-block mb-5">Question: {evaluationSetsDict[key]}</div>
                        <div>Search results</div>
                        {(value as any).searchResults.map((searchResult, index) => <div key={searchResult.id} className="my-2">
                            <div className="text-sm leading-5 font-normal text-gray-500 ">Record id: {searchResult.id}</div>
                            <div className="text-sm leading-5 font-normal text-gray-500 ">Score: {searchResult.score}</div>
                        </div>)}

                        <div>Evaluation</div>
                    </div>
                })}
            </div>}
        </div>
        }
    </>
}