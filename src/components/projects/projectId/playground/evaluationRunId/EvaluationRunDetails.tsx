import { RecordDisplay } from "@/src/components/shared/record-display/RecordDisplay"
import { selectVisibleAttributesHeuristics } from "@/src/reduxStore/states/pages/settings"
import { selectProjectId } from "@/src/reduxStore/states/project"
import { getEvaluationRunById, getEvaluationSets } from "@/src/services/base/playground"
import { EVALUATION_RUN_DETAILS_TABLE_HEADER, prepareEvaluationRunDetailsTableBody } from "@/src/util/table-preparations/evaluation-run-details"
import { arrayToDict } from "@/submodules/javascript-functions/general"
import KernTable from "@/submodules/react-components/components/kern-table/KernTable"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

export default function EvaluationRunDetails() {
    const router = useRouter()

    const projectId = useSelector(selectProjectId);
    const attributes = useSelector(selectVisibleAttributesHeuristics);


    const [evaluationRun, setEvaluationRun] = useState(null)
    const [evaluationSetsDict, setEvaluationSetsDict] = useState(null)
    const [preparedValues, setPreparedValues] = useState([])

    useEffect(() => {
        if (!projectId || !router.query.evaluationRunId) return;
        getEvaluationRunById(projectId, router.query.evaluationRunId as string, (res) => {
            setEvaluationRun(res)
        })
        getEvaluationSets(projectId, (res) => {
            setEvaluationSetsDict(arrayToDict(res, "id"))
        })
    }, [projectId, router.query.evaluationRunId])

    useEffect(() => {
        if (!evaluationRun || !evaluationSetsDict) return;
        // TODO: send the correct number of selected records
        setPreparedValues(prepareEvaluationRunDetailsTableBody(evaluationRun.results, 10))
    }, [evaluationRun, evaluationSetsDict])

    return <>
        {projectId && <div className={`grid overflow-hidden min-h-full p-4`}>
            <div>
                <label className="text-lg leading-6 text-gray-900 font-medium"> Evaluation Run Results</label>
                <div className="my-1">
                    <div className="text-sm leading-5 font-normal text-gray-500 inline-block">You can see the results of the evaluation run</div>
                </div>
            </div>
            {evaluationRun && evaluationSetsDict && <div>
                {evaluationRun.results.map((result, index) => <>
                    <div className="text-md leading-5 font-normal text-gray-500 inline-block my-5"><strong>Question:</strong> {evaluationSetsDict[result.evaluationSetId].question}</div>

                    <KernTable
                        headers={EVALUATION_RUN_DETAILS_TABLE_HEADER}
                        values={preparedValues}
                    />

                    <div className="grid grid-cols-3 gap-x-2 border border-gray-300 rounded-md p-2">
                        <RecordDisplaySearches attributes={attributes} records={result.truePositives} text="True positives" />
                        <RecordDisplaySearches attributes={attributes} records={result.falsePositives} text="False positives" />
                        <RecordDisplaySearches attributes={attributes} records={result.falseNegatives} text="False negatives" />
                    </div>
                </>)}
            </div >}
        </div>
        }
    </>
}

function RecordDisplaySearches({ attributes, records, text }) {
    return <div>
        <div className="text-center my-2">{text}</div>
        {records.length > 0 ? <>
            {records.map((record, index) => <div key={record.id} className="my-2">
                <div key={index} className="flex flex-col gap-x-3 bg-white rounded-md border border-gray-300 py-2 px-3 m-2">
                    <RecordDisplay
                        key={index}
                        attributes={attributes}
                        record={record} />
                </div>
            </div>)}
        </> : <div className="leading-5 text-sm font-normal-text-gray-500 text-gray-500 italic">There are no matching results</div>}
    </div>
}