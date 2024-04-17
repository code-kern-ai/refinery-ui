import { MultilineTooltipAutoProps as MultilineTooltipAutoContentProps } from "@/src/types/shared/multiline-tooltip";
import { extendArrayElementsByUniqueId } from "@/submodules/javascript-functions/id-prep";
import { useMemo } from "react";

export default function MultilineTooltipAutoContent(props: MultilineTooltipAutoContentProps) {
    const splitOnMe = props.splitOn || "\n";
    const toolTipArray = useMemo(() => { return props.tooltip ? extendArrayElementsByUniqueId(props.tooltip.split(splitOnMe)) : [] }, [props.tooltip])

    return (<div className="flex flex-col">
        {toolTipArray.map((line) => (
            <span key={line.id}>{line.value}</span>
        ))}
    </div>)
}