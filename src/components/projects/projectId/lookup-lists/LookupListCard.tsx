import {
  selectAllLookupLists,
  selectCheckedLookupLists,
  setCheckedLookupLists,
} from '@/src/reduxStore/states/pages/lookup-lists'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { LookupListCardProps } from '@/src/types/components/projects/projectId/lookup-lists'
import { IconArrowRight } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

export function LookupListCard(props: LookupListCardProps) {
  const dispatch = useDispatch()
  const router = useRouter()

  const projectId = useSelector(selectProjectId)
  const lookupLists = useSelector(selectAllLookupLists)
  const checkedLookupLists = useSelector(selectCheckedLookupLists)

  useEffect(() => {
    if (!props.lookupList) return
    dispatch(setCheckedLookupLists(Array(lookupLists.length).fill(false)))
  }, [props.lookupList])

  function toggleCheckbox() {
    const index = props.index
    let checkedLookupListsCopy = [...checkedLookupLists]
    checkedLookupListsCopy[index] = !checkedLookupListsCopy[index]
    dispatch(setCheckedLookupLists(checkedLookupListsCopy))
  }

  return (
    <div className="relative flex h-28 items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400">
      <div className="h-full">
        <input
          type="checkbox"
          className="cursor-pointer"
          onChange={toggleCheckbox}
          checked={
            checkedLookupLists[props.index] == undefined
              ? false
              : checkedLookupLists[props.index]
          }
        />
      </div>
      <div className="h-full min-w-0 flex-1 text-sm leading-5">
        <div className="flow-root font-medium">
          <div className="float-left italic text-gray-900">
            {props.lookupList.name}
          </div>
          <a
            href={`/refinery/projects/${projectId}/lookup-lists/${props.lookupList.id}`}
            onClick={(e) => {
              e.preventDefault()
              router.push(
                `/projects/${projectId}/lookup-lists/${props.lookupList.id}`,
              )
            }}
            className="float-right cursor-pointer text-green-800"
          >
            Details
            <IconArrowRight className="inline-block h-5 w-5 text-green-800" />
          </a>
        </div>
        <div
          className={`flex-row gap-16 font-normal text-gray-500 ${props.lookupList.description ? 'flex' : 'block'}`}
        >
          <div className="line-clamp-wrapper">
            <div className="line-clamp italic">
              {props.lookupList.description}
            </div>
          </div>
          <div className="flex-shrink-0 flex-grow">
            <span className="float-right">
              {props.lookupList.termCount +
                ' item' +
                (props.lookupList.termCount == 1 ? '' : 's')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
