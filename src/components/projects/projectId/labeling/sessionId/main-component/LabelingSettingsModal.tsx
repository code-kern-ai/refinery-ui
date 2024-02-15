import Modal from '@/src/components/shared/modal/Modal'
import MultilineTooltip from '@/src/components/shared/multilines-tooltip/MultilineTooltip'
import {
  selectSettings,
  updateSettings,
} from '@/src/reduxStore/states/pages/labeling'
import { selectProject } from '@/src/reduxStore/states/project'
import { LineBreaksType } from '@/src/types/components/projects/projectId/data-browser/data-browser'
import { ComponentType } from '@/src/types/components/projects/projectId/labeling/settings'
import { ModalEnum } from '@/src/types/shared/modal'
import { COLOR_OPTIONS } from '@/src/util/constants'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import Dropdown2 from '@/submodules/react-components/components/Dropdown2'
import { Tooltip } from '@nextui-org/react'
import { IconInfoCircle } from '@tabler/icons-react'
import { Fragment, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

export default function LabelingSettingsModal() {
  const dispatch = useDispatch()

  const projectId = useSelector(selectProject)
  const settings = useSelector(selectSettings)

  const [activeTab, setActiveTab] = useState<ComponentType>(ComponentType.MAIN)
  const [hoverColorOptions, setHoverColorOptions] = useState<string[]>([])
  const [hoverColorClassArray, setHoverColorClassArray] = useState<string[]>([])
  const [showTaskLegendTicked, setShowTaskLegendTicked] =
    useState<boolean>(true)

  useEffect(() => {
    if (!projectId) return
    prepareColorOptions()
  }, [projectId])

  function changeSetting(page: ComponentType, setting: string, value?: any) {
    dispatch(updateSettings(page, setting, value))
    const getSettings = localStorage.getItem('labelingSettings')
    let settings = getSettings ? JSON.parse(getSettings) : {}
    settings[page][setting] = value ?? !settings[page][setting]
    if (page == ComponentType.MAIN) {
      const color = settings.main.hoverGroupBackgroundColor
      if (color == 'None') settings.main.hoverGroupBackgroundColorClass = ''
      else if (color == 'light gray')
        settings.main.hoverGroupBackgroundColorClass = 'bg-gray-100'
      else if (color == 'gray')
        settings.main.hoverGroupBackgroundColorClass = 'bg-gray-200'
      else settings.main.hoverGroupBackgroundColorClass = 'bg-' + color + '-200'
    }
    localStorage.setItem('labelingSettings', JSON.stringify(settings))
  }

  function prepareColorOptions() {
    setHoverColorOptions(['None', 'light gray', ...COLOR_OPTIONS])
    setHoverColorClassArray([
      null,
      'bg-gray-100',
      ...COLOR_OPTIONS.map((c) => `bg-${c}-200`),
    ])
  }

  function toggleLineBreaks() {
    if (
      settings?.main.lineBreaks == LineBreaksType.IS_PRE_WRAP ||
      settings?.main.lineBreaks == LineBreaksType.IS_PRE_LINE
    ) {
      changeSetting(ComponentType.MAIN, 'lineBreaks', LineBreaksType.NORMAL)
      localStorage.setItem('lineBreaks', JSON.stringify(LineBreaksType.NORMAL))
    } else {
      changeSetting(
        ComponentType.MAIN,
        'lineBreaks',
        LineBreaksType.IS_PRE_WRAP,
      )
      localStorage.setItem(
        'lineBreaks',
        JSON.stringify(LineBreaksType.IS_PRE_WRAP),
      )
    }
  }

  function toggleLineBreaksPreWrap() {
    if (settings?.main.lineBreaks === LineBreaksType.IS_PRE_WRAP) {
      changeSetting(
        ComponentType.MAIN,
        'lineBreaks',
        LineBreaksType.IS_PRE_LINE,
      )
      localStorage.setItem(
        'lineBreaks',
        JSON.stringify(LineBreaksType.IS_PRE_LINE),
      )
    } else if (settings?.main.lineBreaks === LineBreaksType.IS_PRE_LINE) {
      changeSetting(
        ComponentType.MAIN,
        'lineBreaks',
        LineBreaksType.IS_PRE_WRAP,
      )
      localStorage.setItem(
        'lineBreaks',
        JSON.stringify(LineBreaksType.IS_PRE_WRAP),
      )
    }
  }

  return (
    <Modal modalName={ModalEnum.LABELING_SETTINGS} doNotFullyInit={true}>
      <div className="flex flex-row items-center justify-center gap-x-2">
        <span className="text-lg font-medium leading-6 text-gray-900">
          Settings
        </span>
        <Tooltip
          content={
            <MultilineTooltip
              tooltipLines={[
                'Note that your browser stores these settings.',
                'Not your user or your organization!',
              ]}
            />
          }
          color="invert"
          placement="top"
          className="cursor-auto"
        >
          <IconInfoCircle className="h-6 w-6" />
        </Tooltip>
      </div>
      <div className="flex justify-center">
        <div className="sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab(ComponentType.MAIN)}
                className={`cursor-pointer whitespace-nowrap px-1 py-4 text-sm font-medium ${activeTab == ComponentType.MAIN ? 'border-b-2 border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
              >
                Global
              </button>
              <button
                onClick={() => setActiveTab(ComponentType.TASK_HEADER)}
                className={`cursor-pointer whitespace-nowrap px-1 py-4  text-sm font-medium ${activeTab == ComponentType.TASK_HEADER ? 'border-b-2 border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
              >
                Task Legend
              </button>
              <button
                onClick={() => setActiveTab(ComponentType.LABELING)}
                className={`cursor-pointer whitespace-nowrap px-1 py-4 text-sm font-medium ${activeTab == ComponentType.LABELING ? 'border-b-2 border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
              >
                Labeling
              </button>
              <button
                onClick={() => setActiveTab(ComponentType.OVERVIEW_TABLE)}
                className={`cursor-pointer whitespace-nowrap px-1 py-4  text-sm font-medium ${activeTab == ComponentType.OVERVIEW_TABLE ? 'border-b-2 border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
              >
                Overview Table
              </button>
            </nav>
          </div>
        </div>
      </div>
      {/* Page Main */}
      {activeTab == ComponentType.MAIN && (
        <div className="my-4 flex flex-col items-center gap-y-2">
          <div
            className="grid items-center gap-x-4 gap-y-2 text-left"
            style={{ gridTemplateColumns: 'max-content auto max-content' }}
          >
            <span>Auto next record</span>
            <span className="flex cursor-pointer items-center">
              <input
                className="h-5 w-5 cursor-pointer"
                type="checkbox"
                checked={settings?.main.autoNextRecord}
                onChange={() =>
                  changeSetting(ComponentType.MAIN, 'autoNextRecord')
                }
              />
            </span>
            <Tooltip
              content={TOOLTIPS_DICT.LABELING.AUTO_NEXT_RECORD}
              color="invert"
              placement="top"
              className="cursor-auto"
            >
              <IconInfoCircle className="h-5 w-5" />
            </Tooltip>
            <span>Hover background</span>
            <Dropdown2
              options={hoverColorOptions}
              buttonName={settings?.main.hoverGroupBackgroundColor}
              backgroundColors={hoverColorClassArray}
              dropdownItemsClasses="max-h-80 overflow-y-auto"
              buttonCaptionBgColor={
                settings?.main.hoverGroupBackgroundColorClass
              }
              selectedOption={(option: any) =>
                changeSetting(
                  ComponentType.MAIN,
                  'hoverGroupBackgroundColor',
                  option,
                )
              }
              dropdownWidth="w-32"
            />
            <Tooltip
              content={TOOLTIPS_DICT.LABELING.HOVER_BACKGROUND}
              color="invert"
              placement="top"
              className="cursor-auto"
            >
              <IconInfoCircle className="h-5 w-5" />
            </Tooltip>
            <span>Visible line breaks</span>
            <div className="flex h-5 items-center">
              <input
                id="comments"
                type="checkbox"
                onChange={toggleLineBreaks}
                checked={settings?.main.lineBreaks != LineBreaksType.NORMAL}
                className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <Tooltip
              content={TOOLTIPS_DICT.LABELING.LINE_BREAKS}
              color="invert"
              placement="top"
              className="cursor-auto"
            >
              <IconInfoCircle className="h-5 w-5" />
            </Tooltip>
            {settings?.main.lineBreaks != LineBreaksType.NORMAL && (
              <Fragment>
                <label
                  htmlFor="preWrap"
                  className="ml-3 block cursor-pointer text-sm font-medium italic text-gray-700"
                >
                  Pre-wrap
                </label>
                <input
                  type="radio"
                  checked={
                    settings?.main.lineBreaks == LineBreaksType.IS_PRE_WRAP
                  }
                  onChange={toggleLineBreaksPreWrap}
                  name="lineBreaks"
                  id="preWrap"
                  className="h-6 w-4 cursor-pointer border-gray-200 text-blue-600 focus:ring-blue-500"
                />
                <Tooltip
                  content={TOOLTIPS_DICT.LABELING.PRE_WRAP}
                  color="invert"
                  placement="top"
                  className="cursor-auto"
                >
                  <IconInfoCircle className="h-5 w-5" />
                </Tooltip>

                <label
                  htmlFor="preLine"
                  className="ml-3 block cursor-pointer text-sm font-medium italic text-gray-700"
                >
                  Pre-line
                </label>
                <input
                  type="radio"
                  checked={
                    settings?.main.lineBreaks == LineBreaksType.IS_PRE_LINE
                  }
                  onChange={toggleLineBreaksPreWrap}
                  name="lineBreaks"
                  id="preLine"
                  className="h-6 w-4 cursor-pointer border-gray-200 text-blue-600 focus:ring-blue-500"
                />
                <Tooltip
                  content={TOOLTIPS_DICT.LABELING.PRE_LINE}
                  color="invert"
                  placement="top"
                  className="cursor-auto"
                >
                  <IconInfoCircle className="h-5 w-5" />
                </Tooltip>
              </Fragment>
            )}
          </div>
        </div>
      )}
      {/* Task Header */}
      {activeTab == ComponentType.TASK_HEADER && (
        <div className="my-4 flex flex-col items-center gap-y-2">
          <p className="text-center text-sm text-gray-600">
            These are general settings.
            <br />
            For label specific settings use the task list at the top
          </p>
          <div
            className="grid items-center gap-x-4 gap-y-2 text-left"
            style={{ gridTemplateColumns: 'max-content auto max-content' }}
          >
            <span>Show task legend</span>
            <span className="flex cursor-pointer items-center">
              <input
                className="h-5 w-5 cursor-pointer"
                type="checkbox"
                checked={settings?.task.show}
                onChange={() => {
                  changeSetting(ComponentType.TASK_HEADER, 'show')
                  setShowTaskLegendTicked(!showTaskLegendTicked)
                }}
              />
            </span>
            <Tooltip
              content={
                <MultilineTooltip
                  tooltipLines={[
                    'Completely hide/show the feature.',
                    'Active settings are preserved',
                  ]}
                />
              }
              color="invert"
              placement="top"
              className="cursor-auto"
            >
              <IconInfoCircle className="h-5 w-5" />
            </Tooltip>
            <span>Collapse</span>
            <span className="flex cursor-pointer items-center">
              <input
                disabled={!showTaskLegendTicked}
                className="h-5 w-5 cursor-pointer"
                type="checkbox"
                checked={settings?.task.isCollapsed}
                onChange={() =>
                  changeSetting(ComponentType.TASK_HEADER, 'isCollapsed')
                }
              />
            </span>
            <Tooltip
              content={TOOLTIPS_DICT.LABELING.IS_COLLAPSED}
              color="invert"
              placement="top"
              className="cursor-auto"
            >
              <IconInfoCircle className="h-5 w-5" />
            </Tooltip>
            <span>Always show quick buttons</span>
            <span className="flex cursor-pointer items-center">
              <input
                disabled={!showTaskLegendTicked}
                className="h-5 w-5 cursor-pointer"
                type="checkbox"
                checked={settings?.task.alwaysShowQuickButtons}
                onChange={() =>
                  changeSetting(
                    ComponentType.TASK_HEADER,
                    'alwaysShowQuickButtons',
                  )
                }
              />
            </span>
            <Tooltip
              content={TOOLTIPS_DICT.LABELING.QUICK_BUTTON}
              color="invert"
              placement="top"
              className="cursor-auto"
            >
              <IconInfoCircle className="h-5 w-5" />
            </Tooltip>
          </div>
        </div>
      )}
      {/* Labeling */}
      {activeTab == ComponentType.LABELING && (
        <div className="my-4 flex flex-col items-center gap-y-2">
          <div
            className="grid items-center gap-x-4 gap-y-2 text-left"
            style={{ gridTemplateColumns: 'max-content auto max-content' }}
          >
            <span>Label options</span>
            <input
              value={settings?.labeling.showNLabelButton}
              type="number"
              min="0"
              step="1"
              onChange={(e) =>
                changeSetting(
                  ComponentType.LABELING,
                  'showNLabelButton',
                  e.target.value,
                )
              }
              className="placeholder-italic h-9 w-12 rounded-md border border-gray-300 pl-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
            />
            <Tooltip
              content={
                <MultilineTooltip
                  tooltipLines={[
                    "Amount of label buttons shown before hiding the rest under: 'other <task> options'",
                  ]}
                />
              }
              color="invert"
              placement="top"
              className="cursor-auto"
            >
              <IconInfoCircle className="h-5 w-5" />
            </Tooltip>
            <span>Close label box</span>
            <span className="flex cursor-pointer items-center">
              <input
                className="h-5 w-5 cursor-pointer"
                type="checkbox"
                checked={settings?.labeling.closeLabelBoxAfterLabel}
                onChange={() =>
                  changeSetting(
                    ComponentType.LABELING,
                    'closeLabelBoxAfterLabel',
                  )
                }
              />
            </span>
            <Tooltip
              content={TOOLTIPS_DICT.LABELING.CLOSE_LABEL_BOX}
              color="invert"
              placement="top"
              className="cursor-auto"
            >
              <IconInfoCircle className="h-5 w-5" />
            </Tooltip>
            <span>Show task names</span>
            <span className="flex cursor-pointer items-center">
              <input
                className="h-5 w-5 cursor-pointer"
                type="checkbox"
                checked={settings?.labeling.showTaskNames}
                onChange={() =>
                  changeSetting(ComponentType.LABELING, 'showTaskNames')
                }
              />
            </span>
            <Tooltip
              content={TOOLTIPS_DICT.LABELING.SHOW_TASK_NAMES}
              color="invert"
              placement="top"
              className="cursor-auto"
            >
              <IconInfoCircle className="h-5 w-5" />
            </Tooltip>
            <span>Show heuristic confidence</span>
            <span className="flex cursor-pointer items-center">
              <input
                className="h-5 w-5 cursor-pointer"
                type="checkbox"
                checked={settings?.labeling.showHeuristicConfidence}
                onChange={() =>
                  changeSetting(
                    ComponentType.LABELING,
                    'showHeuristicConfidence',
                  )
                }
              />
            </span>
            <Tooltip
              content={
                <MultilineTooltip
                  tooltipLines={[
                    'Display the heuristic label confidence.',
                    'Please see in our docs for more information on confidence calculation.',
                  ]}
                />
              }
              color="invert"
              placement="top"
              className="cursor-auto"
            >
              <IconInfoCircle className="h-5 w-5" />
            </Tooltip>
            <span>Compact classification label display</span>
            <span className="flex cursor-pointer items-center">
              <input
                className="h-5 w-5 cursor-pointer"
                type="checkbox"
                checked={settings?.labeling.compactClassificationLabelDisplay}
                onChange={() =>
                  changeSetting(
                    ComponentType.LABELING,
                    'compactClassificationLabelDisplay',
                  )
                }
              />
            </span>
            <Tooltip
              content={TOOLTIPS_DICT.LABELING.LABEL_DISPLAY}
              color="invert"
              placement="top"
              className="cursor-auto"
            >
              <IconInfoCircle className="h-5 w-5" />
            </Tooltip>
            <span>Swim lane extraction labels</span>
            <span className="flex cursor-pointer items-center">
              <input
                className="h-5 w-5 cursor-pointer"
                type="checkbox"
                checked={settings?.labeling.swimLaneExtractionDisplay}
                onChange={() =>
                  changeSetting(
                    ComponentType.LABELING,
                    'swimLaneExtractionDisplay',
                  )
                }
              />
            </span>
            <Tooltip
              content={
                <MultilineTooltip
                  tooltipLines={[
                    'Groups display of labels in type, task, creator & label. Same group gets the same distance to the text.',
                    'Might use a lot of space.',
                  ]}
                />
              }
              color="invert"
              placement="top"
              className="cursor-auto"
            >
              <IconInfoCircle className="h-5 w-5" />
            </Tooltip>
          </div>
        </div>
      )}
      {/* Overview table */}
      {activeTab == ComponentType.OVERVIEW_TABLE && (
        <div className="my-4 flex flex-col items-center gap-y-2">
          <div
            className="grid items-center gap-x-4 gap-y-2 text-left"
            style={{ gridTemplateColumns: 'max-content auto max-content' }}
          >
            <span>Show overview table</span>
            <span className="flex cursor-pointer items-center">
              <input
                className="h-5 w-5 cursor-pointer"
                type="checkbox"
                checked={settings?.overviewTable.show}
                onChange={() =>
                  changeSetting(ComponentType.OVERVIEW_TABLE, 'show')
                }
              />
            </span>
            <Tooltip
              content={
                <MultilineTooltip
                  tooltipLines={[
                    'Completely hide/show the feature.',
                    'Active settings are preserved',
                  ]}
                />
              }
              color="invert"
              placement="top"
              className="cursor-auto"
            >
              <IconInfoCircle className="h-5 w-5" />
            </Tooltip>
            <span>Show heuristics</span>
            <span className="flex cursor-pointer items-center">
              <input
                className="h-5 w-5 cursor-pointer"
                type="checkbox"
                checked={settings?.overviewTable.showHeuristics}
                onChange={() =>
                  changeSetting(ComponentType.OVERVIEW_TABLE, 'showHeuristics')
                }
              />
            </span>
            <Tooltip
              content={TOOLTIPS_DICT.LABELING.SHOW_HEURISTICS}
              color="invert"
              placement="top"
              className="cursor-auto"
            >
              <IconInfoCircle className="h-5 w-5" />
            </Tooltip>
            <span>Include task legend settings</span>
            <span className="flex cursor-pointer items-center">
              <input
                className="h-5 w-5 cursor-pointer"
                type="checkbox"
                checked={settings?.overviewTable.includeLabelDisplaySettings}
                onChange={() =>
                  changeSetting(
                    ComponentType.OVERVIEW_TABLE,
                    'includeLabelDisplaySettings',
                  )
                }
              />
            </span>
            <Tooltip
              content={
                <MultilineTooltip
                  tooltipLines={[
                    'If active the table will filter entries depending on task legend settings.',
                    'Note that show heuristic disabled will overrule this',
                  ]}
                />
              }
              color="invert"
              placement="top"
              className="cursor-auto"
            >
              <IconInfoCircle className="h-5 w-5" />
            </Tooltip>
          </div>
        </div>
      )}
    </Modal>
  )
}
