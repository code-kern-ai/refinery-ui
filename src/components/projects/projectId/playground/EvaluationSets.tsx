import { openModal, setModalStates } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { useDispatch, useSelector } from "react-redux";
import { selectProjectId } from "@/src/reduxStore/states/project";
import CreateEvaluationSetModal from "./CreateEvaluationSetModal";
import { useEffect, useState } from "react";
import { getEvaluationSets } from "@/src/services/base/playground";
import { getRecordByRecordId } from "@/src/services/base/project-setting";
import { postProcessRecordByRecordId } from "@/src/util/components/projects/projectId/settings/attribute-calculation-helper";
import ViewEvaluationSetsModal from "./ViewEvaluationSetsModal";
import KernTable from "@/submodules/react-components/components/kern-table/KernTable";
import { EVALUATION_SETS_TABLE_HEADER, prepareTableBodyEvaluationSets } from "@/src/util/table-preparations/evaluation-sets";

export function EvaluationSets() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const [evaluationSets, setEvaluationSets] = useState([]);
    const [preparedValues, setPreparedValues] = useState([]);

    useEffect(() => {
        if (!projectId) return;
        getEvaluationSets(projectId, (res) => {
            setEvaluationSets(res);
        });
    }, [projectId]);

    useEffect(() => {
        if (!evaluationSets) return;
        setPreparedValues(prepareTableBodyEvaluationSets(evaluationSets, viewRecordsModal));
    }, [evaluationSets]);

    function viewRecordsModal(recordIds: string[]) {
        let recordsArr = [];
        recordIds.forEach((recordId) => {
            getRecordByRecordId(projectId, recordId, (res) => {
                recordsArr = [...recordsArr, postProcessRecordByRecordId(res)];
                dispatch(setModalStates(ModalEnum.VIEW_EVALUATION_SET, { open: true, records: recordsArr }));
            });
        });
    }

    return <>
        {projectId != null && <div className="p-4 bg-gray-100 h-full flex-1 flex flex-col overflow-y-auto">
            <div className="text-lg leading-6 text-gray-900 font-medium w-full flex items-center">
                <div>
                    <label>Evaluation sets</label>
                    <div className="mt-1">
                        <div className="text-sm leading-5 font-normal text-gray-500 inline-block">You can create your evaluation sets and use them for creating evaluation groups.</div>
                    </div>
                </div>
                <button
                    className={`ml-auto bg-green-100 border border-green-400 text-green-700 text-xs font-semibold px-4 py-2 rounded-md cursor-pointer opacity-100 hover:bg-green-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                    onClick={() => dispatch(openModal(ModalEnum.EVALUATION_SET))}>Create evaluation set</button>
            </div >
            <KernTable
                headers={EVALUATION_SETS_TABLE_HEADER}
                values={preparedValues}
                config={{
                    addBorder: true
                }}
            />

        </div>}
        <CreateEvaluationSetModal />
        <ViewEvaluationSetsModal />
    </>
}