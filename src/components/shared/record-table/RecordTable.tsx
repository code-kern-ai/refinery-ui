import { selectConfiguration } from "@/src/reduxStore/states/pages/data-browser";
import { RecordTableProps } from "@/src/types/shared/record-table";
import { prepareColumnsData, prepareTableData } from "@/src/util/shared/record-table-helper";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function RecordTable(props: RecordTableProps) {
    const configuration = useSelector(selectConfiguration);

    const [preparedColumnsData, setPreparedColumnsData] = useState(props.columnsData ?? []);
    const [preparedTableData, setPreparedTableData] = useState(props.tableData ?? []);

    useEffect(() => {
        setPreparedColumnsData(prepareColumnsData(props.columnsData));
        setPreparedTableData(prepareTableData(props.tableData));
    }, [props.columnsData, props.tableData]);

    return (<div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full border  divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            {preparedColumnsData.map((column) => (<th key={column.order} scope="col"
                                className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                {column.displayName}
                            </th>))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {preparedTableData && Object.values(preparedTableData).map((data, index) => (<tr key={data.id} className={`${index % 2 != 0 ? 'bg-gray-50' : 'bg-white'} ${(!data.isWSRelated && configuration.weakSupervisionRelated) ? 'hidden' : ''}`}>
                            {preparedColumnsData.map((column) => (<td key={column.order} className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                {column.field !== 'label' ? (<span>{data[column.field]}</span>) : (
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium border ${data.color.backgroundColor} ${data.color.textColor} ${data.color.borderColor} ${data.color.hoverColor}`}>
                                        {data[column.field]}
                                    </span>
                                )}
                            </td>))}
                        </tr>))}
                    </tbody>
                </table>
            </div>
        </div>
    </div >);
}