import { combineClassNames } from "@/submodules/javascript-functions/general"
import { InfoButton } from "@/submodules/react-components/components/InfoButton"
import { Switch } from "@headlessui/react"
import { OpenAIoSeriesSwitchProps } from "../types"


export default function OpenAIoSeriesSwitch(props: OpenAIoSeriesSwitchProps) {
    return <div className="flex flex-row gap-x-2 items-center">
        <Switch.Group as="div" className="flex items-center justify-between">
            <span className="flex flex-row gap-x-1 items-center">
                <Switch.Description as="span" className="text-sm font-medium text-gray-700 mr-2">
                    Reasoning model
                </Switch.Description>

            </span>
            <Switch
                checked={props.llmConfig.openAioSeries || false}
                onChange={(value) => props.setLlmConfig({ ...props.llmConfig, openAioSeries: value })}
                className={combineClassNames(
                    props.llmConfig.openAioSeries ? 'bg-blue-600' : 'bg-gray-200',
                    'relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-bg-blue-600 focus:ring-offset-2')}
            >
                <span
                    aria-hidden="true"
                    className={combineClassNames(
                        props.llmConfig.openAioSeries ? 'translate-x-3' : 'translate-x-0',
                        'pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                    )}
                />
            </Switch>
        </Switch.Group>
        <InfoButton content="Open AI models of the o series (e.g. o1 & o3) use e.g. max_completion_token instead of max_token and no temperature" divPosition="right" infoButtonSize="sm" />
    </div>
}