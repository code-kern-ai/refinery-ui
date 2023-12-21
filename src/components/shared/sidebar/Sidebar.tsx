import { selectProject } from '@/src/reduxStore/states/project';
import { selectIsAdmin, selectIsManaged, selectRouteColor, selectUser } from '@/src/reduxStore/states/general';
import { UserRole, VersionOverview } from '@/src/types/shared/sidebar';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { Tooltip } from '@nextui-org/react';
import { useCallback, useEffect, useState } from 'react';
import AppSelectionDropdown from '@/submodules/react-components/components/AppSelectionDropdown';
import { ModalButton, ModalEnum } from '@/src/types/shared/modal';
import { closeModal, openModal } from '@/src/reduxStore/states/modal';
import { useLazyQuery } from '@apollo/client';
import { GET_HAS_UPDATES, GET_VERSION_OVERVIEW } from '@/src/services/gql/queries/config';
import { parseUTC } from '@/submodules/javascript-functions/date-parser';
import Modal from '../modal/Modal';
import LoadingIcon from '../loading/LoadingIcon';
import style from '@/src/styles/shared/sidebar.module.css';
import { copyToClipboard } from '@/submodules/javascript-functions/general';
import { IconAlertCircle, IconApi, IconArrowRight, IconBrandDiscord, IconBulb, IconChartPie, IconClipboard, IconExternalLink, IconMaximize, IconMinimize, IconTriangleSquareCircle, IconUserCircle } from '@tabler/icons-react';
import { IconSettings } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants';

const ACCEPT_BUTTON = { buttonCaption: "How to update", useButton: true };
const ABORT_BUTTON = { buttonCaption: "Back", useButton: true };

