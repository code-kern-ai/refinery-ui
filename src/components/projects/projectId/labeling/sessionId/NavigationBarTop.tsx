import { selectUser } from "@/src/reduxStore/states/general";
import { selectAvailableLinks, selectSelectedLink, selectUserIconsData, setSelectedLink } from "@/src/reduxStore/states/pages/labeling";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { UserType } from "@/src/types/components/projects/projectId/labeling/labeling-general";
import { UserRole } from "@/src/types/shared/sidebar";
import { SessionManager } from "@/src/util/classes/labeling/session-manager";
import { UserManager } from "@/src/util/classes/labeling/user-manager";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { Tooltip } from "@nextui-org/react";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import style from '@/src/styles/components/projects/projectId/labeling.module.css';
import { use, useEffect } from "react";

export default function NavigationBarTop() {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const user = useSelector(selectUser);
    const availableLinks = useSelector(selectAvailableLinks);
    const selectedLink = useSelector(selectSelectedLink);
    const userIconsData = useSelector(selectUserIconsData);

    function goToRecordIde() {
        const sessionId = SessionManager.labelingLinkData.huddleId;
        const pos = SessionManager.labelingLinkData.requestedPos;
        router.push(`/projects/${projectId}/record-ide/${sessionId}?pos=${pos}`);
    }

    function previousRecord() {
        // TODO: add init for record
        SessionManager.previousRecord();
        router.push(`/projects/${projectId}/labeling/${SessionManager.labelingLinkData.huddleId}?pos=${SessionManager.huddleData.linkData.requestedPos}&type=${SessionManager.huddleData.linkData.linkType}`);
    }

    function nextRecord() {
        // todo: add init for record
        SessionManager.nextRecord();
        router.push(`/projects/${projectId}/labeling/${SessionManager.labelingLinkData.huddleId}?pos=${SessionManager.huddleData.linkData.requestedPos}&type=${SessionManager.huddleData.linkData.linkType}`);
    }

    return (<>
        {user && <div className="w-full px-4 border-gray-200 border-b h-16">
            <div className="relative flex-shrink-0 bg-white shadow-sm flex justify-between items-center h-full">
                <div className="flex flex-row flex-nowrap items-center">
                    {user.role == UserRole.ENGINEER ? (<>
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
                                {userIconsData.userIcons.map((user, index) => (
                                    <Tooltip content={user.name} key={user.id} color="invert" placement="top" className="mr-3">
                                        {user.userType == UserType.REGISTERED ? (<div className="w-8 h-8 flex cursor-pointer rounded-full justify-center items-center" onClick={() => UserManager.displayUserId = user.id}>
                                            <img src={`/refinery/avatars/${user.avatarUri}`} className="w-8 h-8" />
                                        </div>) : (<div className="w-8 h-8 cursor-pointer relative" onClick={() => UserManager.displayUserId = user.id}>
                                            {user.userType == UserType.GOLD && <div className="absolute -top-1 -left-1 -right-1 -bottom-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`w-full h-full relative top-1 left-1 ${user.active ? style.specialUserActive : style.specialUserInActive}`} viewBox="0 0 24 24" stroke-width="2">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </div>}
                                            {user.userType == UserType.ALL && <div className="absolute top-0 left-0 right-0 bottom-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`w-full h-full ${user.active ? style.specialUserActive : style.specialUserInActive}`} viewBox="0 0 24 24" stroke-width="2">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </div>}
                                        </div>)}
                                    </Tooltip>
                                ))}
                            </div>}
                        </>}

                    </>) : (<div className="flex justify-center items-center overflow-visible">
                        <span className="mr-2"> Available Tasks:</span>
                        <Dropdown options={availableLinks?.length > 0 ? availableLinks : ['No links available']} disabled={availableLinks?.length == 0}
                            buttonName={selectedLink ? selectedLink.name : 'Select slice'} selectedOption={(option: string) => dispatch(setSelectedLink(option))} />
                    </div>)}
                </div>
                <div className="flex flex-row flex-nowrap items-center">
                    <div className="flex justify-center overflow-visible items-center">
                        <div className="text-sm leading-5 text-gray-500 flex-shrink-0 mr-3 my-3">
                            <Tooltip content={user.role == UserRole.ENGINEER ? TOOLTIPS_DICT.LABELING.REACH_END : TOOLTIPS_DICT.LABELING.CHANGE_SLICES} color="invert" placement="bottom" className="cursor-auto">
                                {SessionManager.positionString + " "}<span className="cursor-help underline filtersUnderline">
                                    {user.role == UserRole.ENGINEER ? 'current session' : 'current slice'}
                                </span>
                            </Tooltip>
                        </div>
                        <Tooltip content={TOOLTIPS_DICT.LABELING.ARROW_LEFT} color="invert" placement="left">
                            <button onClick={previousRecord} disabled={SessionManager.prevDisabled}
                                className="bg-white text-gray-700 text-xs font-semibold mr-3 px-4 py-1.5 rounded-md border border-gray-300 whitespace-nowrap inline-flex items-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50">Prev
                                <kbd className="relative ml-1 inline-flex items-center border bg-white border-gray-200 rounded px-0.5 py-0.5 text-sm font-sans font-medium text-gray-400">
                                    <IconArrowLeft className="w-4 h-4" />
                                </kbd>
                            </button>
                        </Tooltip>
                        <Tooltip content={TOOLTIPS_DICT.LABELING.ARROW_RIGHT} color="invert" placement="left">
                            <button onClick={nextRecord} disabled={SessionManager.nextDisabled}
                                className="bg-indigo-700 text-white text-xs font-semibold px-4 py-1.5 rounded-md cursor-pointer whitespace-nowrap inline-flex items-center hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">Next
                                <kbd className="relative ml-1 inline-flex items-center border bg-white border-gray-200 rounded px-0.5 py-0.5 text-sm font-sans font-medium text-gray-400">
                                    <IconArrowRight className="w-4 h-4" />
                                </kbd>
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </div>}
    </>)
}