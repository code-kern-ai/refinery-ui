import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import { useDispatch } from "react-redux";
import LLMPlaygroundModal from "./LLM/LLMPlaygroundModal";
import { setModalStates } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { useCallback } from "react";
import { MemoIconPlayCardStar } from "@/submodules/react-components/components/kern-icons/icons";
import useRefFor from "@/submodules/react-components/hooks/useRefFor";


type LLMResponsePlaygroundProps = {
    attributeId: string;
    apiKey?: string;
}

export default function LLMResponsePlayground(props: LLMResponsePlaygroundProps) {
    const dispatch = useDispatch();

    const attributeIdRef = useRefFor(props.attributeId);
    const apiKeyRef = useRefFor(props.apiKey);
    const openLLMPlayground = useCallback(() => {
        dispatch(setModalStates(ModalEnum.LLM_PLAYGROUND, { open: true, attributeId: attributeIdRef.current, apiKey: apiKeyRef.current }));
    }, []);

    return (
        <>
            <KernButton text="Open LLM Playground" icon={MemoIconPlayCardStar} onClick={openLLMPlayground} size="small" />
            <LLMPlaygroundModal />
        </>
    )
}