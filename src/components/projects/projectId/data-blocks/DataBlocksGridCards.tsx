import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { MemoIconArrowRight } from "@/submodules/react-components/components/kern-icons/icons";
import { useRouter } from "next/router";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { selectDataBlocksAll, setAllDataBlocks } from "@/src/reduxStore/states/pages/data-blocks";
import { DataBlock } from "@/src/types/components/projects/projectId/data-blocks/data-blocks";

export default function DataBlocksGridCards() {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const dataBlocks = useSelector(selectDataBlocksAll);

    const toggleDataBlock = useCallback((dataBlockId: string) => {
        const dataBlocksCopy = jsonCopy(dataBlocks);

        dataBlocksCopy.forEach((dataBlock, index) => {
            if (dataBlock.id === dataBlockId) {
                dataBlocksCopy[index].selected = !(dataBlocks[index].selected ?? false);
            }
        });
        dispatch(setAllDataBlocks(dataBlocksCopy));
    }, [dataBlocks]);

    const navigateToDetails = useCallback((dataBlock: DataBlock) => {
        router.push(`/projects/${projectId}/data-blocks/${dataBlock.id}?type=${dataBlock.type}`);
    }, [projectId]);

    return (<>
        {dataBlocks.map((dataBlock: DataBlock, index: number) => (<div key={dataBlock.id}>
            <div className="relative flex space-x-3 items-center rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400">
                <div className="h-full flex flex-col gap-2 items-center self-start">
                    <label htmlFor="data-block-checkbox" className="cursor-pointer flex justify-center">
                        <input type="checkbox" className="cursor-pointer" name="data-block-checkbox" checked={dataBlock.selected ?? false} onChange={() => toggleDataBlock(dataBlock.id)} />
                    </label>
                </div>

                <div className="flex-1 min-w-0 text-sm leading-5">
                    <div className="flow-root font-medium">
                        <div className="text-gray-900 float-left"> {dataBlock.name}</div>
                        <button className="text-green-800 float-right cursor-pointer" onClick={() => {
                            navigateToDetails(dataBlock);
                        }}> Details
                            <MemoIconArrowRight className="h-5 w-5 inline-block text-green-800" />
                        </button>
                    </div>
                    <div className="flow-root font-normal">
                        <div className="text-gray-500 float-left line-clamp-3" style={{ maxWidth: '250px' }}>
                            {dataBlock.description}
                        </div>
                    </div>
                    <div className="flow-root font-normal mt-2">
                        <div className="float-left text-xs">
                            Type: {dataBlock.type}
                        </div>
                    </div>
                </div>
            </div>
        </div >))
        }
    </ >);
}