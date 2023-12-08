import Header from "../header/Header";
import Sidebar from "../sidebar/Sidebar";

export default function Layout({ children }) {

    return (
        <>
            <div className="h-screen bg-gray-100 flex overflow-hidden">
                <Sidebar />
                <div className="h-full w-full flex-1 flex flex-col">
                    <Header />
                    <div className="block flex-grow h-full w-full bg-gray-100">
                        <main>{children}</main>
                    </div>
                </div>
            </div>
            <div className="absolute flex flex-col z-50 bottom-0 left-24 mb-7 cursor-pointer content-start" id="notifications">

            </div>
        </>
    )
}