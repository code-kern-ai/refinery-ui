import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { LocalStorageDropdown } from "@/submodules/react-components/components/LocalStorageDropdown";
import { InputWithSlider } from "../InputWithSlider";

type LLmProps = {
    llmConfig: any;
    setLlmConfig: (llmConfig: any) => void;
    onlyEssential?: boolean;
    projectId?: string;
    disabled?: boolean;
}

export default function Azure(props: LLmProps) {

    const [newStopSequence, setNewStopSequence] = useState<string>('');

    useEffect(() => {
        if (props.llmConfig.model) {
            props.setLlmConfig({ ...props.llmConfig, maxLength: props.llmConfig.maxLength });
        }
    }, [props.llmConfig.model])

    return (
        <div className='flex flex-col gap-y-6'>
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Engine</label>
                <LocalStorageDropdown disabled={props.disabled} buttonName={props.llmConfig.engine ?? 'Select engine'} searchDefaultValue={props.llmConfig.engine} storageKey='AzureEngine' onOptionSelected={(o) => props.setLlmConfig({ ...props.llmConfig, engine: o })} />

            </div>

            <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Azure URL</label>
                <LocalStorageDropdown disabled={props.disabled} buttonName={props.llmConfig.apiBase ?? 'Select URL'} searchDefaultValue={props.llmConfig.apiBase} storageKey='AzureApiBase' onOptionSelected={(o) => props.setLlmConfig({ ...props.llmConfig, apiBase: o })} />
            </div>
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">API Version</label>
                <LocalStorageDropdown disabled={props.disabled} buttonName={props.llmConfig.apiVersion ?? 'Select Version'} searchDefaultValue={props.llmConfig.apiVersion} storageKey='AzureVersion' onOptionSelected={(o) => props.setLlmConfig({ ...props.llmConfig, apiVersion: o })} />
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
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">Stop sequences</label>
                        <input
                            type="text"
                            value={newStopSequence}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            onChange={(e) => setNewStopSequence(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && props.llmConfig.stopSequences.length < 4) {
                                    props.setLlmConfig({ ...props.llmConfig, stopSequences: [...props.llmConfig.stopSequences, newStopSequence] })
                                    setNewStopSequence('');
                                }
                            }}
                            disabled={props.llmConfig.stopSequences.length >= 4 || props.disabled}
                        />
                        <div className='mt-2 flex items-center gap-x-2'>
                            {props.llmConfig.stopSequences.map((stopSequence, index) => (
                                <div
                                    key={index}
                                    className='flex items-center gap-x-2 bg-gray-100 rounded-md px-2 py-1'
                                >
                                    <p className='text-sm text-gray-700'>{stopSequence}</p>
                                    {!props.disabled && <IconX
                                        className='h-4 w-4 text-gray-500 cursor-pointer'
                                        onClick={() => props.setLlmConfig({ ...props.llmConfig, stopSequences: props.llmConfig.stopSequences.filter((_, i) => i !== index) })}
                                    />}
                                </div>
                            ))}
                        </div>
                    </div>
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