import { DataBlocksOverview } from "@/src/components/projects/projectId/data-blocks/DataBlocksOverview";
import { setCurrentPage, setDisplayIconComments } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function DataBlocksPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.DATA_BLOCKS));
        dispatch(setDisplayIconComments(false));
    }, []);

    return (
        <DataBlocksOverview />
    )
}