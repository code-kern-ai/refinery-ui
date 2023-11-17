import { selectAllLookupLists, selectCheckedLookupLists, setCheckedLookupLists } from "@/src/reduxStore/states/pages/lookup-lists";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { LookupListCardProps } from "@/src/types/components/projects/projectId/lookup-lists";
import { IconArrowRight } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export function LookupListCard(props: LookupListCardProps) {
    const dispatch = useDispatch();
    const router = useRouter();

    const projectId = useSelector(selectProjectId);
    const lookupLists = useSelector(selectAllLookupLists);
    const checkedLookupLists = useSelector(selectCheckedLookupLists);

    useEffect(() => {
        if (!props.lookupList) return;
        dispatch(setCheckedLookupLists(Array(lookupLists.length).fill(false)));
    }, [props.lookupList]);

    function toggleCheckbox() {
        const index = props.index;
        let checkedLookupListsCopy = [...checkedLookupLists];
        checkedLookupListsCopy[index] = !checkedLookupListsCopy[index];
        dispatch(setCheckedLookupLists(checkedLookupListsCopy));
    }

    return (<div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 h-28">
        <div className="h-full">
            <input type="checkbox" className="cursor-pointer" onChange={toggleCheckbox} checked={checkedLookupLists[props.index] == undefined ? false : checkedLookupLists[props.index]} />
        </div>
        <div className="h-full flex-1 min-w-0 text-sm leading-5">
            <div className="flow-root font-medium">
                <div className="text-gray-900 float-left italic">
                    {props.lookupList.name}
                </div>
                <div onClick={() => {
                    router.push(`/projects/${projectId}/lookup-lists/${props.lookupList.id}`);
                }} className="text-green-800 float-right cursor-pointer">
                    Details
                    <IconArrowRight className="h-5 w-5 inline-block text-green-800" />
                </div>
            </div>
            <div className={`flex-row gap-16 font-normal text-gray-500 ${props.lookupList.description ? 'flex' : 'block'}`}>
                <div className="line-clamp-wrapper">
                    <div className="italic line-clamp">
                        {props.lookupList.description}
                    </div>
                </div>
                <div className="flex-grow flex-shrink-0">
                    <span className="float-right">{props.lookupList.termCount + ' item' +
                        (props.lookupList.termCount == 1 ? '' : 's')}</span>
                </div>
            </div>
        </div>
    </div>)
}