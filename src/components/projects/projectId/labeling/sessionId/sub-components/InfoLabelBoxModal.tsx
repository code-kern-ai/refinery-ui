import Modal from '@/src/components/shared/modal/Modal'
import { selectModal } from '@/src/reduxStore/states/modal'
import { selectSettings } from '@/src/reduxStore/states/pages/labeling'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { InfoLabelBoxModalProps } from '@/src/types/components/projects/projectId/labeling/task-header'
import { ModalEnum } from '@/src/types/shared/modal'
import { useSelector } from 'react-redux'

export default function InfoLabelBoxModal(props: InfoLabelBoxModalProps) {
  const projectId = useSelector(selectProjectId)
  const settings = useSelector(selectSettings)
  const modalInfo = useSelector(selectModal(ModalEnum.INFO_LABEL_BOX))

  return (
    <Modal modalName={ModalEnum.INFO_LABEL_BOX}>
      {modalInfo && modalInfo.labelSettingsLabel && (
        <div className="flex flex-col items-center">
          <div className="flex flex-row items-center gap-x-2">
            <h1 className="text-center text-lg font-bold text-gray-900">
              Info
            </h1>
            <div
              className={`rounded-md border px-2 py-0.5 text-sm font-medium focus:outline-none ${modalInfo.labelSettingsLabel.color.backgroundColor} ${modalInfo.labelSettingsLabel.color.textColor} ${modalInfo.labelSettingsLabel.color.borderColor}`}
            >
              <div className="truncate" style={{ maxWidth: '260px' }}>
                {modalInfo.labelSettingsLabel.name}
              </div>
            </div>
          </div>
          <div className="my-2 text-center text-sm text-gray-500">
            You can decide here what sources you want to display in the labeling
            view for this specific label.
          </div>
          <div className="grid grid-cols-3 items-center gap-2 text-left">
            <span className="text-sm font-bold text-gray-500">Shorthand</span>
            <span className="text-sm font-bold text-gray-500">Source</span>
            <span className="text-sm font-bold text-gray-500">
              Current value
            </span>
            <span className="text-sm text-gray-500">M</span>
            <span className="text-sm text-gray-500">Manually set labels</span>
            <span className="h-5 w-5 cursor-pointer justify-self-center">
              <input
                type="checkbox"
                onChange={() => props.toggleLabelDisplaySetting('showManual')}
                checked={
                  settings.task[projectId][modalInfo.labelSettingsLabel.taskId][
                    modalInfo.labelSettingsLabel.id
                  ].showManual
                }
              />
            </span>
            <span className="text-sm text-gray-500">WS</span>
            <span className="text-sm text-gray-500">
              Weakly supervised labels
            </span>
            <span className="h-5 w-5 cursor-pointer justify-self-center">
              <input
                type="checkbox"
                onChange={() =>
                  props.toggleLabelDisplaySetting('showWeakSupervision')
                }
                checked={
                  settings.task[projectId][modalInfo.labelSettingsLabel.taskId][
                    modalInfo.labelSettingsLabel.id
                  ].showWeakSupervision
                }
              />
            </span>
            <span className="text-sm text-gray-500">MC</span>
            <span className="text-sm text-gray-500">Model callback labels</span>
            <span className="h-5 w-5 cursor-pointer justify-self-center">
              <input
                type="checkbox"
                onChange={() => props.toggleLabelDisplaySetting('showModel')}
                checked={
                  settings.task[projectId][modalInfo.labelSettingsLabel.taskId][
                    modalInfo.labelSettingsLabel.id
                  ].showModel
                }
              />
            </span>
            <span className="text-sm text-gray-500">H</span>
            <span className="text-sm text-gray-500">Heuristic labels</span>
            <span className="h-5 w-5 cursor-pointer justify-self-center">
              <input
                type="checkbox"
                onChange={() =>
                  props.toggleLabelDisplaySetting('showHeuristics')
                }
                checked={
                  settings.task[projectId][modalInfo.labelSettingsLabel.taskId][
                    modalInfo.labelSettingsLabel.id
                  ].showHeuristics
                }
              />
            </span>
          </div>
        </div>
      )}
    </Modal>
  )
}
