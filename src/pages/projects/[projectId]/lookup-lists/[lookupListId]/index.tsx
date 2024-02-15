import LookupListsDetails from '@/src/components/projects/projectId/lookup-lists/lookupListId/LookupListsDetails'
import {
  setCurrentPage,
  setDisplayIconComments,
} from '@/src/reduxStore/states/general'
import { CurrentPage } from '@/src/types/shared/general'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

export default function LookupListsDetailsPage() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setCurrentPage(CurrentPage.LOOKUP_LISTS_DETAILS))
    dispatch(setDisplayIconComments(true))
  }, [])

  return <LookupListsDetails />
}
