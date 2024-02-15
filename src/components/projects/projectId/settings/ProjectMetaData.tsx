import {
  selectProject,
  setActiveProject,
} from '@/src/reduxStore/states/project'
import { UPDATE_PROJECT_NAME_AND_DESCRIPTION } from '@/src/services/gql/mutations/project-settings'
import { DELETE_PROJECT } from '@/src/services/gql/mutations/projects'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { useMutation } from '@apollo/client'
import { Tooltip } from '@nextui-org/react'
import { IconWreckingBall } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

export default function ProjectMetaData() {
  const router = useRouter()
  const dispatch = useDispatch()

  const project = useSelector(selectProject)

  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectNameDelete, setProjectNameDelete] = useState('')

  const [updateProjectNameAndDescMut] = useMutation(
    UPDATE_PROJECT_NAME_AND_DESCRIPTION,
  )
  const [deleteProjectMut] = useMutation(DELETE_PROJECT)

  function updateProjectNameAndDescription() {
    if (projectName === '' && projectDescription === '') return
    if (projectName === '') setProjectName(project.name)
    if (projectDescription === '') setProjectDescription(project.description)
    updateProjectNameAndDescMut({
      variables: {
        projectId: project.id,
        name: projectName,
        description:
          projectDescription != '' ? projectDescription : project.description,
      },
    }).then((res) => {
      const activeProject = { ...project }
      activeProject.name = projectName
      activeProject.description = projectDescription
      dispatch(setActiveProject(activeProject))
      setProjectName('')
      setProjectDescription('')
    })
  }

  function deleteProject() {
    deleteProjectMut({ variables: { projectId: project.id } }).then(() => {
      router.push('/projects')
    })
  }

  return (
    <div>
      <div className="mt-8">
        <div className="text-lg font-medium leading-6 text-gray-900">
          Project metadata
        </div>
        <div className="mt-2 inline-block text-sm font-normal leading-5 text-gray-500">
          Change your project name or description here.
        </div>
        <div>
          <form className="relative">
            <div className="flex flex-col divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
              <input
                type="text"
                placeholder={project.name}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    updateProjectNameAndDescription()
                  }
                }}
                className="w-full appearance-none rounded px-3 py-2 text-sm leading-tight text-gray-700 focus:outline-none"
              />
              <textarea
                rows={2}
                placeholder={project.description}
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    updateProjectNameAndDescription()
                  }
                }}
                className="form-control m-0 block w-full bg-white bg-clip-padding px-3 py-1.5 text-sm text-gray-700 focus:outline-none"
              ></textarea>
              <div className="flex items-center justify-between space-x-3 border-t border-gray-200 bg-gray-50 px-2 py-2 sm:px-3">
                <div className="flex-shrink-0">
                  <Tooltip
                    content={
                      TOOLTIPS_DICT.PROJECT_SETTINGS.META_DATA.STORE_CHANGES
                    }
                    color="invert"
                    placement="right"
                  >
                    <button
                      onClick={updateProjectNameAndDescription}
                      disabled={projectName === '' && projectDescription === ''}
                      type="button"
                      className={`inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      Update
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="mb-8 mt-8">
        <div className="text-lg font-medium leading-6 text-gray-900">
          Danger zone
        </div>
        <div className="mt-2 inline-block text-sm font-normal leading-5 text-gray-500">
          This action can not be reversed. Are you sure you want to delete this
          project?
        </div>
        <div className="form-control">
          <div className="flex items-center space-x-2">
            <input
              className="placeholder-italic h-9 w-full rounded-md border border-gray-300 pl-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
              value={projectNameDelete}
              type="text"
              placeholder="Please enter the project name to enable deletion"
              onChange={(e) => setProjectNameDelete(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  projectNameDelete === project.name ? deleteProject() : null
                }
              }}
            />

            <Tooltip
              content={
                TOOLTIPS_DICT.PROJECT_SETTINGS.META_DATA.CANNOT_BE_REVERTED
              }
              placement="left"
              color="invert"
            >
              <button
                onClick={deleteProject}
                disabled={!(projectNameDelete === project.name)}
                type="button"
                className={`ml-6 inline-flex items-center rounded-md border border-red-400 bg-red-100 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 `}
              >
                <IconWreckingBall className="mr-2 h-4 w-4" />
                Delete
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  )
}
