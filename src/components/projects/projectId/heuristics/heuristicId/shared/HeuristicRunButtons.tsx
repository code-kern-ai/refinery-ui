import LoadingIcon from '@/src/components/shared/loading/LoadingIcon'
import { selectHeuristic } from '@/src/reduxStore/states/pages/heuristics'
import { selectProjectId } from '@/src/reduxStore/states/project'
import {
  CREATE_INFORMATION_SOURCE_PAYLOAD,
  RUN_HEURISTIC_THEN_TRIGGER_WEAK_SUPERVISION,
} from '@/src/services/gql/mutations/heuristics'
import { HeuristicRunButtonsProps } from '@/src/types/components/projects/projectId/heuristics/heuristicId/heuristics-details'
import { Status } from '@/src/types/shared/statuses'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { dateAsUTCDate } from '@/submodules/javascript-functions/date-parser'
import { InformationSourceType } from '@/submodules/javascript-functions/enums/enums'
import { useMutation } from '@apollo/client'
import { Tooltip } from '@nextui-org/react'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

export default function HeuristicRunButtons(props: HeuristicRunButtonsProps) {
  const projectId = useSelector(selectProjectId)
  const currentHeuristic = useSelector(selectHeuristic)

  const [canStartHeuristic, setCanStartHeuristic] = useState(true)
  const [justClickedRun, setJustClickedRun] = useState(false)

  const [createTaskMut] = useMutation(CREATE_INFORMATION_SOURCE_PAYLOAD)
  const [runHeuristicAndWeaklySuperviseMut] = useMutation(
    RUN_HEURISTIC_THEN_TRIGGER_WEAK_SUPERVISION,
  )

  useEffect(() => {
    setCanStartHeuristic(checkCanStartHeuristic())
  }, [currentHeuristic])

  function runHeuristic() {
    setJustClickedRun(true)
    createTaskMut({
      variables: {
        projectId: projectId,
        informationSourceId: currentHeuristic.id,
      },
    }).then((res) => {
      setJustClickedRun(false)
      if (
        currentHeuristic.informationSourceType ===
        InformationSourceType.LABELING_FUNCTION
      ) {
        props.updateDisplayLogWarning(false)
      }
    })
  }

  function runHeuristicAndWeaklySupervise() {
    runHeuristicAndWeaklySuperviseMut({
      variables: {
        projectId: projectId,
        informationSourceId: currentHeuristic.id,
        labelingTaskId: currentHeuristic.labelingTaskId,
      },
    }).then((res) => {
      setJustClickedRun(false)
      if (
        currentHeuristic.informationSourceType ===
        InformationSourceType.LABELING_FUNCTION
      ) {
        props.updateDisplayLogWarning(false)
      }
    })
  }

  function checkCanStartHeuristic() {
    if (justClickedRun) return false
    if (!currentHeuristic) return false
    if (!currentHeuristic.lastTask) return true
    if (
      currentHeuristic.lastTask.state === Status.FINISHED ||
      currentHeuristic.lastTask.state === Status.FAILED
    )
      return true
    const d: Date = dateAsUTCDate(new Date(currentHeuristic.lastTask.createdAt))
    const current: Date = new Date()
    if (d.getTime() - current.getTime() > 600000) return true // older than 10 min
    return false
  }

  return (
    <>
      {justClickedRun && (
        <div>
          <LoadingIcon color="indigo" />
        </div>
      )}
      <Tooltip
        content={
          props.runOn10IsRunning
            ? TOOLTIPS_DICT.HEURISTICS.RUN_ON_10_RUNNING
            : TOOLTIPS_DICT.HEURISTICS.RUN
        }
        color="invert"
        placement="left"
      >
        <button
          onClick={runHeuristic}
          disabled={!canStartHeuristic || props.runOn10IsRunning}
          className="ml-2 rounded-md border border-blue-300 bg-blue-50 px-4 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          Run
        </button>
      </Tooltip>
      <Tooltip
        content={
          props.runOn10IsRunning
            ? TOOLTIPS_DICT.HEURISTICS.RUN_ON_10_RUNNING
            : TOOLTIPS_DICT.HEURISTICS.RUN_WS
        }
        color="invert"
        placement="left"
      >
        <button
          onClick={runHeuristicAndWeaklySupervise}
          disabled={!canStartHeuristic || props.runOn10IsRunning}
          className="ml-2 rounded-md border bg-indigo-700 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-800 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          Run + weakly supervise
        </button>
      </Tooltip>
    </>
  )
}
