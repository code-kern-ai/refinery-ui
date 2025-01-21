import { Attribute } from "@/src/types/components/projects/projectId/settings/data-schema";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import { IconPlayCardStar, IconSettings } from "@tabler/icons-react";
import { useState } from "react";


type LLMResponsePlaygroundProps = {
    currentAttribute: Attribute;
}

export default function LLMResponsePlayground(props: LLMResponsePlaygroundProps) {
    // useConsoleLog(props.currentAttribute, 'ca')

    // const [useAttributeConfig, setUseAttributeConfig] = useState<boolean>(false);
    const [openPlayground, setOpenPlayground] = useState(false); //open modal





    {/* Add KernButton / Iconbutton after merge table merge & with dev */ }
    return (
        <KernButton text="Open LLM Playground" icon={IconPlayCardStar} onClick={() => setOpenPlayground((p) => !p)} size="small" />
        // < div className="mt-2 flex flex-row flex-nowrap items-center gap-x-2 cursor-pointer" onClick={() => setOpenPlayground((p) => !p)
        // }>
        //     <label className="block font-bold text-gray-900 cursor-pointer">Open LLM Playground</label>
        //     <IconPlayCardStar className="h-5 w-5 text-gray-500 cursor-pointer" />
        // </div >
    )
}