import { RecordDisplay } from "@/src/components/shared/record-display/RecordDisplay"
import { selectVisibleAttributesHeuristics, setAllAttributes } from "@/src/reduxStore/states/pages/settings"
import { selectProjectId } from "@/src/reduxStore/states/project"
import { getAttributes } from "@/src/services/base/attribute"
import { getEvaluationRunById, getEvaluationSets } from "@/src/services/base/playground"
import { arrayToDict, percentRoundString } from "@/submodules/javascript-functions/general"
import { useRouter } from "next/router"
import { Fragment, useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

export default function EvaluationRunDetails() {
    const router = useRouter()
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const attributes = useSelector(selectVisibleAttributesHeuristics);

    const [evaluationRun, setEvaluationRun] = useState(null)
    const [evaluationSetsDict, setEvaluationSetsDict] = useState(null)

    useEffect(() => {
        if (!projectId) return;
        refetchAttributesAndProcess();
    }, [projectId]);

    useEffect(() => {
        if (!projectId || !router.query.evaluationRunId) return;
        getEvaluationRunById(projectId, router.query.evaluationRunId as string, (res) => {
            setEvaluationRun(res)
        })
        getEvaluationSets(projectId, (res) => {
            setEvaluationSetsDict(arrayToDict(res, "id"))
        })
    }, [projectId, router.query.evaluationRunId])

    function refetchAttributesAndProcess() {
        getAttributes(projectId, ['ALL'], (res) => {
            dispatch(setAllAttributes(res));
        });
    }

    return <>
        {projectId && <div className={`grid overflow-hidden min-h-full p-4`}>
            <div>
                <label className="text-lg leading-6 text-gray-900 font-medium"> Evaluation Run Results</label>
                <div className="my-1">
                    <div className="text-sm leading-5 font-normal text-gray-500 inline-block">You can see the results of the evaluation run</div>
                </div>
            </div>
            {evaluationRun && evaluationSetsDict && <div>
                {evaluationRun.results.map((result, index) => <Fragment key={index}>
                    <div className="text-md leading-5 font-normal text-gray-500 my-5"><strong>Question:</strong> {evaluationSetsDict[result.evaluationSetId].question}</div>
                    <div className="grid grid-cols-3 gap-x-2">
                        <RecordDisplaySearches attributes={attributes} records={result.truePositives} text="Matched records"
                            calculatedValue={result.truePositives.length / evaluationSetsDict[result.evaluationSetId].recordIds.length} />
                        <RecordDisplaySearches attributes={attributes} records={result.falsePositives} text="Unrelated records"
                            calculatedValue={result.falsePositives.length / (result.falsePositives.length + result.truePositives.length)} />
                        <RecordDisplaySearches attributes={attributes} records={result.falseNegatives} text="Missed records"
                            calculatedValue={result.falseNegatives.length / evaluationSetsDict[result.evaluationSetId].recordIds.length} />
                    </div>
                    <div>
                    </div>
                </Fragment>)}
            </div >}
        </div>
        }
    </>
}

function RecordDisplaySearches({ attributes, records, text, calculatedValue }) {
    const [showRecords, setShowRecords] = useState(false)
    const calculatedValueInPercent = percentRoundString(calculatedValue, 2)

    return <div className="relative bg-white pt-5 px-4 sm:pt-6 sm:px-6 shadow rounded-lg">
        <dt>
            <div className={`absolute rounded-md p-3`}>
                {/* TODO add icons */}
            </div>
            <p className="text-sm font-medium text-gray-500 truncate">{text}</p>
            <p className="text-md font-medium text-gray-900 truncate0">
                {calculatedValue} ({calculatedValueInPercent})
            </p>
        </dt>
        <dd className="pb-6 flex items-baseline sm:pb-7">
            <div className="inset-x-0 bg-gray-50 px-4 py-4 sm:px-6 w-full">
                <div className="text-sm">
                    <button className="text-sm font-normal text-gray-500 underline" onClick={() => setShowRecords(!showRecords)}>{showRecords ? "Hide" : "Show"} records</button>
                </div>
                {showRecords && <>
                    {records.length > 0 ? <>
                        {records.map((record, index) => <div key={record.id} className="my-2">
                            <div key={index} className="flex flex-col gap-x-3 bg-white rounded-md border border-gray-300 py-2 px-3 m-2">
                                <RecordDisplay
                                    key={index}
                                    attributes={attributes}
                                    record={record} />
                            </div>
                        </div>)}
                    </> : <div className="leading-5 text-center mt-3 text-sm font-normal-text-gray-500 text-gray-500 italic">There are no matching results</div>}
                </>}
            </div>
        </dd>
    </div>
}