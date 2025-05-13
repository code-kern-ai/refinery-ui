import { useState } from "react";
import { LLMConfig } from "./LLM/LLMConfig";
import { IconAdjustmentsAlt, IconAdjustmentsOff, IconSettings, IconTerminal, IconUser } from "@tabler/icons-react";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import LLMResponsePlayground from "./LLMResponsePlayground";
import { LLMResponseConfigProps } from "./LLM/types";
import { MemoIconTerminal, MemoIconUser } from "@/submodules/react-components/components/kern-icons/icons";


export default function LLMResponseConfig(props: LLMResponseConfigProps) {
    const [configOpen, setConfigOpen] = useState(true);
    const [fullConfigOpen, setFullConfigOpen] = useState(false);

    if (!props.fullLlmConfig || !props.attributeId) return null;
    return (
        <div className="mt-3 flex flex-col gap-y-2">
            <div className="flex flex-row flex-nowrap items-center gap-x-2">
                <label className="block font-bold text-gray-900">LLM Config</label>
                {!props.keepConfigOpen && <KernButton icon={IconSettings} onClick={() => setConfigOpen((p) => !p)} size="small" />}
                {configOpen && <KernButton icon={fullConfigOpen ? IconAdjustmentsAlt : IconAdjustmentsOff} onClick={() => setFullConfigOpen((p) => !p)} size="small" />}

                {props.noPlayground ? null : <LLMResponsePlayground attributeId={props.attributeId} apiKey={props.apiKey} />}

            </div>
            <div className={`${configOpen ? 'block' : 'hidden'}`}>
                <LLMConfig
                    llmIdentifier={props.fullLlmConfig.llmIdentifier}
                    llmConfig={props.fullLlmConfig.llmConfig}
                    setLlmConfig={(llmConfig) => props.setFullLlmConfig(p => ({ ...p, llmConfig: llmConfig }))}
                    onlyEssential={!fullConfigOpen}
                    disabled={props.disabled}
                />

                <TemplatePrompt
                    queryTemplatePromptTmp={props.fullLlmConfig.templatePrompt}
                    setQueryTemplatePromptTmp={(tmpl) => props.setFullLlmConfig(p => ({ ...p, templatePrompt: tmpl }))}
                    type="SYSTEM"
                    inverseColor={true}
                    disabled={props.disabled}
                />
                <TemplatePrompt
                    queryTemplatePromptTmp={props.fullLlmConfig.questionPrompt}
                    setQueryTemplatePromptTmp={(tmpl) => props.setFullLlmConfig(p => ({ ...p, questionPrompt: tmpl }))}
                    type="USER"
                    inverseColor={true}
                    disabled={props.disabled}
                />
            </div>
        </div>
    )
}


type TemplatePromptProps = {
    queryTemplatePromptTmp: string;
    setQueryTemplatePromptTmp: (queryTemplatePromptTmp: string) => void;
    type?: "SYSTEM" | "USER";
    inverseColor?: boolean;
    disabled?: boolean;
}

function TemplatePrompt(props: TemplatePromptProps) {

    return (
        <div className={`${!props.inverseColor ? "bg-slate-50" : ""} border-b border-gray-200 w-full align-top`}>
            <div className="flex gap-x-2">
                <div className='py-2'>
                    <div className='flex items-center justify-center bg-white h-6 w-6 rounded-lg border border-gray-300'>
                        {props.type == "SYSTEM" ? <MemoIconTerminal className='h-4 w-4 text-gray-500' />
                            : <MemoIconUser className='h-4 w-4 text-gray-500' />}
                    </div>
                </div>
                <div className='text-sm font-mono text-gray-900 text-center leading-10'>
                    {props.type == "SYSTEM" ? "System" : "User"}
                </div>
            </div>
            <div className='w-full pb-2 text-sm text-gray-700'>
                <div className="relative z-0">
                    <textarea
                        value={props.queryTemplatePromptTmp}
                        onChange={(e) => props.setQueryTemplatePromptTmp(e.target.value)}
                        rows={4}
                        disabled={props.disabled}
                        className={`${props.inverseColor ? "bg-slate-50" : ""} w-full text-sm text-gray-700 border border-transparent hover:border-gray-200 rounded-lg align-top`}
                    />
                    {props.type == "SYSTEM" && <> <label className="mt-1 text-xs text-gray-500">This will always be appended to your system prompt:</label>

                        <textarea
                            value="You must only output valid JSON. If there is not yet a schema defined for the JSON output, please put everything into a single value under the key 'result' - otherwise stick to the schema that has been provided already."
                            rows={2}
                            disabled={true}
                            className={`${props.inverseColor ? "bg-slate-50" : ""} w-full text-sm text-gray-700 border border-transparent rounded-lg align-top`}
                        />
                    </>}
                </div>
            </div>
        </div>
    )
}