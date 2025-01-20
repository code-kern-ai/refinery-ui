import { selectHeuristic } from "@/src/reduxStore/states/pages/heuristics"
import { HEURISTICS_STATISTICS_TABLE_COLUMNS, prepareTableBodyHeuristicStatistics } from "@/src/util/table-preparations/heuristic-statistics";
import KernTable from "@/submodules/react-components/components/kern-table/KernTable";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux"

export default function HeuristicStatistics() {
    const currentHeuristic = useSelector(selectHeuristic);

    const [preparedValues, setPreparedValues] = useState([]);

    useEffect(() => {
        setPreparedValues(prepareTableBodyHeuristicStatistics(currentHeuristic.stats));
    }, [currentHeuristic]);

    return (
        <div className="mt-8">
            <div className="text-sm leading-5 font-medium text-gray-700 inline-block">Statistics</div>
            <div className="mt-1 flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full py-2 align-middle">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <KernTable
                                headers={HEURISTICS_STATISTICS_TABLE_COLUMNS}
                                values={preparedValues}
                            />
                        </div>
                    </div>
                </div >
            </div>
        </div>
    )
}