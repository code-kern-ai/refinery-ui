import { ChartData, LabelDistribution } from "@/src/types/components/projects/projectId/project-overview/charts";
import { ProjectOverviewFilters, ProjectStats } from "@/src/types/components/projects/projectId/project-overview/project-overview";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { GOLD_STAR_USER_ID } from "../labeling/labeling-main-component-helper";

export function changeDataStructure(labelDistribution: LabelDistribution): ChartData {
    const group = labelDistribution.labelName;
    const valuesScaleManually = {
        name: 'Manually labeled',
        value: labelDistribution.ratioScaleManually,
        valueAbsolute: labelDistribution.absoluteScaleManually,
        color: '#A2f2AF',
    };
    const valuesScaleProgrammatically = {
        name: 'Weakly supervised',
        value: labelDistribution.ratioScaleProgrammatically,
        valueAbsolute: labelDistribution.absoluteScaleProgrammatically,
        color: '#3B82F6',
    };

    const chartData = {} as ChartData;
    chartData.group = group;
    chartData.values = [
        valuesScaleProgrammatically,
        valuesScaleManually,
    ];
    return chartData;
}


export function squashData(data) {
    let squashedData = [];
    data.forEach(e => {
        const groupName = e.group;
        let manuallyLabeled = 0;
        let manuallyLabeledAbsolute = 0;
        let weaklySupervised = 0;
        let weaklySupervisedAbsolute = 0;
        e.values.forEach(v => {
            if (v.name === "Manually labeled") {
                manuallyLabeled = v.value;
                manuallyLabeledAbsolute = v.valueAbsolute;
            } else {
                weaklySupervised = v.value;
                weaklySupervisedAbsolute = v.valueAbsolute;
            }
        })
        squashedData.push({
            "group": groupName,
            "Manually labeled": manuallyLabeled,
            "Manually labeled a": manuallyLabeledAbsolute,
            "Weakly supervised": weaklySupervised,
            "Weakly supervised a": weaklySupervisedAbsolute,
        })
    });
    return squashedData;
}

export function addUserName(allUsers) {
    allUsers.forEach(u => {
        let name;
        if (u.user.id == GOLD_STAR_USER_ID) name = "Gold Star";
        else {
            if (u.user.firstName) name = u.user.firstName[0] + '. ' + u.user.lastName;
            else name = "Unknown";
        }
        u.name = name;
    });
    return allUsers;
}

export function parseOverviewSettingsToDict(interAnnotatorFormGroup: any, overviewFilters: ProjectOverviewFilters): {} {
    let toReturn = {}
    const values = interAnnotatorFormGroup;

    toReturn["interAnnotatorAllUsers"] = values.allUsers;
    toReturn["interAnnotatorGoldUser"] = values.goldUser;
    toReturn["interAnnotatorDataSlice"] = values.dataSlice;
    toReturn["labelingTasksTarget"] = overviewFilters.targetAttribute;
    toReturn["labelingTasks"] = overviewFilters.labelingTask;
    toReturn["displayGraphs"] = overviewFilters.graphTypeEnum;
    toReturn["dataSlice"] = overviewFilters.dataSlice;

    return toReturn;
}
