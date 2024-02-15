import { setModalStates } from '@/src/reduxStore/states/modal'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { NavBarTopEditRecordsProps } from '@/src/types/components/projects/projectId/edit-records'
import { ModalEnum } from '@/src/types/shared/modal'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { Tooltip } from '@nextui-org/react'
import {
  IconColumns1,
  IconColumns2,
  IconColumns3,
  IconDatabase,
} from '@tabler/icons-react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import SyncRecordsModal from './SyncRecordsModal'
import { timer } from 'rxjs'
import { scrollElementIntoView } from '@/submodules/javascript-functions/scrollHelper'
import { jsonCopy } from '@/submodules/javascript-functions/general'
import ExplainModal from './ExplainModal'

export default function NavBarTopEditRecords(props: NavBarTopEditRecordsProps) {
  const router = useRouter()
  const dispatch = useDispatch()

  const projectId = useSelector(selectProjectId)

  function nextColumnClass() {
    const erdDataCopy = jsonCopy(props.erdData)
    switch (erdDataCopy.columnClass) {
      case 'grid-cols-1':
        erdDataCopy.columnClass = 'grid-cols-2'
        break
      case 'grid-cols-2':
        erdDataCopy.columnClass = 'grid-cols-3'
        break
      case 'grid-cols-3':
        erdDataCopy.columnClass = 'grid-cols-1'
        break
      default:
        erdDataCopy.columnClass = 'grid-cols-3'
        break
    }

    localStorage.setItem('ERcolumnClass', erdDataCopy.columnClass)
    erdDataCopy.data.selectedRecordId = null
    if (erdDataCopy.editRecordId) {
      timer(100).subscribe(() => {
        erdDataCopy.data.selectedRecordId = erdDataCopy.editRecordId
        scrollElementIntoView('flash-it', 50)
      })
    } else scrollElementIntoView('flash-it', 50)
    props.setErdData(erdDataCopy)
  }

  return (
    <div className="h-16 w-full border-b border-gray-200 px-4">
      <div className="relative flex h-full flex-shrink-0 items-center justify-between bg-white shadow-sm">
        <div className="flex flex-row flex-nowrap items-center">
          <div className="flex justify-center overflow-visible">
            <Tooltip
              content={TOOLTIPS_DICT.EDIT_RECORDS.GO_TO_DATA_BROWSER}
              placement="bottom"
              color="invert"
            >
              <button
                onClick={() =>
                  router.push(`/projects/${projectId}/data-browser`)
                }
                className="mr-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                Data browser
              </button>
            </Tooltip>
          </div>
        </div>
        <div className="flex flex-row flex-nowrap items-center">
          <div className="flex items-center justify-center overflow-visible">
            <div className="my-3 mr-3 flex-shrink-0 text-sm leading-5 text-gray-500">
              <Tooltip
                content={TOOLTIPS_DICT.EDIT_RECORDS.DIFFERENT_RECORDS}
                color="invert"
                placement="bottom"
                className="cursor-auto"
              >
                <span className="filtersUnderline cursor-help underline">
                  {props.erdData.navBar.positionString} current session
                </span>
              </Tooltip>
            </div>
            <Tooltip
              content={TOOLTIPS_DICT.EDIT_RECORDS.PERSIST_CHANGES}
              color="invert"
              placement="left"
            >
              <button
                onClick={() =>
                  dispatch(
                    setModalStates(ModalEnum.SYNC_RECORDS, {
                      open: true,
                      syncModalAmount: Object.keys(
                        props.erdData.cachedRecordChanges,
                      ).length,
                    }),
                  )
                }
                className="mr-3 inline-flex items-center gap-x-1 whitespace-nowrap rounded-md border border-gray-300 bg-white px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                Synchronize with DB
                <IconDatabase size={24} strokeWidth={2} />
              </button>
            </Tooltip>
            <Tooltip
              content={TOOLTIPS_DICT.EDIT_RECORDS.SWITCH_COLUMN}
              color="invert"
              placement="left"
            >
              <button
                onClick={nextColumnClass}
                className="mr-3 inline-flex items-center gap-x-1 whitespace-nowrap rounded-md border border-gray-300 bg-white px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                Switch view
                {props.erdData.columnClass == 'grid-cols-3' && (
                  <IconColumns1 size={24} strokeWidth={2} />
                )}
                {props.erdData.columnClass == 'grid-cols-1' && (
                  <IconColumns2 size={24} strokeWidth={2} />
                )}
                {props.erdData.columnClass == 'grid-cols-2' && (
                  <IconColumns3 size={24} strokeWidth={2} />
                )}
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
      <ExplainModal
        erdData={props.erdData}
        setErdData={(erdData) => props.setErdData(erdData)}
      />
      <SyncRecordsModal
        erdData={props.erdData}
        setErdData={(erdData) => props.setErdData(erdData)}
      />
    </div>
  )
}
