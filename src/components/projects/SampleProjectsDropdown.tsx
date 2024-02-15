import { Fragment, useCallback, useEffect, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useMutation } from '@apollo/client'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import {
  extendAllProjects,
  selectAllProjects,
  updateProjectState,
} from '@/src/reduxStore/states/project'
import { ModalButton, ModalEnum } from '@/src/types/shared/modal'
import { closeModal, openModal } from '@/src/reduxStore/states/modal'
import Modal from '../shared/modal/Modal'
import {
  IconAlertTriangle,
  IconFishHook,
  IconMessageCircle,
  IconNews,
} from '@tabler/icons-react'
import { CREATE_SAMPLE_PROJECT } from '@/src/services/gql/mutations/projects'
import { ProjectStatus } from '@/src/types/components/projects/projects-list'
import { setSearchGroupsStore } from '@/src/reduxStore/states/pages/data-browser'

const ACCEPT_BUTTON = {
  buttonCaption: 'Create',
  closeAfterClick: false,
  useButton: true,
  disabled: true,
}

export default function SampleProjectsDropdown() {
  const router = useRouter()
  const dispatch = useDispatch()

  const projects = useSelector(selectAllProjects)

  const [projectNameInput, setProjectNameInput] = useState<string>('')
  const [projectTypeInput, setProjectTypeInput] = useState<string>('')
  const [projectNameExists, setProjectNameExists] = useState<boolean>(false)

  const [createSampleProjectMut] = useMutation(CREATE_SAMPLE_PROJECT)

  const importSampleProject = useCallback(
    (projectName?: string, projectType?: string) => {
      const checkIfProjectExists = projects.find(
        (project) => project.name === projectName,
      )
      if (checkIfProjectExists) {
        setProjectNameInput(projectName)
        setProjectTypeInput(projectType)
        setProjectNameExists(true)
        dispatch(openModal(ModalEnum.SAMPLE_PROJECT_TITLE))
        return
      }
      const projectNameFinal =
        projectName && projectName ? projectName : projectNameInput
      const projectTypeFinal = projectType ? projectType : projectTypeInput
      const projectSample = {
        name: projectNameFinal,
        id: 'sample',
        status: ProjectStatus.INIT_SAMPLE_PROJECT,
      }
      dispatch(extendAllProjects(projectSample))
      dispatch(closeModal(ModalEnum.SAMPLE_PROJECT_TITLE))
      dispatch(setSearchGroupsStore({}))
      createSampleProjectMut({
        variables: { name: projectNameFinal, projectType: projectTypeFinal },
      }).then((res) => {
        const projectUpdated = res.data.createSampleProject['project']
        dispatch(updateProjectState('sample', { ...projectUpdated }))
        dispatch(closeModal(ModalEnum.SAMPLE_PROJECT_TITLE))
        if (router.pathname.includes('/projects')) {
          router.push(`/projects/${projectUpdated.id}/overview`)
        }
      })
    },
    [],
  )

  const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON)

  function handleProjectName(value: string) {
    const checkName = projects.some((project) => project.name == value)
    setProjectNameExists(checkName)
    setAcceptButton({
      ...acceptButton,
      disabled: checkName || value.trim() == '',
    })
    setProjectNameInput(value)
  }

  useEffect(() => {
    setAcceptButton({
      ...acceptButton,
      emitFunction: () =>
        importSampleProject(projectNameInput, projectTypeInput),
    })
  }, [projectNameInput])

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button
          className={`ml-6 mr-6 mt-6 inline-flex cursor-pointer items-center justify-between rounded-md bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 xs:mr-0`}
        >
          Sample projects
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
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
        <Menu.Items className="absolute z-10 ml-6 mt-2 w-max origin-top-left rounded-md bg-white shadow-sm ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <a
                  key="sample-project-1"
                  style={{ borderBottom: '1px dashed #e2e8f0' }}
                  className={`block cursor-pointer px-3 py-2 text-sm text-gray-900 opacity-100 ${active ? 'bg-kernindigo text-white' : ''}`}
                  onClick={() => {
                    importSampleProject('Clickbait', 'Clickbait')
                  }}
                >
                  <IconFishHook className="inline-block h-5 w-5" />
                  <span className="ml-2">Clickbait</span>
                  <div className="mt-2">
                    Binary classification for detecting nudging articles.
                  </div>
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  key="sample-project-2"
                  style={{ borderBottom: '1px solid #e2e8f0' }}
                  className={`block cursor-pointer px-3 py-2 text-sm text-gray-900 opacity-100 ${active ? 'bg-kernindigo text-white' : ''}`}
                  onClick={() => {
                    importSampleProject(
                      'Clickbait - initial',
                      'Clickbait - initial',
                    )
                  }}
                >
                  <span>
                    Initial (only contains the initial data set and labels.)
                  </span>
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  key="sample-project-3"
                  style={{ borderBottom: '1px dashed #e2e8f0' }}
                  className={`block cursor-pointer px-3 py-2 text-sm text-gray-900 opacity-100 ${active ? 'bg-kernindigo text-white' : ''}`}
                  onClick={() => {
                    importSampleProject(
                      'Conversational AI',
                      'Conversational AI',
                    )
                  }}
                >
                  <IconMessageCircle className="inline-block h-5 w-5" />
                  <span className="ml-2">Conversational AI</span>
                  <div className="mt-2">
                    Detecting intent within conversational lines.
                  </div>
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  key="sample-project-4"
                  style={{ borderBottom: '1px solid #e2e8f0' }}
                  className={`block cursor-pointer px-3 py-2 text-sm text-gray-900 opacity-100 ${active ? 'bg-kernindigo text-white' : ''}`}
                  onClick={() => {
                    importSampleProject(
                      'Conversational AI - initial',
                      'Conversational AI - initial',
                    )
                  }}
                >
                  <span>
                    Initial (only contains the initial data set and labels.)
                  </span>
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  key="sample-project-5"
                  style={{ borderBottom: '1px dashed #e2e8f0' }}
                  className={`block cursor-pointer px-3 py-2 text-sm text-gray-900 opacity-100 ${active ? 'bg-kernindigo text-white' : ''}`}
                  onClick={() => {
                    importSampleProject('AG News', 'AG News')
                  }}
                >
                  <IconNews className="inline-block h-5 w-5" />
                  <span className="ml-2">AG News</span>
                  <div className="mt-2">Modelling topics of headline news.</div>
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  key="sample-project-6"
                  style={{ borderBottom: '1px solid #e2e8f0' }}
                  className={`block cursor-pointer px-3 py-2 text-sm text-gray-900 opacity-100 ${active ? 'bg-kernindigo text-white' : ''}`}
                  onClick={() => {
                    importSampleProject(
                      'AG News - initial',
                      'AG News - initial',
                    )
                  }}
                >
                  <span>
                    Initial (only contains the initial data set and labels.)
                  </span>
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  key="sample-project-6"
                  className={`block cursor-pointer px-3 py-2 text-sm text-gray-900 opacity-100 ${active ? 'bg-kernindigo text-white' : ''}`}
                  onClick={() =>
                    window.open(
                      'https://github.com/code-kern-ai/refinery-sample-projects',
                      '_blank',
                    )
                  }
                >
                  <span>Further sample projects</span>
                </a>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
      <Modal
        modalName={ModalEnum.SAMPLE_PROJECT_TITLE}
        acceptButton={acceptButton}
      >
        <h1 className="flex flex-grow justify-center text-lg font-bold text-gray-900">
          Enter project title
        </h1>
        <div className="mb-4 text-center text-sm text-gray-500">
          Please enter a custom title for the sample project
        </div>
        <div className="form-control text-left">
          <label className="text-sm font-normal text-gray-500">
            Project title
          </label>
          <div className="flex flex-row">
            <input
              value={projectNameInput}
              type="text"
              onInput={(e: any) => handleProjectName(e.target.value)}
              onKeyDown={(e: any) => {
                if (e.key == 'Enter') {
                  importSampleProject()
                }
              }}
              className="placeholder-italic h-8 w-full rounded-md border border-gray-300 pl-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
              placeholder="Enter some title here..."
            />
          </div>
          {projectNameExists && (
            <div className="mt-2 text-left text-xs text-red-700">
              Project title exists
            </div>
          )}
          <div className="mt-2 flex flex-row">
            <IconAlertTriangle className="h-5 w-5 text-yellow-700" />
            <label className="ml-2 text-left text-xs italic text-yellow-700">
              The first sample project of a specific type can use the default
              name, but after the name is taken, the user needs a custom name.
            </label>
          </div>
        </div>
      </Modal>
    </Menu>
  )
}
