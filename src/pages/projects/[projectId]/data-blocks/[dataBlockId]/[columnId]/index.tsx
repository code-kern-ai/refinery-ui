import DataBlocksColumnsOverview from "@/src/components/projects/projectId/data-blocks/dataBlockId/columnId/DataBlocksColumnsOverview";
import { setCurrentPage, setDisplayIconComments } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function DataBlocksColumnsPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.DATA_BLOCKS_COLUMNS));
        dispatch(setDisplayIconComments(false));
    }, []);

    return (
        <DataBlocksColumnsOverview />
    )
}