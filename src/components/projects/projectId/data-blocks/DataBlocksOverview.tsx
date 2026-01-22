import { selectProjectId } from "@/src/reduxStore/states/project";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect } from "react";
import DataBlockHeader from "./DataBlockHeader";
import { selectDataBlocksAll, setAllDataBlocks } from "@/src/reduxStore/states/pages/data-blocks";
import { getDataBlocks } from "@/src/services/base/data-blocks";
import DataBlocksGridCards from "./DataBlocksGridCards";

export function DataBlocksOverview() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const dataBlocks = useSelector(selectDataBlocksAll);

    useEffect(() => {
        if (!projectId) return;
        refetchDataBlocks();
    }, [projectId]);

    const refetchDataBlocks = useCallback(() => {
        getDataBlocks(projectId, (res) => {
            dispatch(setAllDataBlocks(res));
        });
    }, [projectId]);


    return (projectId && <div className="p-4 bg-gray-100 h-full flex-1 flex flex-col">
        <div className="w-full h-full -mr-4">
            <DataBlockHeader refetch={refetchDataBlocks} />

            {dataBlocks && dataBlocks.length == 0 ? (
                <div>
                    <div className="text-gray-500 font-normal mt-8">
                        <p className="text-sm leading-7">Seems like your project has no data blocks yet.</p>
                    </div>
                </div>
            ) : (<>
                <div className="overflow-y-auto">
                    <div className="mt-8 grid gap-6 grid-cols-3">
                        <DataBlocksGridCards />
                    </div>
                </div>
            </>)}
        </div >
    </div >)
}