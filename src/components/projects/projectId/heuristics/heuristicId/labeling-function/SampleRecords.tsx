import Modal from "@/src/components/shared/modal/Modal";
import { selectModal, setModalStates } from "@/src/reduxStore/states/modal";
import { SampleRecordProps } from "@/src/types/components/projects/projectId/heuristics/heuristicId/labeling-function";
import { ModalEnum } from "@/src/types/shared/modal";
import { useDispatch, useSelector } from "react-redux";
import style from '@/src/styles/components/projects/projectId/heuristics/heuristics-details.module.css';
import { RecordDisplay } from "@/src/components/shared/record-display/RecordDisplay";

export default function SampleRecords(props: SampleRecordProps) {
    const dispatch = useDispatch();
    const modalSampleRecord = useSelector(selectModal(ModalEnum.SAMPLE_RECORDS_LABELING_FUNCTION));

    return (<div className="mt-12 flex flex-col">
        <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <div className="min-w-full border divide-y divide-gray-300">
                        {props.sampleRecords.records.map((record, index) => (
                            <div className="divide-y divide-gray-200 bg-white" key={record.id}>
                                <div className="flex-shrink-0 border-b border-gray-200 shadow-sm flex justify-between items-center">
                                    <div className="flex items-center text-xs leading-5 text-gray-500 font-normal mx-4 my-3 text-justify">
                                        {record.fullRecordData[props.selectedAttribute]}
                                    </div>
                                    <div className="flex items-center justify-center mr-5 ml-auto">
                                        {Object.entries(record.calculatedLabelsResult).map(([key, value]: any) => (
                                            <div key={key} className="ml-2 flex flex-row flex-nowrap items-center">
                                                {value.displayAmount && <span className="text-xs text-gray-500 font-normal">{value.count}x</span>}
                                                <label className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${value.color.backgroundColor} ${value.color.hoverColor} ${value.color.textColor} ${value.color.borderColor}`}>
                                                    {value.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-center mr-5">
                                        <label onClick={() => dispatch(setModalStates(ModalEnum.SAMPLE_RECORDS_LABELING_FUNCTION, { currentRecordIdx: index, open: true }))}
                                            className=" bg-white text-gray-700 text-xs font-semibold px-4 py-1 rounded border border-gray-300 cursor-pointer hover:bg-gray-50 focus:outline-none inline-block">
                                            View
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <Modal modalName={ModalEnum.SAMPLE_RECORDS_LABELING_FUNCTION}>
            <h1 className="text-lg text-gray-900 mb-2 text-center">View details</h1>
            {modalSampleRecord.currentRecordIdx != -1 && <div>
                <div className={`text-sm text-gray-500 my-2 overflow-y-auto max-height-modal ${style.scrollableSize}`}>
                    <RecordDisplay record={props.sampleRecords.records[modalSampleRecord.currentRecordIdx]} />
                    <div className="text-sm leading-5 text-left text-gray-900 font-bold">
                        Label data
                        <div className="flex items-center justify-start">
                            {Object.entries(props.sampleRecords.records[modalSampleRecord.currentRecordIdx].calculatedLabelsResult).map(([key, value]: any) => (
                                <div key={key} className="ml-2 flex flex-row flex-nowrap items-center">
                                    {value.displayAmount && <span className="text-xs text-gray-500 font-normal">{value.count}x</span>}
                                    <label className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${value.color.backgroundColor} ${value.color.hoverColor} ${value.color.textColor} ${value.color.borderColor}`}>
                                        {value.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>}
        </Modal>

    </div>)

}