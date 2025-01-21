import { Dispatch, SetStateAction, useState } from "react";
import { LLMConfig } from "./LLM/LLMConfig";
import { IconAdjustmentsAlt, IconAdjustmentsOff, IconSettings, IconTerminal, IconUser } from "@tabler/icons-react";
import { Attribute, LLMConfig as LLMConfigType } from "@/src/types/components/projects/projectId/settings/data-schema";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import LLMResponsePlayground from "./LLMResponsePlayground";

type LLMResponseConfigProps = {
    fullLlmConfig: LLMConfigType;
    setFullLlmConfig: Dispatch<SetStateAction<LLMConfigType>>;
}

export default function LLMResponseConfig(props: LLMResponseConfigProps) {
    // const [selectedLLMProvider, setSelectedLLMProvider] = useState<string>('Open AI');
    // const [llmConfigTmp, setLlmConfigTmp] = useState<any>(props.currentAttribute.additionalConfig);

    const [configOpen, setConfigOpen] = useState(true);
    const [fullConfigOpen, setFullConfigOpen] = useState(false);

    // const [systemPrompt, setSystemPrompt] = useState<string>('');
    // const [userMessage, setUserMessage] = useState<string>('');


    // add preselects sets for different examples (only in playground)
    // add wrapper for set config to ac
    if (!props.fullLlmConfig) return null;
    return (
        <div className="mt-5 flex flex-col gap-y-2">
            <div className="flex flex-row flex-nowrap items-center gap-x-2">
                <label className="block font-bold text-gray-900">LLM Config</label>
                <KernButton icon={IconSettings} onClick={() => setConfigOpen((p) => !p)} size="small" />
                {configOpen && <KernButton icon={fullConfigOpen ? IconAdjustmentsAlt : IconAdjustmentsOff} onClick={() => setFullConfigOpen((p) => !p)} size="small" />}

                <LLMResponsePlayground currentAttribute={undefined} />

            </div>
            <div className={`${configOpen ? 'block' : 'hidden'} p-4 bg-white rounded-lg shadow-md`}>


                {/* <label className="block mb-2 text-sm font-medium text-gray-900">API Key</label>
                This could be your input */}
                <LLMConfig
                    llmIdentifier={props.fullLlmConfig.llmIdentifier}
                    llmConfig={props.fullLlmConfig.llmConfig}
                    setLlmConfig={(llmConfig) => props.setFullLlmConfig(p => ({ ...p, llmConfig: llmConfig }))}
                    onlyEssential={!fullConfigOpen}
                // disabled={!canEditPipeline}
                />

                <TemplatePrompt
                    queryTemplatePromptTmp={props.fullLlmConfig.templatePrompt}
                    // templateData={mustacheData}
                    setQueryTemplatePromptTmp={(tmpl) => props.setFullLlmConfig(p => ({ ...p, templatePrompt: tmpl }))}
                    // setOpenParsingModal={setOpenParsingModal}
                    type="SYSTEM"
                    inverseColor={true}
                // disabled={!canEditPipeline}
                />
                <TemplatePrompt
                    queryTemplatePromptTmp={props.fullLlmConfig.questionPrompt}
                    // templateData={mustacheData}
                    setQueryTemplatePromptTmp={(tmpl) => props.setFullLlmConfig(p => ({ ...p, questionPrompt: tmpl }))}
                    // setOpenParsingModal={setOpenParsingModal}
                    type="USER"
                    inverseColor={true}
                // disabled={!canEditPipeline}
                />
            </div>
        </div>
    )
}


type TemplatePromptProps = {
    queryTemplatePromptTmp: string;
    // templateData: any;
    setQueryTemplatePromptTmp: (queryTemplatePromptTmp: string) => void;
    // setOpenParsingModal: (openParsingModal: boolean) => void;
    type?: "SYSTEM" | "USER";
    inverseColor?: boolean;
    disabled?: boolean;
}

function TemplatePrompt(props: TemplatePromptProps) {
    // const [mustacheApplied, setMustacheApplied] = useState(false);
    // const [mustacheUnresolved, setMustacheUnresolved] = useState(false);
    // const [toggleRenderView, setToggleRenderView] = useState(false);

    // const RenderTooltipIcon = toggleRenderView ? IconEyeCancel : IconEyeCheck;
    // const renderTooltipText = (toggleRenderView ? "Hide" : "Preview") + " rendered template";

    return (
        <div className={`${!props.inverseColor ? "bg-slate-50" : ""} border-b border-gray-200 w-full align-top`}>
            <div className="flex gap-x-2">
                <div className='py-2'>
                    <div className='flex items-center justify-center bg-white h-6 w-6 rounded-lg border border-gray-300'>
                        {props.type == "SYSTEM" ? <IconTerminal className='h-4 w-4 text-gray-500' />
                            : <IconUser className='h-4 w-4 text-gray-500' />}
                    </div>
                </div>
                <div className='text-sm font-mono text-gray-900 '>
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
                    {props.type == "SYSTEM" && <> <label className="mt-1 text-xs text-gray-500">Included prompt extension:</label>

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