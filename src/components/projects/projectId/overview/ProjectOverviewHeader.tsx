import { selectStaticSlices } from "@/src/reduxStore/states/pages/data-browser";
import { selectLabelingTasksAll, selectUsableAttributesNoFiltered } from "@/src/reduxStore/states/pages/settings";
import { selectOverviewFilters, setOverviewFilters, updateOverFilters } from "@/src/reduxStore/states/tmp";
import { ProjectOverviewFilters } from "@/src/types/components/projects/projectId/project-overview/project-overview";
import { LabelingTask } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { Tooltip } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";


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
            targetAttribute: targetAttributes[0],
            labelingTask: labelingTasksFinal,
            dataSlice: dataSlices[0],
        }
        dispatch(setOverviewFilters(overviewFiltersNew));
        setLabelingTasksFiltered(labelingTasks.filter((labelingTask) => labelingTask.targetName === targetAttributes[0].name));
    }, [labelingTasks, targetAttributes, dataSlices]);

    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol role="list" className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-center">
                <li className="ml-2">
                    <div className="flex items-center">
                        <Tooltip placement="bottom" trigger="hover" color="invert" content={TOOLTIPS_DICT.PROJECT_OVERVIEW.TARGET_TYPE} className="relative z-10 cursor-auto">
                            <span className='cursor-help mr-2 underline text-black-800 filtersUnderline'>Target</span>
                        </Tooltip>
                        {targetAttributes &&
                            <KernDropdown buttonName={labelingTasks?.length == 0 ? '' : overviewFilters?.targetAttribute?.name} options={labelingTasks?.length == 0 ? [] : targetAttributes} dropdownWidth="w-44"
                                selectedOption={(option: any) => {
                                    dispatch(updateOverFilters('targetAttribute', option));
                                    const labelingTasksFinal = labelingTasks.find((labelingTask) => labelingTask.targetName === option.name);
                                    dispatch(updateOverFilters('labelingTask', labelingTasksFinal));
                                    setLabelingTasksFiltered(labelingTasks.filter((labelingTask) => labelingTask.targetName === option.name));
                                }} />}
                    </div>
                </li>

                <li className="ml-2">
                    <div className="flex items-center">
                        <Tooltip placement="bottom" trigger="hover" color="invert" content={TOOLTIPS_DICT.PROJECT_OVERVIEW.LABELING_TASK} className="relative z-10 cursor-auto">
                            <span className='cursor-help mr-2 underline text-black-800 filtersUnderline'>Labeling task</span>
                        </Tooltip>
                        {labelingTasks && <KernDropdown buttonName={overviewFilters?.labelingTask?.name} options={labelingTasksFiltered} dropdownWidth="w-44"
                            selectedOption={(option: any) => dispatch(updateOverFilters('labelingTask', option))} />}
                    </div>
                </li>

                <li className="ml-2">
                    <div className="flex items-center">
                        <Tooltip placement="bottom" color="invert" content={TOOLTIPS_DICT.PROJECT_OVERVIEW.STATIC_DATA_SLICE} className="z-10 relative cursor-auto">
                            <span className={`cursor-help mr-2 underline text-black-800 filtersUnderline`}>Data slice</span>
                        </Tooltip>
                        {dataSlices && <KernDropdown buttonName={overviewFilters?.dataSlice?.name} options={dataSlices} dropdownWidth="w-44"
                            selectedOption={(option: any) => dispatch(updateOverFilters('dataSlice', option))} />}
                    </div>
                </li>

            </ol >
        </nav >
    )
}