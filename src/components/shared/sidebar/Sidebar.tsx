import { selectProject } from '@/src/reduxStore/states/project';
import { selectIsAdmin, selectIsManaged, selectRouteColor, selectUser } from '@/src/reduxStore/states/general';
import { UserRole } from '@/src/types/shared/sidebar';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { Tooltip } from '@nextui-org/react';
import { useState } from 'react';
import AppSelectionDropdown from '@/submodules/react-components/components/AppSelectionDropdown';
import { ModalEnum } from '@/src/types/shared/modal';
import { openModal } from '@/src/reduxStore/states/modal';
import { IconAlertCircle, IconApi, IconBrandDiscord, IconBulb, IconChartPie, IconClipboard, IconMaximize, IconMinimize, IconTag, IconTriangleSquareCircle, IconUserCircle } from '@tabler/icons-react';
import { IconSettings } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants';
import { CacheEnum, selectCachedValue } from '@/src/reduxStore/states/cachedValues';
import VersionOverviewModal from './VersionOverviewModal';
import HowToUpdateModal from './HowToUpdateModal';
import { setProjectIdSampleProject } from '@/src/reduxStore/states/tmp';
import { getHasUpdates } from '@/src/services/base/misc';

export default function Sidebar() {
    const router = useRouter();
    const dispatch = useDispatch();

    const user = useSelector(selectUser);
    const project = useSelector(selectProject);
    const isAdmin = useSelector(selectIsAdmin);
    const isManaged = useSelector(selectIsManaged);
    const routeColor = useSelector(selectRouteColor);
    const versionOverviewData = useSelector(selectCachedValue(CacheEnum.VERSION_OVERVIEW));

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [hasUpdates, setHasUpdates] = useState(false);

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
        if (versionOverviewData) {
            getHasUpdates(res => {
                setHasUpdates(res.data["hasUpdates"]);
            });
        }
    }

    return (
        user && (
            <div className="h-screen flex bg-gray-50 overflow-visible">
                <div className="flex overflow-visible">
                    <div className="flex flex-col w-20 overflow-visible">
                        <div className="flex-1 flex flex-col min-h-0 bg-kernindigo overflow-initial" style={{ zIndex: 100 }}>
                            <div className="flex-1 flex flex-col">
                                <div className="flex-shrink-0 bg-kernindigo pt-4 pb-10 flex items-center justify-center">
                                    <a href='/refinery/projects' onClick={(e: any) => { e.preventDefault(); dispatch(setProjectIdSampleProject(null)); router.push('/projects') }}
                                        className="inline-flex items-center p-2 rounded-full hover:bg-kernindigo-dark focus:outline-none">
                                        <Image
                                            width={40}
                                            height={40}
                                            src="/refinery/images/refinery-icon.png"
                                            alt="Kern AI"
                                            priority={true}
                                        />
                                    </a>
                                </div>
                                <div>
                                    {(project && project.id && routeColor) ? (<div>
                                        {user.role === UserRole.ENGINEER && <div
                                            className="flex items-center justify-center overflow-visible">
                                            <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.OVERVIEW} className={`${project.numDataScaleUploaded == 0 ? 'pointer-events-none cursor-not-allowed' : 'cursor-pointer'}`}>
                                                <div className={`relative z-50`}>
                                                    <a href={`/refinery/projects/${project.id}/overview`} onClick={(e: any) => { e.preventDefault(); router.push(`/projects/${project.id}/overview`) }}
                                                        className={`${project.numDataScaleUploaded == 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'} circle ${routeColor.overview.active ? 'text-kernpurple' : 'text-white'}`}>
                                                        <IconChartPie className="w-6 h-6" />
                                                    </a>
                                                </div>
                                            </Tooltip>
                                        </div>}
                                        {user.role === UserRole.ENGINEER && <div
                                            className="flex items-center justify-center overflow-visible mt-9 2xl:mt-12">
                                            <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.DATA_BROWSER} className={`${project.numDataScaleUploaded == 0 ? 'pointer-events-none cursor-not-allowed' : 'cursor-pointer'}`}>
                                                <div className={`relative z-50`}>
                                                    <a href={`/refinery/projects/${project.id}/data-browser`} onClick={(e: any) => { e.preventDefault(); router.push(`/projects/${project.id}/data-browser`) }}
                                                        className={`${project.numDataScaleUploaded == 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'} circle ${routeColor.data.active ? 'text-kernpurple' : 'text-white'}`}>
                                                        <IconTriangleSquareCircle className="w-6 h-6" />
                                                    </a>
                                                </div>
                                            </Tooltip>
                                        </div>}
                                        <div className={`flex items-center justify-center overflow-visible ${user?.role == 'ENGINEER' ? 'mt-9 2xl:mt-12' : ''}`}>
                                            <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.LABELING} className={`${project.numDataScaleUploaded == 0 ? 'pointer-events-none cursor-not-allowed' : 'cursor-pointer'}`}>
                                                <div className={`relative z-50`}>
                                                    <a href={`/refinery/projects/${project.id}/labeling`} onClick={(e: any) => { e.preventDefault(); router.push(`/projects/${project.id}/labeling`) }}
                                                        className={`${project.numDataScaleUploaded == 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'} circle ${routeColor.labeling.active ? 'text-kernpurple' : 'text-white'}`}>
                                                        <IconTag className="w-6 h-6" />
                                                    </a>
                                                </div>
                                            </Tooltip>
                                        </div>
                                        {user.role === UserRole.ENGINEER && <div
                                            className="flex items-center justify-center overflow-visible mt-9 2xl:mt-12">
                                            <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.HEURISTICS} className={`${project.numDataScaleUploaded == 0 ? 'pointer-events-none cursor-not-allowed' : 'cursor-pointer'}`}>
                                                <div className={`relative z-50`}>
                                                    <a href={`/refinery/projects/${project.id}/heuristics`} onClick={(e: any) => { e.preventDefault(); router.push(`/projects/${project.id}/heuristics`) }}
                                                        className={`${project.numDataScaleUploaded == 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'} circle ${routeColor.heuristics.active ? 'text-kernpurple' : 'text-white'}`}>
                                                        <IconBulb className="w-6 h-6" />
                                                    </a>
                                                </div>
                                            </Tooltip>
                                        </div>}
                                        {user.role === UserRole.ENGINEER && <div
                                            className="flex items-center justify-center overflow-visible mt-9 2xl:mt-12">
                                            <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.SETTINGS}>
                                                <div className={`relative z-50`}>
                                                    <a href={`/refinery/projects/${project.id}/settings`} onClick={(e: any) => { e.preventDefault(); router.push(`/projects/${project.id}/settings`) }}
                                                        className={`circle ${routeColor.settings.active ? 'text-kernpurple' : 'text-white'}`}>
                                                        <IconSettings className="w-6 h-6" />
                                                    </a>
                                                </div>
                                            </Tooltip>
                                        </div>}
                                        {(isAdmin && isManaged) && <div
                                            className="flex items-center justify-center overflow-visible mt-9 2xl:mt-12">
                                            <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.ADMIN} className={`${project.numDataScaleUploaded == 0 ? 'pointer-events-none cursor-not-allowed' : 'cursor-pointer'}`}>
                                                <div className={`relative z-50 opacity-100 cursor-pointer`}>
                                                    <a href={`/refinery/projects/${project.id}/admin`} onClick={(e: any) => { e.preventDefault(); router.push(`/projects/${project.id}/admin`) }}
                                                        className={`${project.numDataScaleUploaded == 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'} circle ${routeColor.admin.active ? 'text-kernpurple' : 'text-white'}`}>
                                                        <IconUserCircle className="w-6 h-6" />
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
                                    {user.role == UserRole.ENGINEER && <>
                                        {!isManaged && <div className={`flex items-center justify-center overflow-visible ${project?.id !== undefined ? 'mt-6' : ''}`}>
                                            <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.DOCUMENTATION} className="relative z-50">
                                                <a href="https://docs.kern.ai/" target="_blank" rel="noopener noreferrer" className="circle text-white">
                                                    <IconClipboard className="w-6 h-6" />
                                                </a>
                                            </Tooltip>
                                        </div>}
                                    </>}
                                    <div className={`flex items-center justify-center overflow-visible ${isManaged ? (project?.id !== undefined ? 'mt-6' : '') : 'mt-9 2xl:mt-12'}`}>
                                        <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.API} className="relative z-50">
                                            <a href="https://github.com/code-kern-ai/kern-python" target="_blank"
                                                rel="noopener noreferrer" className="circle text-white">
                                                <IconApi className="w-6 h-6" />
                                            </a>
                                        </Tooltip>
                                    </div>
                                </div>

                                {user.role === UserRole.ENGINEER && !isManaged && <div className="flex items-center justify-center overflow-visible mt-9 2xl:mt-12">
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
                            {!isFullScreen && <div className="flex items-center justify-center mt-9 2xl:mt-12">
                                <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.MAXIMIZE_SCREEN}>
                                    <button onClick={openFullScreen}
                                        className="z-50 cursor-pointer">
                                        <IconMaximize className="text-white" />
                                    </button>
                                </Tooltip>
                            </div>}

                            {isFullScreen && <div className="flex items-center justify-center mt-9 2xl:mt-12">
                                <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.MINIMIZE_SCREEN}>
                                    <button onClick={closeFullScreen}
                                        className="z-50 cursor-pointer">
                                        <IconMinimize className="text-white" />
                                    </button>
                                </Tooltip>
                            </div>}

                            {isManaged && <div className="flex items-center justify-center mt-4">
                                <AppSelectionDropdown cockpit={true} gates={true}></AppSelectionDropdown>
                            </div>}

                            <div className="flex-shrink-0 flex pt-3 justify-center">
                                <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.VERSION_OVERVIEW}>
                                    <div onClick={requestVersionOverview} id="refineryVersion"
                                        className="z-50 tooltip tooltip-right cursor-pointer select-none text-white flex items-center mr-1">
                                        v1.16.0
                                        {hasUpdates && <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.NEWER_VERSION_AVAILABLE} >
                                            <IconAlertCircle className="h-5 w-5 text-yellow-700" />
                                        </Tooltip>}
                                    </div>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>
                <VersionOverviewModal />
                <HowToUpdateModal />
            </div >
        )
    )
}