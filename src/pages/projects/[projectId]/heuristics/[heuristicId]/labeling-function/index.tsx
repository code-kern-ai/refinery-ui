import LabelingFunction from '@/src/components/projects/projectId/heuristics/heuristicId/labeling-function/LabelingFunction'
import {
  setCurrentPage,
  setDisplayIconComments,
} from '@/src/reduxStore/states/general'
import { CurrentPage } from '@/src/types/shared/general'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

export default function LabelingFunctionPage() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setCurrentPage(CurrentPage.LABELING_FUNCTION))
    dispatch(setDisplayIconComments(true))
  }, [])

  return <LabelingFunction />
}
