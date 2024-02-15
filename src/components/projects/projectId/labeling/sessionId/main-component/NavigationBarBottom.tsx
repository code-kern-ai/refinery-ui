import { selectUser } from '@/src/reduxStore/states/general'
import { openModal } from '@/src/reduxStore/states/modal'
import { ModalEnum } from '@/src/types/shared/modal'
import { UserRole } from '@/src/types/shared/sidebar'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { Tooltip } from '@nextui-org/react'
import { IconSettings, IconTrash } from '@tabler/icons-react'
import { useDispatch, useSelector } from 'react-redux'
import DeleteRecordModal from './DeleteRecordModal'
import {
  selectDisplayUserRole,
  selectRecordRequestsRecord,
  selectSettings,
  updateSettings,
} from '@/src/reduxStore/states/pages/labeling'
import { ComponentType } from '@/src/types/components/projects/projectId/labeling/settings'
import LabelingSettingsModal from './LabelingSettingsModal'

export default function NavigationBarBottom() {
  const dispatch = useDispatch()

  const settings = useSelector(selectSettings)
  const user = useSelector(selectUser)
  const record = useSelector(selectRecordRequestsRecord)
  const userDisplayRole = useSelector(selectDisplayUserRole)

  function toggleAutoNextRecord() {
    dispatch(updateSettings(ComponentType.MAIN, 'autoNextRecord'))
    const getSettings = localStorage.getItem('labelingSettings')
    let settings = getSettings ? JSON.parse(getSettings) : {}
    settings.main.autoNextRecord = !settings.main.autoNextRecord
    localStorage.setItem('labelingSettings', JSON.stringify(settings))
  }

  function setShowNLabelButtonFunc(event: any) {
    const valueInt = event.target.value
    dispatch(
      updateSettings(ComponentType.LABELING, 'showNLabelButton', valueInt),
    )
    const getSettings = localStorage.getItem('labelingSettings')
    let settings = getSettings ? JSON.parse(getSettings) : {}
    settings.labeling.showNLabelButton = valueInt
    localStorage.setItem('labelingSettings', JSON.stringify(settings))
  }

  return (
    <>
      {user && (
        <div className="h-16 w-full border-t border-gray-200 px-4">
          <div className="relative flex h-full flex-shrink-0 items-center justify-between bg-white shadow-sm">
            <div className="flex flex-row flex-nowrap items-center">
              <div className="flex justify-center overflow-visible">
                {user.role == UserRole.ENGINEER &&
                  userDisplayRole == UserRole.ENGINEER && (
                    <Tooltip
                      content={TOOLTIPS_DICT.LABELING.DELETE_CURRENT_RECORD}
                      color="invert"
                      placement="top"
                    >
                      <button
                        onClick={() =>
                          dispatch(openModal(ModalEnum.DELETE_RECORD))
                        }
                        disabled={record == null}
                        className="mr-3 flex rounded-md border border-red-400 bg-red-100 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <IconTrash className="mr-2" size={16} />
                        Delete record
                      </button>
                    </Tooltip>
                  )}
              </div>
              <div className="flex cursor-pointer items-center justify-center overflow-visible">
                {record && record.id != 'deleted' && (
                  <>
                    {' '}
                    <label
                      htmlFor="autoNextRecord"
                      className="group relative inline-flex flex-shrink-0 cursor-pointer items-center justify-center focus:outline-none"
                      role="switch"
                      aria-checked="false"
                    >
                      <input
                        name="autoNextRecord"
                        className="h-5 w-5 cursor-pointer"
                        type="checkbox"
                        checked={settings.main.autoNextRecord}
                        onChange={toggleAutoNextRecord}
                      />
                    </label>
                    <span
                      className="ml-3 mr-6 flex flex-shrink-0 flex-grow flex-col"
                      onClick={toggleAutoNextRecord}
                    >
                      <span className="text-sm font-medium text-gray-900">
                        Automatically get next record
                      </span>
                      <span className="text-sm text-gray-500">
                        Apply this if you want to load the next record after
                        setting a label
                      </span>
                    </span>
                  </>
                )}
              </div>
              <div className="flex cursor-pointer items-center justify-center overflow-visible">
                {record && record.id != 'deleted' && (
                  <>
                    <input
                      value={settings.labeling.showNLabelButton}
                      type="number"
                      min="0"
                      step="1"
                      onChange={(event) => setShowNLabelButtonFunc(event)}
                      onBlur={(event) => setShowNLabelButtonFunc(event)}
                      onKeyDown={(event) => {
                        if (event.key == 'Enter') setShowNLabelButtonFunc(event)
                      }}
                      className="placeholder-italic h-9 w-12 rounded-md border border-gray-300 pl-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                    />
                    <span className="ml-3 flex flex-shrink-0 flex-grow cursor-auto flex-col">
                      <span
                        className="text-sm font-medium text-gray-900"
                        id="availability-label"
                      >
                        Display of label options
                      </span>
                      <span
                        className="text-sm text-gray-500"
                        id="availability-description"
                      >
                        Nr. of options shown by default
                      </span>
                    </span>
                  </>
                )}
              </div>
            </div>
            {user.role !== UserRole.ANNOTATOR &&
              userDisplayRole != UserRole.ANNOTATOR && (
                <Tooltip
                  onClick={() =>
                    dispatch(openModal(ModalEnum.LABELING_SETTINGS))
                  }
                  content={
                    <div className="w-32">Open Labeling Suite settings</div>
                  }
                  color="invert"
                  placement="left"
                >
                  <div className="rounded-md border border-gray-300 p-2">
                    <IconSettings className="h-6 w-6" />
                  </div>
                </Tooltip>
              )}
          </div>
          <DeleteRecordModal />
          <LabelingSettingsModal />
        </div>
      )}
    </>
  )
}
