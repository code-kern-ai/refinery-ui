import { selectAttributes, selectLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProject } from "@/src/reduxStore/states/project";
import { SearchGroupElement } from "@/src/types/components/projects/projectId/data-browser/data-browser";
import { getBasicSearchGroup } from "@/src/util/components/projects/projectId/data-browser/search-groups-helper";
import { SearchGroup } from "@/submodules/javascript-functions/enums/enums";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const GROUP_SORT_ORDER = 0;

export default function SearchGroups() {
    const project = useSelector(selectProject);
    const attributes = useSelector(selectAttributes);
    const labelingTasks = useSelector(selectLabelingTasksAll);

    const [fullSearch, setFullSearch] = useState({});
    const [searchGroups, setSearchGroups] = useState({});
    const [searchGroupsOrder, setSearchGroupsOrder] = useState<{ order: number; key: string }[]>([]);

    useEffect(() => {
        if (!project) return;
        prepareSearchGroups();
    }, [project]);

    function prepareSearchGroups() {
        if (!attributes || !labelingTasks) {
            console.log('preparation before data collected --> should not happen');
            return;
        }
        setSearchGroupsOrder([]);
        setSearchGroups({});
        setFullSearch({});

        const fullSearchCopy = jsonCopy(fullSearch);
        const searchGroupsCopy = jsonCopy(searchGroups);
        // Drill down
        fullSearch["DRILL_DOWN"] = { groupElements: false };

        // Attributes
        const searchGroupContainer = getBasicSearchGroup(SearchGroup.ATTRIBUTES, GROUP_SORT_ORDER + 100);
        fullSearchCopy["ATTRIBUTES"] = { groupElements: searchGroupContainer };
        searchGroupsCopy["ATTRIBUTES"] = searchGroupContainer;

    }

    return (<></>)
}