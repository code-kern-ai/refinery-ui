import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import { IconPlayCardStar } from "@tabler/icons-react";
import { useDispatch } from "react-redux";
import LLMPlaygroundModal from "./LLM/LLMPlaygroundModal";
import { setModalStates } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";


type LLMResponsePlaygroundProps = {
    attributeId: string;
}

export default function LLMResponsePlayground(props: LLMResponsePlaygroundProps) {
    const dispatch = useDispatch();
    return (
        <>
            <KernButton text="Open LLM Playground" icon={IconPlayCardStar} onClick={() => dispatch(setModalStates(ModalEnum.LLM_PLAYGROUND, { open: true, attributeId: props.attributeId }))} size="small" />
            <LLMPlaygroundModal />
        </>
    )
}