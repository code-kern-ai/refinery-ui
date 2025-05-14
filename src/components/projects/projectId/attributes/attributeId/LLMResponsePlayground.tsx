import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import { useDispatch } from "react-redux";
import LLMPlaygroundModal from "./LLM/LLMPlaygroundModal";
import { setModalStates } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { useCallback } from "react";
import { MemoIconPlayCardStar } from "@/submodules/react-components/components/kern-icons/icons";


type LLMResponsePlaygroundProps = {
    attributeId: string;
    apiKey?: string;
}

export default function LLMResponsePlayground(props: LLMResponsePlaygroundProps) {
    const dispatch = useDispatch();

    const openLLMPlayground = useCallback(() => {
        dispatch(setModalStates(ModalEnum.LLM_PLAYGROUND, { open: true, attributeId: props.attributeId, apiKey: props.apiKey }));
    }, []);

    return (
        <>
            <KernButton text="Open LLM Playground" icon={MemoIconPlayCardStar} onClick={openLLMPlayground} size="small" />
            <LLMPlaygroundModal />
        </>
    )
}