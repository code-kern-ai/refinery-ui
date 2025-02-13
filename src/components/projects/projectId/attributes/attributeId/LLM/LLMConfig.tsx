
import OpenAI from "./models/OpenAI"
import Azure from "./models/Azure"
import { LLMConfigProps } from "./types";

export function isLLMConfigValid(llmIdentifier: string, llmConfig: any): boolean {
    switch (llmIdentifier) {
        case 'Open AI':
            return llmConfig.model && llmConfig.environmentVariable
        case 'Azure':
            return llmConfig.model && llmConfig.environmentVariable && llmConfig.engine && llmConfig.apiBase && llmConfig.apiVersion
    }
    return false;
}


export function LLMConfig(props: LLMConfigProps) {
    switch (props.llmIdentifier) {
        case 'Open AI':
            return <OpenAI disabled={props.disabled} llmConfig={props.llmConfig} setLlmConfig={props.setLlmConfig} onlyEssential={props.onlyEssential} projectId={props.projectId} isVision={props.isVision} />
        case 'Azure':
            return <Azure disabled={props.disabled} llmConfig={props.llmConfig} setLlmConfig={props.setLlmConfig} onlyEssential={props.onlyEssential} projectId={props.projectId} />
        default:
            return null
    }
}