import Modal from '@/src/components/shared/modal/Modal'
import { selectModal } from '@/src/reduxStore/states/modal'
import { selectHeuristic } from '@/src/reduxStore/states/pages/heuristics'
import { selectVisibleAttributesHeuristics } from '@/src/reduxStore/states/pages/settings'
import { ModalEnum } from '@/src/types/shared/modal'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { Tooltip } from '@nextui-org/react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { Fragment } from 'react'
import { useSelector } from 'react-redux'

export default function ViewDetailsZSModal() {
  const modalRecord = useSelector(
    selectModal(ModalEnum.SAMPLE_RECORDS_ZERO_SHOT),
  )
  const usableAttributes = useSelector(selectVisibleAttributesHeuristics)
  const currentHeuristic = useSelector(selectHeuristic)

  return (
    <Modal modalName={ModalEnum.SAMPLE_RECORDS_ZERO_SHOT}>
      <h1 className="mb-2 text-center text-lg text-gray-900">View details</h1>
      <div className="my-2 text-sm text-gray-500">
        {usableAttributes.map((att, i) => (
          <div key={att.id} className="my-3 text-left text-sm leading-5">
            <div className="font-bold text-gray-900">{att.name}</div>
            <div className="font-normal text-gray-500">
              {modalRecord.record?.fullRecordData[att.name]}
            </div>
          </div>
        ))}
      </div>

      <div
        className="grid grid-cols-3 items-center gap-x-2 gap-y-2 text-left"
        style={{ gridTemplateColumns: 'max-content max-content max-content' }}
      >
        {modalRecord.record?.labels.map((result: any, index) => (
          <Fragment key={result.labelName}>
            {result.color ? (
              <div
                className={`my-2 mr-2 items-center rounded border px-2 py-0.5 text-center text-xs font-medium ${result.color.backgroundColor} ${result.color.textColor} ${result.color.borderColor} ${result.color.hoverColor}`}
              >
                {result.labelName}
              </div>
            ) : (
              <div className="my-2 mr-2 items-center rounded border border-gray-400 bg-gray-100 px-2 py-0.5 text-center text-xs font-medium text-gray-700 hover:bg-gray-200">
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
              <span className="ml-2 select-none self-start text-sm">
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
    </Modal>
  )
}
