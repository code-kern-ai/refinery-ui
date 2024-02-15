import { setModalStates } from '@/src/reduxStore/states/modal'
import {
  selectHeuristic,
  setActiveHeuristics,
} from '@/src/reduxStore/states/pages/heuristics'
import {
  selectLabelingTasksAll,
  selectTextAttributes,
} from '@/src/reduxStore/states/pages/settings'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { RUN_ZERO_SHOT_PROJECT } from '@/src/services/gql/mutations/heuristics'
import {
  GET_HEURISTICS_BY_ID,
  GET_ZERO_SHOT_10_RANDOM_RECORDS,
} from '@/src/services/gql/queries/heuristics'
import { ZeroShotExecutionProps } from '@/src/types/components/projects/projectId/heuristics/heuristicId/zero-shot'
import { ModalEnum } from '@/src/types/shared/modal'
import { Status } from '@/src/types/shared/statuses'
import {
  postProcessZeroShot,
  postProcessZeroShot10Records,
} from '@/src/util/components/projects/projectId/heuristics/heuristicId/zero-shot-helper'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { useLazyQuery, useMutation } from '@apollo/client'
import { Tooltip } from '@nextui-org/react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ViewDetailsZSModal from './ViewDetailsZSModal'
import { useRouter } from 'next/router'
import LoadingIcon from '@/src/components/shared/loading/LoadingIcon'

