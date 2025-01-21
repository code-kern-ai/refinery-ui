import { useDispatch, useSelector } from "react-redux"

// import { TempStorageEnum, selectTempValue, setTempVariable } from "@/src/reduxStore/states/temps"
import { useEffect } from "react"
import OpenAI from "./models/OpenAI"
import Azure from "./models/Azure"
// import { EnvVarScope } from "@/src/util/enums"
// import Azure from "@/src/components/Pipeline/StrategySteps/LLM/models/Azure"
// import OpenAI from "@/src/components/Pipeline/StrategySteps/LLM/models/OpenAI"

type LLMConfigProps = {
    llmIdentifier: string,
    llmConfig: any,
    setLlmConfig: (llmConfig: any) => void,
    onlyEssential?: boolean,
    projectId?: string,
    // defaultScope?: { name: string, value: EnvVarScope },
    // allowScopeChange?: boolean,
    isVision?: boolean,
    disabled?: boolean,
}

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