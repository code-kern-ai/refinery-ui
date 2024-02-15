import {
  selectIsAdmin,
  selectIsDemo,
  selectUser,
} from '@/src/reduxStore/states/general'
import { closeModal, setModalStates } from '@/src/reduxStore/states/modal'
import { removeFromAllProjectsById } from '@/src/reduxStore/states/project'
import {
  Project,
  ProjectCardProps,
  ProjectStatus,
} from '@/src/types/components/projects/projects-list'
import { ModalEnum } from '@/src/types/shared/modal'
import { isStringTrue } from '@/submodules/javascript-functions/general'
import { Tooltip } from '@nextui-org/react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { NOT_AVAILABLE, UNKNOWN_USER } from '@/src/util/constants'
import { IconArrowRight, IconX } from '@tabler/icons-react'
import { useMutation } from '@apollo/client'
import { DELETE_PROJECT } from '@/src/services/gql/mutations/projects'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'

export default function ProjectCard(props: ProjectCardProps) {
  const router = useRouter()
  const dispatch = useDispatch()

  const isDemo = useSelector(selectIsDemo)
  const isAdmin = useSelector(selectIsAdmin)
  const user = useSelector(selectUser)

  const [deleteProjectByIdMut] = useMutation(DELETE_PROJECT, {
    fetchPolicy: 'no-cache',
  })

  function adminOpenOrDeleteProject(project: Project) {
    if (!isAdmin) return
    const deleteInstant = isStringTrue(
      localStorage.getItem('adminInstantDelete'),
    )
    if (deleteInstant) {
      deleteProjectByIdMut({ variables: { projectId: project.id } }).then(
        () => {
          dispatch(closeModal(ModalEnum.ADMIN_DELETE_PROJECT))
          dispatch(removeFromAllProjectsById(project.id))
        },
      )
    } else {
      dispatch(
        setModalStates(ModalEnum.ADMIN_DELETE_PROJECT, {
          projectId: project.id,
          open: true,
        }),
      )
    }
  }

  function manageProject(): void {
    const projectId = props.project.id
    if (user?.role == 'ENGINEER') {
      if (props.project.numDataScaleUploaded == 0) {
        router.push(`/projects/${projectId}/settings`)
      } else {
        router.push(`/projects/${projectId}/overview`)
      }
    } else {
      router.push(`/projects/${projectId}/labeling`)
    }
  }

  return (
    <div
      key={props.project.id}
      className="card relative m-4 rounded-2xl bg-white shadow"
    >
      {props.project.status != ProjectStatus.IN_DELETION &&
        props.project.status != ProjectStatus.HIDDEN && (
          <div className="card-body p-6">
            {props.project.timeStamp != null && (
              <div
                className="absolute left-2/4 top-0 flex flex-row flex-nowrap gap-x-1 rounded-bl rounded-br bg-gray-100 px-1"
                style={{ transform: 'translate(-50%' }}
              >
                <span className="text-sm text-gray-500">Created by</span>
                <Tooltip
                  content={
                    props.project.user.firstName && props.project.user.lastName
                      ? props.project.user.mail
                      : ''
                  }
                  placement="bottom"
                  color="invert"
                  className="cursor-auto"
                >
                  <span className="text-sm text-gray-900">
                    {props.project.user.firstName && props.project.user.lastName
                      ? props.project.user.firstName +
                        ' ' +
                        props.project.user.lastName
                      : UNKNOWN_USER}
                  </span>
                </Tooltip>
                {!isDemo && isAdmin && (
                  <>
                    <span className="text-sm text-gray-500">on</span>
                    <span className="text-sm text-gray-900 ">
                      {props.project.date}
                    </span>
                    <span className="text-sm text-gray-500">at</span>
                    <span className="text-sm text-gray-900 ">
                      {props.project.time}
                    </span>
                  </>
                )}
              </div>
            )}
            {isAdmin &&
              props.project.status !== ProjectStatus.INIT_SAMPLE_PROJECT && (
                <div
                  className="absolute left-0 top-0 cursor-pointer"
                  onClick={() => adminOpenOrDeleteProject(props.project)}
                >
                  <Tooltip
                    content={TOOLTIPS_DICT.PROJECTS.QUICK_DELETE}
                    color="invert"
                    offset={2}
                    placement="right"
                  >
                    <IconX className="h-6 w-6 text-gray-500" />
                  </Tooltip>
                </div>
              )}
            <div className="my-2 grid grid-cols-3 items-center gap-4 lg:grid-cols-6">
              <div className="col-span-2">
                <div className="text-sm font-medium text-gray-900">
                  {props.project.name}
                </div>
                {props.project.description ? (
                  <div className="text-sm font-normal text-gray-500">
                    {props.project.description}
                  </div>
                ) : (
                  <div className="text-sm font-normal italic text-gray-500">
                    No description
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Records</div>
                <div className="text-sm font-normal text-gray-500">
                  {props.projectStatisticsById &&
                  props.projectStatisticsById[props.project.id]
                    ?.numDataScaleUploaded
                    ? props.projectStatisticsById[props.project.id]
                        ?.numDataScaleUploaded
                    : '0'}
                  &nbsp;records
                </div>
              </div>
              <div>
                {props.projectStatisticsById &&
                  props.projectStatisticsById[props.project.id]
                    ?.numDataScaleManual != 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Manually labeled
                      </div>
                      <div className="text-sm font-normal text-gray-500">
                        {
                          props.projectStatisticsById[props.project.id]
                            ?.numDataScaleManual
                        }
                        &nbsp;records (
                        {props.projectStatisticsById[props.project.id]
                          ?.manuallyLabeled || NOT_AVAILABLE}
                        )
                      </div>
                    </div>
                  )}
              </div>
              <div>
                {props.projectStatisticsById &&
                  props.projectStatisticsById[props.project.id]
                    ?.numDataScaleProgrammatical != 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Weakly supervised
                      </div>
                      <div className="text-sm font-normal text-gray-500">
                        {
                          props.projectStatisticsById[props.project.id]
                            ?.numDataScaleProgrammatical
                        }
                        &nbsp;records (
                        {props.projectStatisticsById[props.project.id]
                          ?.weaklySupervised || NOT_AVAILABLE}
                        )
                      </div>
                    </div>
                  )}
              </div>
              <div>
                {props.project.status !== ProjectStatus.INIT_SAMPLE_PROJECT && (
                  <button
                    onClick={manageProject}
                    className="text-sm font-medium text-green-800"
                  >
                    <span className="leading-5">Continue project</span>
                    <IconArrowRight className="inline-block h-5 w-5 text-green-800" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
