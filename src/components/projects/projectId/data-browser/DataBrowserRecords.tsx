import { openModal } from '@/src/reduxStore/states/modal'
import {
  selectActiveSearchParams,
  selectActiveSlice,
  selectAdditionalData,
  selectRecords,
  selectSimilaritySearch,
  setActiveDataSlice,
  setActiveSearchParams,
  setIsTextHighlightNeeded,
  setRecordsInDisplay,
  setTextHighlight,
  updateAdditionalDataState,
} from '@/src/reduxStore/states/pages/data-browser'
import style from '@/src/styles/components/projects/projectId/data-browser.module.css'
import { ModalEnum } from '@/src/types/shared/modal'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { Slice } from '@/submodules/javascript-functions/enums/enums'
import { Tooltip } from '@nextui-org/react'
import {
  IconAdjustments,
  IconAlertTriangleFilled,
  IconChartCircles,
  IconFilter,
  IconFilterOff,
  IconTriangleFilled,
} from '@tabler/icons-react'
import { useDispatch, useSelector } from 'react-redux'
import LoadingIcon from '@/src/components/shared/loading/LoadingIcon'
import { selectVisibleAttributesHeuristics } from '@/src/reduxStore/states/pages/settings'
import RecordList from './RecordList'
import { useRouter } from 'next/router'
import { selectProjectId } from '@/src/reduxStore/states/project'
import ConfigurationModal from './modals/ConfigurationModal'
import { DataBrowserRecordsProps } from '@/src/types/components/projects/projectId/data-browser/data-browser'
import { setSessionData } from '@/src/reduxStore/states/tmp'
import Export from '@/src/components/shared/export/Export'
import { LabelingLinkType } from '@/src/types/components/projects/projectId/labeling/labeling-main-component'
import { Fragment, useEffect } from 'react'

