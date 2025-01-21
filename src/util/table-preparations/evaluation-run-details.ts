import { percentRoundString } from "@/submodules/javascript-functions/general";
import { getPrecision, getRecall } from "../components/projects/projectId/heuristics/shared-helper";

export const EVALUATION_RUN_DETAILS_TABLE_HEADER = [{ column: "True positives", id: "truePositives" }, { column: "False positives", id: "falsePositives" }, { column: "False negatives", id: "falseNegatives" }, { column: "Precision", id: "precision" }, { column: "Recall", id: "recall" }];

export function prepareEvaluationRunDetailsTableBody(evaluationRunDetails, selectedRecords) {
    let finalData = [];
    evaluationRunDetails.forEach((result) => {
        console.log(result)
        const currentRow = [
            {
                type: "text",
                value: percentRoundString(result.truePositives.length / selectedRecords),
            },
            {
                type: "text",
                value: percentRoundString(result.falsePositives.length / selectedRecords),
            },
            {
                type: "text",
                value: percentRoundString(result.falseNegatives.length / selectedRecords),
            },
            {
                type: "text",
                value: percentRoundString(getPrecision(result.truePositives.length, result.falsePositives.length))
            },
            {
                type: "text",
                value: percentRoundString(getRecall(result.truePositives.length, result.falseNegatives.length))
            }
        ];
        finalData.push(currentRow);
    });
    return finalData;
}