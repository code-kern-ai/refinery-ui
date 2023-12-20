import { selectStaticSlices } from "@/src/reduxStore/states/pages/data-browser";
import { selectLabelingTasksAll, selectUsableAttributesNoFiltered } from "@/src/reduxStore/states/pages/settings";
import { selectOverviewFilters, setOverviewFilters, updateOverFilters } from "@/src/reduxStore/states/tmp";
import { ProjectOverviewFilters } from "@/src/types/components/projects/projectId/project-overview/project-overview";
import { LabelingTask } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { getDisplayGraphValueArray } from "@/src/util/components/projects/projectId/project-overview/project-overview-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { Tooltip } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const DISPLAY_GRAPHS_VALUE_ARRAY = getDisplayGraphValueArray();

export default function ProjectOverviewHeader() {
    const dispatch = useDispatch();

    const labelingTasks = useSelector(selectLabelingTasksAll);
    const targetAttributes = useSelector(selectUsableAttributesNoFiltered);
    const dataSlices = useSelector(selectStaticSlices);
    const overviewFilters = useSelector(selectOverviewFilters);

    const [labelingTasksFiltered, setLabelingTasksFiltered] = useState<LabelingTask[]>([]);

    useEffect(() => {
        if (!labelingTasks || !targetAttributes || !dataSlices || !targetAttributes[0] || !dataSlices[0]) return;
        const labelingTasksFinal = labelingTasks.find((labelingTask) => labelingTask.targetName === targetAttributes[0].name);
        const overviewFiltersNew: ProjectOverviewFilters = {
            graphType: DISPLAY_GRAPHS_VALUE_ARRAY[0].name,
            targetAttribute: targetAttributes[0].name,
            labelingTask: labelingTasksFinal?.name,
            dataSlice: dataSlices[0].name,
            graphTypeEnum: DISPLAY_GRAPHS_VALUE_ARRAY[0].value,
        }
        dispatch(setOverviewFilters(overviewFiltersNew));
        setLabelingTasksFiltered(labelingTasks.filter((labelingTask) => labelingTask.targetName === targetAttributes[0].name));
    }, [labelingTasks, targetAttributes, dataSlices]);

    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 items-center">
                <li>
                    <div className="flex flex-row items-center">
                        <Tooltip placement="bottom" trigger="hover" color="invert" content={TOOLTIPS_DICT.PROJECT_OVERVIEW.VISUALIZATION} className="relative z-10 cursor-auto">
                            <span className={`cursor-help mr-2 underline text-black-800 filtersUnderline`}>Visualizations</span>
                        </Tooltip>
                        <Dropdown buttonName={overviewFilters?.graphType} options={DISPLAY_GRAPHS_VALUE_ARRAY} dropdownWidth="w-44"
                            selectedOption={(option: string) => {
                                dispatch(updateOverFilters('graphType', option));
                                const graphTypeEnum = DISPLAY_GRAPHS_VALUE_ARRAY.find((graph) => graph.name === option)?.value;
                                dispatch(updateOverFilters('graphTypeEnum', graphTypeEnum));
                            }} />
                    </div>
                </li>
                <li>
                    <div className="flex items-center">
                        <svg className="flex-shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                        </svg>
                        <Tooltip placement="bottom" trigger="hover" color="invert" content={TOOLTIPS_DICT.PROJECT_OVERVIEW.TARGET_TYPE} className="relative z-10 cursor-auto">
                            <span className={`cursor-help mr-2 underline text-black-800 filtersUnderline`}>Target</span>
                        </Tooltip>
                        {targetAttributes && <Dropdown buttonName={labelingTasks?.length == 0 ? '' : overviewFilters?.targetAttribute} options={labelingTasks?.length == 0 ? [] : targetAttributes} dropdownWidth="w-44"
                            selectedOption={(option: string) => {
                                dispatch(updateOverFilters('targetAttribute', option));
                                const labelingTasksFinal = labelingTasks.find((labelingTask) => labelingTask.targetName === option);
                                dispatch(updateOverFilters('labelingTask', labelingTasksFinal.name));
                                setLabelingTasksFiltered(labelingTasks.filter((labelingTask) => labelingTask.targetName === option));
                            }} />}
                    </div>
                </li>

                <li>
                    <div className="flex items-center">
                        <svg className="flex-shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                        </svg>
                        <Tooltip placement="bottom" trigger="hover" color="invert" content={TOOLTIPS_DICT.PROJECT_OVERVIEW.LABELING_TASK} className="relative z-10 cursor-auto">
                            <span className={`cursor-help mr-2 underline text-black-800 filtersUnderline`}>Labeling task</span>
                        </Tooltip>
                        {labelingTasks && <Dropdown buttonName={overviewFilters?.labelingTask} options={labelingTasksFiltered} dropdownWidth="w-44"
                            selectedOption={(option: string) => dispatch(updateOverFilters('labelingTask', option))} />}
                    </div>
                </li>

                <li>
                    <div className="flex items-center">
                        <svg className="flex-shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                        </svg>
                        <Tooltip placement="bottom" color="invert" content={TOOLTIPS_DICT.PROJECT_OVERVIEW.STATIC_DATA_SLICE} className="z-10 relative cursor-auto">
                            <span className={`cursor-help mr-2 underline text-black-800 filtersUnderline`}>Data slice</span>
                        </Tooltip>
                        {dataSlices && <Dropdown buttonName={overviewFilters?.dataSlice} options={dataSlices} dropdownWidth="w-44"
                            selectedOption={(option: string) => dispatch(updateOverFilters('dataSlice', option))} />}
                    </div>
                </li>

            </ol >
        </nav >
    )
}