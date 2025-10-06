import { useEffect } from "react";
import { LocalStorageDropdown } from "@/submodules/react-components/components/LocalStorageDropdown";
import { InputWithSlider } from "@/submodules/react-components/components/InputWithSlider";
import { LLmPropsAzureFoundry } from "../types";


export default function AzureFoundry(props: LLmPropsAzureFoundry) {


    useEffect(() => {
        if (props.llmConfig.model) {
            props.setLlmConfig({ ...props.llmConfig, maxLength: props.llmConfig.maxLength });
        }
    }, [props.llmConfig.model])

    return (
        <div className='flex flex-col gap-y-6'>
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Foundry URL</label>
                <LocalStorageDropdown disabled={props.disabled} buttonName={props.llmConfig.apiBase ?? 'Select URL'} searchDefaultValue={props.llmConfig.apiBase} storageKey='AzureFoundryApiBase' onOptionSelected={(o) => props.setLlmConfig({ ...props.llmConfig, apiBase: o })} />
            </div>
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Foundry Model</label>
                <LocalStorageDropdown disabled={props.disabled} buttonName={props.llmConfig.model ?? 'Select Model'} searchDefaultValue={props.llmConfig.model} storageKey='AzureFoundryModel' onOptionSelected={(o) => props.setLlmConfig({ ...props.llmConfig, model: o })} />
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
                        max={8192} // dependent on engine so not for us to know
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