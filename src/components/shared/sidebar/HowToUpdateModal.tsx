import { ModalButton, ModalEnum } from '@/src/types/shared/modal'
import Modal from '../modal/Modal'
import { Tooltip } from '@nextui-org/react'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { copyToClipboard } from '@/submodules/javascript-functions/general'
import { useCallback, useEffect, useState } from 'react'
import style from '@/src/styles/shared/sidebar.module.css'
import { useDispatch } from 'react-redux'
import { closeModal, openModal } from '@/src/reduxStore/states/modal'

const ABORT_BUTTON = { buttonCaption: 'Back', useButton: true }

export default function HowToUpdateModal() {
  const dispatch = useDispatch()

  const [openTab, setOpenTab] = useState(0)
  const [backButton, setBackButton] = useState<ModalButton>(ABORT_BUTTON)

  function toggleTabs(index: number) {
    setOpenTab(index)
  }

  const goBack = useCallback(() => {
    dispatch(closeModal(ModalEnum.HOW_TO_UPDATE))
    dispatch(openModal(ModalEnum.VERSION_OVERVIEW))
  }, [])

  useEffect(() => {
    setBackButton({ ...ABORT_BUTTON, emitFunction: goBack })
  }, [goBack])

  return (
    <Modal modalName={ModalEnum.HOW_TO_UPDATE} backButton={backButton}>
      <div className="justify-center text-center text-lg font-medium leading-6 text-gray-900">
        How to update
      </div>
      <div className="flex max-w-full overflow-visible border-b-2 border-b-gray-200 text-center">
        <div
          onClick={() => toggleTabs(0)}
          className={`mr-10 cursor-help py-3 text-sm font-medium leading-5 ${openTab == 0 ? 'border-bottom text-indigo-700' : 'text-gray-500'}`}
        >
          <Tooltip
            placement="bottom"
            content={TOOLTIPS_DICT.SIDEBAR['LINUX/MAC']}
            color="invert"
          >
            <span className="border-dotted">Bash users</span>
          </Tooltip>
        </div>
        <div
          onClick={() => toggleTabs(1)}
          className={`mr-10 cursor-help py-3 text-sm font-medium leading-5 ${openTab == 1 ? 'border-bottom text-indigo-700' : 'text-gray-500'}`}
        >
          <Tooltip
            placement="bottom"
            content={TOOLTIPS_DICT.SIDEBAR.PIP}
            color="invert"
          >
            <span className="border-dotted">CLI users</span>
          </Tooltip>
        </div>
        <div
          onClick={() => toggleTabs(2)}
          className={`mr-10 cursor-help py-3 text-sm font-medium leading-5 ${openTab == 2 ? 'border-bottom text-indigo-700' : 'text-gray-500'}`}
        >
          <Tooltip
            placement="bottom"
            content={TOOLTIPS_DICT.SIDEBAR.WINDOWS_TERMINAL}
            color="invert"
          >
            <span className="border-dotted">cmd</span>
          </Tooltip>
        </div>
        <div
          onClick={() => toggleTabs(3)}
          className={`mr-10 cursor-help py-3 text-sm font-medium leading-5 ${openTab == 3 ? 'border-bottom text-indigo-700' : 'text-gray-500'}`}
        >
          <Tooltip
            placement="bottom"
            content={TOOLTIPS_DICT.SIDEBAR.WINDOWS_FILE_EXPLORER}
            color="invert"
          >
            <span className="border-dotted">Executing from explorer</span>
          </Tooltip>
        </div>
      </div>
      <div className="mt-3 h-40 px-5 text-left">
        {openTab == 0 && (
          <ol className="font-dmMono grid list-decimal gap-y-4">
            <li>Open a Terminal</li>
            <li>
              Change to refinery directory (using cd) -&nbsp;
              <span className="whitespace-nowrap rounded-md bg-gray-200 p-1 text-red-700">
                $ cd /path/to/refinery
              </span>
            </li>
            <li>
              Run the update script -&nbsp;
              <span className="whitespace-nowrap rounded-md bg-gray-200 p-1 text-red-700">
                $
                <Tooltip
                  placement="top"
                  content={TOOLTIPS_DICT.GENERAL.CLICK_TO_COPY}
                  color="invert"
                >
                  <span
                    className="cursor-pointer"
                    onClick={() => copyToClipboard('./update')}
                  >
                    ./update
                  </span>
                </Tooltip>
              </span>
            </li>
          </ol>
        )}

        {openTab == 1 && (
          <ol className="font-dmMono grid list-decimal gap-y-4">
            <li>Open a Terminal</li>
            <li>
              Change to refinery directory
              <ol className={`grid gap-y-4 px-8 ${style.listLetters}`}>
                <li>
                  Linux/Mac -&nbsp;
                  <span className="whitespace-nowrap rounded-md bg-gray-200 p-1 text-red-700">
                    $ cd path/to/refinery
                  </span>
                </li>
                <li>
                  Windows -&nbsp;
                  <span className="whitespace-nowrap rounded-md bg-gray-200 p-1 text-red-700">
                    cd path\to\refinery
                  </span>
                </li>
              </ol>
            </li>
            <li>
              Run the CLI update command&nbsp;
              <span className="whitespace-nowrap rounded-md bg-gray-200 p-1 text-red-700">
                $
                <Tooltip
                  placement="top"
                  content={TOOLTIPS_DICT.GENERAL.CLICK_TO_COPY}
                  color="invert"
                >
                  <span
                    className="cursor-pointer"
                    onClick={() => copyToClipboard('refinery update')}
                  >
                    refinery update
                  </span>
                </Tooltip>
              </span>
            </li>
          </ol>
        )}

        {openTab == 2 && (
          <ol className="font-dmMono grid list-decimal gap-y-4">
            <li>Open a Terminal</li>
            <li>
              Change to refinery directory&nbsp;
              <span className="whitespace-nowrap rounded-md bg-gray-200 p-1 text-red-700">
                cd path\to\refinery
              </span>
            </li>
            <li>
              Run the update script -&nbsp;
              <span className="whitespace-nowrap rounded-md bg-gray-200 p-1 text-red-700">
                $
                <Tooltip
                  placement="top"
                  content={TOOLTIPS_DICT.GENERAL.CLICK_TO_COPY}
                  color="invert"
                >
                  <span
                    className="cursor-pointer"
                    onClick={() => copyToClipboard('update.bat')}
                  >
                    update.bat
                  </span>
                </Tooltip>
              </span>
            </li>
          </ol>
        )}

        {openTab == 3 && (
          <ol className="font-dmMono grid list-decimal gap-y-4">
            <li>Open the File Explorer</li>
            <li>Navigate to the refinery directory</li>
            <li>
              Launch the update script by double-clicking&nbsp;
              <span className="whitespace-nowrap rounded-md bg-gray-200 p-1 text-red-700">
                $
                <Tooltip
                  placement="top"
                  content={TOOLTIPS_DICT.GENERAL.CLICK_TO_COPY}
                  color="invert"
                >
                  <span
                    className="cursor-pointer"
                    onClick={() => copyToClipboard('update.bat')}
                  >
                    update.bat
                  </span>
                </Tooltip>
              </span>
            </li>
          </ol>
        )}
      </div>
    </Modal>
  )
}
