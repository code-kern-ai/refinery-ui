import { selectProject, setActiveProject } from "@/src/reduxStore/states/project";
import { UPDATE_PROJECT_NAME_AND_DESCRIPTION } from "@/src/services/gql/mutations/project";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function ProjectMetaData() {
    const dispatch = useDispatch();

    const project = useSelector(selectProject);

    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');

    const [updateProjectNameAndDescMut] = useMutation(UPDATE_PROJECT_NAME_AND_DESCRIPTION);

    function updateProjectNameAndDescription() {
        if (projectName === '' && projectDescription === '') return;
        if (projectName === '') setProjectName(project.name);
        if (projectDescription === '') setProjectDescription(project.description);
        updateProjectNameAndDescMut({ variables: { projectId: project.id, name: projectName, description: projectDescription } }).then((res) => {
            const activeProject = jsonCopy(project);
            activeProject.name = projectName;
            activeProject.description = projectDescription;
            dispatch(setActiveProject(activeProject));
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
                            }} className="appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
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
                                <Tooltip content="Stores the changes" color="invert" placement="right">
                                    <button onClick={updateProjectNameAndDescription}
                                        disabled={projectName === '' && projectDescription === ''} type="button"
                                        className={`inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none ${projectName === '' && projectDescription === '' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'}`}>
                                        Update</button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div >

    </div >)
}