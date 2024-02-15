import LoadingIcon from '@/src/components/shared/loading/LoadingIcon'
import { selectHeuristic } from '@/src/reduxStore/states/pages/heuristics'
import { Status } from '@/src/types/shared/statuses'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { Tooltip } from '@nextui-org/react'
import {
  IconAlertTriangleFilled,
  IconArrowRight,
  IconCircleCheckFilled,
} from '@tabler/icons-react'
import { useSelector } from 'react-redux'

export default function CalculationProgress() {
  const currentHeuristic = useSelector(selectHeuristic)

  return (
    <div className="mt-8">
      <div className="inline-block text-sm font-medium leading-5 text-gray-700">
        Last execution
      </div>
      {currentHeuristic.lastTask ? (
        <>
          <div className="card mb-4 flex-grow overflow-visible rounded-2xl border border-gray-200 bg-white">
            <div className="card-body p-6">
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-grow items-center">
                  {currentHeuristic.lastTask.state === Status.CREATED && (
                    <Tooltip
                      content={
                        TOOLTIPS_DICT.LABELING_FUNCTION.CURRENTLY_RUNNING
                      }
                      color="invert"
                      placement="right"
                      className="mx-2 cursor-auto"
                    >
                      <LoadingIcon />
                    </Tooltip>
                  )}
                  {currentHeuristic.lastTask.state == Status.FINISHED && (
                    <Tooltip
                      content={TOOLTIPS_DICT.GENERAL.SUCCESSFULLY_CREATED}
                      color="invert"
                      className="mx-2 cursor-auto"
                    >
                      <IconCircleCheckFilled className="h-6 w-6 text-green-500" />
                    </Tooltip>
                  )}
                  {currentHeuristic.lastTask.state == Status.FAILED && (
                    <Tooltip
                      content={TOOLTIPS_DICT.GENERAL.ERROR}
                      color="invert"
                      className="mx-2 cursor-auto"
                    >
                      <IconAlertTriangleFilled className="h-6 w-6 text-red-500" />
                    </Tooltip>
                  )}
                  {currentHeuristic.lastTask.state === Status.CREATED ? (
                    <>
                      <div className="text-sm font-normal leading-5 text-gray-500">
                        run#{currentHeuristic.lastTask.iteration}
                      </div>
                      <div className="w-full text-sm font-normal leading-5 text-gray-500">
                        <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-2.5 rounded-full bg-green-400"
                            style={{
                              width: currentHeuristic.lastTask.progress + '%',
                            }}
                          ></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-normal leading-5 text-gray-500">
                        run#{currentHeuristic.lastTask.iteration}
                      </div>
                      {currentHeuristic.lastTask.durationText && (
                        <Tooltip
                          content={
                            TOOLTIPS_DICT.LABELING_FUNCTION.EXECUTION_TIME
                          }
                          color="invert"
                          placement="top"
                          className="cursor-auto"
                        >
                          <div className="ml-2 flex select-none items-center text-sm font-normal leading-5 text-gray-500">
                            <IconArrowRight className="h-4 w-4 text-gray-500" />
                            <span className="ml-2">
                              {currentHeuristic.lastTask.durationText}
                            </span>
                          </div>
                        </Tooltip>
                      )}
                    </>
                  )}
                </div>

                <div className="flex">
                  <div className="text-sm font-normal leading-5 text-gray-500">
                    {currentHeuristic.lastTask.createdAtDisplay}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="bg-white">
            <div className="py-6 text-sm font-normal leading-5 text-gray-500">
              This heuristic was not yet run.
            </div>
          </div>
        </>
      )}
    </div>
  )
}
