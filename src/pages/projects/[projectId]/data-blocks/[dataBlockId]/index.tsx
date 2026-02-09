import DataBlocksDetailsOverview from "@/src/components/projects/projectId/data-blocks/dataBlockId/DataBlocksDetailsOverview";
import { setCurrentPage, setDisplayIconComments } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function DataBlocksDetailsPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.DATA_BLOCKS));
        dispatch(setDisplayIconComments(false));
    }, []);

    return (
        <DataBlocksDetailsOverview />
    )
}