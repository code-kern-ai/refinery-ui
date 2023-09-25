import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useMutation } from '@apollo/client';
import { CREATE_SAMPLE_PROJECT } from '@/src/services/gql/queries/projects';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { extendAllProjects, selectAllProjects } from '@/src/reduxStore/states/project';
import { ModalEnum } from '@/src/types/shared/modal';
import { closeModal, openModal } from '@/src/reduxStore/states/modal';
import Modal from '../shared/modal/Modal';

export default function SampleProjectsDropdown() {
    const router = useRouter();
    const dispatch = useDispatch();
    const projects = useSelector(selectAllProjects);

    const [createSampleProjectMut] = useMutation(CREATE_SAMPLE_PROJECT);
    const [projectNameInput, setProjectNameInput] = useState<string>("");
    const [projectTypeInput, setProjectTypeInput] = useState<string>("");
    const [checkIfProjectNameExists, setCheckIfProjectNameExists] = useState<boolean>(false);
    const acceptButton = { buttonCaption: "Create", closeAfterClick: false, useButton: true, disabled: false, emitFunction: () => { importSampleProject() } }


    function importSampleProject(projectName?: string, projectType?: string) {
        const checkIfProjectExists = projects.find((project) => project.name === projectName);
        if (checkIfProjectExists) {
            setProjectNameInput(projectName);
            setProjectTypeInput(projectType);
            setCheckIfProjectNameExists(true);
            dispatch(openModal(ModalEnum.SAMPLE_PROJECT_TITLE));
            return;
        }
        if (projectNameInput == "" && projectName == "") return;
        const projectNameFinal = projectName ? projectName : projectNameInput;
        const projectTypeFinal = projectType ? projectType : projectTypeInput;
        createSampleProjectMut({ variables: { name: projectNameFinal, projectType: projectTypeFinal } }).then((res) => {
            const project = res.data.createSampleProject['project'];
            dispatch(extendAllProjects(project));
            dispatch(closeModal(ModalEnum.SAMPLE_PROJECT_TITLE));
            if (router.pathname.includes("/projects")) {
                router.push(`/projects/${project.id}/overview`);
            }
        });
    }

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className={`inline-flex justify-between items-center bg-blue-700 text-white text-xs font-semibold ml-6 mt-6 mr-6 xs:mr-0 px-4 py-2 rounded-md cursor-pointer hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                    Sample projects
                    <ChevronDownIcon
                        className="-mr-1 ml-2 h-5 w-5"
                        aria-hidden="true"
                    />
                </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute w-max z-10 mt-2 origin-top-left rounded-md ml-6 bg-white shadow-sm ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <a key="sample-project-1" style={{ borderBottom: '1px dashed #e2e8f0' }}
                                    className={`opacity-100 cursor-pointer text-gray-900 block px-3 py-2 text-sm ${active ? "bg-kernindigo text-white" : ""}`}
                                    onClick={() => {
                                        importSampleProject("Clickbait", "Clickbait");
                                    }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-fish-hook inline-block"
                                        width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"
                                        strokeLinecap="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                        <path d="M16 9v6a5 5 0 0 1 -10 0v-4l3 3"></path>
                                        <circle cx="16" cy="7" r="2"></circle>
                                        <path d="M16 5v-2"></path>
                                    </svg>
                                    <span className="ml-2">Clickbait</span>
                                    <div className="mt-2">Binary classification for detecting nudging articles.</div>
                                </a>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <a key="sample-project-2" style={{ borderBottom: '1px solid #e2e8f0' }}
                                    className={`opacity-100 cursor-pointer text-gray-900 block px-3 py-2 text-sm ${active ? "bg-kernindigo text-white" : ""}`}
                                    onClick={() => {
                                        importSampleProject("Clickbait - initial", "Clickbait - initial");
                                    }} >
                                    <span>Initial (only contains the initial data set and labels.)</span>
                                </a>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <a key="sample-project-3" style={{ borderBottom: '1px dashed #e2e8f0' }}
                                    className={`opacity-100 cursor-pointer text-gray-900 block px-3 py-2 text-sm ${active ? "bg-kernindigo text-white" : ""}`}
                                    onClick={() => {
                                        importSampleProject("Conversational AI", "Conversational AI");
                                    }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-message-circle inline-block"
                                        width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"
                                        strokeLinecap="round" strokeLinejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                        <path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1"></path>
                                        <line x1="12" y1="12" x2="12" y2="12.01"></line>
                                        <line x1="8" y1="12" x2="8" y2="12.01"></line>
                                        <line x1="16" y1="12" x2="16" y2="12.01"></line>
                                    </svg>
                                    <span className="ml-2">Conversational AI</span>
                                    <div className="mt-2">Detecting intent within conversational lines.</div>
                                </a>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <a key="sample-project-4" style={{ borderBottom: '1px solid #e2e8f0' }}
                                    className={`opacity-100 cursor-pointer text-gray-900 block px-3 py-2 text-sm ${active ? "bg-kernindigo text-white" : ""}`}
                                    onClick={() => {
                                        importSampleProject("Conversational AI - initial", "Conversational AI - initial");
                                    }} >
                                    <span>Initial (only contains the initial data set and labels.)</span>
                                </a>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <a key="sample-project-5" style={{ borderBottom: '1px dashed #e2e8f0' }}
                                    className={`opacity-100 cursor-pointer text-gray-900 block px-3 py-2 text-sm ${active ? "bg-kernindigo text-white" : ""}`}
                                    onClick={() => {
                                        importSampleProject("AG News", "AG News");
                                    }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-news inline-block" width="20"
                                        height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"
                                        strokeLinecap="round" strokeLinejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                        <path
                                            d="M16 6h3a1 1 0 0 1 1 1v11a2 2 0 0 1 -4 0v-13a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1v12a3 3 0 0 0 3 3h11">
                                        </path>
                                        <line x1="8" y1="8" x2="12" y2="8"></line>
                                        <line x1="8" y1="12" x2="12" y2="12"></line>
                                        <line x1="8" y1="16" x2="12" y2="16"></line>
                                    </svg>
                                    <span className="ml-2">AG News</span>
                                    <div className="mt-2">Modelling topics of headline news.</div>
                                </a>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <a key="sample-project-6" style={{ borderBottom: '1px solid #e2e8f0' }}
                                    className={`opacity-100 cursor-pointer text-gray-900 block px-3 py-2 text-sm ${active ? "bg-kernindigo text-white" : ""}`}
                                    onClick={() => {
                                        importSampleProject("AG News - initial", "AG News - initial");
                                    }}>
                                    <span>Initial (only contains the initial data set and labels.)</span>
                                </a>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <a key="sample-project-6"
                                    className={`opacity-100 cursor-pointer text-gray-900 block px-3 py-2 text-sm ${active ? "bg-kernindigo text-white" : ""}`}
                                    onClick={() => window.open("https://github.com/code-kern-ai/refinery-sample-projects", "_blank")}>
                                    <span>Further sample projects</span>
                                </a>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
            <Modal modalName={ModalEnum.SAMPLE_PROJECT_TITLE} acceptButton={acceptButton}>
                <h1 className="flex flex-grow justify-center text-lg text-gray-900 font-bold">Enter project title</h1>
                <div className="text-sm text-gray-500 mb-4 text-center">
                    Please enter a custom title for the sample project
                </div>
                <div className="form-control text-left">
                    <label className="text-gray-500 text-sm font-normal">Project title</label>
                    <div className="flex flex-row">
                        <input value={projectNameInput} type="text" onInput={(e: any) => {
                            const checkName = projects.some(project => project.name == e.target.value.trim());
                            setCheckIfProjectNameExists(checkName);
                            setProjectNameInput(e.target.value)
                        }} onKeyDown={(e: any) => {
                            if (e.key == "Enter") {
                                importSampleProject();
                            }
                        }}
                            className="h-8 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" placeholder="Enter some title here..." />
                    </div>
                    {checkIfProjectNameExists && (<div className="text-red-700 text-xs mt-2 text-left">Project title exists</div>)}
                    <div className="flex flex-row mt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-alert-triangle text-yellow-700"
                            width="20" height="20" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path
                                d="M10.24 3.957l-8.422 14.06a1.989 1.989 0 0 0 1.7 2.983h16.845a1.989 1.989 0 0 0 1.7 -2.983l-8.423 -14.06a1.989 1.989 0 0 0 -3.4 0z" />
                            <path d="M12 9v4" />
                            <path d="M12 17h.01" />
                        </svg>
                        <label className="text-yellow-700 text-xs italic ml-2 text-left">The first sample project of a specific type can use the
                            default name, but after the name is taken, the user needs a custom name.</label>
                    </div>
                </div>
            </Modal>
        </Menu>
    )
}