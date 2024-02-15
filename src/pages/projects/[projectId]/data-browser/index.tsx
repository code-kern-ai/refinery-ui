import DataBrowser from '@/src/components/projects/projectId/data-browser/DataBrowser'
import {
  setCurrentPage,
  setDisplayIconComments,
} from '@/src/reduxStore/states/general'
import { CurrentPage } from '@/src/types/shared/general'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

export default function DataBrowserPage() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setCurrentPage(CurrentPage.DATA_BROWSER))
    dispatch(setDisplayIconComments(true))
  }, [])

  return <DataBrowser />
}
