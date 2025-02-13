import { LLMConfig } from "@/src/types/components/projects/projectId/settings/data-schema";
import { Dispatch, SetStateAction } from "react";

export type LLMResponseConfigProps = {
    attributeId: string;
    fullLlmConfig: LLMConfig;
    setFullLlmConfig: Dispatch<SetStateAction<LLMConfig>>;
    disabled?: boolean;
    noPlayground?: boolean;
    keepConfigOpen?: boolean;
    apiKey?: string; //only for playground
}


export type LLMConfigProps = {
    llmIdentifier: string,
    llmConfig: any,
    setLlmConfig: (llmConfig: any) => void,
    onlyEssential?: boolean,
    projectId?: string,
    isVision?: boolean,
    disabled?: boolean,
}


export type LLmPropsOpenAI = {
    llmConfig: any;
    setLlmConfig: (llmConfig: any) => void;
    onlyEssential?: boolean;
    projectId?: string;
    isVision?: boolean;
    disabled?: boolean;
}


export type LLmPropsAzure = {
    llmConfig: any;
    setLlmConfig: (llmConfig: any) => void;
    onlyEssential?: boolean;
    projectId?: string;
    disabled?: boolean;
}