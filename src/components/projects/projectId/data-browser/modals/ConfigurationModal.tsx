import Modal from '@/src/components/shared/modal/Modal'
import { setModalStates } from '@/src/reduxStore/states/modal'
import {
  selectConfiguration,
  updateConfigurationState,
} from '@/src/reduxStore/states/pages/data-browser'
import { LineBreaksType } from '@/src/types/components/projects/projectId/data-browser/data-browser'
import { ModalEnum } from '@/src/types/shared/modal'
import { useDispatch, useSelector } from 'react-redux'

export default function ConfigurationModal() {
  const dispatch = useDispatch()

  const configuration = useSelector(selectConfiguration)

  function toggleConfigurationOption(field: string) {
    dispatch(updateConfigurationState(field, !configuration[field]))
    dispatch(setModalStates(ModalEnum.CONFIGURATION, { open: true }))
  }

  function toggleLineBreaks() {
    if (
      configuration.lineBreaks == LineBreaksType.IS_PRE_WRAP ||
      configuration.lineBreaks == LineBreaksType.IS_PRE_LINE
    ) {
      dispatch(updateConfigurationState('lineBreaks', LineBreaksType.NORMAL))
      dispatch(setModalStates(ModalEnum.CONFIGURATION, { open: true }))
    } else {
      dispatch(
        updateConfigurationState('lineBreaks', LineBreaksType.IS_PRE_WRAP),
      )
      dispatch(setModalStates(ModalEnum.CONFIGURATION, { open: true }))
    }
  }

  function toggleLineBreaksPreWrap() {
    if (configuration.lineBreaks === LineBreaksType.IS_PRE_WRAP) {
      dispatch(
        updateConfigurationState('lineBreaks', LineBreaksType.IS_PRE_LINE),
      )
      dispatch(setModalStates(ModalEnum.CONFIGURATION, { open: true }))
    } else if (configuration.lineBreaks === LineBreaksType.IS_PRE_LINE) {
      dispatch(
        updateConfigurationState('lineBreaks', LineBreaksType.IS_PRE_WRAP),
      )
      dispatch(setModalStates(ModalEnum.CONFIGURATION, { open: true }))
    }
  }

  function toggleSeparator() {
    if (configuration.separator === ',') {
      dispatch(updateConfigurationState('separator', '-'))
      dispatch(setModalStates(ModalEnum.CONFIGURATION, { open: true }))
    } else {
      dispatch(updateConfigurationState('separator', ','))
      dispatch(setModalStates(ModalEnum.CONFIGURATION, { open: true }))
    }
  }

  return (
    <Modal modalName={ModalEnum.CONFIGURATION}>
      <div className="flex flex-grow justify-center text-lg font-medium leading-6 text-gray-900">
        View configuration{' '}
      </div>
      <div className="mb-2 flex flex-grow justify-center text-sm">
        Change the content that is displayed in the browser.
      </div>
      <div className="mb-2">
        <fieldset className="space-y-5">
          <div className="relative flex items-start text-left">
            <div className="flex h-5 items-center">
              <input
                id="comments"
                type="checkbox"
                onChange={(e) => {
                  toggleConfigurationOption('highlightText')
                }}
                checked={configuration.highlightText}
                className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div
              className="ml-3 cursor-pointer text-sm"
              onClick={() => toggleConfigurationOption('highlightText')}
            >
              <label className="cursor-pointer font-medium text-gray-700">
                Highlight text
              </label>
              <p id="comments-description" className="text-gray-500">
                During search, you can remove the text highlighting. This makes
                the search a bit faster.
              </p>
            </div>
          </div>
          <div className="relative flex items-start text-left">
            <div className="flex h-5 items-center">
              <input
                id="comments"
                type="checkbox"
                onChange={() =>
                  toggleConfigurationOption('weakSupervisionRelated')
                }
                checked={configuration.weakSupervisionRelated}
                className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div
              className="ml-3 cursor-pointer text-sm"
              onClick={() =>
                toggleConfigurationOption('weakSupervisionRelated')
              }
            >
              <label className="cursor-pointer font-medium text-gray-700">
                Only show weakly supervised-related
              </label>
              <p id="comments-description" className="text-gray-500">
                If checked, the data-browser will only show you heuristics that
                affect the weak supervision.
              </p>
            </div>
          </div>
          <div className="relative flex items-start text-left">
            <div className="flex h-5 items-center">
              <input
                id="comments"
                type="checkbox"
                onChange={toggleLineBreaks}
                checked={configuration.lineBreaks != LineBreaksType.NORMAL}
                className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div
              className="ml-3 cursor-pointer text-sm"
              onClick={toggleLineBreaks}
            >
              <label className="cursor-pointer font-medium text-gray-700">
                Visible line breaks
              </label>
              <p className="text-gray-500">
                If checked, the attributes in the data-browser and labeling page
                will be shown with line breaks
              </p>
            </div>
          </div>
          {configuration.lineBreaks != LineBreaksType.NORMAL && (
            <div className="px-10">
              <div className="mt-2 flex flex-row items-start text-left">
                <input
                  type="radio"
                  checked={
                    configuration.lineBreaks == LineBreaksType.IS_PRE_WRAP
                  }
                  onChange={toggleLineBreaksPreWrap}
                  name="lineBreaks"
                  id="preWrap"
                  className="h-6 w-4 cursor-pointer border-gray-200 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="preWrap"
                  className="ml-1 block cursor-pointer text-sm font-medium text-gray-700"
                >
                  <span>Pre-wrap</span>
                  <p className="cursor-pointer text-sm text-gray-500">
                    Preserves whitespace and line breaks{' '}
                  </p>
                </label>
              </div>
              <div className="mt-2 flex flex-row items-start text-left">
                <input
                  type="radio"
                  checked={
                    configuration.lineBreaks == LineBreaksType.IS_PRE_LINE
                  }
                  onChange={toggleLineBreaksPreWrap}
                  name="lineBreaks"
                  id="preLine"
                  className="h-6 w-4 cursor-pointer border-gray-200 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="preLine"
                  className="ml-1 block cursor-pointer text-sm font-medium text-gray-700"
                >
                  <span>Pre-line</span>
                  <p className="cursor-pointer text-sm text-gray-500">
                    Collapses multiple whitespaces and line breaks into a single
                    space{' '}
                  </p>
                </label>
              </div>
            </div>
          )}
        </fieldset>
        <div className="mt-3 text-left text-sm text-gray-900">
          Select which separator you want to use for the IN operator
        </div>
        <div className="mt-2 flex flex-row items-start text-left">
          <input
            type="radio"
            checked={configuration.separator == ','}
            onChange={toggleSeparator}
            name="comma"
            id="comma"
            className="h-6 w-4 cursor-pointer border-gray-200 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor="comma"
            className="ml-1 block cursor-pointer text-sm font-medium text-gray-700"
          >
            Comma(,)
          </label>
        </div>
        <div className="mt-2 flex flex-row items-start text-left">
          <input
            type="radio"
            checked={configuration.separator == '-'}
            onChange={toggleSeparator}
            name="dash"
            id="dash"
            className="h-6 w-4 cursor-pointer border-gray-200 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor="dash"
            className="ml-1 block cursor-pointer text-sm font-medium text-gray-700"
          >
            Dash(-)
          </label>
        </div>
      </div>
    </Modal>
  )
}
