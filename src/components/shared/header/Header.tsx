
export default function Header() {
    const isDemo = false; // to be replaced with a check for demo mode
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
            </div>
            <div className="flex items-center">

            </div>
        </header>
    )
}