import Modal from "@/src/components/shared/modal/Modal";
import { LabelingInfoTableModalProps } from "@/src/types/components/projects/projectId/labeling/overview-table";
import { ModalEnum } from "@/src/types/shared/modal";
import { IconSearch } from "@tabler/icons-react";

export default function LabelingInfoTableModal(props: LabelingInfoTableModalProps) {
    return (<Modal modalName={ModalEnum.LABELING_INFO_TABLE}>
        <h1 className="text-lg text-gray-900 text-center font-bold">Info</h1>
        {props.dataToDisplay[0] && <div className="flex flex-col items-center">
            <div className="flex flex-row gap-x-2 items-center">
                <div className="text-gray-500 my-2 text-center mb-2">
                    Every label stores a lot of data.<br /><br />This can be the label type, the corresponding task, creation user or heuristic as well as the label itself.
                    Now to get a better overview over every label placed on a record we group the labels by these different criteria.<br /><br />This means
                    there is a group for e.g. type <span className="underline">{props.dataToDisplay[0].sourceType}</span>.If you hover the element
                    everything with the same type will be highlighted. <br />If you hover over a task (e.g. <span className="underline">{props.dataToDisplay[0].taskName}</span>) everything with the same task
                    will be highlighted. The same goes for the other groups.<br />Note that the magnifying glass highlights
                    only the specific label entry.<br /><br />Feel free to try it out in the table below and focus on the background.
                </div>

            </div>
            <table className="min-w-full border divide-y divide-gray-300">
                <tbody className="divide-y divide-gray-200 bg-white">
                    <tr className="bg-white">
                        <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-500 sm:pl-6">{props.dataToDisplay[0].sourceType}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{props.dataToDisplay[0].taskName}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{props.dataToDisplay[0].createdBy}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-sm font-medium cursor-default relative ${props.dataToDisplay[0].label.backgroundColor} ${props.dataToDisplay[0].label.textColor} ${props.dataToDisplay[0].label.borderColor}`}>
                                {props.dataToDisplay[0].label.name}
                                <div className="label-overlay-base"></div>
                            </span>
                            {props.dataToDisplay[0].label.value && <div className="ml-2">{props.dataToDisplay[0].label.value}</div>}
                        </td>
                        <td className="w-icon">
                            <IconSearch className="w-6 h-6 text-gray-700" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>}
    </Modal>)
}