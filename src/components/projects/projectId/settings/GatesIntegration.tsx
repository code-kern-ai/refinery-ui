import Statuses from '@/src/components/shared/statuses/Statuses'
import { openModal } from '@/src/reduxStore/states/modal'
import { selectGatesIntegration } from '@/src/reduxStore/states/pages/settings'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { ModalEnum } from '@/src/types/shared/modal'
import { GatesIntegratorStatus } from '@/src/types/shared/statuses'
import { IconReload } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import GatesIntegrationWarningModal from './GatesIntegrationWarningModal'

export default function GatesIntegration() {
  const dispatch = useDispatch()

  const projectId = useSelector(selectProjectId)
  const gatesIntegrationData = useSelector(selectGatesIntegration)

  const [gatesLink, setGatesLink] = useState(null)

  useEffect(() => {
    setGatesLink(
      window.location.origin + '/gates/project/' + projectId + '/prediction',
    )
  }, [])

  return (
    <div className="mt-8">
      <div className="inline-flex items-center text-lg font-medium leading-6 text-gray-900">
        <span className="mr-2">Gates integration</span>
        <Statuses
          page="gates-integrator"
          status={gatesIntegrationData?.status}
        />
      </div>
      <div className="mt-1">
        <div className="inline-block text-sm font-medium leading-5 text-gray-700">
          Gates is the inference API for refinery.
          {gatesIntegrationData?.status === GatesIntegratorStatus.READY && (
            <span>
              {' '}
              This project is ready to be used with Gates. You can switch to the{' '}
              <a href={gatesLink}>
                <span className="cursor-pointer underline">Gates App</span>
              </a>{' '}
              to configure and run it.
            </span>
          )}
          {gatesIntegrationData?.status === GatesIntegratorStatus.UPDATING && (
            <span>
              {' '}
              This project is currently updated to be used with Gates.
            </span>
          )}
          {gatesIntegrationData?.status === GatesIntegratorStatus.NOT_READY && (
            <span>
              {' '}
              This project is not ready to be used with Gates. You can update
              the project to make it ready.
              <span>
                {' '}
                This will rerun the project&apos;s embeddings and heuristics to
                create the necessary data for Gates.
              </span>
              <button
                type="button"
                onClick={() =>
                  dispatch(openModal(ModalEnum.GATES_INTEGRATION_WARNING))
                }
                className="mr-1 mt-2 flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
              >
                <IconReload className="h-4 w-4" />
                <span className="ml-1 leading-5">Update Project</span>
              </button>
            </span>
          )}
        </div>
      </div>
      <GatesIntegrationWarningModal />
    </div>
  )
}
