import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import { selectProject } from "@/src/reduxStore/states/project";
import { CardStats, CardStatsEnum, ProjectOverviewCardsProps } from "@/src/types/components/projects/projectId/overview";
import { Tooltip } from "@nextui-org/react";
import { IconBottle, IconBulb, IconClick, IconScale } from "@tabler/icons-react";
import { useSelector } from "react-redux";

const CARDS_DATA = [
    { color: 'yellow', stats: CardStatsEnum.MANUAL, label: 'Manually labeled', linkLabel: 'Continue labeling', link: 'labeling' },
    { color: 'green', stats: CardStatsEnum.WEAK_SUPERVISION, label: 'Weakly supervised', linkLabel: 'Manage heuristics', link: 'heuristics' },
    { color: 'red', stats: CardStatsEnum.INFORMATION_SOURCE, label: 'Heuristics', linkLabel: 'Manage heuristics', link: 'heuristics' },
    { color: 'blue', stats: CardStatsEnum.INTER_ANNOTATOR, label: 'Inter annotator agreement', linkLabel: 'View records', link: 'data' },
];

export default function ProjectOverviewCards(props: ProjectOverviewCardsProps) {
    const project = useSelector(selectProject);

    return (<div>
        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CARDS_DATA.map((card: CardStats) => (
                <div key={card.color} className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg">
                    <dt>
                        <div className={`absolute bg-${card.color}-500 rounded-md p-3`}>
                            {card.stats == CardStatsEnum.MANUAL && <IconClick className="h-6 w-6 text-white" />}
                            {card.stats == CardStatsEnum.WEAK_SUPERVISION && <IconBottle className="h-6 w-6 text-white" />}
                            {card.stats == CardStatsEnum.INFORMATION_SOURCE && <IconBulb className="h-6 w-6 text-white" />}
                            {card.stats == CardStatsEnum.INTER_ANNOTATOR && <IconScale className="h-6 w-6 text-white" />}
                        </div>
                        <p className="ml-16 text-sm font-medium text-gray-500 truncate">{card.label}</p>
                    </dt>
                    <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                        {props.projectStats.generalLoading ? (<LoadingIcon color={card.color} />) : (
                            <Tooltip content={card.stats !== CardStatsEnum.INTER_ANNOTATOR ? props.projectStats.general[card.stats] : props.projectStats.interAnnotator}
                                placement="top" color="invert">
                                {(card.stats == CardStatsEnum.MANUAL || card.stats == CardStatsEnum.WEAK_SUPERVISION) &&
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {props.projectStats.generalStats[card.stats]}
                                    </p>}
                                {card.stats == CardStatsEnum.INFORMATION_SOURCE && <p className="text-2xl font-semibold text-gray-900">
                                    {props.projectStats.generalPercent[card.stats]}
                                </p>}
                                {card.stats == CardStatsEnum.INTER_ANNOTATOR && <p className="text-2xl font-semibold text-gray-900">
                                    {props.projectStats.interAnnotatorStat == -1 ? 'n/a' : props.projectStats.interAnnotatorStat}
                                </p>}
                            </Tooltip>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-gray-50 px-4 py-4 sm:px-6">
                            <div className="text-sm">
                                <a className="font-medium text-green-700 hover:text-green-500"
                                    href={`/refinery/projects/${project.id}/${card.link}`}>{card.linkLabel}</a>
                            </div>
                        </div>
                    </dd>
                </div>
            ))}
        </dl >
    </div >);
}