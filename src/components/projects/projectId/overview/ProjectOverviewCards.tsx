import { IconClick } from "@tabler/icons-react";

export default function ProjectOverviewCards() {
    return (<div>
        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg">
                <dt>
                    <div className="absolute bg-yellow-500 rounded-md p-3">
                        <IconClick className="h-6 w-6 text-white" />
                    </div>
                    <p className="ml-16 text-sm font-medium text-gray-500 truncate">Manually labeled</p>
                </dt>
                <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                    {/* <ng-template [ngIf]="projectStats.generalLoading" [ngIfElse]="showStatsM">
                        <kern-loading></kern-loading>
                    </ng-template>
                    <ng-template #showStatsM>
                        <div class="tooltip" [attr.data-tip]="projectStats.general['MANUAL']">
                            <p class="text-2xl font-semibold text-gray-900">
                                {{projectStats.generalStats["MANUAL"] | percentRound: 2}}
                            </p>
                        </div>

                    </ng-template> */}
                    <div className="absolute bottom-0 inset-x-0 bg-gray-50 px-4 py-4 sm:px-6">
                        <div className="text-sm">
                            <a className="font-medium text-green-700 hover:text-green-500">Continue labeling</a>
                        </div>
                    </div>
                </dd>
            </div>
        </dl >
    </div >);
}