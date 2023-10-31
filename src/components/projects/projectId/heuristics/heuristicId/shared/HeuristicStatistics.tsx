import { selectHeuristic } from "@/src/reduxStore/states/pages/heuristics"
import { Stat } from "@/src/types/components/projects/projectId/heuristics/heuristics";
import { useSelector } from "react-redux"

export default function HeuristicStatistics() {
    const currentHeuristic = useSelector(selectHeuristic);

    return (
        <div className="mt-8">
            <div className="text-sm leading-5 font-medium text-gray-700 inline-block">Statistics</div>
            <div className="mt-1 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full border divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col"
                                            className="py-2 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6">
                                            Label</th>
                                        <th scope="col"
                                            className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                            <span className="tooltip-text-smaller tooltip tooltip-right"
                                                data-tip="True positives / (True positives + False positives) for the reference data you labeled">Est.
                                                Precision</span>
                                        </th>
                                        {currentHeuristic.returnType == 'YIELD' && <th scope="col"
                                            className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                            <span className="tooltip-text-smaller tooltip tooltip-right"
                                                data-tip="True positives / (True positives + False negatives) for the reference data you labeled">Est.
                                                Recall</span>
                                        </th>}
                                        <th scope="col"
                                            className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                            <span className="tooltip-text-smaller tooltip tooltip-left"
                                                data-tip="How many records does this heuristic generally hit?">Coverage</span>
                                        </th>
                                        <th scope="col"
                                            className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                            <span className="tooltip-text-no-margin tooltip tooltip-left"
                                                data-tip="How many spans are hit by this heuristic?">Hits</span>
                                        </th>
                                        <th scope="col"
                                            className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                            <span className="tooltip-text-bigger tooltip tooltip-left"
                                                data-tip="On how many records (or spans) does this heuristic create conflicting expressions to other heuristics?">Conflicts</span>
                                        </th>
                                        <th scope="col"
                                            className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                            <span className="tooltip-text-bigger tooltip tooltip-left"
                                                data-tip="On how many records (or spans) does this heuristic create overlapping expressions to other heuristics?">Overlaps</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentHeuristic.stats.map((sourceContainer: Stat, j) => (<tr key={sourceContainer.label} className={`${j % 2 != 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                        <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${sourceContainer.color.backgroundColor} ${sourceContainer.color.textColor} ${sourceContainer.color.borderColor} ${sourceContainer.color.hoverColor}`}>
                                                {sourceContainer.label}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                            {sourceContainer.values.Precision}
                                        </td>
                                        {currentHeuristic.returnType == 'YIELD' && <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                            {sourceContainer.values.Recall}
                                        </td>}
                                        <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                            {sourceContainer.values.Coverage}
                                        </td>
                                        <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                            {sourceContainer.values.TotalHits}
                                        </td>
                                        <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                            {sourceContainer.values.Conflicts}
                                        </td>
                                        <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                            {sourceContainer.values.Overlaps}
                                        </td>
                                    </tr>))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div >
            </div>
        </div>
    )
}