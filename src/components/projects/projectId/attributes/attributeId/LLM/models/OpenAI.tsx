import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { InputWithSlider } from "../InputWithSlider";


interface LLmProps {
    llmConfig: any;
    setLlmConfig: (llmConfig: any) => void;
    onlyEssential?: boolean;
    projectId?: string;
    isVision?: boolean;
    disabled?: boolean;
}

// https://platform.openai.com/docs/models
const MODEL_OPTIONS = ['gpt-4o-mini', 'gpt-4o', 'gpt-4', 'gpt-4-turbo-preview', 'gpt-4-1106-preview', 'gpt-4-0125-preview', 'gpt-4-turbo', 'gpt-3.5-turbo']
const VISION_MODEL_OPTIONS = ['gpt-4o', 'gpt-4-turbo', 'gpt-4o-mini']
const MAX_LENGTH = {
    'gpt-3.5-turbo': 16385,
    'gpt-4': 8192,
    'gpt-4-turbo': 128000,
    'gpt-4-turbo-preview': 128000,
    'gpt-4-1106-preview': 128000,
    'gpt-4-0125-preview': 128000,
    'gpt-4o': 128000,
    'gpt-4o-mini': 128000,
}

export default function OpenAI(props: LLmProps) {

    const [newStopSequence, setNewStopSequence] = useState<string>('');
    useEffect(() => {
        if (props.llmConfig.model) {
            const newMaxLength = Math.min(props.llmConfig.maxLength, MAX_LENGTH[props.llmConfig.model]);
            props.setLlmConfig({ ...props.llmConfig, maxLength: newMaxLength });
        }
    }, [props.llmConfig.model])

    useEffect(() => {
        if (props.isVision) {
            if (props.llmConfig.model && !VISION_MODEL_OPTIONS.includes(props.llmConfig.model)) {
                props.setLlmConfig({ ...props.llmConfig, model: VISION_MODEL_OPTIONS[0] })
            }
        } else {
            if (props.llmConfig.model && !MODEL_OPTIONS.includes(props.llmConfig.model)) {
                props.setLlmConfig({ ...props.llmConfig, model: MODEL_OPTIONS[0] })
            }
        }
    }, [])

    return (
        <div className='flex flex-col gap-y-6'>
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Model</label>
                <KernDropdown
                    buttonName={props.llmConfig.model ? props.llmConfig.model : 'Select model'}
                    options={props.isVision ? VISION_MODEL_OPTIONS : MODEL_OPTIONS}
                    selectedOption={(option) => props.setLlmConfig({ ...props.llmConfig, model: option })}
                    disabled={props.disabled}
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