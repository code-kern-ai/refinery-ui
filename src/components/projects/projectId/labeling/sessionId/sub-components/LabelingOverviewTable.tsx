import { selectUser } from "@/src/reduxStore/states/general";
import { selectRecordRequestsRla, selectSettings } from "@/src/reduxStore/states/pages/labeling";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { HeaderHover, TableDisplayData } from "@/src/types/components/projects/projectId/labeling/overview-table";
import { buildOverviewTableDisplayArray, filterRlaDataForUser, filterRlaLabelCondition, getEmptyHeaderHover, rlasHaveHeuristicData } from "@/src/util/components/projects/projectId/labeling/overview-table-helper";
import { LabelSource } from "@/submodules/javascript-functions/enums/enums";
import { use, useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function LabelingOverviewTable() {
    const rlas = useSelector(selectRecordRequestsRla);
    const user = useSelector(selectUser);
    const settings = useSelector(selectSettings);
    const projectId = useSelector(selectProjectId);

    const [dataToDisplay, setDataToDisplay] = useState<TableDisplayData[]>(null);
    const [fullData, setFullData] = useState<TableDisplayData[]>([]);
    const [dataHasHeuristics, setDataHasHeuristics] = useState(false);
    const [headerHover, setHeaderHover] = useState<HeaderHover>(getEmptyHeaderHover());

    useEffect(() => {
        if (!rlas) {
            setDataToDisplay(null);
            setFullData(null);
        }
        setFullData(buildOverviewTableDisplayArray(rlas, user));
        checkAndRebuildTableHover();
        setDataHasHeuristics(rlasHaveHeuristicData(rlas));
    }, [rlas]);

    useEffect(() => {
        if (!fullData) return;
        if (!settings) return;
        rebuildDataForDisplay();
    }, [settings, fullData]);

    function checkAndRebuildTableHover() {
        if (!fullData) return;
        setHeaderHover(getEmptyHeaderHover());
        const headerHoverCopy = { ...headerHover };
        for (const data of fullData) {
            headerHoverCopy.typeCollection += data.hoverGroups.type.split(',')[0] + ', ';
            headerHoverCopy.taskCollection += data.hoverGroups.task.split(',')[0] + ', ';
            headerHoverCopy.createdByCollection += data.hoverGroups.createdBy.split(',')[0] + ', ';
            headerHoverCopy.labelCollection += data.hoverGroups.label.split(',')[0] + ', ';
            headerHoverCopy.rlaCollection += data.hoverGroups.rlaId.split(',')[0] + ', ';
        }
        setHeaderHover(headerHoverCopy);
    }

    function rebuildDataForDisplay() {
        if (fullData) {
            let filtered = fullData;
            // filtered = filterRlaDataForUser(filtered, user, 'rla');
            filtered = filterRlaDataForOverviewTable(filtered, 'rla');
            setDataToDisplay(filtered);
        } else {
            setDataToDisplay(null);
        }
    }

    function filterRlaDataForOverviewTable(data: any[], rlaKey?: string): any[] {
        let filtered = data;
        if (!settings.overviewTable.showHeuristics) {
            if (rlaKey) filtered = filtered.filter(entry => entry[rlaKey].sourceType != LabelSource.INFORMATION_SOURCE);
            else filtered = filtered.filter(rla => rla.sourceType != LabelSource.INFORMATION_SOURCE);
        }
        if (settings.overviewTable.includeLabelDisplaySettings) {
            if (rlaKey) filtered = filtered.filter(entry => filterRlaLabelCondition(entry[rlaKey], settings, projectId));
            else filtered = filtered.filter(rla => filterRlaLabelCondition(rla, settings, projectId));
        }
        return filtered;
    }

    return (<>
        {dataToDisplay && (dataToDisplay.length > 0) ? (<></>) : (<>
            {!settings.showHeuristics}
        </>)}
    </>)
}