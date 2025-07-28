
import OpenAI from "./models/OpenAI"
import Azure from "./models/Azure"
import { LLMConfigProps } from "./types";
import AzureFoundry from "./models/AzureFoundry";
import PrivatemodeAi from "./models/PrivatemodeAi";

export function LLMConfig(props: LLMConfigProps) {
    switch (props.llmIdentifier) {
        case 'Open AI':
            return <OpenAI disabled={props.disabled} llmConfig={props.llmConfig} setLlmConfig={props.setLlmConfig} onlyEssential={props.onlyEssential} projectId={props.projectId} />
        case 'Azure':
            return <Azure disabled={props.disabled} llmConfig={props.llmConfig} setLlmConfig={props.setLlmConfig} onlyEssential={props.onlyEssential} projectId={props.projectId} />
        case 'Azure Foundry':
            return <AzureFoundry disabled={props.disabled} llmConfig={props.llmConfig} setLlmConfig={props.setLlmConfig} onlyEssential={props.onlyEssential} projectId={props.projectId} />
        case 'Privatemode AI':
            return <PrivatemodeAi disabled={props.disabled} llmConfig={props.llmConfig} setLlmConfig={props.setLlmConfig} onlyEssential={props.onlyEssential} projectId={props.projectId} />
        default:
            return null
    }
}