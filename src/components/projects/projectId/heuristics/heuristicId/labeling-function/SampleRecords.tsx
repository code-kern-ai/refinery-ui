import { setModalStates } from '@/src/reduxStore/states/modal'
import { SampleRecordProps } from '@/src/types/components/projects/projectId/heuristics/heuristicId/labeling-function'
import { ModalEnum } from '@/src/types/shared/modal'
import { useDispatch } from 'react-redux'
import ViewDetailsLFModal from './ViewDetailsLFModal'

export default function SampleRecords(props: SampleRecordProps) {
  const dispatch = useDispatch()

  return (
    <div className="mt-12 flex flex-col">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <div className="min-w-full divide-y divide-gray-300 border">
              {props.sampleRecords.records.map((record, index) => (
                <div
                  className="divide-y divide-gray-200 bg-white"
                  key={record.id}
                >
                  <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 shadow-sm">
                    <div className="mx-4 my-3 flex items-center text-justify text-xs font-normal leading-5 text-gray-500">
                      {record.fullRecordData[props.selectedAttribute]}
                    </div>
                    <div className="ml-auto mr-5 flex items-center justify-center">
                      {Object.entries(record.calculatedLabelsResult).map(
                        ([key, value]: any) => (
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
                              className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${value.color.backgroundColor} ${value.color.hoverColor} ${value.color.textColor} ${value.color.borderColor}`}
                            >
                              {value.label}
                            </label>
                          </div>
                        ),
                      )}
                    </div>
                    <div className="mr-5 flex items-center justify-center">
                      <label
                        onClick={() =>
                          dispatch(
                            setModalStates(
                              ModalEnum.SAMPLE_RECORDS_LABELING_FUNCTION,
                              { currentRecordIdx: index, open: true },
                            ),
                          )
                        }
                        className=" inline-block cursor-pointer rounded border border-gray-300 bg-white px-4 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none"
                      >
                        View
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ViewDetailsLFModal sampleRecords={props.sampleRecords} />
    </div>
  )
}
