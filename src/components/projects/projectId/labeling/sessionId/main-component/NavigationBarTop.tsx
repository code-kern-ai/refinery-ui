import { selectUser } from "@/src/reduxStore/states/general";
import { selectAvailableLinks, selectDisplayUserRole, selectSelectedLink, selectUserDisplayId, selectUserIconsData, setAvailableLinks, setHoverGroupDict, setSelectedLink, setUserDisplayId } from "@/src/reduxStore/states/pages/labeling";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { LabelingLinkType, NavigationBarTopProps, UserType } from "@/src/types/components/projects/projectId/labeling/labeling-main-component";
import { UserRole } from "@/src/types/shared/sidebar";
import { SessionManager } from "@/src/util/classes/labeling/session-manager";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { Tooltip } from "@nextui-org/react";
import { IconArrowLeft, IconArrowRight, IconCircle, IconStar } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import style from '@/src/styles/components/projects/projectId/labeling.module.css';
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { useEffect } from "react";
import { parseLinkFromText } from "@/src/util/shared/link-parser-helper";
import { getAvailableLinks } from "@/src/services/base/labeling";

export default function NavigationBarTop(props: NavigationBarTopProps) {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const user = useSelector(selectUser);
    const availableLinks = useSelector(selectAvailableLinks);
    const selectedLink = useSelector(selectSelectedLink);
    const userIconsData = useSelector(selectUserIconsData);
    const displayId = useSelector(selectUserDisplayId);
    const userDisplayRole = useSelector(selectDisplayUserRole);

    useEffect(() => {
        if (userDisplayRole?.role == UserRole.ENGINEER || !SessionManager.labelingLinkData) return;
        const heuristicId = SessionManager.labelingLinkData.linkType == LabelingLinkType.HEURISTIC ? SessionManager.labelingLinkData.huddleId : null;
        getAvailableLinks(projectId, userDisplayRole?.role, heuristicId, (result) => {
            const availableLinks = result['data']['availableLinks'];
            dispatch(setAvailableLinks(availableLinks));
            const linkRoute = router.asPath.split("?")[0];
            dispatch(setSelectedLink(availableLinks.find(link => link.link.split("?")[0] == linkRoute)));
        });
    }, [SessionManager.labelingLinkData, userDisplayRole]);

    function goToRecordIde() {
        const sessionId = router.query.sessionId as string;
        const pos = router.query.pos as string;
        router.push(`/projects/${projectId}/record-ide/${sessionId}?pos=${pos}`);
    }

    function previousRecord() {
        SessionManager.previousRecord();
        router.push(`/projects/${projectId}/labeling/${SessionManager.labelingLinkData.huddleId}?pos=${SessionManager.huddleData.linkData.requestedPos}&type=${SessionManager.huddleData.linkData.linkType}`);
    }

    function nextRecord() {
        SessionManager.nextRecord();
        router.push(`/projects/${projectId}/labeling/${SessionManager.labelingLinkData.huddleId}?pos=${SessionManager.huddleData.linkData.requestedPos}&type=${SessionManager.huddleData.linkData.linkType}`);
    }

    function dropdownSelectLink(option: any) {
        dispatch(setSelectedLink(option));
        const linkData = parseLinkFromText(option.link);
        router.push(`${linkData.route}?pos=${linkData.queryParams.pos}&type=${linkData.queryParams.type}`)
    }

    return (<>
        {user && <div className="w-full px-4 border-gray-200 border-b h-16">
            <div className="relative flex-shrink-0 bg-white shadow-sm flex justify-between items-center h-full">
                <div className="flex flex-row flex-nowrap items-center">
                    {user.role == UserRole.ENGINEER && userDisplayRole == UserRole.ENGINEER ? (<>
                        <div className="flex justify-center overflow-visible">
                            <Tooltip content={TOOLTIPS_DICT.LABELING.NAVIGATE_TO_DATA_BROWSER} placement="bottom" color="invert">
                                <button onClick={() => router.push(`/projects/${projectId}/data-browser`)}
                                    className="bg-white text-gray-700 text-xs font-semibold mr-3 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none">
                                    Data browser
                                </button>
                            </Tooltip>
                        </div>

                        <div className="flex justify-center overflow-visible">
                            <Tooltip content={TOOLTIPS_DICT.LABELING.NAVIGATE_TO_RECORD_IDE} placement="bottom" color="invert">
                                <button onClick={() => goToRecordIde()}
                                    className="bg-white text-gray-700 text-xs font-semibold mr-3 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none">
                                    Record IDE
                                </button>
                            </Tooltip>
                        </div>
                        {userIconsData.userIcons.length > 0 && <>
                            {userIconsData.showUserIcons && <div className="flex justify-center overflow-visible">
                                {userIconsData.userIcons.map((user) => (
                                    <Tooltip content={user.name} key={user.id} color="invert" placement="top" className="mr-3">
                                        {user.userType == UserType.REGISTERED ? (<div className={`w-8 h-8 flex cursor-pointer rounded-full justify-center items-center ${user.id == displayId ? 'opacity-100' : 'opacity-50'}`}
                                            onClick={() => dispatch(setUserDisplayId(user.id))}>
                                            <img src={`/refinery/avatars/${user.avatarUri}`} className="w-8 h-8" />
                                        </div>) : (<div className="w-8 h-8 cursor-pointer relative" onClick={() => dispatch(setUserDisplayId(user.id))}>
                                            {user.userType == UserType.GOLD && <div className="absolute -top-1 -bottom-1">
                                                <IconStar className={`w-full h-full ${user.id == displayId ? style.specialUserActive : style.specialUserInActive}`} />
                                            </div>}
                                            {user.userType == UserType.ALL && <div className="absolute top-0 left-0 right-0 bottom-0">
                                                <IconCircle className={`w-full h-full ${user.id == displayId ? style.specialUserActive : style.specialUserInActive}`} />
                                            </div>}
                                        </div>)}
                                    </Tooltip>
                                ))}
                            </div>}
                        </>}

                    </>) : (<div className="flex justify-center items-center overflow-visible">
                        <span className="mr-2"> Available Tasks:</span>
                        <KernDropdown options={availableLinks && availableLinks.length > 0 ? availableLinks : ['No links available']} disabled={availableLinks?.length == 0 || props.lockedLink}
                            buttonName={selectedLink ? selectedLink.name : 'Select slice'} selectedOption={(option: any) => dropdownSelectLink(option)} />
                    </div>)}
                </div>
                {props.absoluteWarning && <div className="left-0 right-0 flex items-center justify-center pointer-events-none top-4 z-100">
                    <span className="inline-flex items-center px-2 py-0.5 rounded font-medium bg-red-100 text-red-800">{props.absoluteWarning}</span>
                </div>}
                <div className="flex flex-row flex-nowrap items-center">
                    <div className="flex justify-center overflow-visible items-center">
                        <div className="text-sm leading-5 text-gray-500 flex-shrink-0 mr-3 my-3 inline-flex">
                            {SessionManager.positionString}&nbsp;
                            <Tooltip content={user.role == UserRole.ENGINEER && userDisplayRole == UserRole.ENGINEER ? TOOLTIPS_DICT.LABELING.REACH_END : TOOLTIPS_DICT.LABELING.CHANGE_SLICES} color="invert" placement="bottom" className="cursor-auto">
                                <span className="cursor-help underline filtersUnderline">
                                    {user.role == UserRole.ENGINEER ? ' current session' : ' current slice'}
                                </span>
                            </Tooltip>
                        </div>
                        <button onClick={previousRecord} disabled={SessionManager.prevDisabled}
                            className="bg-white text-gray-700 text-xs font-semibold mr-3 px-4 py-1.5 rounded-md border border-gray-300 whitespace-nowrap inline-flex items-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50">Prev
                            <kbd className="relative ml-1 inline-flex items-center border bg-white border-gray-200 rounded px-0.5 py-0.5 text-sm font-sans font-medium text-gray-400">
                                <IconArrowLeft className="w-4 h-4" />
                            </kbd>
                        </button>
                        <button onClick={nextRecord} disabled={SessionManager.nextDisabled}
                            className="bg-indigo-700 text-white text-xs font-semibold px-4 py-1.5 rounded-md cursor-pointer whitespace-nowrap inline-flex items-center hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">Next
                            <kbd className="relative ml-1 inline-flex items-center border bg-white border-gray-200 rounded px-0.5 py-0.5 text-sm font-sans font-medium text-gray-400">
                                <IconArrowRight className="w-4 h-4" />
                            </kbd>
                        </button>
                    </div>
                </div>
            </div>
        </div>}
    </>)
}