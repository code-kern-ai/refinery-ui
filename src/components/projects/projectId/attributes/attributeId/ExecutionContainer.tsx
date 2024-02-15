import LoadingIcon from '@/src/components/shared/loading/LoadingIcon'
import { setModalStates } from '@/src/reduxStore/states/modal'
import { selectProjectId } from '@/src/reduxStore/states/project'
import {
  CALCULATE_USER_ATTRIBUTE_SAMPLE_RECORDS,
  GET_RECORD_BY_RECORD_ID,
} from '@/src/services/gql/queries/project-setting'
import {
  ExecutionContainerProps,
  SampleRecord,
} from '@/src/types/components/projects/projectId/settings/attribute-calculation'
import { AttributeState } from '@/src/types/components/projects/projectId/settings/data-schema'
import { ModalEnum } from '@/src/types/shared/modal'
import { postProcessRecordByRecordId } from '@/src/util/components/projects/projectId/settings/attribute-calculation-helper'
import { useLazyQuery } from '@apollo/client'
import { Tooltip } from '@nextui-org/react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import ConfirmExecutionModal from './ConfirmExecutionModal'
import ViewRecordDetailsModal from './ViewRecordDetailsModal'
import { extendArrayElementsByUniqueId } from '@/submodules/javascript-functions/id-prep'

export default function ExecutionContainer(props: ExecutionContainerProps) {
  const projectId = useSelector(selectProjectId)
  const dispatch = useDispatch()

  const [requestedSomething, setRequestedSomething] = useState(false)
  const [runOn10HasError, setRunOn10HasError] = useState(false)
  const [sampleRecords, setSampleRecords] = useState<SampleRecord>(null)
  const [checkIfAtLeastRunning, setCheckIfAtLeastRunning] = useState(false)
  const [checkIfAtLeastQueued, setCheckIfAtLeastQueued] = useState(false)

  const [refetchSampleRecords] = useLazyQuery(
    CALCULATE_USER_ATTRIBUTE_SAMPLE_RECORDS,
    { fetchPolicy: 'no-cache' },
  )
  const [refetchRecordByRecordId] = useLazyQuery(GET_RECORD_BY_RECORD_ID, {
    fetchPolicy: 'no-cache',
  })

  function calculateUserAttributeSampleRecords() {
    if (requestedSomething) return
    setRequestedSomething(true)
    refetchSampleRecords({
      variables: {
        projectId: projectId,
        attributeId: props.currentAttribute.id,
      },
    }).then(
      (res) => {
        const sampleRecordsFinal = {
          ...res.data['calculateUserAttributeSampleRecords'],
        }
        setRequestedSomething(false)
        setRunOn10HasError(
          sampleRecordsFinal.calculatedAttributes.length > 0 ? false : true,
        )
        if (props.currentAttribute.dataType == 'EMBEDDING_LIST') {
          sampleRecordsFinal.calculatedAttributesList =
            sampleRecordsFinal.calculatedAttributes.map((record: string) =>
              JSON.parse(record),
            )
          sampleRecordsFinal.calculatedAttributesListDisplay =
            extendArrayElementsByUniqueId(
              sampleRecordsFinal.calculatedAttributesList,
            )
        }
        sampleRecordsFinal.calculatedAttributesDisplay =
          extendArrayElementsByUniqueId(sampleRecordsFinal.calculatedAttributes)
        setSampleRecords(sampleRecordsFinal)
        props.refetchCurrentAttribute()
      },
      () => {
        setRequestedSomething(false)
      },
    )
  }

  function recordByRecordId(recordId: string) {
    refetchRecordByRecordId({
      variables: { projectId: projectId, recordId: recordId },
    }).then((res) => {
      dispatch(
        setModalStates(ModalEnum.VIEW_RECORD_DETAILS, {
          record: postProcessRecordByRecordId(res.data['recordByRecordId']),
        }),
      )
    })
  }

  return (
    <div>
      <div className="mt-8 text-sm leading-5">
        <div className="mr-2 font-medium text-gray-700">Execution</div>

        <div className="flex items-center">
          <div className="font-normal text-gray-500">
            You can execute your attribute calculation on all records, or
            test-run it on 10 examples (which are sampled randomly). Test
            results are shown below after computation.
          </div>
          {requestedSomething && (
            <div className="inline-block">
              <LoadingIcon color="indigo" />
            </div>
          )}

          <Tooltip
            content={TOOLTIPS_DICT.ATTRIBUTE_CALCULATION.EXECUTE_10_RECORDS}
            color="invert"
            placement="left"
            className="ml-auto"
          >
            <button
              onClick={calculateUserAttributeSampleRecords}
              disabled={
                props.currentAttribute.state == AttributeState.USABLE ||
                props.currentAttribute.state == AttributeState.RUNNING ||
                requestedSomething ||
                props.tokenizationProgress < 1 ||
                props.checkUnsavedChanges
              }
              className={`rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Run on 10
            </button>
          </Tooltip>

          <Tooltip
            color="invert"
            placement="left"
            content={
              props.currentAttribute.state == AttributeState.USABLE
                ? 'Attribute is already in use'
                : requestedSomething
                  ? 'Test is running'
                  : checkIfAtLeastRunning
                    ? 'Another attribute is running'
                    : checkIfAtLeastQueued
                      ? 'Another attribute is queued for execution'
                      : props.tokenizationProgress < 1
                        ? 'Tokenization is in progress'
                        : runOn10HasError
                          ? 'Run on 10 records has an error'
                          : 'Execute the attribute on all records'
            }
          >
            <button
              onClick={() =>
                dispatch(
                  setModalStates(ModalEnum.EXECUTE_ATTRIBUTE_CALCULATION, {
                    open: true,
                    requestedSomething: requestedSomething,
                  }),
                )
              }
              disabled={
                props.currentAttribute.state == AttributeState.USABLE ||
                props.currentAttribute.state == AttributeState.RUNNING ||
                requestedSomething ||
                checkIfAtLeastRunning ||
                checkIfAtLeastQueued ||
                props.tokenizationProgress < 1 ||
                runOn10HasError ||
                props.checkUnsavedChanges
              }
              className={`ml-3 cursor-pointer rounded-md bg-indigo-700 px-4 py-2 text-xs font-semibold leading-4 text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Run
            </button>
          </Tooltip>
        </div>
      </div>

      {sampleRecords &&
        sampleRecords.calculatedAttributesDisplay.length > 0 && (
          <div className="mt-4 flex flex-col">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <div className="min-w-full divide-y divide-gray-300 border">
                    {sampleRecords.calculatedAttributesDisplay.map(
                      (record: any, index: number) => (
                        <div
                          key={record.id}
                          className="divide-y divide-gray-200 bg-white"
                        >
                          <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 shadow-sm">
                            <div className="mx-4 my-3 flex items-center text-justify text-xs font-normal leading-5 text-gray-500">
                              {record.value}
                            </div>
                            <div className="ml-auto mr-5 flex items-center justify-center">
                              <button
                                onClick={() => {
                                  dispatch(
                                    setModalStates(
                                      ModalEnum.VIEW_RECORD_DETAILS,
                                      { open: true, recordIdx: index },
                                    ),
                                  )
                                  recordByRecordId(
                                    sampleRecords.recordIds[index],
                                  )
                                }}
                                className="inline-block cursor-pointer rounded border border-gray-300 bg-white px-4 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      <ViewRecordDetailsModal
        currentAttribute={props.currentAttribute}
        sampleRecords={sampleRecords}
      />
      <ConfirmExecutionModal currentAttributeId={props.currentAttribute.id} />
    </div>
  )
}
