import { selectProject } from '@/src/reduxStore/states/project';
import { selectRouteColor, selectUser } from '@/src/reduxStore/states/general';
import { UserRole } from '@/src/types/shared/sidebar';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { Tooltip } from '@nextui-org/react';
import { useState } from 'react';
import AppSelectionDropdown from '@/submodules/react-components/components/AppSelectionDropdown';
import { useRouter } from 'next/router';
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants';
import { setProjectIdSampleProject } from '@/src/reduxStore/states/tmp';
import { MemoIconBulb, MemoIconChartPie, MemoIconMaximize, MemoIconMinimize, MemoIconSettings, MemoIconSitemapFilled, MemoIconTag, MemoIconTriangleSquareCircle } from '@/submodules/react-components/components/kern-icons/icons';

export default function Sidebar() {
    const router = useRouter();
    const dispatch = useDispatch();

    const user = useSelector(selectUser);
    const project = useSelector(selectProject);
    const routeColor = useSelector(selectRouteColor);

    const [isFullScreen, setIsFullScreen] = useState(false);

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
                                                <div className="relative z-50">
                                                    <a href={`/refinery/projects/${project.id}/overview`} onClick={(e: any) => { e.preventDefault(); router.push(`/projects/${project.id}/overview`) }}
                                                        className={`${project.numDataScaleUploaded == 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'} circle ${routeColor.overview.active ? 'text-kernpurple' : 'text-white'}`}>
                                                        <MemoIconChartPie className="w-6 h-6" />
                                                    </a>
                                                </div>
                                            </Tooltip>
                                        </div>}
                                        {user.role === UserRole.ENGINEER && <div
                                            className="flex items-center justify-center overflow-visible mt-9 2xl:mt-12">
                                            <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.DATA_BROWSER} className={`${project.numDataScaleUploaded == 0 ? 'pointer-events-none cursor-not-allowed' : 'cursor-pointer'}`}>
                                                <div className="relative z-50">
                                                    <a href={`/refinery/projects/${project.id}/data-browser`} onClick={(e: any) => { e.preventDefault(); router.push(`/projects/${project.id}/data-browser`) }}
                                                        className={`${project.numDataScaleUploaded == 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'} circle ${routeColor.data.active ? 'text-kernpurple' : 'text-white'}`}>
                                                        <MemoIconTriangleSquareCircle className="w-6 h-6" />
                                                    </a>
                                                </div>
                                            </Tooltip>
                                        </div>}
                                        <div className={`flex items-center justify-center overflow-visible ${user?.role == 'ENGINEER' ? 'mt-9 2xl:mt-12' : ''}`}>
                                            <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.LABELING} className={`${project.numDataScaleUploaded == 0 ? 'pointer-events-none cursor-not-allowed' : 'cursor-pointer'}`}>
                                                <div className="relative z-50">
                                                    <a href={`/refinery/projects/${project.id}/labeling`} onClick={(e: any) => { e.preventDefault(); router.push(`/projects/${project.id}/labeling`) }}
                                                        className={`${project.numDataScaleUploaded == 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'} circle ${routeColor.labeling.active ? 'text-kernpurple' : 'text-white'}`}>
                                                        <MemoIconTag className="w-6 h-6" />
                                                    </a>
                                                </div>
                                            </Tooltip>
                                        </div>
                                        {user.role === UserRole.ENGINEER && <div
                                            className="flex items-center justify-center overflow-visible mt-9 2xl:mt-12">
                                            <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.HEURISTICS} className={`${project.numDataScaleUploaded == 0 ? 'pointer-events-none cursor-not-allowed' : 'cursor-pointer'}`}>
                                                <div className="relative z-50">
                                                    <a href={`/refinery/projects/${project.id}/heuristics`} onClick={(e: any) => { e.preventDefault(); router.push(`/projects/${project.id}/heuristics`) }}
                                                        className={`${project.numDataScaleUploaded == 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'} circle ${routeColor.heuristics.active ? 'text-kernpurple' : 'text-white'}`}>
                                                        <MemoIconBulb className="w-6 h-6" />
                                                    </a>
                                                </div>
                                            </Tooltip>
                                        </div>}
                                        {user.role === UserRole.ENGINEER && <div
                                            className="flex items-center justify-center overflow-visible mt-9 2xl:mt-12">
                                            <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.SETTINGS}>
                                                <div className="relative z-50">
                                                    <a href={`/refinery/projects/${project.id}/settings`} onClick={(e: any) => { e.preventDefault(); router.push(`/projects/${project.id}/settings`) }}
                                                        className={`circle ${routeColor.settings.active ? 'text-kernpurple' : 'text-white'}`}>
                                                        <MemoIconSettings className="w-6 h-6" />
                                                    </a>
                                                </div>
                                            </Tooltip>
                                        </div>}
                                        {user.role === UserRole.ENGINEER && <div
                                            className="flex items-center justify-center overflow-visible mt-9 2xl:mt-12">
                                            <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.DATA_BLOCKS}>
                                                <div className="relative z-50">
                                                    <a href={`/refinery/projects/${project.id}/data-blocks`} onClick={(e: any) => { e.preventDefault(); router.push(`/projects/${project.id}/data-blocks`) }}
                                                        className={`circle ${routeColor.dataBlocks.active ? 'text-kernpurple' : 'text-white'}`}>
                                                        <MemoIconSitemapFilled className="w-6 h-6" />
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
                            </div>
                            {!isFullScreen && <div className="flex items-center justify-center mt-9 2xl:mt-12">
                                <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.MAXIMIZE_SCREEN}>
                                    <button onClick={openFullScreen}
                                        className="z-50 cursor-pointer">
                                        <MemoIconMaximize className="text-white" />
                                    </button>
                                </Tooltip>
                            </div>}

                            {isFullScreen && <div className="flex items-center justify-center mt-9 2xl:mt-12">
                                <Tooltip placement="right" trigger="hover" color="invert" content={TOOLTIPS_DICT.SIDEBAR.MINIMIZE_SCREEN}>
                                    <button onClick={closeFullScreen}
                                        className="z-50 cursor-pointer">
                                        <MemoIconMinimize className="text-white" />
                                    </button>
                                </Tooltip>
                            </div>}

                            <div className="flex items-center justify-center mt-4">
                                <AppSelectionDropdown cognition={true}></AppSelectionDropdown>
                            </div>

                            <div className="flex-shrink-0 flex pt-3 justify-center">
                                <div id="refineryVersion"
                                    className="z-50 tooltip tooltip-right select-none text-white flex items-center mr-1">
                                    v1.23.0
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        )
    )
}