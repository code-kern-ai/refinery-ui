import { selectProject } from '@/src/reduxStore/states/project';
import { selectCurrentPage, selectIsAdmin, selectIsManaged, selectUser } from '@/src/reduxStore/states/general';
import { UserRole, VersionOverview } from '@/src/types/shared/sidebar';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { Tooltip } from '@nextui-org/react';
import { CurrentPage } from '@/src/types/shared/general';
import { useState } from 'react';
import AppSelectionDropdown from '@/submodules/react-components/components/AppSelectionDropdown';
import { ModalEnum } from '@/src/types/shared/modal';
import { closeModal, openModal } from '@/src/reduxStore/states/modal';
import { useLazyQuery } from '@apollo/client';
import { GET_HAS_UPDATES, GET_VERSION_OVERVIEW } from '@/src/services/gql/queries/config';
import { parseUTC } from '@/submodules/javascript-functions/date-parser';
import Modal from '../modal/Modal';
import LoadingIcon from '../loading/LoadingIcon';
import style from '@/src/styles/sidebar.module.css';
import { copyToClipboard } from '@/submodules/javascript-functions/general';

export default function Sidebar() {
    const dispatch = useDispatch();

    const user = useSelector(selectUser);
    const project = useSelector(selectProject);
    const currentPage = useSelector(selectCurrentPage);
    const isAdmin = useSelector(selectIsAdmin);
    const isManaged = useSelector(selectIsManaged);

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [hasUpdates, setHasUpdates] = useState(false);
    const [versionOverviewData, setVersionOverviewData] = useState<any>(null);
    const [openTab, setOpenTab] = useState(0);

    const [refetchVersionOverview] = useLazyQuery(GET_VERSION_OVERVIEW, { fetchPolicy: 'no-cache' });
    const [refetchHasUpdates] = useLazyQuery(GET_HAS_UPDATES, { fetchPolicy: 'no-cache' });

    const acceptButton = { buttonCaption: "How to update", useButton: !isManaged, emitFunction: () => { howToUpdate() } };
    const backButton = { buttonCaption: "Back", useButton: true, emitFunction: () => goBack() };


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

    function howToUpdate() {
        dispatch(closeModal(ModalEnum.VERSION_OVERVIEW));
        dispatch(openModal(ModalEnum.HOW_TO_UPDATE));
    }

    function goBack() {
        dispatch(closeModal(ModalEnum.HOW_TO_UPDATE));
        dispatch(openModal(ModalEnum.VERSION_OVERVIEW));
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
                                    <a href="/refinery/projects"
                                        className="inline-flex items-center p-2 rounded-full hover:bg-kernindigo-dark focus:outline-none">
                                        <Image
                                            width={40}
                                            height={40}
                                            src="/refinery/images/refinery-icon.png"
                                            alt="Kern AI"
                                        />
                                    </a>
                                </div>
                                <div>
                                    {project && project.id ? (<div>
                                        {user.role === UserRole.ENGINEER && <div
                                            className="flex items-center justify-center overflow-visible">
                                            <Tooltip placement="right" trigger="hover" color="invert" content="Overview">
                                                <div className={`relative z-50 ${project.numDataScaleUploaded == 0 ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'opacity-100 cursor-pointer'}`}>
                                                    <a rel="noopener noreferrer" href={`/refinery/projects/${project.id}/overview`}
                                                        className={`circle ${currentPage == CurrentPage.PROJECT_OVERVIEW ? 'text-kernpurple' : 'text-white'}`}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20"
                                                            fill="currentColor">
                                                            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                                                            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                                                        </svg>
                                                    </a>
                                                </div>
                                            </Tooltip>
                                        </div>}
                                        {user.role === UserRole.ENGINEER && <div
                                            className="flex items-center justify-center overflow-visible mt-10 2xl:mt-12">
                                            <Tooltip placement="right" trigger="hover" color="invert" content="Data Browser">
                                                <div className={`relative z-50 ${project.numDataScaleUploaded == 0 ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'opacity-100 cursor-pointer'}`}>
                                                    <a rel="noopener noreferrer" href={`/refinery/projects/${project.id}/data`}
                                                        className={`circle ${currentPage == CurrentPage.DATA_BROWSER ? 'text-kernpurple' : 'text-white'}`}>
                                                        <svg xmlns="http://www.w3.org/2000/svg"
                                                            className="icon icon-tabler icon-tabler-icons" width="24" height="24"
                                                            viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"
                                                            strokeLinecap="round" strokeLinejoin="round">
                                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                            <circle cx="6.5" cy="6.5" r="3.5"></circle>
                                                            <path d="M2.5 21h8l-4 -7z"></path>
                                                            <path d="M14 3l7 7"></path>
                                                            <path d="M14 10l7 -7"></path>
                                                            <path d="M14 14h7v7h-7z"></path>
                                                        </svg>
                                                    </a>
                                                </div>
                                            </Tooltip>
                                        </div>}
                                        <div className={`flex items-center justify-center overflow-visible ${user?.role == 'ENGINEER' ? 'mt-10 2xl:mt-12' : ''}`}>
                                            <Tooltip placement="right" trigger="hover" color="invert" content="Labeling">
                                                <div className={`relative z-50 ${project.numDataScaleUploaded == 0 ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'opacity-100 cursor-pointer'}`}>
                                                    <a rel="noopener noreferrer" href={`/refinery/projects/${project.id}/labeling`}
                                                        className={`circle ${currentPage == CurrentPage.LABELING ? 'text-kernpurple' : 'text-white'}`}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20"
                                                            fill="currentColor">
                                                            <path fillRule="evenodd"
                                                                d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                                                                clipRule="evenodd" />
                                                        </svg>
                                                    </a>
                                                </div>
                                            </Tooltip>
                                        </div>
                                        {user.role === UserRole.ENGINEER && <div
                                            className="flex items-center justify-center overflow-visible mt-10 2xl:mt-12">
                                            <Tooltip placement="right" trigger="hover" color="invert" content="Heuristics">
                                                <div className={`relative z-50 ${project.numDataScaleUploaded == 0 ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'opacity-100 cursor-pointer'}`}>
                                                    <a rel="noopener noreferrer" href={`/refinery/projects/${project.id}/heuristics`}
                                                        className={`circle ${currentPage == CurrentPage.HEURISTICS || currentPage == CurrentPage.LOOKUP_LISTS_OVERVIEW ? 'text-kernpurple' : 'text-white'}`}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20"
                                                            fill="currentColor">
                                                            <path
                                                                d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                                                        </svg>
                                                    </a>
                                                </div>
                                            </Tooltip>
                                        </div>}
                                        {user.role === UserRole.ENGINEER && <div
                                            className="flex items-center justify-center overflow-visible mt-10 2xl:mt-12">
                                            <Tooltip placement="right" trigger="hover" color="invert" content="Settings">
                                                <div className={`relative z-50 ${project.numDataScaleUploaded == 0 ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'opacity-100 cursor-pointer'}`}>
                                                    <a rel="noopener noreferrer" href={`/refinery/projects/${project.id}/settings`}
                                                        className={`circle ${currentPage == CurrentPage.SETTINGS ? 'text-kernpurple' : 'text-white'}`}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20"
                                                            fill="currentColor">
                                                            <path fillRule="evenodd"
                                                                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                                                                clipRule="evenodd" />
                                                        </svg>
                                                    </a>
                                                </div>
                                            </Tooltip>
                                        </div>}
                                        {isAdmin && <div
                                            className="flex items-center justify-center overflow-visible mt-10 2xl:mt-12">
                                            <Tooltip placement="right" trigger="hover" color="invert" content="Admin">
                                                <div className={`relative z-50 opacity-100 cursor-pointer`}>
                                                    <a rel="noopener noreferrer" href={`/refinery/projects/${project.id}/admin`}
                                                        className={`circle ${currentPage == CurrentPage.ADMIN_PAGE ? 'text-kernpurple' : 'text-white'}`}>
                                                        <svg xmlns="http://www.w3.org/2000/svg"
                                                            className="icon icon-tabler icon-tabler-user-circle" width="20" height="20"
                                                            viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"
                                                            strokeLinecap="round" strokeLinejoin="round">
                                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                            <circle cx="12" cy="12" r="9"></circle>
                                                            <circle cx="12" cy="10" r="3"></circle>
                                                            <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855">
                                                            </path>
                                                        </svg>
                                                    </a>
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
                                </div>

                                {user.role === UserRole.ENGINEER && !isManaged && <div className="flex items-center justify-center overflow-visible mt-10 2xl:mt-12">
                                    <Tooltip placement="right" trigger="hover" color="invert" content="Join our community">
                                        <div className="relative z-50">
                                            <a href="https://discord.com/invite/qf4rGCEphW" target="_blank" rel="noopener noreferrer"
                                                className="circle text-white">
                                                <svg xmlns="http://www.w3.org/2000/svg"
                                                    className="icon icon-tabler icon-tabler-brand-discord" width="24" height="24"
                                                    viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"
                                                    strokeLinecap="round" strokeLinejoin="round">
                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                    <circle cx="9" cy="12" r="1"></circle>
                                                    <circle cx="15" cy="12" r="1"></circle>
                                                    <path d="M7.5 7.5c3.5 -1 5.5 -1 9 0"></path>
                                                    <path d="M7 16.5c3.5 1 6.5 1 10 0"></path>
                                                    <path
                                                        d="M15.5 17c0 1 1.5 3 2 3c1.5 0 2.833 -1.667 3.5 -3c.667 -1.667 .5 -5.833 -1.5 -11.5c-1.457 -1.015 -3 -1.34 -4.5 -1.5l-1 2.5">
                                                    </path>
                                                    <path
                                                        d="M8.5 17c0 1 -1.356 3 -1.832 3c-1.429 0 -2.698 -1.667 -3.333 -3c-.635 -1.667 -.476 -5.833 1.428 -11.5c1.388 -1.015 2.782 -1.34 4.237 -1.5l1 2.5">
                                                    </path>
                                                </svg>
                                            </a>
                                        </div>
                                    </Tooltip>
                                </div>}
                            </div>
                            {!isFullScreen && <div className="flex items-center justify-center mt-10 2xl:mt-12">
                                <Tooltip placement="right" trigger="hover" color="invert" content="Maximize screen">
                                    <button onClick={openFullScreen}
                                        className="z-50 cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="text-white icon icon-tabler icon-tabler-maximize"
                                            width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"
                                            fill="none" strokeLinecap="round" strokeLinejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                            <path d="M4 8v-2a2 2 0 0 1 2 -2h2"></path>
                                            <path d="M4 16v2a2 2 0 0 0 2 2h2"></path>
                                            <path d="M16 4h2a2 2 0 0 1 2 2v2"></path>
                                            <path d="M16 20h2a2 2 0 0 0 2 -2v-2"></path>
                                        </svg>
                                    </button>
                                </Tooltip>
                            </div>}

                            {isFullScreen && <div className="flex items-center justify-center mt-10 2xl:mt-12">
                                <Tooltip placement="right" trigger="hover" color="invert" content="Minimize screen">
                                    <button onClick={closeFullScreen}
                                        className="z-50 cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="text-white icon icon-tabler icon-tabler-minimize"
                                            width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"
                                            fill="none" strokeLinecap="round" strokeLinejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                            <path d="M15 19v-2a2 2 0 0 1 2 -2h2"></path>
                                            <path d="M15 5v2a2 2 0 0 0 2 2h2"></path>
                                            <path d="M5 15h2a2 2 0 0 1 2 2v2"></path>
                                            <path d="M5 9h2a2 2 0 0 0 2 -2v-2"></path>
                                        </svg>
                                    </button>
                                </Tooltip>
                            </div>}

                            {isManaged && <div className="flex items-center justify-center mt-4">
                                <AppSelectionDropdown cockpit={true} gates={true} workflow={true}></AppSelectionDropdown>
                            </div>}

                            <div className="flex-shrink-0 flex pt-3 pb-10 justify-center">
                                <Tooltip placement="right" trigger="hover" color="invert" content="Version overview">
                                    <div onClick={requestVersionOverview} id="refineryVersion"
                                        className="z-50 tooltip tooltip-right cursor-pointer select-none text-white flex items-center">
                                        v1.12.0
                                        {hasUpdates && <Tooltip placement="right" trigger="hover" color="invert" content="Newer version available">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-alert-circle inline-block text-yellow-700 align-top ml-1"
                                                width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"
                                                fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                <circle cx="12" cy="12" r="9"></circle>
                                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                            </svg>
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
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
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
                                                    {service.remoteHasNewer && <Tooltip placement="right" trigger="hover" color="invert" content="Newer version available">
                                                        <svg xmlns="http://www.w3.org/2000/svg"
                                                            className="icon icon-tabler icon-tabler-alert-circle inline-block text-yellow-700 align-top"
                                                            width="20" height="20" viewBox="0 0 24 24" strokeWidth="2"
                                                            stroke="currentColor" fill="none" strokeLinecap="round"
                                                            strokeLinejoin="round">
                                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                            <circle cx="12" cy="12" r="9"></circle>
                                                            <line x1="12" y1="8" x2="12" y2="12"></line>
                                                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                                        </svg>
                                                    </Tooltip>}
                                                </div>
                                            </td>
                                            <td className="text-center px-3 py-2 text-sm text-gray-500">{service.parseDate}</td>
                                            <td className="text-center px-3 py-2 text-sm text-gray-500">
                                                <a href={service.link} target="_blank" rel="noopener noreferrer" className="h-4 w-4 m-auto block p-0">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 m-auto"
                                                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
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
                            <Tooltip placement="bottom" content="Linux/Mac" color="invert">
                                <span className="border-dotted">Bash users</span>
                            </Tooltip>
                        </div>
                        <div onClick={() => toggleTabs(1)}
                            className={`text-sm leading-5 font-medium mr-10 cursor-help py-3 ${openTab == 1 ? 'text-indigo-700 border-bottom' : 'text-gray-500'}`}>
                            <Tooltip placement="bottom" content="Installed refinery with pip" color="invert">
                                <span className="border-dotted">CLI users</span>
                            </Tooltip>
                        </div>
                        <div onClick={() => toggleTabs(2)}
                            className={`text-sm leading-5 font-medium mr-10 cursor-help py-3 ${openTab == 2 ? 'text-indigo-700 border-bottom' : 'text-gray-500'}`}>
                            <Tooltip placement="bottom" content="Windows terminal" color="invert">
                                <span className="border-dotted">cmd</span>
                            </Tooltip>
                        </div>
                        <div onClick={() => toggleTabs(3)}
                            className={`text-sm leading-5 font-medium mr-10 cursor-help py-3 ${openTab == 3 ? 'text-indigo-700 border-bottom' : 'text-gray-500'}`}>
                            <Tooltip placement="bottom" content="Windows from File Explorer" color="invert">
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
                                    <Tooltip placement="top" content="Click to copy" color="invert">
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
                                    <Tooltip placement="top" content="Click to copy" color="invert">
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
                                    <Tooltip placement="top" content="Click to copy" color="invert">
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
                                    <Tooltip placement="top" content="Click to copy" color="invert">
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