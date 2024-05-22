import { HeuristicsOverview } from "@/src/components/projects/projectId/heuristics/HeuristicsOverview";
import { setCurrentPage, setDisplayIconComments } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function HeuristicsPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.HEURISTICS));
        dispatch(setDisplayIconComments(true));
    }, []);

    return (
        <HeuristicsOverview />
    )
}