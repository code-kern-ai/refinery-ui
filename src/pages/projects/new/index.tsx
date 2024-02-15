import NewProject from '@/src/components/projects/new/NewProject'
import {
  setCurrentPage,
  setDisplayIconComments,
} from '@/src/reduxStore/states/general'
import { CurrentPage } from '@/src/types/shared/general'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

export default function NewProjectPage() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setCurrentPage(CurrentPage.NEW_PROJECT))
    dispatch(setDisplayIconComments(false))
  }, [])

  return <NewProject />
}
