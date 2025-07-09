import { selectEngineers } from "@/src/reduxStore/states/general";
import { useSelector } from "react-redux"
import { User } from "@/src/types/shared/general";
import { UNKNOWN_USER } from "@/src/util/constants";

export default function UsersList() {
    const engineers = useSelector(selectEngineers);

    return <div className="bg-gray-100">
        <div>
            <div className="mx-auto mt-8 pb-12 px-4 sm:px-6">
                <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-5 sm:space-y-4">
                        <h3 className="text-2xl font-semibold tracking-tight sm:text-4xl">Engineering team</h3>
                        <p className="text-gray-900">Administers the project and works on programmatic tasks such as
                            labeling automation or filter settings.</p>
                        <p className="text-gray-500">They have access to all features of the application</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {engineers.map((user: User) => (
                            <div key={user.id} className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400">
                                <div className="flex-shrink-0">
                                    <img className="h-10 w-10 rounded-full" alt="" src={`/refinery/avatars/${user?.avatarUri}`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <a className="focus:outline-none">
                                        <span className="absolute inset-0" aria-hidden="true"></span>
                                        <p className="text-sm font-medium text-gray-900">{user.firstName && user.lastName ? user.firstName + ' ' + user.lastName : UNKNOWN_USER}</p>
                                        <p className="truncate text-sm text-gray-500">{user.mail}</p>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* commented Display for EXPERTS & ANNOTATORS since both are currently unable to access Refinery, only ANNOTATORS are currently in use and only for Cognition */}
                    {/* After rework we might want to reuse some of these*/}

                    {/* <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                    </div>
                    <div className="mt-4 space-y-5 sm:space-y-4">
                        <h2 className="text-2xl font-semibold tracking-tight sm:text-4xl">Domain experts team</h2>
                        <p className="text-gray-900">Working on reference manual labels, which can be used by the
                            engineering team to estimate the data quality.</p>
                        <p className="text-gray-500">They have access to the labeling view only.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {experts.map((user: User) => (
                            <div key={user.id} className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400">
                                <div className="flex-shrink-0">
                                    <img className="h-10 w-10 rounded-full" alt="" src={`/refinery/avatars/${user?.avatarUri}`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <a className="focus:outline-none">
                                        <span className="absolute inset-0" aria-hidden="true"></span>
                                        <p className="text-sm font-medium text-gray-900">{user.firstName && user.lastName ? user.firstName + ' ' + user.lastName : UNKNOWN_USER}</p>
                                        <p className="truncate text-sm text-gray-500">{user.mail}</p>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                    {experts?.length == 0 && <div className="text-center">
                        <MemoIconUsersGroup className="mx-auto h-12 w-12 text-gray-400" />
                        <h2 className="mt-2 text-lg font-medium text-gray-900">Add experts</h2>
                        <p className="mt-1 text-sm text-gray-500">Let us know if you want to add experts.
                        </p>
                    </div>}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                    </div>
                    <div className="mt-4 space-y-5 sm:space-y-4">
                        <h2 className="text-2xl font-semibold tracking-tight sm:text-4xl">Annotator team</h2>
                        <p className="text-gray-900">Working on manual labels as if they were heuristics. They can
                            be switched on/off by the engineering team, so that the engineers can in- or exclude
                            them during weak supervision.</p>
                        <p className="text-gray-500">They have access to a task-minimized labeling view only.
                            Engineers can revoke their
                            access to the labeling view.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {annotators.map((user: User) => (
                            <div key={user.id} className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400">
                                <div className="flex-shrink-0">
                                    <img className="h-10 w-10 rounded-full" alt="" src={`/refinery/avatars/${user?.avatarUri}`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <a className="focus:outline-none">
                                        <span className="absolute inset-0" aria-hidden="true"></span>
                                        <p className="text-sm font-medium text-gray-900">{user.firstName && user.lastName ? user.firstName + ' ' + user.lastName : UNKNOWN_USER}</p>
                                        <p className="truncate text-sm text-gray-500">{user.mail}</p>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                    {annotators?.length == 0 && <div className="text-center">
                        <MemoIconUsersGroup className="mx-auto h-12 w-12 text-gray-400" />
                        <h2 className="mt-2 text-lg font-medium text-gray-900">Add annotators</h2>
                        <p className="mt-1 text-sm text-gray-500">Let us know if you want to add annotators.
                        </p>
                    </div>} */}
                </div>
            </div>
        </div>

    </div>
}