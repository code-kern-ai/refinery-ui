import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllProjects } from '@/src/reduxStore/states/project';
import { ModalButton, ModalEnum } from '@/src/types/shared/modal';
import { closeModal, openModal } from '@/src/reduxStore/states/modal';
import Modal from '../shared/modal/Modal';
import { IconAlertTriangle, IconCarCrash, IconFishHook, IconMessageCircle, IconNews } from '@tabler/icons-react';
import { CREATE_SAMPLE_PROJECT } from '@/src/services/gql/mutations/projects';
import { setSearchGroupsStore } from '@/src/reduxStore/states/pages/data-browser';
import { selectProjectIdSampleProject, setProjectIdSampleProject } from '@/src/reduxStore/states/tmp';

const ACCEPT_BUTTON = { buttonCaption: "Create", closeAfterClick: false, useButton: true, disabled: true };

export default function SampleProjectsDropdown() {
    const router = useRouter();
    const dispatch = useDispatch();

    const projects = useSelector(selectAllProjects);
    const tmpProjectIdSample = useSelector(selectProjectIdSampleProject);

    const [projectNameInput, setProjectNameInput] = useState("");
    const [projectTypeInput, setProjectTypeInput] = useState("");
    const [projectNameExists, setProjectNameExists] = useState(false);

    const [createSampleProjectMut] = useMutation(CREATE_SAMPLE_PROJECT);

    const importSampleProject = useCallback((projectName?: string, projectType?: string) => {
        const checkIfProjectExists = projects.find((project) => project.name === projectName);
        if (checkIfProjectExists) {
            setProjectNameInput(projectName);
            setProjectTypeInput(projectType);
            setProjectNameExists(true);
            dispatch(openModal(ModalEnum.SAMPLE_PROJECT_TITLE));
            return;
        }
        const projectNameFinal = projectName && projectName ? projectName : projectNameInput;
        const projectTypeFinal = projectType ? projectType : projectTypeInput;
        dispatch(closeModal(ModalEnum.SAMPLE_PROJECT_TITLE));
        dispatch(setSearchGroupsStore({}));
        createSampleProjectMut({ variables: { name: projectNameFinal, projectType: projectTypeFinal } }).then((res) => {
            dispatch(closeModal(ModalEnum.SAMPLE_PROJECT_TITLE));
            const projectId = res['data']['createSampleProject']['project'].id;
            dispatch(setProjectIdSampleProject(projectId));
        });
    }, [projects, projectNameInput, projectTypeInput, router]);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    function handleProjectName(value: string) {
        const checkName = projects.some(project => project.name == value);
        setProjectNameExists(checkName);
        setAcceptButton({ ...acceptButton, disabled: checkName || value.trim() == "" })
        setProjectNameInput(value);
    }


    useEffect(() => {
        setAcceptButton({ ...acceptButton, emitFunction: () => importSampleProject(projectNameInput, projectTypeInput) });
    }, [projectNameInput]);

    useEffect(() => {
        if (tmpProjectIdSample) {
            router.push(`/projects/${tmpProjectIdSample}/overview`);
        }
    }, [tmpProjectIdSample]);

    useEffect(() => {
        return () => {
            dispatch(setProjectIdSampleProject(null));
        }
    }, []);

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
                                    <IconFishHook className="h-5 w-5 inline-block" />
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
                                <a key="sample-project-1" style={{ borderBottom: '1px dashed #e2e8f0' }}
                                    className={`opacity-100 cursor-pointer text-gray-900 block px-3 py-2 text-sm ${active ? "bg-kernindigo text-white" : ""}`}
                                    onClick={() => {
                                        importSampleProject("Global Guard Insurance", "Global Guard Insurance");
                                    }}>
                                    <IconCarCrash className="h-5 w-5 inline-block" />
                                    <span className="ml-2">Global Guard Insurance</span>
                                    <div className="mt-2">Reference data for RAG project.</div>
                                </a>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <a key="sample-project-1" style={{ borderBottom: '1px solid #e2e8f0' }}
                                    className={`opacity-100 cursor-pointer text-gray-900 block px-3 py-2 text-sm ${active ? "bg-kernindigo text-white" : ""}`}
                                    onClick={() => {
                                        importSampleProject("Global Guard Insurance - initial", "Global Guard Insurance - initial");
                                    }}>
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
                                    <IconMessageCircle className="h-5 w-5 inline-block" />
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
                                    <IconNews className="h-5 w-5 inline-block" />
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
                        <input value={projectNameInput} type="text" onInput={(e: any) => handleProjectName(e.target.value)} onKeyDown={(e: any) => {
                            if (e.key == "Enter") {
                                importSampleProject();
                            }
                        }} className="h-8 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" placeholder="Enter some title here..." />
                    </div>
                    {projectNameExists && (<div className="text-red-700 text-xs mt-2 text-left">Project title exists</div>)}
                    <div className="flex flex-row mt-2">
                        <IconAlertTriangle className="h-5 w-5 text-yellow-700" />
                        <label className="text-yellow-700 text-xs italic ml-2 text-left">The first sample project of a specific type can use the
                            default name, but after the name is taken, the user needs a custom name.</label>
                    </div>
                </div>
            </Modal>
        </Menu>
    )
}