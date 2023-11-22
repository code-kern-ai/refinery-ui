import LabelingMainComponent from "@/src/components/projects/projectId/labeling/sessionId/main-component/LabelingMainComponent";
import { setCurrentPage } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/src/types/shared/general";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function LabelingPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.LABELING))
    }, []);

    return (
        <LabelingMainComponent />
    )
}