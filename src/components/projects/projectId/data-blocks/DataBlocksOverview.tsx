import { selectProjectId } from "@/src/reduxStore/states/project";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect } from "react";
import { selectOrganizationId } from "@/src/reduxStore/states/general";
import { useWebsocket } from "@/submodules/react-components/hooks/web-socket/useWebsocket";
import { Application, CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";
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

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (['data_blocks_created', 'data_blocks_updated', 'data_blocks_deleted'].includes(msgParts[1])) {
            refetchDataBlocks();
        }
    }, [projectId]);

    const orgId = useSelector(selectOrganizationId);
    useWebsocket(orgId, Application.REFINERY, CurrentPage.DATA_BLOCKS, handleWebsocketNotification, projectId);

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