export default function ZeroShotExecution(props: ZeroShotExecutionProps) {
  const dispatch = useDispatch()
  const router = useRouter()

  const projectId = useSelector(selectProjectId)
  const currentHeuristic = useSelector(selectHeuristic)
  const labelingTasks = useSelector(selectLabelingTasksAll)
  const textAttributes = useSelector(selectTextAttributes)

  const [canRunProject, setCanRunProject] = useState(false)
  const [randomRecordTesterResult, setRandomRecordTesterResult] = useState(null)
  const [testerRequestedSomething, setTesterRequestedSomething] =
    useState(false)
  const [modelFailedMessage, setModelFailedMessage] = useState(null)
  const [noLabelsMessage, setNoLabelsMessage] = useState(null)

  const [refetchZeroShot10Records] = useLazyQuery(
    GET_ZERO_SHOT_10_RANDOM_RECORDS,
    { fetchPolicy: 'network-only' },
  )
  const [runZeroShotMut] = useMutation(RUN_ZERO_SHOT_PROJECT)
  const [refetchCurrentHeuristic] = useLazyQuery(GET_HEURISTICS_BY_ID, {
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (currentHeuristic) {
      setCanRunProject(
        !currentHeuristic.lastTask ||
          currentHeuristic.lastTask.state != Status.CREATED,
      )
    }
  }, [currentHeuristic])

  function runZeroShot10RecordTest() {
    setModelFailedMessage(false)
    setNoLabelsMessage(false)
    if (testerRequestedSomething) return
    let labels
    const useTaskLabels = props.customLabels == ''
    if (!useTaskLabels)
      labels = props.customLabels.split(',').map((l) => l.trim())
    else
      labels = labelingTasks
        .find((task) => task.id == currentHeuristic.labelingTaskId)
        .labels.filter(
          (l) =>
            !currentHeuristic.zeroShotSettings.excludedLabels.includes(l.id),
        )
        .map((l) => l.name)
    if (!labels.length) {
      setNoLabelsMessage(true)
      return
    }
    setTesterRequestedSomething(true)
    setRandomRecordTesterResult(null)
    refetchZeroShot10Records({
      variables: {
        projectId: projectId,
        informationSourceId: currentHeuristic.id,
        labels: JSON.stringify(labels),
      },
    }).then((res: any) => {
      if (res.errors && res.errors.length > 0) {
        setModelFailedMessage(true)
        setTesterRequestedSomething(false)
        props.setIsModelDownloading(false)
        return
      }
      const labels = labelingTasks.find(
        (task) => task.id == currentHeuristic.labelingTaskId,
      ).labels
      setRandomRecordTesterResult(
        postProcessZeroShot10Records(res.data['zeroShot10Records'], labels),
      )
      setTesterRequestedSomething(false)
      setModelFailedMessage(false)
    })
  }

  function runZeroShotProject() {
    if (!canRunProject) return
    if (testerRequestedSomething) return
    setTesterRequestedSomething(true)
    runZeroShotMut({
      variables: {
        projectId: projectId,
        informationSourceId: currentHeuristic.id,
      },
    }).then((res) => {
      setTesterRequestedSomething(false)
      refetchCurrentHeuristic({
        variables: {
          projectId: projectId,
          informationSourceId: router.query.heuristicId,
        },
      }).then((res) => {
        dispatch(
          setActiveHeuristics(
            postProcessZeroShot(
              res['data']['informationSourceBySourceId'],
              labelingTasks,
              textAttributes,
            ),
          ),
        )
      })
    })
  }

  return (
    <>
      <div className="mt-8 text-sm leading-5">
        <div className="mr-2 font-medium text-gray-700">Execution</div>
        <div
          className="grid items-center"
          style={{ gridTemplateColumns: 'auto max-content 0px' }}
        >
          <div className="font-normal text-gray-500">
            You can execute your model on all records, or test-run it on 10
            examples (which are sampled randomly). Test results are shown below
            after computation.
          </div>
          <div className="flex">
            {testerRequestedSomething && (
              <div className="m-1">
                {' '}
                <LoadingIcon color="indigo" />
              </div>
            )}
            <Tooltip
              content={TOOLTIPS_DICT.ZERO_SHOT.EXECUTE_10_RECORDS}
              color="invert"
              placement="top"
            >
              <button
                onClick={runZeroShot10RecordTest}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Run on 10
              </button>
            </Tooltip>

            <Tooltip
              content={
                testerRequestedSomething
                  ? TOOLTIPS_DICT.ZERO_SHOT.RUN_ON_10_TEST
                  : TOOLTIPS_DICT.ZERO_SHOT.EXECUTE_ALL_RECORDS
              }
              color="invert"
              placement="top"
            >
              <button
                onClick={runZeroShotProject}
                disabled={
                  !canRunProject ||
                  testerRequestedSomething ||
                  currentHeuristic.state == Status.QUEUED
                }
                className="ml-3 cursor-pointer rounded-md bg-indigo-700 px-4 py-2 text-xs font-semibold leading-4 text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Run
              </button>
            </Tooltip>
          </div>
        </div>
        {modelFailedMessage && (
          <div className="mt-2 text-sm leading-5 text-red-700">
            Error when running test, ensure that you have valid model and
            labels.
          </div>
        )}
        {noLabelsMessage && (
          <div className="mt-2 text-sm leading-5 text-red-700">
            No labels to run zero-shot.
          </div>
        )}
      </div>
      {randomRecordTesterResult && (
        <div className="mt-4 flex flex-col">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <div className="min-w-full divide-y divide-gray-300 border">
                  {randomRecordTesterResult.records.map((record, i) => (
                    <div key={i} className="divide-y divide-gray-200 bg-white">
                      {record.labels.length > 0 && (
                        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 shadow-sm">
                          <div className="my-3 ml-4 flex items-center text-left text-xs font-normal leading-5 text-gray-500">
                            {record.checkedText}
                          </div>
                          <div
                            className="grid flex-nowrap items-center"
                            style={{
                              gridTemplateColumns: 'auto 50px 40px 80px',
                            }}
                          >
                            {record.labels[0].color ? (
                              <div className="mr-5 flex items-center justify-center">
                                <span
                                  className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${record.labels[0].color.backgroundColor} ${record.labels[0].color.textColor} ${record.labels[0].color.borderColor} ${record.labels[0].color.hoverColor}`}
                                >
                                  {record.labels[0].labelName}
                                </span>
                              </div>
                            ) : (
                              <div className="mr-5 flex items-center justify-center">
                                <span
                                  className={`inline-flex items-center rounded border border-gray-400 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 hover:bg-gray-200`}
                                >
                                  {record.labels[0].labelName}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center justify-center">
                              <span className="text-center text-xs font-normal leading-5 text-gray-500">
                                {record.labels[0].confidenceText}
                              </span>
                            </div>
                            <div className="flex flex-row items-center">
                              {record.labels[0].confidence <
                              currentHeuristic.zeroShotSettings
                                .minConfidence ? (
                                <Tooltip
                                  content={
                                    TOOLTIPS_DICT.ZERO_SHOT.CONFIDENCE_TOO_LOW
                                  }
                                  color="invert"
                                  placement="top"
                                  className="cursor-auto"
                                >
                                  <IconAlertTriangle className="ml-1 mr-3 h-5 w-5 text-yellow-500" />
                                </Tooltip>
                              ) : (
                                <div className="w-10"></div>
                              )}
                            </div>
                            <div className="mr-5 flex items-center justify-center">
                              <label
                                onClick={() =>
                                  dispatch(
                                    setModalStates(
                                      ModalEnum.SAMPLE_RECORDS_ZERO_SHOT,
                                      { record: record, open: true },
                                    ),
                                  )
                                }
                                className=" inline-block cursor-pointer rounded border border-gray-300 bg-white px-4 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none"
                              >
                                View
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <ViewDetailsZSModal />
        </div>
      )}
    </>
  )
}
