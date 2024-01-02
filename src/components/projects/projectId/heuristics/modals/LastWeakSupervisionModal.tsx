import Modal from "@/src/components/shared/modal/Modal";
import Statuses from "@/src/components/shared/statuses/Statuses";
import { ModalEnum } from "@/src/types/shared/modal";

export default function LastWeakSupervisionModal(props: { currentWeakSupervisionRun: any }) {
    return (<Modal modalName={ModalEnum.LAST_WEAK_SUPERVISION_RUN}>
        <h1 className="text-lg text-gray-900 mb-2 text-center">Last Weak
            Supervision Run</h1>
        {props.currentWeakSupervisionRun && <div className=" flex flex-grow justify-center my-4">
            <div className="grid items-center text-left" style={{ gridTemplateColumns: '215px auto' }}>
                <div className="text-sm font-bold">State</div>
                <div className="text text-sm">
                    <Statuses status={props.currentWeakSupervisionRun.state} />
                </div>
                <div className="text-sm font-bold">Selected Heuristics</div>
                <div className="text-sm text-gray-500">{props.currentWeakSupervisionRun.selectedInformationSources}</div>

                <div className="text-sm font-bold">Selected labeling tasks</div>
                <div className="text-sm text-gray-500">{props.currentWeakSupervisionRun.selectedLabelingTasks}</div>

                <div className="text-sm font-bold">Distinct records</div>
                <div className="text-sm text-gray-500">{props.currentWeakSupervisionRun.distinctRecords}</div>

                <div className="text-sm font-bold">Created labels</div>
                <div className="text-sm text-gray-500">{props.currentWeakSupervisionRun.resultCount}</div>

                <div className="text-sm font-bold">Created by</div>
                <div className="text-sm text-gray-500">{props.currentWeakSupervisionRun.displayName}</div>

                <div className="text-sm font-bold">Started at</div>
                <div className="text-sm text-gray-500">{props.currentWeakSupervisionRun.createdAtDisplay}</div>

                <div className="text-sm font-bold">Finished at</div>
                <div className="text-sm text-gray-500">{props.currentWeakSupervisionRun.finishedAtDisplay}</div>
            </div>
        </div>}
    </Modal>)
}