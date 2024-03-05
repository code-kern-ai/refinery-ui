import { selectProjectId } from "@/src/reduxStore/states/project";
import { Heuristic } from "@/src/types/components/projects/projectId/heuristics/heuristics";
import { GridCardsProps } from "@/src/types/shared/grid-cards";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { InformationSourceType } from "@/submodules/javascript-functions/enums/enums";
import { Tooltip } from "@nextui-org/react";
import { IconArrowRight, IconBolt, IconCode, IconSparkles, IconUsers } from "@tabler/icons-react";
import { useSelector } from "react-redux";
import style from '@/src/styles/components/projects/projectId/heuristics/heuristics.module.css';
import { useMutation } from "@apollo/client";
import { TOGGLE_HEURISTICS_SELECTED } from "@/src/services/gql/mutations/heuristics";
import { useRouter } from "next/router";
import Statuses from "../statuses/Statuses";

export default function GridCards(props: GridCardsProps) {
    const router = useRouter();

    const projectId = useSelector(selectProjectId);

    const [toggleHeuristicsMut] = useMutation(TOGGLE_HEURISTICS_SELECTED);

    function toggleHeuristic(projectId: string, heuristicId: string) {
        toggleHeuristicsMut({ variables: { projectId: projectId, informationSourceId: heuristicId } }).then(() => {
            props.refetch();
        });
    }

    return (<>
        {props.filteredList.map((heuristic: Heuristic, index: number) => (<div key={heuristic.id}>
            <div className={`relative flex space-x-3 items-center rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400 ${props.filteredList.length > 2 ? style.item : ''}`}>
                <div className="h-full flex flex-col gap-2 items-center self-start">
                    <label htmlFor="heuristic-name" className="cursor-pointer flex justify-center">
                        <input type="checkbox" className="cursor-pointer" name="heuristic-name" checked={heuristic.selected} onChange={() => toggleHeuristic(projectId, heuristic.id)} />
                    </label>
                    {heuristic.informationSourceType === InformationSourceType.LABELING_FUNCTION && <Tooltip content={TOOLTIPS_DICT.HEURISTICS.LABELING_FUNCTION} color="invert" placement="right" className="cursor-auto">
                        <IconCode size={20} strokeWidth={1.5} />
                    </Tooltip>}
                    {heuristic.informationSourceType === InformationSourceType.ACTIVE_LEARNING && <Tooltip content={TOOLTIPS_DICT.HEURISTICS.ACTIVE_LEARNING} color="invert" placement="right" className="cursor-auto">
                        <IconBolt size={20} strokeWidth={1.5} className="fill-gray-800" />
                    </Tooltip>}
                    {heuristic.informationSourceType === InformationSourceType.ZERO_SHOT && <Tooltip content={TOOLTIPS_DICT.HEURISTICS.ZERO_SHOT} color="invert" placement="right" className="cursor-auto">
                        <IconSparkles size={20} strokeWidth={1.5} className="fill-gray-800" />
                    </Tooltip>}
                    {heuristic.informationSourceType === InformationSourceType.CROWD_LABELER && <Tooltip content={TOOLTIPS_DICT.HEURISTICS.CROWD_LABELING} color="invert" placement="right" className="cursor-auto">
                        <IconUsers size={20} strokeWidth={1.5} />
                    </Tooltip>}
                </div>

                <div className="flex-1 min-w-0 text-sm leading-5">
                    <div className="flow-root font-medium">
                        <div className="text-gray-900 float-left"> {heuristic.name}</div>
                        <a className="text-green-800 float-right cursor-pointer" href={`/refinery${heuristic.routerLink}`} onClick={(e) => {
                            e.preventDefault();
                            router.push(`${heuristic.routerLink}`);
                        }}> Details
                            <IconArrowRight className="h-5 w-5 inline-block text-green-800" />
                        </a>
                    </div>
                    <div className="flow-root font-normal">
                        <div className="text-gray-500 float-left line-clamp-3" style={{ maxWidth: '250px' }}>
                            {heuristic.description}
                        </div>
                        <div className="float-right">
                            <Statuses status={heuristic.state} tooltipPosition="left" page="heuristics" />
                        </div>
                    </div>
                    {!(heuristic.stats.length == 1 && heuristic.stats[0].label == '-') && <>
                        {heuristic.stats.map((stat: any) => (<div key={stat.labelId} className="grid grid-cols-3 font-normal text-gray-500 items-center">
                            <div className="py-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-medium border ${stat.color.backgroundColor} ${stat.color.textColor} ${stat.color.borderColor} ${stat.color.hoverColor}`}>
                                    {stat.label}
                                </span>
                            </div>
                            <div className="mr-4 py-4 ml-auto text-sm leading-5 font-medium text-gray-900">
                                <div>Est. Precision</div>
                                <div className="font-normal text-gray-500">{stat.values.Precision}</div>
                            </div>
                            <div className="py-4 ml-auto text-sm leading-5 font-medium text-gray-900">
                                <div>Coverage</div>
                                <div className="font-normal text-gray-500">{stat.values.Coverage}&nbsp;
                                    {stat.values.Coverage == 1 ? 'record' : 'records'}
                                </div>

                            </div>
                        </div>))}
                    </>}
                </div>
            </div>
        </div >))
        }
    </ >);
}