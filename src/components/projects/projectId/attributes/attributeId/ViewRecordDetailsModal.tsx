import Modal from '@/src/components/shared/modal/Modal'
import { selectModal } from '@/src/reduxStore/states/modal'
import { ModalEnum } from '@/src/types/shared/modal'
import { useSelector } from 'react-redux'
import style from '@/src/styles/components/projects/projectId/attribute-calculation.module.css'
import { RecordDisplay } from '@/src/components/shared/record-display/RecordDisplay'
import { DataTypeEnum } from '@/src/types/shared/general'
import LoadingIcon from '@/src/components/shared/loading/LoadingIcon'
import { ViewRecordDetailsModalProps } from '@/src/types/components/projects/projectId/settings/attribute-calculation'
import { selectVisibleAttributesHeuristics } from '@/src/reduxStore/states/pages/settings'

export default function ViewRecordDetailsModal(
  props: ViewRecordDetailsModalProps,
) {
  const modalViewRecordDetails = useSelector(
    selectModal(ModalEnum.VIEW_RECORD_DETAILS),
  )
  const attributes = useSelector(selectVisibleAttributesHeuristics)

  return (
    <Modal modalName={ModalEnum.VIEW_RECORD_DETAILS}>
      <h1 className="mb-2 text-center text-lg text-gray-900">View details</h1>
      {modalViewRecordDetails.record ? (
        <div
          className={`max-height-modal my-2 overflow-y-auto text-sm text-gray-500 ${style.scrollableSize}`}
        >
          <RecordDisplay
            attributes={attributes}
            record={modalViewRecordDetails.record}
          />
          <div className="text-left text-sm font-bold leading-5 text-gray-900">
            Calculated value
          </div>
          <div className="text-left text-sm font-normal leading-5 text-gray-500">
            {props.currentAttribute.dataType != DataTypeEnum.EMBEDDING_LIST ? (
              <span>
                {
                  props.sampleRecords.calculatedAttributes[
                    modalViewRecordDetails.recordIdx
                  ]
                }
              </span>
            ) : (
              <div className="flex flex-col gap-y-2 divide-y">
                {props.sampleRecords.calculatedAttributesListDisplay[
                  modalViewRecordDetails.recordIdx
                ].map((item: any) => (
                  <span key={item.id} className="mt-1">
                    {
                      props.sampleRecords.calculatedAttributesList[
                        modalViewRecordDetails.recordIdx
                      ]
                    }
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <LoadingIcon />
      )}
    </Modal>
  )
}
