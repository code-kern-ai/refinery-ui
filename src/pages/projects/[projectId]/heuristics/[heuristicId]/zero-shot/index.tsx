import ZeroShot from "@/src/components/projects/projectId/heuristics/heuristicId/zero-shot/ZeroShot";
import { setCurrentPage } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/src/types/shared/general";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function ZeroShotPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.ZERO_SHOT))
    }, []);

    return (
        <ZeroShot />
    )
}