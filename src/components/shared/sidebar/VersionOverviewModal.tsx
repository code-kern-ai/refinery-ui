import { ModalButton, ModalEnum } from '@/src/types/shared/modal'
import Modal from '../modal/Modal'
import {
  IconAlertCircle,
  IconArrowRight,
  IconExternalLink,
} from '@tabler/icons-react'
import { useDispatch, useSelector } from 'react-redux'
import {
  CacheEnum,
  selectCachedValue,
} from '@/src/reduxStore/states/cachedValues'
import style from '@/src/styles/shared/sidebar.module.css'
import { VersionOverview } from '@/src/types/shared/sidebar'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { Tooltip } from '@nextui-org/react'
import LoadingIcon from '../loading/LoadingIcon'
import { useCallback, useEffect, useState } from 'react'
import { selectIsManaged } from '@/src/reduxStore/states/general'
import { closeModal, openModal } from '@/src/reduxStore/states/modal'

const ACCEPT_BUTTON = { buttonCaption: 'How to update', useButton: true }

export default function VersionOverviewModal() {
  const dispatch = useDispatch()

  const isManaged = useSelector(selectIsManaged)
  const versionOverviewData = useSelector(
    selectCachedValue(CacheEnum.VERSION_OVERVIEW),
  )

  const howToUpdate = useCallback(() => {
    dispatch(closeModal(ModalEnum.VERSION_OVERVIEW))
    dispatch(openModal(ModalEnum.HOW_TO_UPDATE))
  }, [])

  useEffect(() => {
    setAcceptButton({
      ...ACCEPT_BUTTON,
      useButton: !isManaged,
      emitFunction: howToUpdate,
    })
  }, [howToUpdate, isManaged])

  const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON)

  return (
    <Modal modalName={ModalEnum.VERSION_OVERVIEW} acceptButton={acceptButton}>
      <div className="inline-block justify-center text-lg font-medium leading-6 text-gray-900">
        Version overview
        <a
          className="ml-3 text-base font-medium text-green-800"
          href="https://changelog.kern.ai/"
          target="_blank"
        >
          <span className="leading-5">Changelog</span>
          <IconArrowRight className="inline-block h-4 w-4 text-green-800" />
        </a>
      </div>
      {versionOverviewData ? (
        <div className="mt-3 inline-block min-w-full align-middle">
          <div
            className={`overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg ${style.scrollableSize}`}
          >
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    Service
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    Installed version
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    Remote version
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    Last checked
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    Link
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {versionOverviewData.map(
                  (service: VersionOverview, index: number) => (
                    <tr
                      key={service.service}
                      className={index % 2 != 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className="px-3 py-2 text-left text-sm text-gray-500">
                        {service.service}
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-gray-500">
                        {service.installedVersion}
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-gray-500">
                        <div className="flex flex-row items-center justify-center">
                          <div className="mr-2">{service.remoteVersion}</div>
                          {service.remoteHasNewer && (
                            <Tooltip
                              placement="right"
                              trigger="hover"
                              color="invert"
                              content={
                                TOOLTIPS_DICT.SIDEBAR.NEWER_VERSION_AVAILABLE
                              }
                              className="cursor-auto"
                            >
                              <IconAlertCircle className="h-5 w-5 text-yellow-700" />
                            </Tooltip>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-gray-500">
                        {service.parseDate}
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-gray-500">
                        <a
                          href={service.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="m-auto block h-4 w-4 p-0"
                        >
                          <IconExternalLink className="m-auto h-4 w-4" />
                        </a>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <LoadingIcon />
      )}
    </Modal>
  )
}
