import { selectCurrentPage, selectIsDemo, selectIsManaged, selectOrganization, selectUser } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/src/types/shared/general";
import { UserRole } from "@/src/types/shared/sidebar";
import { Tooltip } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import style from "../../../styles/header.module.css"
import LogoutDropdown from "./LogoutDropdown";
import { useRouter } from "next/router";

export default function Header() {
    const router = useRouter();

    const isDemo = useSelector(selectIsDemo);
    const isManaged = useSelector(selectIsManaged);
    const currentPage = useSelector(selectCurrentPage);
    const organization = useSelector(selectOrganization);
    const user = useSelector(selectUser);

    const [organizationInactive, setOrganizationInactive] = useState(null);

    useEffect(() => {
        setOrganizationInactive(organization == null);
    }, [organization]);

    return (
        <header className="sticky top-0 z-50 w-full">
            <div className="relative z-10 flex-shrink-0 h-16 bg-white border-b border-gray-200 shadow-sm flex justify-between items-center">
                {isDemo ? (<div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center pointer-events-none">
                    <span className="inline-flex items-center px-2 py-0.5 rounded font-medium bg-red-100 text-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-play-card mr-2" width="24"
                            height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <rect transform="rotate(90 12 12)" x="3" y="5" width="18" height="14" rx="2"></rect>
                            <line x1="8" y1="6" x2="8.01" y2="6"></line>
                            <line x1="16" y1="18" x2="16.01" y2="18"></line>
                            <path d="M12 16l-3 -4l3 -4l3 4z"></path>
                        </svg>
                        Demo Playground - Everything will be reset on the hour
                    </span>
                </div>) : (<></>)}
                <div className="flex items-center">
                    {currentPage == CurrentPage.PROJECTS ? (<div className="ml-6 text-gray-500 text-sm font-normal">
                        {!organizationInactive && <> Welcome, <span className="font-bold text-gray-900">{user?.firstName}</span>! See your projects at <span className="font-bold text-gray-900">{organization?.name}</span>.</>}
                        {organizationInactive && <> Welcome, <span className="font-bold text-gray-900">{user?.firstName}</span>! {!isManaged ? 'Switch to your main account to continue labeling...' : 'You are currently on the waitlist.'}
                        </>}
                    </div>) : (<></>)}
                    {currentPage == CurrentPage.NEW_PROJECT && <div className="ml-6 text-gray-500 text-sm font-normal">
                        Add a new project to <span className="font-bold text-gray-900">{organization?.name}</span>.
                    </div>}
                </div>
                <div className="flex flex-row flex-nowrap items-center">
                    <div className="flex items-center justify-center">
                        <Tooltip placement="left" trigger="hover" color="invert" content="Home page - Projects" >
                            <a className="flex mr-6" onClick={() => router.push('/projects')}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-home" width="24"
                                    height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"
                                    strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <polyline points="5 12 3 12 12 3 21 12 19 12"></polyline>
                                    <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"></path>
                                    <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"></path>
                                </svg>
                            </a>
                        </Tooltip>
                    </div>
                    {user?.role == UserRole.ENGINEER ? (
                        <div className="flex items-center justify-center">
                            <Tooltip placement="left" trigger="hover" color="invert" content="Home page - Users">
                                <a className="flex mr-6" onClick={() => router.push('/users')}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-hexagons" width="24"
                                        height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"
                                        strokeLinecap="round" strokeLinejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                        <path d="M4 18v-5l4 -2l4 2v5l-4 2z"></path>
                                        <path d="M8 11v-5l4 -2l4 2v5"></path>
                                        <path d="M12 13l4 -2l4 2v5l-4 2l-4 -2"></path>
                                    </svg>
                                </a>
                            </Tooltip>
                        </div>
                    ) : (<></>)}
                    <div className="flex items-center justify-center">
                        {/* TODO: Add comments here */}
                    </div>
                    <div className="flex items-center justify-center">
                        {/* TODO: Add notifications here */}
                    </div>
                    {user?.role == UserRole.ENGINEER ? (
                        <div className="flex items-center justify-center">
                            <div className={`${style.widget} ${style.widgetLg}`}><a className={style.btnx} href="https://github.com/code-kern-ai/refinery"
                                rel="noopener" target="_blank" aria-label="Star code-kern-ai/refinery on GitHub"><svg
                                    viewBox="0 0 16 16" width="16" height="16" className="octicon octicon-star" aria-hidden="true">
                                    <path fillRule="evenodd"
                                        d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z">
                                    </path>
                                </svg>&nbsp;<span>Star on GitHub</span></a></div>
                        </div>
                    ) : (<></>)}
                    <LogoutDropdown />
                </div>
            </div >

        </header >
    )
}