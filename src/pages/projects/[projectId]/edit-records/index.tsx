import EditRecords from '@/src/components/projects/projectId/edit-records/EditRecords'
import {
  setCurrentPage,
  setDisplayIconComments,
} from '@/src/reduxStore/states/general'
import { CurrentPage } from '@/src/types/shared/general'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

export default function EditRecordsPage() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setCurrentPage(CurrentPage.EDIT_RECORDS))
    dispatch(setDisplayIconComments(true))
  }, [])

  return <EditRecords />
}
