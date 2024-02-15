import Modal from '@/src/components/shared/modal/Modal'
import { ModalEnum } from '@/src/types/shared/modal'
import style from '@/src/styles/components/projects/projectId/heuristics/heuristics-details.module.css'
import { RecordDisplay } from '@/src/components/shared/record-display/RecordDisplay'
import { ViewDetailsLFModalProps } from '@/src/types/components/projects/projectId/heuristics/heuristicId/labeling-function'
import { useSelector } from 'react-redux'
import { selectModal } from '@/src/reduxStore/states/modal'
import { selectVisibleAttributesHeuristics } from '@/src/reduxStore/states/pages/settings'

export default function ViewDetailsLFModal(props: ViewDetailsLFModalProps) {
  const modalSampleRecord = useSelector(
    selectModal(ModalEnum.SAMPLE_RECORDS_LABELING_FUNCTION),
  )
  const attributes = useSelector(selectVisibleAttributesHeuristics)

  return (
    <Modal modalName={ModalEnum.SAMPLE_RECORDS_LABELING_FUNCTION}>
      <h1 className="mb-2 text-center text-lg text-gray-900">View details</h1>
      {modalSampleRecord.currentRecordIdx != -1 && (
        <div>
          <div
            className={`max-height-modal my-2 overflow-y-auto text-sm text-gray-500 ${style.scrollableSize}`}
          >
            <RecordDisplay
              attributes={attributes}
              record={
                props.sampleRecords.records[modalSampleRecord.currentRecordIdx]
              }
            />
            <div className="text-left text-sm font-bold leading-5 text-gray-900">
              Label data
              <div className="flex items-center justify-start">
                {Object.entries(
                  props.sampleRecords.records[
                    modalSampleRecord.currentRecordIdx
                  ].calculatedLabelsResult,
                ).map(([key, value]: any) => (
                  <div
                    key={key}
                    className="ml-2 flex flex-row flex-nowrap items-center"
                  >
                    {value.displayAmount && (
                      <span className="text-xs font-normal text-gray-500">
                        {value.count}x
                      </span>
                    )}
                    <label
                      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${value.color.backgroundColor} ${value.color.textColor} ${value.color.borderColor}`}
                    >
                      {value.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
