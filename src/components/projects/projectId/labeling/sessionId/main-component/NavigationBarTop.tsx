import { selectUser } from '@/src/reduxStore/states/general'
import {
  selectAvailableLinks,
  selectDisplayUserRole,
  selectSelectedLink,
  selectUserDisplayId,
  selectUserIconsData,
  setAvailableLinks,
  setHoverGroupDict,
  setSelectedLink,
  setUserDisplayId,
} from '@/src/reduxStore/states/pages/labeling'
import { selectProjectId } from '@/src/reduxStore/states/project'
import {
  LabelingLinkType,
  NavigationBarTopProps,
  UserType,
} from '@/src/types/components/projects/projectId/labeling/labeling-main-component'
import { UserRole } from '@/src/types/shared/sidebar'
import { SessionManager } from '@/src/util/classes/labeling/session-manager'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { Tooltip } from '@nextui-org/react'
import {
  IconArrowLeft,
  IconArrowRight,
  IconCircle,
  IconStar,
} from '@tabler/icons-react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import style from '@/src/styles/components/projects/projectId/labeling.module.css'
import Dropdown2 from '@/submodules/react-components/components/Dropdown2'
import { useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { AVAILABLE_LABELING_LINKS } from '@/src/services/gql/queries/labeling'
import { parseLinkFromText } from '@/src/util/shared/link-parser-helper'

export default function NavigationBarTop(props: NavigationBarTopProps) {
  const router = useRouter()
  const dispatch = useDispatch()

  const projectId = useSelector(selectProjectId)
  const user = useSelector(selectUser)
  const availableLinks = useSelector(selectAvailableLinks)
  const selectedLink = useSelector(selectSelectedLink)
  const userIconsData = useSelector(selectUserIconsData)
  const displayId = useSelector(selectUserDisplayId)
  const userDisplayRole = useSelector(selectDisplayUserRole)

  const [refetchAvailableLinks] = useLazyQuery(AVAILABLE_LABELING_LINKS, {
    fetchPolicy: 'no-cache',
  })

  useEffect(() => {
    if (
      userDisplayRole?.role == UserRole.ENGINEER ||
      !SessionManager.labelingLinkData
    )
      return
    const heuristicId =
      SessionManager.labelingLinkData.linkType == LabelingLinkType.HEURISTIC
        ? SessionManager.labelingLinkData.huddleId
        : null
    refetchAvailableLinks({
      variables: {
        projectId: projectId,
        assumedRole: userDisplayRole?.role,
        assumedHeuristicId: heuristicId,
      },
    }).then((result) => {
      const availableLinks = result['data']['availableLinks']
      dispatch(setAvailableLinks(availableLinks))
      const linkRoute = router.asPath.split('?')[0]
      dispatch(
        setSelectedLink(
          availableLinks.find((link) => link.link.split('?')[0] == linkRoute),
        ),
      )
    })
  }, [SessionManager.labelingLinkData, userDisplayRole])

  function goToRecordIde() {
    const sessionId = router.query.sessionId as string
    const pos = router.query.pos as string
    router.push(`/projects/${projectId}/record-ide/${sessionId}?pos=${pos}`)
  }

  function previousRecord() {
    SessionManager.previousRecord()
    router.push(
      `/projects/${projectId}/labeling/${SessionManager.labelingLinkData.huddleId}?pos=${SessionManager.huddleData.linkData.requestedPos}&type=${SessionManager.huddleData.linkData.linkType}`,
    )
  }

  function nextRecord() {
    SessionManager.nextRecord()
    router.push(
      `/projects/${projectId}/labeling/${SessionManager.labelingLinkData.huddleId}?pos=${SessionManager.huddleData.linkData.requestedPos}&type=${SessionManager.huddleData.linkData.linkType}`,
    )
  }

  function dropdownSelectLink(option: any) {
    dispatch(setSelectedLink(option))
    const linkData = parseLinkFromText(option.link)
    router.push(
      `${linkData.route}?pos=${linkData.queryParams.pos}&type=${linkData.queryParams.type}`,
    )
  }

  return (
    <>
      {user && (
        <div className="h-16 w-full border-b border-gray-200 px-4">
          <div className="relative flex h-full flex-shrink-0 items-center justify-between bg-white shadow-sm">
            <div className="flex flex-row flex-nowrap items-center">
              {user.role == UserRole.ENGINEER &&
              userDisplayRole == UserRole.ENGINEER ? (
                <>
                  <div className="flex justify-center overflow-visible">
                    <Tooltip
                      content={TOOLTIPS_DICT.LABELING.NAVIGATE_TO_DATA_BROWSER}
                      placement="bottom"
                      color="invert"
                    >
                      <button
                        onClick={() =>
                          router.push(`/projects/${projectId}/data-browser`)
                        }
                        className="mr-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none"
                      >
                        Data browser
                      </button>
                    </Tooltip>
                  </div>

                  <div className="flex justify-center overflow-visible">
                    <Tooltip
                      content={TOOLTIPS_DICT.LABELING.NAVIGATE_TO_RECORD_IDE}
                      placement="bottom"
                      color="invert"
                    >
                      <button
                        onClick={() => goToRecordIde()}
                        className="mr-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none"
                      >
                        Record IDE
                      </button>
                    </Tooltip>
                  </div>
                  {userIconsData.userIcons.length > 0 && (
                    <>
                      {userIconsData.showUserIcons && (
                        <div className="flex justify-center overflow-visible">
                          {userIconsData.userIcons.map((user) => (
                            <Tooltip
                              content={user.name}
                              key={user.id}
                              color="invert"
                              placement="top"
                              className="mr-3"
                            >
                              {user.userType == UserType.REGISTERED ? (
                                <div
                                  className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full ${user.id == displayId ? 'opacity-100' : 'opacity-50'}`}
                                  onClick={() =>
                                    dispatch(setUserDisplayId(user.id))
                                  }
                                >
                                  <img
                                    src={`/refinery/avatars/${user.avatarUri}`}
                                    className="h-8 w-8"
                                  />
                                </div>
                              ) : (
                                <div
                                  className="relative h-8 w-8 cursor-pointer"
                                  onClick={() =>
                                    dispatch(setUserDisplayId(user.id))
                                  }
                                >
                                  {user.userType == UserType.GOLD && (
                                    <div className="absolute -bottom-1 -top-1">
                                      <IconStar
                                        className={`h-full w-full ${user.id == displayId ? style.specialUserActive : style.specialUserInActive}`}
                                      />
                                    </div>
                                  )}
                                  {user.userType == UserType.ALL && (
                                    <div className="absolute bottom-0 left-0 right-0 top-0">
                                      <IconCircle
                                        className={`h-full w-full ${user.id == displayId ? style.specialUserActive : style.specialUserInActive}`}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </Tooltip>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center overflow-visible">
                  <span className="mr-2"> Available Tasks:</span>
                  <Dropdown2
                    options={
                      availableLinks && availableLinks.length > 0
                        ? availableLinks
                        : ['No links available']
                    }
                    disabled={availableLinks?.length == 0 || props.lockedLink}
                    buttonName={
                      selectedLink ? selectedLink.name : 'Select slice'
                    }
                    selectedOption={(option: any) => dropdownSelectLink(option)}
                  />
                </div>
              )}
            </div>
            {props.absoluteWarning && (
              <div className="z-100 pointer-events-none left-0 right-0 top-4 flex items-center justify-center">
                <span className="inline-flex items-center rounded bg-red-100 px-2 py-0.5 font-medium text-red-800">
                  {props.absoluteWarning}
                </span>
              </div>
            )}
            <div className="flex flex-row flex-nowrap items-center">
              <div className="flex items-center justify-center overflow-visible">
                <div className="my-3 mr-3 inline-flex flex-shrink-0 text-sm leading-5 text-gray-500">
                  {SessionManager.positionString}&nbsp;
                  <Tooltip
                    content={
                      user.role == UserRole.ENGINEER &&
                      userDisplayRole == UserRole.ENGINEER
                        ? TOOLTIPS_DICT.LABELING.REACH_END
                        : TOOLTIPS_DICT.LABELING.CHANGE_SLICES
                    }
                    color="invert"
                    placement="bottom"
                    className="cursor-auto"
                  >
                    <span className="filtersUnderline cursor-help underline">
                      {user.role == UserRole.ENGINEER
                        ? ' current session'
                        : ' current slice'}
                    </span>
                  </Tooltip>
                </div>
                <button
                  onClick={previousRecord}
                  disabled={SessionManager.prevDisabled}
                  className="mr-3 inline-flex items-center whitespace-nowrap rounded-md border border-gray-300 bg-white px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Prev
                  <kbd className="relative ml-1 inline-flex items-center rounded border border-gray-200 bg-white px-0.5 py-0.5 font-sans text-sm font-medium text-gray-400">
                    <IconArrowLeft className="h-4 w-4" />
                  </kbd>
                </button>
                <button
                  onClick={nextRecord}
                  disabled={SessionManager.nextDisabled}
                  className="inline-flex cursor-pointer items-center whitespace-nowrap rounded-md bg-indigo-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <kbd className="relative ml-1 inline-flex items-center rounded border border-gray-200 bg-white px-0.5 py-0.5 font-sans text-sm font-medium text-gray-400">
                    <IconArrowRight className="h-4 w-4" />
                  </kbd>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
