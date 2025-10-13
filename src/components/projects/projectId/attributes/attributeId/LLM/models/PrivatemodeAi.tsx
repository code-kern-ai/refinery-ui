import { useEffect } from "react";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { InfoButton } from "@/submodules/react-components/components/InfoButton";
import { InputWithSlider } from "@/submodules/react-components/components/InputWithSlider";
import { LLmPropsPrivatemodeAI } from "../types";
import { MODEL_MAP_FULL_NAME } from "@/submodules/javascript-functions/constants";

const REVERSE_MAP_FULL_NAME = Object.fromEntries(Object.entries(MODEL_MAP_FULL_NAME).map(([key, value]) => [value, key]));
export const MODEL_OPTIONS = Object.keys(MODEL_MAP_FULL_NAME);
const MODEL_MAP_FULL_NAME_OPTIONS = Object.keys(REVERSE_MAP_FULL_NAME);
export default function PrivatemodeAi(props: LLmPropsPrivatemodeAI) {
    useEffect(() => {
        if (props.llmConfig.model && !MODEL_MAP_FULL_NAME_OPTIONS.includes(props.llmConfig.model)) {
            props.setLlmConfig({ ...props.llmConfig, model: MODEL_MAP_FULL_NAME[MODEL_OPTIONS[0]] })
        }
    }, []);
    return (
        <div className='flex flex-col'>
            {props.onlyEssential ?
                null : <div className="mb-2 flex items-center">
                    <span className="text-sm font-medium text-gray-900 line-through">API Key  </span>
                    <InfoButton content="Set in backend" divPosition="right" infoButtonSize="sm" />
                </div>}
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Model</label>
                <KernDropdown
                    buttonName={props.llmConfig.model ? REVERSE_MAP_FULL_NAME[props.llmConfig.model] : 'Select model'}
                    options={MODEL_OPTIONS}
                    selectedOption={(option) => props.setLlmConfig({ ...props.llmConfig, model: MODEL_MAP_FULL_NAME[option] })}
                    disabled={props.disabled}
                />
            </div>
            {props.onlyEssential ? null : <>
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
            </>}

        </div>
    )
}