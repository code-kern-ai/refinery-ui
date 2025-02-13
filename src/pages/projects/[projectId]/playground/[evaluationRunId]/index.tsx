import { setCurrentPage } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import EvaluationRunDetails from "@/src/components/projects/projectId/playground/evaluationRunId/EvaluationRunDetails";


export default function EvaluationRunDetailsPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.EVALUATION_RUN_DETAILS));
    }, [])

    return (<EvaluationRunDetails />);
}