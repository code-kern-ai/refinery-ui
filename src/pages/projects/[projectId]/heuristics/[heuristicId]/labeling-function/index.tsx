import LabelingFunction from "@/src/components/projects/projectId/heuristics/heuristicId/labeling-function/LabelingFunction";
import { setCurrentPage } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/src/types/shared/general";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function LabelingFunctionPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.LABELING_FUNCTION))
    }, []);

    return (
        <LabelingFunction />
    )
}