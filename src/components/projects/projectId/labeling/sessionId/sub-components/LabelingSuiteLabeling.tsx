import LoadingIcon from "@/src/components/shared/loading/LoadingIcon"
import { selectRecordRequests } from "@/src/reduxStore/states/pages/labeling"
import { LabelingVars } from "@/src/types/components/projects/projectId/labeling/labeling"
import { getDefaultLabelingVars } from "@/src/util/components/projects/projectId/labeling/labeling-helper"
import { Fragment, useState } from "react"
import { useSelector } from "react-redux"

export default function LabelingSuiteLabeling() {
    const recordRequests = useSelector(selectRecordRequests);

    const [lVars, setLVars] = useState<LabelingVars>(getDefaultLabelingVars())

    return (<div className="bg-white relative p-4">
        {/* {lVars.loading && <LoadingIcon size="lg" />} */}
        {!lVars.loading && recordRequests.record.deleted && <div className="flex items-center justify-center text-red-500">This Record has been deleted</div>}

        {!lVars.loading && !recordRequests.record.deleted && lVars.loopAttributes && <div className="grid w-full border md:rounded-lg items-center" style={{ gridTemplateColumns: 'max-content max-content 40px auto' }}>
            {lVars.loopAttributes.map((attribute, i) => (<Fragment key={attribute.id}>
                {lVars.taskLookup[attribute.id].lookup.map((task, j) => (<Fragment key={task.orderKey}>
                    <div className={`font-dmMono text-sm font-bold text-gray-500 py-2 pl-4 pr-3 sm:pl-6 col-start-1 h-full ${i % 2 == 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        {j == 0 ? attribute.name : ''}
                    </div>

                </Fragment>))}
            </Fragment>))}
        </div>}
    </div>)
}