import { selectAnnotators, selectEngineers, selectExperts, selectInactiveOrganization } from "@/src/reduxStore/states/general";
import { useSelector } from "react-redux"
import YoutubeIntroduction from "../projects/YoutubeIntroduction";
import { User } from "@/src/types/shared/general";
import { IconUsersGroup } from "@tabler/icons-react";
import { UNKNOWN_USER } from "@/src/util/constants";
import { MemoIconUsersGroup } from "@/submodules/react-components/components/kern-icons/icons";

export default function UsersList() {
    const organizationInactive = useSelector(selectInactiveOrganization);
    const engineers = useSelector(selectEngineers);
    const annotators = useSelector(selectAnnotators);
    const experts = useSelector(selectExperts);

    return <div className="bg-gray-100">
        {!organizationInactive && <div>
            <div className="mx-auto mt-8 pb-12 px-4 sm:px-6">
                <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-5 sm:space-y-4">
                        <h3 className="text-2xl font-semibold tracking-tight sm:text-4xl">Engineering team</h3>
                        <p className="text-gray-900">Administers the project and works on programmatic tasks such as
                            labeling automation or filter settings.</p>
                        <p className="text-gray-500">They have access to all features of the application, including
                            the Python SDK.</p>
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
                    <div className="relative">
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
                    </div>}
                </div>
            </div>
        </div>
        }
        {organizationInactive && <div>
            <div className="h-screen relative bg-white overflow-hidden">
                <div className="hidden lg:block lg:absolute lg:inset-0" aria-hidden="true">
                    <svg className="h-screen absolute top-0 left-1/2 transform translate-x-64 -translate-y-8" width="640"
                        height="784" fill="none" viewBox="0 0 640 784">
                        <defs>
                            <pattern id="9ebea6f4-a1f5-4d96-8c4e-4c2abf658047" x="118" y="0" width="20" height="20"
                                patternUnits="userSpaceOnUse">
                                <rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" />
                            </pattern>
                        </defs>
                        <rect y="72" width="640" height="640" className="text-gray-50" fill="currentColor" />
                        <rect x="118" width="404" height="784" fill="url(#9ebea6f4-a1f5-4d96-8c4e-4c2abf658047)" />
                    </svg>
                </div>
                <div className="relative pt-6 pb-16 sm:pb-24 lg:pb-32">
                    <main className="mt-16 mx-auto px-4 sm:mt-24 sm:px-6 lg:mt-32">
                        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                                <div>
                                    <div className="text-gray-500 font-semibold text-base uppercase">You&apos;re now on the waitlist!
                                    </div>
                                    <div className="font-extrabold text-gray-900 text-5xl mt-1">
                                        You don&apos;t want to <span className="text-green-800">wait?</span>
                                    </div>
                                    <div className="font-normal text-xl text-gray-500 mt-5">
                                        In a 15 minute onboarding call, we can directly assign you access. Reach out to us &nbsp;
                                        <a href="https://www.kern.ai/schedule-demo" target="_blank"><span
                                            className="underline cursor-pointer">here</span></a>.
                                    </div>
                                    <div className="text-gray-500 mt-5">
                                        In the meantime, feel free to take a look at a product demo or check out our &nbsp;
                                        <a href="https://docs.kern.ai/" target="_blank"><span
                                            className="underline cursor-pointer">documentation</span></a>. If you have any
                                        questions, contact us any time.
                                    </div>
                                </div>
                            </div>
                            <YoutubeIntroduction />
                        </div>
                    </main>
                </div>
            </div>
        </div>}
    </div>
}