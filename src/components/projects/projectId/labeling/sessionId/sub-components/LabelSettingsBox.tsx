import { LabelSettingsBoxProps } from "@/src/types/components/projects/projectId/labeling/task-header";

export default function LabelSettingsBox(props: LabelSettingsBoxProps) {
    return (<div id="label-settings-box" className={`flex flex-col rounded-lg bg-white shadow absolute z-10 top-0 left-0 border border-gray-300 ${props.labelSettingsLabel ? null : 'hidden'}`}>
        Test
    </div>)
}