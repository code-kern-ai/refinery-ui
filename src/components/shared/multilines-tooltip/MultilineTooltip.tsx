import { MultilineTooltipProps, MultilineTooltip } from "@/src/types/shared/multiline-tooltip";
import { extendArrayElementsByUniqueId } from "@/submodules/javascript-functions/id-prep";
import { Fragment, useEffect, useState } from "react";

// TODO: Make Submodule component with an option to split on different characters as flexbox
export default function MultilineTooltip(props: MultilineTooltipProps) {
    const [tooltipArray, setTooltipArray] = useState<MultilineTooltip[]>(null);

    useEffect(() => {
        if (!props.tooltipLines) return;
        setTooltipArray(extendArrayElementsByUniqueId(props.tooltipLines));
    }, [props.tooltipLines]);

    return (<div>
        {tooltipArray && tooltipArray.map((line, index) => (
            <Fragment key={line.id}>
                <p>{line.value}</p>
                {index !== props.tooltipLines.length - 1 && <br></br>}
            </Fragment>
        ))}
    </div>)
}