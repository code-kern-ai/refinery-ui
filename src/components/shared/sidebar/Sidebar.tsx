import { selectProject } from '@/src/reduxStore/states/project';
import { selectUser } from '@/src/reduxStore/states/general';
import { UserRole } from '@/src/types/shared/sidebar';
import Image from 'next/image';
import { useSelector } from 'react-redux';

export default function Sidebar() {
    const user = useSelector(selectUser);
    const project = useSelector(selectProject);

    return (
        user ? (
            <div className="h-screen flex bg-gray-50 overflow-visible">
                <div className="flex overflow-visible">
                    <div className="flex flex-col w-20 overflow-visible">
                        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-kernindigo overflow-initial">
                            <div className="flex-1 flex flex-col">
                                <div className="flex-shrink-0 bg-kernindigo pt-4 pb-10 flex items-center justify-center">
                                    <a
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
                                        {user.role === UserRole.ENGINEER ? (
                                            <></>) : (<></>)}
                                    </div>) : (<></>)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <></>
        )

    )
}