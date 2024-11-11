import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { Tooltip } from "@nextui-org/react";
import { useMemo } from "react";

const BASE_URL = "https://bricks.kern.ai/"



export function VisitBricksButton(props: { urlExtension?: "generators" | "extractors" | "classifiers", size?: "small" | "medium" | "large", tooltipPlacement?: "top" | "bottom" | "left" | "right" }) {

    const buttonClasses = useMemo(() => {
        return "bg-white text-gray-900 text font-semibold px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none " + toTextSize(props.size)
    }, [props.size])

    return <Tooltip content={TOOLTIPS_DICT.GENERAL.VISIT_BRICKS} placement={props.tooltipPlacement || "top"} color="invert" className="cursor-auto">
        <a href={props.urlExtension ? BASE_URL + props.urlExtension : BASE_URL} target="_blank" rel="noreferrer">
            <button
                className={buttonClasses}>
                Visit Bricks
            </button>
        </a>
    </Tooltip>
}


function toTextSize(size: "small" | "medium" | "large") {
    switch (size) {
        case "small":
            return "text-xs";
        case "medium":
            return "text-sm";
        case "large":
            return "text-md";
        default:
            return ""
    }
}