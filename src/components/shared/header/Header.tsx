import { selectUser } from "@/src/reduxStore/states/general";
import { UserRole } from "@/src/types/shared/sidebar";
import { Tooltip } from "@nextui-org/react";
import { useSelector } from "react-redux";

export default function Header() {
    const isDemo = false; // TODO: to be replaced with a check for demo mode
    const user = useSelector(selectUser);

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

                </div>
                <div className="flex flex-row flex-nowrap items-center">
                    <div className="flex items-center justify-center">
                        <Tooltip placement="left" trigger="hover" color="invert" content="Home page - Projects" >
                            <a className="flex mr-6">
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
                        {user?.role == UserRole.ENGINEER ? (
                            <div className="flex items-center justify-center">
                                <Tooltip placement="left" trigger="hover" color="invert" content="Home page - Users">
                                    <a className="flex mr-6 tooltip tooltip-left" data-tip="Home page - Users">
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

                    </div>
                </div>
            </div >

        </header >
    )
}