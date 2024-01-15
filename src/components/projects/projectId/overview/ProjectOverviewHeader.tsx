import { selectStaticSlices } from "@/src/reduxStore/states/pages/data-browser";
import { selectLabelingTasksAll, selectUsableAttributesNoFiltered } from "@/src/reduxStore/states/pages/settings";
import { selectOverviewFilters, setOverviewFilters, updateOverFilters } from "@/src/reduxStore/states/tmp";
import { ProjectOverviewFilters } from "@/src/types/components/projects/projectId/project-overview/project-overview";
import { LabelingTask } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { getDisplayGraphValueArray } from "@/src/util/components/projects/projectId/project-overview/project-overview-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import Dropdown2 from "@/submodules/react-components/components/Dropdown2";
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
            graphType: DISPLAY_GRAPHS_VALUE_ARRAY[0],
            targetAttribute: targetAttributes[0],
            labelingTask: labelingTasksFinal,
            dataSlice: dataSlices[0],
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
                        <Dropdown2 buttonName={overviewFilters?.graphType?.name} options={DISPLAY_GRAPHS_VALUE_ARRAY} dropdownWidth="w-44"
                            selectedOption={(option: any) => {
                                dispatch(updateOverFilters('graphType', option));
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
                        {targetAttributes &&
                            <Dropdown2 buttonName={labelingTasks?.length == 0 ? '' : overviewFilters?.targetAttribute?.name} options={labelingTasks?.length == 0 ? [] : targetAttributes} dropdownWidth="w-44"
                                selectedOption={(option: any) => {
                                    dispatch(updateOverFilters('targetAttribute', option));
                                    const labelingTasksFinal = labelingTasks.find((labelingTask) => labelingTask.targetName === option.name);
                                    dispatch(updateOverFilters('labelingTask', labelingTasksFinal));
                                    setLabelingTasksFiltered(labelingTasks.filter((labelingTask) => labelingTask.targetName === option.name));
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
                        {labelingTasks && <Dropdown2 buttonName={overviewFilters?.labelingTask?.name} options={labelingTasksFiltered} dropdownWidth="w-44"
                            selectedOption={(option: any) => dispatch(updateOverFilters('labelingTask', option))} />}
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
                        {dataSlices && <Dropdown2 buttonName={overviewFilters?.dataSlice?.name} options={dataSlices} dropdownWidth="w-44"
                            selectedOption={(option: any) => dispatch(updateOverFilters('dataSlice', option))} />}
                    </div>
                </li>

            </ol >
        </nav >
    )
}