import { RecordDisplay } from "@/src/components/shared/record-display/RecordDisplay"
import { selectVisibleAttributesHeuristics, setAllAttributes } from "@/src/reduxStore/states/pages/settings"
import { selectProjectId } from "@/src/reduxStore/states/project"
import { getAttributes } from "@/src/services/base/attribute"
import { getEvaluationRunById, getEvaluationSets } from "@/src/services/base/playground"
import { arrayToDict, percentRoundString } from "@/submodules/javascript-functions/general"
import { IconArrowLeft, IconCheck, IconX } from "@tabler/icons-react"
import { useRouter } from "next/router"
import { Fragment, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

export default function EvaluationRunDetails() {
    const router = useRouter()
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const attributes = useSelector(selectVisibleAttributesHeuristics);

    const [evaluationRun, setEvaluationRun] = useState(null)
    const [evaluationSetsDict, setEvaluationSetsDict] = useState(null)
    const [aggregateResults, setAggregateResults] = useState(null)

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

    useEffect(() => {
        if (!evaluationRun) return;
        let aggregateResults = {
            matchedRecords: 0,
            updatedRecords: 0,
            missedRecords: 0
        };
        evaluationRun.results.forEach((result) => {
            aggregateResults.matchedRecords += result.true_positives.length;
            aggregateResults.updatedRecords += result.false_positives.length;
            aggregateResults.missedRecords += result.false_negatives.length;
        })

        setAggregateResults(aggregateResults)
    }, [evaluationRun])

    function refetchAttributesAndProcess() {
        getAttributes(projectId, ['ALL'], (res) => {
            dispatch(setAllAttributes(res));
        });
    }

    return <>
        {projectId && <div className={`grid overflow-hidden min-h-full p-4`}>
            <div className="flex items-center gap-2">
                <button onClick={() => router.back()} className="text-green-800 text-sm font-medium">
                    <IconArrowLeft className="h-5 w-5 inline-block text-green-800" />
                    <span className="leading-5">Go back</span>
                </button>
                <label className="text-lg leading-6 text-gray-900 font-medium"> Evaluation Run Results</label>
            </div>
            <div className="my-1">
                <div className="text-sm leading-5 font-normal text-gray-500 inline-block">You can see the results of the evaluation run</div>
            </div>
            <div className="text-md leading-5 font-normal text-gray-700 my-5"><strong>Aggregated view for all sets in the evaluation run</strong></div>
            <div className="grid grid-cols-3 gap-x-2">
                <RecordDisplaySearchesAggregated text="Matched records" howMany={aggregateResults?.matchedRecords} fromHowMany={aggregateResults?.matchedRecords + aggregateResults?.missedRecords} />
                <RecordDisplaySearchesAggregated text="Unrelated records" howMany={aggregateResults?.updatedRecords} fromHowMany={aggregateResults?.matchedRecords + aggregateResults?.updatedRecords} />
                <RecordDisplaySearchesAggregated text="Missed records" howMany={aggregateResults?.missedRecords} fromHowMany={aggregateResults?.matchedRecords + aggregateResults?.missedRecords} />
            </div>

            <div className="text-md leading-5 font-normal text-gray-700 mt-5"><strong>Statistics per each set in the evaluation run</strong></div>
            {evaluationRun && evaluationSetsDict && <div>
                {evaluationRun.results.map((result, index) => <Fragment key={index}>
                    <div className="text-md leading-5 font-normal text-gray-500 my-5"><strong className="underline">Question:</strong> {evaluationSetsDict[result.evaluation_set_id].question}</div>
                    <div className="grid grid-cols-3 gap-x-2">
                        <RecordDisplaySearches attributes={attributes} records={result.true_positives} text="Matched records"
                            howMany={result.true_positives.length} fromHowMany={evaluationSetsDict[result.evaluation_set_id].recordIds.length} />
                        <RecordDisplaySearches attributes={attributes} records={result.false_positives} text="Unrelated records"
                            howMany={result.false_positives.length} fromHowMany={result.false_positives.length + result.true_positives.length} />
                        <RecordDisplaySearches attributes={attributes} records={result.false_negatives} text="Missed records"
                            howMany={result.false_negatives.length} fromHowMany={evaluationSetsDict[result.evaluation_set_id].recordIds.length} />
                    </div>
                </Fragment>)}
            </div >}
        </div>
        }
    </>
}

function RecordDisplaySearches({ attributes, records, text, howMany, fromHowMany }) {
    const [showRecords, setShowRecords] = useState(false)
    const calculatedValueInPercent = percentRoundString(howMany / fromHowMany, 2)

    return <div className="relative bg-white pt-5 px-4 shadow rounded-lg">
        <dt>
            <div className={`flex items-center gap-2`}>
                {text === "Matched records" && <div className="bg-green-200 p-2 rounded-full flex justify-center items-center">
                    <IconCheck className="text-green-800" size={20} stroke={2.5} />
                </div>}
                {text === "Unrelated records" && <div className="bg-green-200 p-2 rounded-full flex justify-center items-center">
                    <IconX className="text-red-800" size={20} stroke={2.5} />
                </div>}
                {text === "Missed records" && <div className="bg-red-300 p-2 rounded-full flex justify-center items-center">
                    <IconX className="text-red-800" size={20} stroke={2.5} />
                </div>}

                <div>
                    <p className="text-sm font-medium text-gray-500 truncate">{text}</p>
                    <p className="text-md font-medium text-gray-900 truncate0">
                        {howMany}/{fromHowMany} ({calculatedValueInPercent})
                    </p>
                </div>
            </div>
        </dt>
        <dd className="pb-4 flex items-baseline">
            <div className="inset-x-0 bg-gray-50 px-4 py-4 w-full" style={{ maxHeight: "500px", overflowY: "auto" }}>
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

function RecordDisplaySearchesAggregated({ text, howMany, fromHowMany }) {
    const calculatedValueInPercent = percentRoundString(howMany / fromHowMany, 2)

    return <div className="relative bg-white p-4 shadow rounded-lg">
        <dt>
            <div className={`flex items-center gap-2`}>
                {text === "Matched records" && <div className="bg-green-200 p-2 rounded-full flex justify-center items-center">
                    <IconCheck className="text-green-800" size={20} stroke={2.5} />
                </div>}
                {text === "Unrelated records" && <div className="bg-green-200 p-2 rounded-full flex justify-center items-center">
                    <IconX className="text-red-800" size={20} stroke={2.5} />
                </div>}
                {text === "Missed records" && <div className="bg-red-300 p-2 rounded-full flex justify-center items-center">
                    <IconX className="text-red-800" size={20} stroke={2.5} />
                </div>}

                <div>
                    <p className="text-sm font-medium text-gray-500 truncate">{text}</p>
                    <p className="text-md font-medium text-gray-900 truncate0">
                        {howMany}/{fromHowMany} ({calculatedValueInPercent})
                    </p>
                </div>
            </div>
        </dt>
    </div>
}