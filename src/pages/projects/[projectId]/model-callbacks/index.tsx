import ModelCallbacks from "@/src/components/projects/projectId/model-callbacks/ModelCallbacks";
import { setCurrentPage } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/src/types/shared/general";
import { useEffect } from "react";
import { useDispatch } from "react-redux"

export default function ModelCallbacksPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setCurrentPage(CurrentPage.MODEL_CALLBACKS));
  }, []);

  return (<ModelCallbacks></ModelCallbacks>)
}