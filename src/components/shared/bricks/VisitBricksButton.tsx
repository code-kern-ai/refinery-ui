import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import { Tooltip } from "@nextui-org/react";
import { useMemo } from "react";

const BASE_URL = "https://bricks.kern.ai/"



export function VisitBricksButton(props: { urlExtension?: "generators" | "extractors" | "classifiers", size?: "small" | "medium" | "large", tooltipPlacement?: "top" | "bottom" | "left" | "right" }) {
    const buttonClasses = useMemo(() => {
        return "bg-white text-gray-900 text font-semibold px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none " + toTextSize(props.size)
    }, [props.size])

    return <KernButton
        text="Visit Bricks"
        onClick={() => window.open(BASE_URL + (props.urlExtension ? props.urlExtension : ""), "_blank")}
        tooltip={TOOLTIPS_DICT.GENERAL.VISIT_BRICKS}
        tooltipPlacement={props.tooltipPlacement || "top"}
    />
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