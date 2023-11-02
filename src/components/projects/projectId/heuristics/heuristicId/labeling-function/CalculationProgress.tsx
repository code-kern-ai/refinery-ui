import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import { selectHeuristic } from "@/src/reduxStore/states/pages/heuristics";
import { Status } from "@/src/types/shared/statuses";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { Tooltip } from "@nextui-org/react";
import { IconAlertTriangleFilled, IconArrowRight, IconCircleCheckFilled } from "@tabler/icons-react";
import { useSelector } from "react-redux";

export default function CalculationProgress() {
    const currentHeuristic = useSelector(selectHeuristic);

    return (<div className="mt-8">
        <div className="text-sm leading-5 font-medium text-gray-700 inline-block">Last execution</div>
        {currentHeuristic.lastTask ? (<>
            <div className="mb-4 card border border-gray-200 bg-white flex-grow overflow-visible rounded-2xl">
                <div className="card-body p-6">
                    <div className="flex flex-row justify-between items-center">
                        <div className="flex flex-grow items-center">
                            {currentHeuristic.lastTask.state === Status.CREATED && <Tooltip content={TOOLTIPS_DICT.LABELING_FUNCTION.CURRENTLY_RUNNING} color="invert" placement="right">
                                <LoadingIcon />
                            </Tooltip>}
                            {currentHeuristic.lastTask.state == Status.FINISHED && <Tooltip content={TOOLTIPS_DICT.LABELING_FUNCTION.FINISHED} color="invert">
                                <IconCircleCheckFilled className="h-6 w-6 text-green-500" />
                            </Tooltip>}
                            {currentHeuristic.lastTask.state == Status.FAILED && <Tooltip content={TOOLTIPS_DICT.LABELING_FUNCTION.ERROR} color="invert">
                                <IconAlertTriangleFilled className="h-6 w-6 text-red-500" />
                            </Tooltip>}
                            {currentHeuristic.lastTask.state === Status.CREATED ? (<>
                                <div className="text-sm leading-5 font-normal text-gray-500">run#{currentHeuristic.lastTask.iteration}</div>
                                <div className="text-sm leading-5 font-normal text-gray-500 w-full">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                        <div className="bg-green-400 h-2.5 rounded-full" style={{ 'width': currentHeuristic.lastTask.progress + '%' }}>
                                        </div>
                                    </div>
                                </div>
                            </>) : (<><div className="text-sm leading-5 font-normal text-gray-500">run#{currentHeuristic.lastTask.iteration}</div>
                                {currentHeuristic.lastTask.durationText && <Tooltip content={TOOLTIPS_DICT.LABELING_FUNCTION.EXECUTION_TIME} color="invert" placement="top">
                                    <div className="text-sm leading-5 font-normal text-gray-500 ml-2 select-none flex items-center">
                                        <IconArrowRight className="h-4 w-4 text-gray-500" />
                                        <span className="ml-2">{currentHeuristic.lastTask.durationText}</span>
                                    </div>
                                </Tooltip>}
                            </>)}
                        </div>

                        <div className="flex">
                            <div className="text-sm leading-5 font-normal text-gray-500">{currentHeuristic.lastTask.createdAtDisplay}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>) : <>
            <div className="bg-white">
                <div className="py-6 text-sm leading-5 font-normal text-gray-500">This heuristic was not yet run.</div>
            </div>
        </>}
    </div>)
}