import { selectInactiveOrganization, selectIsManaged } from "@/src/reduxStore/states/general";
import { useSelector } from "react-redux"
import YoutubeIntroduction from "../projects/YoutubeIntroduction";
import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { GET_ORGANIZATION_USERS } from "@/src/services/gql/queries/organizations";
import { postProcessUsersList } from "@/src/util/components/users/users-list-helper";
import { User } from "@/src/types/shared/general";
import { IconCheck, IconUsersGroup } from "@tabler/icons-react";

export default function UsersList() {
    const isManaged = useSelector(selectIsManaged);
    const organizationInactive = useSelector(selectInactiveOrganization);

    const [engineers, setEngineers] = useState([]);
    const [annotators, setAnnotators] = useState([]);
    const [experts, setExperts] = useState([]);

    //state vs query. Since we need the users on the data browser/labeling page as well i think a state makes sense
    const [refetchOrganizationUsers] = useLazyQuery(GET_ORGANIZATION_USERS);

    useEffect(() => {
        if (!isManaged) return;
        refetchOrganizationUsers().then((res) => {
            const users = postProcessUsersList(res.data['allUsers']);
            setEngineers(users.filter((user) => user.role === 'ENGINEER'));
            setAnnotators(users.filter((user) => user.role === 'ANNOTATOR'));
            setExperts(users.filter((user) => user.role === 'EXPERT'));
        })
    }, [isManaged]);

    return <div className="bg-slate-50 h-screen overflow-y-auto">
        {!isManaged && <div>
            <div className="mt-10 mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="mx-auto">
                    <div className="max-w-2xl md:mx-auto md:text-center xl:max-w-none">
                        <h2 className="font-display text-3xl tracking-tight sm:text-4xl md:text-5xl">
                            Tailored pricing,
                            fitting your requirements.
                        </h2>
                        <p className="mt-6 text-lg tracking-tight text-gray-900">
                            refinery comes both via managed cloud or as an on-prem enterprise solution. Also,
                            you can let us manage your crowdlabeling tasks in the managed cloud.
                        </p>
                    </div>

                </div>

                <div
                    className="mt-12 pb-12 space-y-4 sm:mt-16 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 lg:mx-auto lg:max-w-4xl xl:mx-0 xl:max-w-none xl:grid-cols-3">
                    <div
                        className="bg-white divide-y divide-gray-200 rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6">
                            <h2 className="text-lg font-medium leading-6 text-gray-900">Open-source</h2>
                            <p className="mt-4 text-sm text-gray-500">Designed for single-user workflows.</p>
                            <div className='md:h-44'>
                                <div>
                                    <p className="mt-8">
                                        <span className="text-4xl font-bold tracking-tight text-gray-900">For
                                            free</span>
                                    </p>
                                    <p className="mt-2">
                                        <span className="font-small text-gray-500">Install it on your local
                                            machine.</span>
                                    </p>
                                </div>
                            </div>
                            <a href="https://github.com/code-kern-ai/refinery" target="_blank"
                                className="mt-4 block w-full rounded-md border border-gray-800 bg-gray-800 py-2 text-center text-sm font-semibold text-white hover:bg-gray-900">
                                Go to GitHub
                            </a>
                        </div>
                        <div className="px-6 pt-6 pb-8">
                            <h3 className="text-sm font-medium text-gray-900">What&apos;s included</h3>
                            <ul role="list" className="mt-6 space-y-4">
                                <li className="flex space-x-3">
                                    <IconCheck className="h-5 w-5 flex-shrink-0 text-green-500" />
                                    <span className="text-sm text-gray-500">Free forever.</span>
                                </li>
                                <li className="flex space-x-3">
                                    <IconCheck className="h-5 w-5 flex-shrink-0 text-green-500" />
                                    <span className="text-sm text-gray-500">Ideal for smaller projects, e.g.
                                        side-projects or Proof-of-Concepts.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div
                        className="bg-white divide-y divide-gray-200 rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6">
                            <h2 className="text-lg font-medium leading-6 text-gray-900">Managed cloud</h2>
                            <p className="mt-4 text-sm text-gray-500">We do all the heavy-lifting for you.</p>
                            <div className='md:h-44'>
                                <div>
                                    <p className="mt-8">
                                        <span className="text-base font-medium text-gray-500">Starting at</span>
                                        <span className="text-4xl font-bold tracking-tight text-gray-900"> 300€
                                        </span>
                                        <span className="text-base font-medium text-gray-500">/mo.</span>
                                    </p>
                                    <p className="mt-2">
                                        <span className="font-small text-gray-500">Depending on workload, dedicated
                                            vs. shared instances, and labeling services.</span>
                                    </p>
                                    <span
                                        className="mt-4 inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-sm font-medium text-blue-800">
                                        14-day trial
                                    </span>
                                </div>
                            </div>
                            <a href="https://cal.com/demo-refinery" target="_blank"
                                className="mt-4 block w-full rounded-md border border-gray-800 bg-gray-800 py-2 text-center text-sm font-semibold text-white hover:bg-gray-900">
                                Talk to sales
                            </a>
                        </div>
                        <div className="px-6 pt-6 pb-8">
                            <h3 className="text-sm font-medium text-gray-900">What&apos;s included</h3>
                            <ul role="list" className="mt-6 space-y-4">
                                <li className="flex space-x-3">
                                    <IconCheck className="h-5 w-5 flex-shrink-0 text-green-500" />
                                    <span className="text-sm text-gray-500">Managed and monitored by us.</span>
                                </li>
                                <li className="flex space-x-3">
                                    <IconCheck className="h-5 w-5 flex-shrink-0 text-green-500" />
                                    <span className="text-sm text-gray-500">Work together with your team.</span>
                                </li>
                                <li className="flex space-x-3">
                                    <IconCheck className="h-5 w-5 flex-shrink-0 text-green-500" />
                                    <span className="text-sm text-gray-500">GPU-acceleration of large language model
                                        (LLM)-services.</span>
                                </li>
                                <li className="flex space-x-3">
                                    <IconCheck className="h-5 w-5 flex-shrink-0 text-green-500" />
                                    <span className="text-sm text-gray-500">On-demand managed labeling
                                        services.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div
                        className="bg-white divide-y divide-gray-200 rounded-lg border border-gray-200 shadow-sm">
                        <div className="p-6">
                            <h2 className="text-lg font-medium leading-6 text-gray-900">On-premise deployment
                            </h2>
                            <p className="mt-4 text-sm text-gray-500">You run refinery, we help you make it a
                                success.</p>
                            <div className='md:h-44'>
                                <div>
                                    <p className="mt-8">
                                        <span className="text-4xl font-bold tracking-tight text-gray-900">3000€
                                        </span>
                                        <span className="text-base font-medium text-gray-500">/mo.</span>
                                    </p>
                                    <p className="mt-2">
                                        <span className="font-small text-gray-500">Running on your own
                                            infrastructure.</span>
                                    </p>
                                    <span
                                        className="mt-4 inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800">
                                        Early bird offer
                                    </span>
                                </div>
                            </div>
                            <a href="https://cal.com/demo-refinery" target="_blank"
                                className="mt-4 block w-full rounded-md border border-gray-800 bg-gray-800 py-2 text-center text-sm font-semibold text-white hover:bg-gray-900">
                                Talk to sales
                            </a>
                        </div>
                        <div className="px-6 pt-6 pb-8">
                            <h3 className="text-sm font-medium text-gray-900">What&apos;s included</h3>
                            <ul role="list" className="mt-6 space-y-4">
                                <li className="flex space-x-3">
                                    <IconCheck className="h-5 w-5 flex-shrink-0 text-green-500" />
                                    <span className="text-sm text-gray-500">Deployed on your own
                                        infrastructure.</span>
                                </li>
                                <li className="flex space-x-3">
                                    <IconCheck className="h-5 w-5 flex-shrink-0 text-green-500" />
                                    <span className="text-sm text-gray-500">Work together with your team.</span>
                                </li>
                                <li className="flex space-x-3">
                                    <IconCheck className="h-5 w-5 flex-shrink-0 text-green-500" />
                                    <span className="text-sm text-gray-500">Custom API.</span>
                                </li>
                                <li className="flex space-x-3">
                                    <IconCheck className="h-5 w-5 flex-shrink-0 text-green-500" />
                                    <span className="text-sm text-gray-500">Dedicated engineer support.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>}
        {!organizationInactive && isManaged && <div>
            <div className="mx-auto mt-8 pb-12 px-4 sm:px-6">
                <div className="grid grid-cols-1 gap-8 pb-12">
                    <div className="space-y-5 sm:space-y-4">
                        <h3 className="text-3xl font-bold tracking-tight sm:text-4xl">Engineering team</h3>
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
                                        <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
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
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Domain experts team</h2>
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
                                        <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                                        <p className="truncate text-sm text-gray-500">{user.mail}</p>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                    {experts?.length == 0 && <div className="text-center">
                        <IconUsersGroup className="mx-auto h-12 w-12 text-gray-400" />
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
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Annotator team</h2>
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
                                        <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                                        <p className="truncate text-sm text-gray-500">{user.mail}</p>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                    {annotators?.length == 0 && <div className="text-center">
                        <IconUsersGroup className="mx-auto h-12 w-12 text-gray-400" />
                        <h2 className="mt-2 text-lg font-medium text-gray-900">Add annotators</h2>
                        <p className="mt-1 text-sm text-gray-500">Let us know if you want to add annotators.
                        </p>
                    </div>}
                </div>
            </div>
        </div>
        }
        {organizationInactive && isManaged && <div>
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
                                        <a href="https://www.kern.ai/waitlist" target="_blank"><span
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