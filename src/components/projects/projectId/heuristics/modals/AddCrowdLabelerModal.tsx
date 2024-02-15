import Modal from '@/src/components/shared/modal/Modal'
import { selectHeuristicType } from '@/src/reduxStore/states/pages/heuristics'
import { selectLabelingTasksAll } from '@/src/reduxStore/states/pages/settings'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { CREATE_HEURISTIC } from '@/src/services/gql/mutations/heuristics'
import { LabelingTask } from '@/src/types/components/projects/projectId/settings/labeling-tasks'
import { ModalButton, ModalEnum } from '@/src/types/shared/modal'
import {
  DEFAULT_DESCRIPTION,
  getFunctionName,
  getInformationSourceTemplate,
  getRouterLinkHeuristic,
} from '@/src/util/components/projects/projectId/heuristics/heuristics-helper'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import Dropdown2 from '@/submodules/react-components/components/Dropdown2'
import { useMutation } from '@apollo/client'
import { Tooltip } from '@nextui-org/react'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const ACCEPT_BUTTON = {
  buttonCaption: 'Create',
  useButton: true,
  disabled: true,
}

export default function AddCrowdLabelerModal() {
  const router = useRouter()

  const projectId = useSelector(selectProjectId)
  const labelingTasks = useSelector(selectLabelingTasksAll)
  const heuristicType = useSelector(selectHeuristicType)

  const [labelingTask, setLabelingTask] = useState<LabelingTask>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const [createHeuristicMut] = useMutation(CREATE_HEURISTIC)

  const createHeuristic = useCallback(() => {
    const matching = labelingTasks.filter((e) => e.id == labelingTask.id)
    const codeData = getInformationSourceTemplate(matching, heuristicType, '')
    if (!codeData) return

    createHeuristicMut({
      variables: {
        projectId: projectId,
        labelingTaskId: labelingTask.id,
        sourceCode: codeData.code,
        name: name,
        description: description,
        type: heuristicType,
      },
    }).then((res) => {
      let id =
        res['data']?.['createInformationSource']?.['informationSource']?.['id']
      if (id) {
        router.push(getRouterLinkHeuristic(heuristicType, projectId, id))
      } else {
        console.log(
          "can't find newly created id for " +
            heuristicType +
            " --> can't open",
        )
      }
    })
  }, [labelingTask, name, description])

  const [acceptButtonCL, setAcceptButtonCL] =
    useState<ModalButton>(ACCEPT_BUTTON)

  useEffect(() => {
    setAcceptButtonCL({
      ...ACCEPT_BUTTON,
      emitFunction: createHeuristic,
      disabled: !(labelingTask && name),
    })
  }, [labelingTask, name, createHeuristic])

  useEffect(() => {
    if (!labelingTasks || labelingTasks.length == 0) return
    setLabelingTask(labelingTasks[0])
    setName(getFunctionName(heuristicType))
    setDescription(DEFAULT_DESCRIPTION)
  }, [labelingTasks, heuristicType])

  return (
    <Modal
      modalName={ModalEnum.ADD_CROWD_LABELER}
      acceptButton={acceptButtonCL}
    >
      <h1 className="mb-4 text-center text-lg text-gray-900">
        Add new crowd labeler
      </h1>
      <div
        className="grid grid-cols-2 items-center gap-2"
        style={{ gridTemplateColumns: 'max-content auto' }}
      >
        <Tooltip
          content={TOOLTIPS_DICT.HEURISTICS.CHOOSE_LABELING_TASK}
          color="invert"
          placement="right"
        >
          <div className="justify-self-start">
            <span className="card-title label-text mb-0 cursor-help text-left">
              <span className="filtersUnderline underline">Labeling task</span>
            </span>
          </div>
        </Tooltip>
        <Dropdown2
          options={labelingTasks}
          buttonName={labelingTask?.name}
          selectedOption={(option: any) => setLabelingTask(option)}
          disabled={labelingTasks?.length == 0}
        />

        <Tooltip
          content={TOOLTIPS_DICT.HEURISTICS.ENTER_HEURISTIC_NAME}
          color="invert"
          placement="right"
        >
          <div className="justify-self-start">
            <span className="card-title label-text mb-0 cursor-help text-left">
              <span className="filtersUnderline underline">Heuristic name</span>
            </span>
          </div>
        </Tooltip>
        <input
          placeholder="Enter a function name..."
          value={name}
          onChange={(e: any) => setName(e.target.value)}
          className="placeholder-italic h-9 w-full rounded-md border border-gray-300 pl-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
        />
        <Tooltip
          content={TOOLTIPS_DICT.HEURISTICS.ENTER_DESCRIPTION}
          color="invert"
          placement="right"
        >
          <div className="justify-self-start">
            <span className="card-title label-text mb-0 cursor-help text-left">
              <span className="filtersUnderline underline">Description</span>
            </span>
          </div>
        </Tooltip>
        <input
          placeholder="Enter a description..."
          value={description}
          onChange={(e: any) => setDescription(e.target.value)}
          className="placeholder-italic h-9 w-full rounded-md border border-gray-300 pl-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
        />
      </div>
    </Modal>
  )
}