export default function Sidebar() {
    const router = useRouter();
    const dispatch = useDispatch();

    const user = useSelector(selectUser);
    const project = useSelector(selectProject);
    const isAdmin = useSelector(selectIsAdmin);
    const isManaged = useSelector(selectIsManaged);
    const routeColor = useSelector(selectRouteColor);

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [hasUpdates, setHasUpdates] = useState(false);
    const [versionOverviewData, setVersionOverviewData] = useState<VersionOverview[]>(null);
    const [openTab, setOpenTab] = useState(0);

    const [refetchVersionOverview] = useLazyQuery(GET_VERSION_OVERVIEW, { fetchPolicy: 'no-cache' });
    const [refetchHasUpdates] = useLazyQuery(GET_HAS_UPDATES, { fetchPolicy: 'no-cache' });

    const howToUpdate = useCallback(() => {
        dispatch(closeModal(ModalEnum.VERSION_OVERVIEW));
        dispatch(openModal(ModalEnum.HOW_TO_UPDATE));
    }, []);

    const goBack = useCallback(() => {
        dispatch(closeModal(ModalEnum.HOW_TO_UPDATE));
        dispatch(openModal(ModalEnum.VERSION_OVERVIEW));
    }, []);

    useEffect(() => {
        setAcceptButton({ ...ACCEPT_BUTTON, useButton: !isManaged, emitFunction: howToUpdate });
        setBackButton({ ...ABORT_BUTTON, emitFunction: goBack });
    }, [howToUpdate, goBack]);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);
    const [backButton, setBackButton] = useState<ModalButton>(ABORT_BUTTON);

    function openFullScreen() {
        setIsFullScreen(true);
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).mozRequestFullScreen) {
            /* Firefox */
            (document.documentElement as any).mozRequestFullScreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
            /* Chrome, Safari and Opera */
            (document.documentElement as any).webkitRequestFullscreen();
        } else if ((document.documentElement as any).msRequestFullscreen) {
            /* IE/Edge */
            (document.documentElement as any).msRequestFullscreen();
        }
    }

    function closeFullScreen() {
        setIsFullScreen(false);
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
            /* Firefox */
            (document as any).mozCancelFullScreen();
        } else if ((document as any).webkitExitFullscreen) {
            /* Chrome, Safari and Opera */
            (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
            /* IE/Edge */
            (document as any).msExitFullscreen();
        }
    }

    function requestVersionOverview() {
        dispatch(openModal(ModalEnum.VERSION_OVERVIEW));
        refetchVersionOverview().then(res => {
            const versionOverview: VersionOverview[] = res.data["versionOverview"];
            versionOverview.forEach((version: any) => {
                version.parseDate = parseUTC(version.lastChecked);
            });
            versionOverview.sort((a, b) => a.service.localeCompare(b.service));
            setVersionOverviewData(versionOverview);
            refetchHasUpdates().then(res => {
                setHasUpdates(res.data["hasUpdates"]);
            });
        });
    }

    function toggleTabs(index: number) {
        setOpenTab(index);
    }

    return (
        user && (
            <div className="h-screen flex bg-gray-50 overflow-visible">
                <div className="flex overflow-visible">
                    <div className="flex flex-col w-20 overflow-visible">
                        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-kernindigo overflow-initial">
                            <div className="flex-1 flex flex-col">
                                <div className="flex-shrink-0 bg-kernindigo pt-4 pb-10 flex items-center justify-center">
                                    <button onClick={() => router.push('/projects')}
                                        className="inline-flex items-center p-2 rounded-full hover:bg-kernindigo-dark focus:outline-none">
                                        <Image
                                            width={40}
                                            height={40}
                                            src="/refinery/images/refinery-icon.png"
                                            alt="Kern AI"
                                            priority={true}
                                        />
                                    </button>
                                </div>
                                <div>
                                    {(project && project.id && routeColor) ? (<div>
                                        {user.role === UserRole.ENGINEER && <div
                                            className="flex items-center justify-center overflow-visible">
                                            <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.OVERVIEW}>
                                                <div className={`relative z-50 ${project.numDataScaleUploaded == 0 ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'opacity-100 cursor-pointer'}`}>
                                                    <button onClick={() => router.push(`/projects/${project.id}/overview`)}
                                                        className={`circle ${routeColor.overview.active ? 'text-kernpurple' : 'text-white'}`}>
                                                        <IconChartPie className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            </Tooltip>
                                        </div>}
                                        {user.role === UserRole.ENGINEER && <div
                                            className="flex items-center justify-center overflow-visible mt-10 2xl:mt-12">
                                            <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.DATA_BROWSER}>
                                                <div className={`relative z-50 ${project.numDataScaleUploaded == 0 ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'opacity-100 cursor-pointer'}`}>
                                                    <button onClick={() => router.push(`/projects/${project.id}/data-browser`)}
                                                        className={`circle ${routeColor.data.active ? 'text-kernpurple' : 'text-white'}`}>
                                                        <IconTriangleSquareCircle className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            </Tooltip>
                                        </div>}
                                        <div className={`flex items-center justify-center overflow-visible ${user?.role == 'ENGINEER' ? 'mt-10 2xl:mt-12' : ''}`}>
                                            <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.LABELING}>
                                                <div className={`relative z-50 ${project.numDataScaleUploaded == 0 ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'opacity-100 cursor-pointer'}`}>
                                                    <button onClick={() => router.push(`/projects/${project.id}/labeling`)}
                                                        className={`circle ${routeColor.labeling.active ? 'text-kernpurple' : 'text-white'}`}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 20 20"
                                                            fill="currentColor">
                                                            <path fillRule="evenodd"
                                                                d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                                                                clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </Tooltip>
                                        </div>
                                        {user.role === UserRole.ENGINEER && <div
                                            className="flex items-center justify-center overflow-visible mt-10 2xl:mt-12">
                                            <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.HEURISTICS}>
                                                <div className={`relative z-50 ${project.numDataScaleUploaded == 0 ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'opacity-100 cursor-pointer'}`}>
                                                    <button onClick={() => router.push(`/projects/${project.id}/heuristics`)}
                                                        className={`circle ${routeColor.heuristics.active ? 'text-kernpurple' : 'text-white'}`}>
                                                        <IconBulb className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            </Tooltip>
                                        </div>}
                                        {user.role === UserRole.ENGINEER && <div
                                            className="flex items-center justify-center overflow-visible mt-10 2xl:mt-12">
                                            <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.SETTINGS}>
                                                <div className={`relative z-50 ${project.numDataScaleUploaded == 0 ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'opacity-100 cursor-pointer'}`}>
                                                    <button onClick={() => router.push(`/projects/${project.id}/settings`)}
                                                        className={`circle ${routeColor.settings.active ? 'text-kernpurple' : 'text-white'}`}>
                                                        <IconSettings className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            </Tooltip>
                                        </div>}
                                        {isAdmin && <div
                                            className="flex items-center justify-center overflow-visible mt-10 2xl:mt-12">
                                            <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.ADMIN}>
                                                <div className={`relative z-50 opacity-100 cursor-pointer`}>
                                                    <button onClick={() => router.push(`/projects/${project.id}/admin`)}
                                                        className={`circle ${routeColor.admin.active ? 'text-kernpurple' : 'text-white'}`}>
                                                        <IconUserCircle className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            </Tooltip>
                                        </div>}
                                        {user.role == UserRole.ENGINEER && <div
                                            className="flex items-center justify-center overflow-visible my-6 text-white">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="20px" fill="none"
                                                viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                                                preserveAspectRatio="none">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                                            </svg>
                                        </div>}
                                    </div>) : (<></>)}
                                    {user.role == UserRole.ENGINEER && <>
                                        {!isManaged && <div className={`flex items-center justify-center overflow-visible ${project?.id !== undefined ? 'mt-6' : ''}`}>
                                            <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.DOCUMENTATION} className="relative z-50">
                                                <a href="https://docs.kern.ai/" target="_blank" rel="noopener noreferrer" className="circle text-white">
                                                    <IconClipboard className="w-6 h-6" />
                                                </a>
                                            </Tooltip>
                                        </div>}
                                    </>}
                                    <div className={`flex items-center justify-center overflow-visible ${isManaged ? (project?.id !== undefined ? 'mt-6' : '') : 'mt-10 2xl:mt-12'}`}>
                                        <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.API} className="relative z-50">
                                            <a href="https://github.com/code-kern-ai/kern-python" target="_blank"
                                                rel="noopener noreferrer" className="circle text-white">
                                                <IconApi className="w-6 h-6" />
                                            </a>
                                        </Tooltip>
                                    </div>
                                </div>

                                {user.role === UserRole.ENGINEER && !isManaged && <div className="flex items-center justify-center overflow-visible mt-10 2xl:mt-12">
                                    <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.JOIN_OUR_COMMUNITY}>
                                        <div className="relative z-50">
                                            <a href="https://discord.com/invite/qf4rGCEphW" target="_blank" rel="noopener noreferrer"
                                                className="circle text-white">
                                                <IconBrandDiscord className="w-6 h-6" />
                                            </a>
                                        </div>
                                    </Tooltip>
                                </div>}
                            </div>
                            {!isFullScreen && <div className="flex items-center justify-center mt-10 2xl:mt-12">
                                <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.MAXIMIZE_SCREEN}>
                                    <button onClick={openFullScreen}
                                        className="z-50 cursor-pointer">
                                        <IconMaximize className="text-white" />
                                    </button>
                                </Tooltip>
                            </div>}

                            {isFullScreen && <div className="flex items-center justify-center mt-10 2xl:mt-12">
                                <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.MINIMIZE_SCREEN}>
                                    <button onClick={closeFullScreen}
                                        className="z-50 cursor-pointer">
                                        <IconMinimize className="text-white" />
                                    </button>
                                </Tooltip>
                            </div>}

                            {isManaged && <div className="flex items-center justify-center mt-4">
                                <AppSelectionDropdown cockpit={true} gates={true} workflow={true}></AppSelectionDropdown>
                            </div>}

                            <div className="flex-shrink-0 flex pt-3 pb-10 justify-center">
                                <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.VERSION_OVERVIEW}>
                                    <div onClick={requestVersionOverview} id="refineryVersion"
                                        className="z-50 tooltip tooltip-right cursor-pointer select-none text-white flex items-center mr-1">
                                        v1.12.0
                                        {hasUpdates && <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.NEWER_VERSION_AVAILABLE} >
                                            <IconAlertCircle className="h-5 w-5 text-yellow-700" />
                                        </Tooltip>}
                                    </div>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>
                <Modal modalName={ModalEnum.VERSION_OVERVIEW} acceptButton={acceptButton}>
                    <div className="inline-block justify-center text-lg leading-6 text-gray-900 font-medium">
                        Version overview

                        <a className="text-green-800 text-base font-medium ml-3" href="https://changelog.kern.ai/" target="_blank">
                            <span className="leading-5">Changelog</span>
                            <IconArrowRight className="h-4 w-4 inline-block text-green-800" />
                        </a>
                    </div>
                    {versionOverviewData ? (<div className="inline-block min-w-full align-middle mt-3">
                        <div className={`overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg ${style.scrollableSize}`}>
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col"
                                            className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Service</th>
                                        <th scope="col"
                                            className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Installed version</th>
                                        <th scope="col"
                                            className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Remote version</th>
                                        <th scope="col"
                                            className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Last checked</th>
                                        <th scope="col"
                                            className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Link</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {versionOverviewData.map((service: VersionOverview, index: number) => (
                                        <tr key={service.service} className={index % 2 != 0 ? 'bg-gray-50' : 'bg-white'}>
                                            <td className="text-left px-3 py-2 text-sm text-gray-500">{service.service}</td>
                                            <td className="text-center px-3 py-2 text-sm text-gray-500">{service.installedVersion}</td>
                                            <td className="text-center px-3 py-2 text-sm text-gray-500">
                                                <div className="flex flex-row items-center justify-center">
                                                    <div className="mr-2">{service.remoteVersion}</div>
                                                    {service.remoteHasNewer && <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.NEWER_VERSION_AVAILABLE} className="cursor-auto">
                                                        <IconAlertCircle className="h-5 w-5 text-yellow-700" />
                                                    </Tooltip>}
                                                </div>
                                            </td>
                                            <td className="text-center px-3 py-2 text-sm text-gray-500">{service.parseDate}</td>
                                            <td className="text-center px-3 py-2 text-sm text-gray-500">
                                                <a href={service.link} target="_blank" rel="noopener noreferrer" className="h-4 w-4 m-auto block p-0">
                                                    <IconExternalLink className="h-4 w-4 m-auto" />
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>) : (<LoadingIcon />)}
                </Modal>
                <Modal modalName={ModalEnum.HOW_TO_UPDATE} backButton={backButton}>
                    <div className="text-center justify-center text-lg leading-6 text-gray-900 font-medium">
                        How to update
                    </div>
                    <div className="flex border-b-2 border-b-gray-200 max-w-full text-center overflow-visible">
                        <div onClick={() => toggleTabs(0)}
                            className={`text-sm leading-5 font-medium mr-10 cursor-help py-3 ${openTab == 0 ? 'text-indigo-700 border-bottom' : 'text-gray-500'}`}>
                            <Tooltip placement="bottom" content={TOOLTIPS_DICT.SIDEBAR['LINUX/MAC']} color="invert">
                                <span className="border-dotted">Bash users</span>
                            </Tooltip>
                        </div>
                        <div onClick={() => toggleTabs(1)}
                            className={`text-sm leading-5 font-medium mr-10 cursor-help py-3 ${openTab == 1 ? 'text-indigo-700 border-bottom' : 'text-gray-500'}`}>
                            <Tooltip placement="bottom" content={TOOLTIPS_DICT.SIDEBAR.PIP} color="invert">
                                <span className="border-dotted">CLI users</span>
                            </Tooltip>
                        </div>
                        <div onClick={() => toggleTabs(2)}
                            className={`text-sm leading-5 font-medium mr-10 cursor-help py-3 ${openTab == 2 ? 'text-indigo-700 border-bottom' : 'text-gray-500'}`}>
                            <Tooltip placement="bottom" content={TOOLTIPS_DICT.SIDEBAR.WINDOWS_TERMINAL} color="invert">
                                <span className="border-dotted">cmd</span>
                            </Tooltip>
                        </div>
                        <div onClick={() => toggleTabs(3)}
                            className={`text-sm leading-5 font-medium mr-10 cursor-help py-3 ${openTab == 3 ? 'text-indigo-700 border-bottom' : 'text-gray-500'}`}>
                            <Tooltip placement="bottom" content={TOOLTIPS_DICT.SIDEBAR.WINDOWS_FILE_EXPLORER} color="invert">
                                <span className="border-dotted">Executing from explorer</span>
                            </Tooltip>
                        </div>
                    </div>
                    <div className="mt-3 px-5 h-40 text-left">
                        {openTab == 0 && <ol className="font-dmMono list-decimal grid gap-y-4">
                            <li>Open a Terminal</li>
                            <li>Change to refinery directory (using cd) -&nbsp;
                                <span className="bg-gray-200 text-red-700 rounded-md p-1 whitespace-nowrap">$ cd
                                    /path/to/refinery</span>
                            </li>
                            <li>Run the update script -&nbsp;
                                <span className="bg-gray-200 text-red-700 rounded-md p-1 whitespace-nowrap">$
                                    <Tooltip placement="top" content={TOOLTIPS_DICT.GENERAL.CLICK_TO_COPY} color="invert">
                                        <span className="cursor-pointer" onClick={() => copyToClipboard('./update')}>./update</span>
                                    </Tooltip>
                                </span>
                            </li>
                        </ol>}

                        {openTab == 1 && <ol className="font-dmMono list-decimal grid gap-y-4">
                            <li>Open a Terminal</li>
                            <li>Change to refinery directory
                                <ol className={`px-8 grid gap-y-4 ${style.listLetters}`}>
                                    <li>Linux/Mac -&nbsp;
                                        <span className="bg-gray-200 text-red-700 rounded-md p-1 whitespace-nowrap">$ cd
                                            path/to/refinery</span>
                                    </li>
                                    <li>Windows -&nbsp;
                                        <span className="bg-gray-200 text-red-700 rounded-md p-1 whitespace-nowrap">cd
                                            path\to\refinery</span>
                                    </li>
                                </ol>
                            </li>
                            <li>
                                Run the CLI update command&nbsp;
                                <span className="bg-gray-200 text-red-700 rounded-md p-1 whitespace-nowrap">$
                                    <Tooltip placement="top" content={TOOLTIPS_DICT.GENERAL.CLICK_TO_COPY} color="invert">
                                        <span className="cursor-pointer" onClick={() => copyToClipboard('refinery update')}>refinery update</span>
                                    </Tooltip>
                                </span>
                            </li>
                        </ol>}

                        {openTab == 2 && <ol className="font-dmMono list-decimal grid gap-y-4">
                            <li>Open a Terminal</li>
                            <li>Change to refinery directory&nbsp;
                                <span className="bg-gray-200 text-red-700 rounded-md p-1 whitespace-nowrap">cd
                                    path\to\refinery</span>
                            </li>
                            <li>
                                Run the update script -&nbsp;
                                <span className="bg-gray-200 text-red-700 rounded-md p-1 whitespace-nowrap">$
                                    <Tooltip placement="top" content={TOOLTIPS_DICT.GENERAL.CLICK_TO_COPY} color="invert">
                                        <span className="cursor-pointer" onClick={() => copyToClipboard('update.bat')}>update.bat</span>
                                    </Tooltip>
                                </span>
                            </li>
                        </ol>}

                        {openTab == 3 && <ol className="font-dmMono list-decimal grid gap-y-4">
                            <li>Open the File Explorer</li>
                            <li>Navigate to the refinery directory</li>
                            <li>
                                Launch the update script by double-clicking&nbsp;
                                <span className="bg-gray-200 text-red-700 rounded-md p-1 whitespace-nowrap">$
                                    <Tooltip placement="top" content={TOOLTIPS_DICT.GENERAL.CLICK_TO_COPY} color="invert">
                                        <span className="cursor-pointer" onClick={() => copyToClipboard('update.bat')}>update.bat</span>
                                    </Tooltip>
                                </span>
                            </li>
                        </ol>}
                    </div>
                </Modal >
            </div >
        )
    )
}