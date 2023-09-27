import { getDisplayGraphValueArray } from "@/src/util/projects/project-overview-helper";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { Tooltip } from "@nextui-org/react";
import { useState } from "react";
import style from '@/src/styles/project-overview.module.css';
import { useDispatch } from "react-redux";


const DISPLAY_GRAPHS_VALUE_ARRAY = getDisplayGraphValueArray();

export default function ProjectOverviewHeader() {
    const [displayGraphsSelectedValue, setDisplayGraphsSelectedValue] = useState(DISPLAY_GRAPHS_VALUE_ARRAY[0].name);
    const [labelingTasksTarget, setLabelingTasksTarget] = useState(null);

    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 items-center">
                <li>
                    <div className="flex flex-row items-center">
                        <Tooltip placement="right" trigger="hover" color="invert" content="Choose the visualizations" className="relative z-10">
                            <span className={`cursor-help mr-2 underline text-black-800 ${style.filtersUnderline}`}>Visualizations</span>
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
                        <Tooltip placement="right" trigger="hover" color="invert" content="Choose the target type" className="relative z-10">
                            <span className={`cursor-help mr-2 underline text-black-800 ${style.filtersUnderline}`}>Target</span>
                        </Tooltip>


                        {/* <select [formControl]="labelingTasksTargetForm" class="select select-sm select-bordered pr-8 w-56">
                    <option *ngFor="let target of labelingTasksTargetMap | keyvalue" [value]="target.key">
                        {{target.key}}</option>
                </select> */}
                    </div>
                </li>

                <li>
                    <div className="flex items-center">
                        <svg className="flex-shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                        </svg>
                        <Tooltip placement="bottom" trigger="hover" color="invert" content="Choose the labeling task" className="relative z-10">
                            <span className={`cursor-help mr-2 underline text-black-800 ${style.filtersUnderline}`}>Labeling task</span>
                        </Tooltip>
                        {/* <select *ngIf="labelingTasksMap" [formControl]="labelingTasksForm"
                        class="select select-sm select-bordered pr-8 truncate w-56">
                        <option *ngFor="let task of labelingTasksMap | keyvalue" [value]="task.value.id">
                            {{task.value.name}}</option>
                    </select> */}
                    </div>
                </li>

                <li>
                    <div className="flex items-center">
                        <svg className="flex-shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                        </svg>
                        <Tooltip placement="bottom" content="Choose a static data slice. Only static ones can be used" className="z-10 relative">
                            <span className={`cursor-help mr-2 underline text-black-800 ${style.filtersUnderline}`}>Data slice</span>
                        </Tooltip>

                        {/* <select class="select select-sm select-bordered pr-8 truncate w-56" [formControl]="dataSliceForm">
                        <option value="@@NO_SLICE@@">All Records</option>
                        <option *ngFor="let slice of dataSlicesById | keyvalue" [value]="slice.key">
                            {{slice.value.name}}
                        </option>
                    </select> */}
                    </div>
                </li>

            </ol >
        </nav >
    )
}