export default function DataBrowserRecords(props: DataBrowserRecordsProps) {
  const dispatch = useDispatch()
  const router = useRouter()

  const projectId = useSelector(selectProjectId)
  const extendedRecords = useSelector(selectRecords)
  const activeSlice = useSelector(selectActiveSlice)
  const similaritySearch = useSelector(selectSimilaritySearch)
  const additionalData = useSelector(selectAdditionalData)
  const activeSearchParams = useSelector(selectActiveSearchParams)
  const attributes = useSelector(selectVisibleAttributesHeuristics)

  useEffect(() => {
    router.events.on('routeChangeStart', clearFilters)
    return () => {
      router.events.off('routeChangeStart', clearFilters)
    }
  }, [])

  function clearFilters() {
    dispatch(setActiveSearchParams([]))
    dispatch(setRecordsInDisplay(false))
    dispatch(setActiveDataSlice(null))
    dispatch(setTextHighlight([]))
    dispatch(setIsTextHighlightNeeded({}))
    dispatch(updateAdditionalDataState('clearFullSearch', true))
    dispatch(updateAdditionalDataState('displayOutdatedWarning', false))
    dispatch(updateAdditionalDataState('canUpdateDynamicSlice', false))
  }

  function storePreliminaryRecordIds(index: number, forEdit: boolean = false) {
    if (forEdit) {
      const sessionData = {
        records: extendedRecords.recordList,
        selectedRecordId: extendedRecords.recordList[index].id,
        attributes: attributes,
      }
      dispatch(setSessionData(sessionData))
      router.push(`/projects/${projectId}/edit-records`)
    } else {
      const getSession = JSON.parse(localStorage.getItem('huddleData'))
      if (getSession && getSession.recordIds.length > 0) {
        router.push(
          `/projects/${projectId}/labeling/${extendedRecords.sessionId}?pos=${index + 1}&type=${LabelingLinkType.SESSION}`,
        )
        return
      }

      const huddleData: any = {
        recordIds: extendedRecords.recordList.map((record) => record.id),
        partial: true,
        linkData: {
          projectId: projectId,
          huddleId: extendedRecords.sessionId,
          requestedPos: index,
          linkType: LabelingLinkType.SESSION,
        },
        allowedTask: null,
        canEdit: true,
        checkedAt: { db: null, local: new Date() },
      }
      localStorage.setItem('huddleData', JSON.stringify(huddleData))
      router.push(
        `/projects/${projectId}/labeling/${extendedRecords.sessionId}?pos=${index + 1}&type=${LabelingLinkType.SESSION}`,
      )
    }
  }

  function refetchMoreRecords(e: any) {
    if (e.target.offsetHeight + e.target.scrollTop >= e.target.scrollHeight) {
      props.refetchNextRecords()
    }
  }

  return (
    <div
      className={`flex h-full flex-auto flex-col bg-gray-100 px-2 pt-4 ${style.transitionAll} ${style.mainPageWidthOpen} `}
    >
      {extendedRecords && (
        <div className="flex items-center justify-between">
          <div className="mr-2 flex select-none flex-row flex-nowrap whitespace-nowrap text-sm">
            {extendedRecords.fullCount}&nbsp; Record
            {extendedRecords.fullCount === 1 ? '' : 's'}
          </div>
          <div className="flex flex-row items-center">
            {(activeSlice?.static || similaritySearch.recordsInDisplay) && (
              <div>
                <div className="mr-2 select-none rounded-md border border-yellow-500">
                  <div className="rounded-md bg-yellow-50 p-2">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <IconAlertTriangleFilled className="h-5 w-5 text-yellow-400" />
                      </div>
                      {activeSlice?.static ? (
                        <div className="ml-3">
                          <p className="text-sm font-medium text-yellow-800">
                            Static data slice active. Filter changes won&apos;t
                            take effect
                            {activeSlice?.sliceType != Slice.STATIC_OUTLIER
                              ? ' until you update the slice'
                              : ''}
                            .
                          </p>
                          {additionalData.staticSliceOrderActive &&
                            activeSlice?.sliceType != Slice.STATIC_OUTLIER && (
                              <div className="text-xs font-medium text-yellow-800">
                                * Result order still takes effect:{' '}
                                {additionalData.staticSliceOrderActive}
                              </div>
                            )}
                        </div>
                      ) : (
                        <div className="ml-3">
                          <p className="text-sm font-medium text-yellow-800">
                            Similarity search active. Filter changes will
                            replace search results.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {(activeSlice != null ||
              activeSearchParams.length > 0 ||
              similaritySearch.recordsInDisplay) && (
              <button
                onClick={() => {
                  clearFilters()
                }}
                className="mr-1 inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-2.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
              >
                <IconFilterOff className="mr-1 h-4 w-4" />
                Clear filters
              </button>
            )}
            <Tooltip
              content={TOOLTIPS_DICT.DATA_BROWSER.CONFIGURATION}
              color="invert"
              placement="bottom"
            >
              <button
                onClick={() => dispatch(openModal(ModalEnum.CONFIGURATION))}
                className="mr-1 inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-2.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
              >
                <IconAdjustments className="mr-1 h-4 w-4" />
                Configuration
              </button>
            </Tooltip>
            <Export sessionId={extendedRecords?.sessionId} />
          </div>
        </div>
      )}
      {!activeSlice?.static && (
        <div className="mt-4 flex flex-row flex-wrap">
          {!additionalData.loading &&
            activeSearchParams.map((searchParam, i) => (
              <Fragment key={i}>
                {searchParam.splittedText.map((searchText, j) => (
                  <div key={j} className="flex flex-row items-center gap-y-1">
                    <div
                      className="mr-2 grid grid-cols-2 items-center whitespace-pre-line break-all rounded-full border border-green-700 bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-700"
                      style={{ gridTemplateColumns: 'auto max-content' }}
                    >
                      <div className="flex items-center">
                        <IconFilter className="mr-1 h-4 w-4" />
                        <div className="m-auto whitespace-pre-line break-all">
                          {searchText}
                        </div>
                      </div>
                    </div>
                    {!(
                      i == activeSearchParams.length - 1 &&
                      j == searchParam.splittedText.length - 1
                    ) && (
                      <Tooltip
                        content={TOOLTIPS_DICT.DATA_BROWSER.INTERSECTION}
                        color="invert"
                        placement="top"
                      >
                        <IconChartCircles className="mr-1 h-4 w-4" />
                      </Tooltip>
                    )}
                  </div>
                ))}
              </Fragment>
            ))}
        </div>
      )}

      <div
        className="mb-3 mt-4 grow overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 160px)' }}
        onScroll={(e: any) => refetchMoreRecords(e)}
      >
        {additionalData.loading && (
          <div className="flex h-full items-center justify-center">
            <LoadingIcon size="lg" />
          </div>
        )}
        {extendedRecords && attributes && !additionalData.loading && (
          <div className="mr-2">
            {extendedRecords.fullCount == 0 && (
              <div>Your search criteria didn&apos;t match any record.</div>
            )}
            <RecordList
              editRecord={(index) => storePreliminaryRecordIds(index, true)}
              recordClicked={(index) => storePreliminaryRecordIds(index)}
            />
          </div>
        )}
      </div>
      <ConfigurationModal />
    </div>
  )
}
