import ActiveLearning from "@/src/components/projects/projectId/heuristics/heuristicId/active-learning/ActiveLearning";
import { setCurrentPage } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/src/types/shared/general";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function ActiveLearningPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.ACTIVE_LEARNING))
    }, []);

    return (
        <ActiveLearning />
    )
}