import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { selectHeuristic } from "@/src/reduxStore/states/pages/heuristics";
import { selectVisibleAttributesHeuristics } from "@/src/reduxStore/states/pages/settings";
import { ModalEnum } from "@/src/types/shared/modal";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { Tooltip } from "@nextui-org/react";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useSelector } from "react-redux";

export default function ViewDetailsZSModal() {
    const modalRecord = useSelector(selectModal(ModalEnum.SAMPLE_RECORDS_ZERO_SHOT));
    const usableAttributes = useSelector(selectVisibleAttributesHeuristics);
    const currentHeuristic = useSelector(selectHeuristic);

    return (
        <Modal modalName={ModalEnum.SAMPLE_RECORDS_ZERO_SHOT}>
            <h1 className="text-lg text-gray-900 mb-2 text-center">View details</h1>
            <div className="text-sm text-gray-500 my-2">
                {usableAttributes.map((att, i) => (<div key={att.id} className="text-sm leading-5 text-left my-3">
                    <div className="text-gray-900 font-bold">{att.name}</div>
                    <div className="text-gray-500 font-normal">
                        {modalRecord.record?.fullRecordData[att.name]}</div>
                </div>))}
            </div>

            <div className="gap-x-2 items-center" style={{ gridTemplateColumns: 'max content 16.5rem max-content' }}>
                {modalRecord.record?.labels.map((result: any, index) => (<div key={result.labelName} className="flex items-center">
                    {result.color ? (<div className={`border items-center px-2 py-0.5 rounded text-xs font-medium text-center mr-2 my-2 ${result.color.backgroundColor} ${result.color.textColor} ${result.color.borderColor} ${result.color.hoverColor}`}>
                        {result.labelName}
                    </div>) : (<div
                        className="border items-center px-2 py-0.5 rounded text-xs font-medium text-center mr-2 my-2 bg-gray-100 text-gray-700 border-gray-400 hover:bg-gray-200">
                        {result.labelName}
                    </div>)}
                    <div className="text-sm leading-5 font-normal text-gray-500">
                        <div className="w-64 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="bg-green-400 h-2.5 rounded-full" style={{ 'width': result.confidenceText }}>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row items-center">
                        <span className="text-sm select-none self-start ml-2">{result.confidenceText}</span>
                        {(result.confidence * 100) < currentHeuristic.zeroShotSettings.minConfidence && <Tooltip content={TOOLTIPS_DICT.ZERO_SHOT.CONFIDENCE_TOO_LOW} color="invert" placement="top" className="cursor-auto">
                            <IconAlertTriangle className="text-yellow-500 h-5 w-5" />
                        </Tooltip>}
                    </div>
                </div>))}
            </div>
        </Modal >
    )
}