import CrowdLabeler from "@/src/components/projects/projectId/heuristics/heuristicId/crowd-labeler/CrowdLabeler";
import { setCurrentPage, setDisplayIconComments } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/src/types/shared/general";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function CrowdLabelerPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.CROWD_LABELER));
        dispatch(setDisplayIconComments(true));
    }, []);

    return (
        <CrowdLabeler />
    )
}