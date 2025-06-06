import { selectProject, setActiveProject } from "@/src/reduxStore/states/project";
import { updateProjectNameAndDescriptionPost } from "@/src/services/base/project";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { Tooltip } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteProjectPost } from "@/src/services/base/project";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import { MemoIconWreckingBall } from "@/submodules/react-components/components/kern-icons/icons";

export default function ProjectMetaData() {
    const router = useRouter();
    const dispatch = useDispatch();

    const project = useSelector(selectProject);

    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [projectNameDelete, setProjectNameDelete] = useState('');

    function updateProjectNameAndDescription() {
        if (projectName === '' && projectDescription === '') return;
        if (projectName === '') setProjectName(project.name);
        if (projectDescription === '') setProjectDescription(project.description);
        updateProjectNameAndDescriptionPost(project.id, projectName, projectDescription != '' ? projectDescription : project.description, (res) => {
            const activeProject = { ...project };
            activeProject.name = projectName;
            activeProject.description = projectDescription;
            dispatch(setActiveProject(activeProject));
            setProjectName('');
            setProjectDescription('');
        });
    }

    function deleteProject() {
        deleteProjectPost(project.id, (res) => {
            router.push('/projects');
        });
    }

    return (<div>
        <div className="mt-8">
            <div className="text-gray-900 text-lg leading-6 font-medium">
                Project metadata
            </div>
            <div className="text-sm leading-5 font-normal mt-2 text-gray-500 inline-block">Change your project name or description here.</div><div>
                <form className="relative">
                    <div
                        className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden flex flex-col divide-y divide-gray-200">
                        <input type="text" placeholder={project.name} value={projectName} onChange={(e) => setProjectName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    updateProjectNameAndDescription();
                                }
                            }} className="appearance-none rounded w-full text-sm py-2 px-3 text-gray-700 leading-tight border-0 focus:outline-none"
                        />
                        <textarea rows={2} placeholder={project.description} value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    updateProjectNameAndDescription();
                                }
                            }} className="form-control block w-full px-3 py-1.5 text-sm text-gray-700 bg-white bg-clip-padding focus:outline-none m-0"></textarea>
                        <div
                            className="border-t bg-gray-50 border-gray-200 px-2 py-2 flex justify-between items-center space-x-3 sm:px-3">
                            <div className="flex-shrink-0">
                                <KernButton
                                    text="Update"
                                    onClick={updateProjectNameAndDescription}
                                    disabled={projectName === '' && projectDescription === ''}
                                    type="button"
                                    tooltip={TOOLTIPS_DICT.PROJECT_SETTINGS.META_DATA.STORE_CHANGES}
                                    tooltipPlacement="right"
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div >

        <div className="mt-8 mb-8">
            <div className="text-gray-900 text-lg leading-6 font-medium">Danger zone</div>
            <div className="text-sm leading-5 font-normal mt-2 text-gray-500 inline-block">This action can not be reversed.
                Are you sure you want to delete this project?</div>
            {!project.is_integration_project && <div className="text-sm text-red-500 italic">
                This is an integration project, please do not delete it unless the integration is deleted
            </div>}
            <div className="form-control">
                <div className="flex space-x-2 items-center">
                    <input className="h-9 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                        value={projectNameDelete} type="text" placeholder="Please enter the project name to enable deletion" onChange={(e) => setProjectNameDelete(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); (projectNameDelete === project.name) ? deleteProject() : null } }} />

                    <Tooltip content={<div className="w-24">{TOOLTIPS_DICT.PROJECT_SETTINGS.META_DATA.CANNOT_BE_REVERTED}</div>} placement="top" color="invert">
                        <KernButton
                            text="Delete"
                            onClick={deleteProject}
                            disabled={!(projectNameDelete === project.name)}
                            type="button"
                            icon={MemoIconWreckingBall}
                            buttonColor="red"
                            iconColor="red"
                        />
                    </Tooltip>
                </div>
            </div>
        </div>
    </div >)
}