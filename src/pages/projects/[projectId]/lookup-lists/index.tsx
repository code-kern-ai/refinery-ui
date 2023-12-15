import LookupListsOverview from "@/src/components/projects/projectId/lookup-lists/LookupListsOverview";
import { setCurrentPage, setDisplayIconComments } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/src/types/shared/general";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function LookupListsPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.LOOKUP_LISTS_OVERVIEW));
        dispatch(setDisplayIconComments(true));
    }, []);

    return (
        <LookupListsOverview />
    )
}