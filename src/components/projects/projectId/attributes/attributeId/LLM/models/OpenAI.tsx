import { useEffect } from "react";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { InputWithSlider } from "@/submodules/react-components/components/InputWithSlider";
import { LLmPropsOpenAI } from "../types";
import OpenAIoSeriesSwitch from "./OpenAIoSeriesSwitch";



// https://platform.openai.com/docs/models
const MAX_LENGTH = {
    'gpt-4o-mini': 16384,
    'gpt-3.5-turbo': 16385,
    'gpt-4': 8192,
    'gpt-4-turbo': 4096,
    'gpt-4o': 16384,
    'o1': 100000,
    'o1-mini': 65536,
    'o3-mini': 100000,
}
const MODEL_OPTIONS = Object.keys(MAX_LENGTH);

export default function OpenAI(props: LLmPropsOpenAI) {

    useEffect(() => {
        if (props.llmConfig.model) {
            const newMaxLength = Math.min(props.llmConfig.maxLength, MAX_LENGTH[props.llmConfig.model]);
            props.setLlmConfig({ ...props.llmConfig, maxLength: newMaxLength });
        }
    }, [props.llmConfig.model])

    useEffect(() => {
        if (props.llmConfig.model && !MODEL_OPTIONS.includes(props.llmConfig.model)) {
            props.setLlmConfig({ ...props.llmConfig, model: MODEL_OPTIONS[0] })
        }
    }, [])
    return (
        <div className='flex flex-col gap-y-6'>
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Model</label>
                <KernDropdown
                    buttonName={props.llmConfig.model ? props.llmConfig.model : 'Select model'}
                    options={MODEL_OPTIONS}
                    selectedOption={(option) => props.setLlmConfig({ ...props.llmConfig, model: option })}
                    disabled={props.disabled}
                />
                <OpenAIoSeriesSwitch
                    llmConfig={props.llmConfig}
                    setLlmConfig={props.setLlmConfig}
                />
            </div>
            {props.onlyEssential ? null : <>

                <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
                    <InputWithSlider
                        label="Temperature"
                        value={props.llmConfig.temperature}
                        min={0}
                        max={2}
                        step={0.01}
                        onChange={(value) => props.setLlmConfig({ ...props.llmConfig, temperature: value })}
                        disabled={props.disabled}
                    />
                    <InputWithSlider
                        label="Maximum token"
                        value={props.llmConfig.maxLength}
                        min={1}
                        max={props.llmConfig.model in MAX_LENGTH ? MAX_LENGTH[props.llmConfig.model] : 9999}
                        step={1}
                        onChange={(value) => props.setLlmConfig({ ...props.llmConfig, maxLength: value })}
                        disabled={props.disabled}
                    />
                    <InputWithSlider
                        label="Top P"
                        value={props.llmConfig.topP}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={(value) => props.setLlmConfig({ ...props.llmConfig, topP: value })}
                        disabled={props.disabled}
                    />
                    <InputWithSlider
                        label='Frequency penalty'
                        value={props.llmConfig.frequencyPenalty}
                        min={-2}
                        max={2}
                        step={0.01}
                        onChange={(value) => props.setLlmConfig({ ...props.llmConfig, frequencyPenalty: value })}
                        disabled={props.disabled}
                    />
                    <InputWithSlider
                        label='Presence penalty'
                        value={props.llmConfig.presencePenalty}
                        min={-2}
                        max={2}
                        step={0.01}
                        onChange={(value) => props.setLlmConfig({ ...props.llmConfig, presencePenalty: value })}
                        disabled={props.disabled}
                    />
                </div>
            </>}
        </div>
    )
}