import { getDisplayGraphValueArray } from "@/src/util/components/projects/projectId/project-overview-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { Tooltip } from "@nextui-org/react";
import { useState } from "react";

const DISPLAY_GRAPHS_VALUE_ARRAY = getDisplayGraphValueArray();

export default function ProjectOverviewHeader() {
    const [displayGraphsSelectedValue, setDisplayGraphsSelectedValue] = useState(DISPLAY_GRAPHS_VALUE_ARRAY[0].name);

    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 items-center">
                <li>
                    <div className="flex flex-row items-center">
                        <Tooltip placement="bottom" trigger="hover" color="invert" content={TOOLTIPS_DICT.PROJECT_OVERVIEW.VISUALIZATION} className="relative z-10">
                            <span className={`cursor-help mr-2 underline text-black-800 filtersUnderline`}>Visualizations</span>
                        </Tooltip>
                        <Dropdown buttonName={displayGraphsSelectedValue} options={DISPLAY_GRAPHS_VALUE_ARRAY} dropdownWidth="w-44"
                            selectedOption={(option: string) => setDisplayGraphsSelectedValue(option)} />
                    </div>
                </li>
                <li>
                    <div className="flex items-center">
                        <svg className="flex-shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                        </svg>
                        <Tooltip placement="bottom" trigger="hover" color="invert" content={TOOLTIPS_DICT.PROJECT_OVERVIEW.TARGET_TYPE} className="relative z-10">
                            <span className={`cursor-help mr-2 underline text-black-800 filtersUnderline`}>Target</span>
                        </Tooltip>
                    </div>
                </li>

                <li>
                    <div className="flex items-center">
                        <svg className="flex-shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                        </svg>
                        <Tooltip placement="bottom" trigger="hover" color="invert" content={TOOLTIPS_DICT.PROJECT_OVERVIEW.LABELING_TASK} className="relative z-10">
                            <span className={`cursor-help mr-2 underline text-black-800 filtersUnderline`}>Labeling task</span>
                        </Tooltip>
                    </div>
                </li>

                <li>
                    <div className="flex items-center">
                        <svg className="flex-shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                        </svg>
                        <Tooltip placement="bottom" color="invert" content={TOOLTIPS_DICT.PROJECT_OVERVIEW.STATIC_DATA_SLICE} className="z-10 relative">
                            <span className={`cursor-help mr-2 underline text-black-800 filtersUnderline`}>Data slice</span>
                        </Tooltip>
                    </div>
                </li>

            </ol >
        </nav >
    )
}