import LoadingIcon from '@/src/components/shared/loading/LoadingIcon'
import Modal from '@/src/components/shared/modal/Modal'
import { openModal } from '@/src/reduxStore/states/modal'
import { selectHeuristic } from '@/src/reduxStore/states/pages/heuristics'
import { selectLabelingTasksAll } from '@/src/reduxStore/states/pages/settings'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { GET_ZERO_SHOT_TEXT } from '@/src/services/gql/queries/heuristics'
import { ModalEnum } from '@/src/types/shared/modal'
import { postProcessZeroShotText } from '@/src/util/components/projects/projectId/heuristics/heuristicId/zero-shot-helper'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { useLazyQuery } from '@apollo/client'
import { Tooltip } from '@nextui-org/react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { Fragment, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ZeroShotExecution from './ZeroShotExecution'
import WhySoLongModal from './WhySoLongModal'
import { PlaygroundProps } from '@/src/types/components/projects/projectId/heuristics/heuristicId/zero-shot'

export default function Playground(props: PlaygroundProps) {
  const dispatch = useDispatch()

  const projectId = useSelector(selectProjectId)
  const currentHeuristic = useSelector(selectHeuristic)
  const labelingTasks = useSelector(selectLabelingTasksAll)

  const [testInput, setTestInput] = useState<string>('')
  const [customLabels, setCustomLabels] = useState<string>('')
  const [testerRequestedSomething, setTesterRequestedSomething] =
    useState<boolean>(false)
  const [singleLineTesterResult, setSingleLineTesterResult] = useState<
    string[]
  >([])

  const [refetchZeroShotText] = useLazyQuery(GET_ZERO_SHOT_TEXT, {
    fetchPolicy: 'network-only',
  })

  function runZeroShotTest() {
    if (testInput.length == 0) return
    if (testerRequestedSomething) return
    let labels
    const useTaskLabels = customLabels == ''
    if (useTaskLabels) {
      labels = labelingTasks
        .find((task) => task.id == currentHeuristic.labelingTaskId)
        .labels.filter(
          (l) =>
            !currentHeuristic.zeroShotSettings.excludedLabels.includes(l.id),
        )
        .map((l) => l.name)
    } else labels = customLabels.split(',').map((l) => l.trim())
    if (!labels.length) return
    setTesterRequestedSomething(true)
    setSingleLineTesterResult([])
    refetchZeroShotText({
      variables: {
        projectId: projectId,
        informationSourceId: currentHeuristic.id,
        config: currentHeuristic.zeroShotSettings.targetConfig,
        text: testInput,
        runIndividually: currentHeuristic.zeroShotSettings.runIndividually,
        labels: JSON.stringify(labels),
      },
    }).then((res) => {
      const labels = labelingTasks.find(
        (task) => task.id == currentHeuristic.labelingTaskId,
      ).labels
      setSingleLineTesterResult(
        postProcessZeroShotText(res.data['zeroShotText'], labels).labels,
      )
      setTesterRequestedSomething(false)
    })
  }

  return (
    <>
      <div className="mt-8 text-sm leading-5">
        <div className="font-medium text-gray-700">
          Playground
          <span className="ml-2 font-normal text-gray-500">
            Zero-shot models take some time, so feel free to play around with it
            a bit before, during or after you run the heuristic.
          </span>
        </div>

        <div>
          <input
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Enter any text..."
            onKeyDown={(e) => {
              if (e.key == 'Enter') runZeroShotTest()
            }}
            type="text"
            className="placeholder-italic h-8 w-full rounded-md border border-gray-300 pl-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
          />
        </div>

        <div className="mt-2 flex flex-row items-center">
          <span className="mr-3 flex-shrink-0 text-sm font-normal leading-10 text-gray-500">
            By default we use the labels from your selected task. You can also
            switch them on or off.
          </span>
          <input
            value={customLabels}
            onChange={(e) => setCustomLabels(e.target.value)}
            placeholder="You can test with different labels. Separate them by comma"
            type="text"
            className="placeholder-italic h-8 w-full rounded-md border border-gray-300 pl-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
          />

          <div className="w-8">
            {testerRequestedSomething && (
              <Tooltip
                content={TOOLTIPS_DICT.ZERO_SHOT.WHY_SO_LONG}
                color="invert"
                placement="top"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => dispatch(openModal(ModalEnum.WHY_SO_LONG))}
                >
                  <LoadingIcon color="indigo" />
                </div>
              </Tooltip>
            )}
          </div>
          <Tooltip
            content={TOOLTIPS_DICT.ZERO_SHOT.COMPUTE_TEXT}
            color="invert"
            placement="left"
          >
            <button
              disabled={testerRequestedSomething}
              onClick={runZeroShotTest}
              className="ml-3 cursor-pointer whitespace-nowrap rounded-md border bg-indigo-700 px-4 py-2 text-xs font-medium leading-4 text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Compute example
            </button>
          </Tooltip>
        </div>

        {singleLineTesterResult.length > 0 && (
          <div className="mt-2 text-sm leading-5">
            <span className="font-semibold text-gray-700">Prediction</span>
            <div
              className="grid grid-cols-3 items-center gap-x-2 gap-y-2 text-left"
              style={{
                gridTemplateColumns: 'max-content max-content max-content',
              }}
            >
              {singleLineTesterResult.map((result: any) => (
                <Fragment key={result.labelName}>
                  {result.color ? (
                    <div
                      className={`m-2 items-center rounded border px-2 py-0.5 text-center text-xs font-medium ${result.color.backgroundColor} ${result.color.textColor} ${result.color.borderColor} ${result.color.hoverColor}`}
                    >
                      {result.labelName}
                    </div>
                  ) : (
                    <div className="m-2 items-center rounded border border-gray-400 bg-gray-100 px-2 py-0.5 text-center text-xs font-medium text-gray-700 hover:bg-gray-200">
                      {result.labelName}
                    </div>
                  )}
                  <div className="text-sm font-normal leading-5 text-gray-500">
                    <div className="h-2.5 w-64 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2.5 rounded-full bg-green-400"
                        style={{ width: result.confidenceText }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex flex-row items-center">
                    <span className="mr-2 select-none self-start text-sm">
                      {result.confidenceText}
                    </span>
                    {result.confidence <
                      currentHeuristic.zeroShotSettings.minConfidence && (
                      <Tooltip
                        content={TOOLTIPS_DICT.ZERO_SHOT.CONFIDENCE_TOO_LOW}
                        color="invert"
                        placement="top"
                        className="cursor-auto"
                      >
                        <IconAlertTriangle className="h-5 w-5 text-yellow-500" />
                      </Tooltip>
                    )}
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        )}
        <WhySoLongModal />
      </div>

      <ZeroShotExecution
        customLabels={customLabels}
        setIsModelDownloading={(val: boolean) =>
          props.setIsModelDownloading(val)
        }
      />
    </>
  )
}
