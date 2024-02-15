import {
  selectProjectId,
  setActiveProject,
} from '@/src/reduxStore/states/project'
import { NotificationDataProps } from '@/src/types/shared/notification-center'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { Tooltip } from '@nextui-org/react'
import { useRouter } from 'next/router'
import { Fragment, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

export default function NotificationData(props: NotificationDataProps) {
  const router = useRouter()
  const dispatch = useDispatch()
  const projectId = useSelector(selectProjectId)

  const [expandedNotifications, setExpandedNotifications] = useState({})

  function switchExpandedState(notification) {
    if (expandedNotifications[notification.id]) {
      setExpandedNotifications({
        ...expandedNotifications,
        [notification.id]: false,
      })
    } else {
      setExpandedNotifications({
        ...expandedNotifications,
        [notification.id]: true,
      })
    }
  }

  return (
    <div className="ml-3 w-full">
      <div className="flex">
        <h3 className={`text-sm font-medium text-${props.textColor}-800`}>
          <a
            className="mr-1 underline"
            href={props.notification[0].docs}
            target="_blank"
          >
            {props.notification[0].title}
          </a>
          ({props.notification[0].date}
          {props.notification[0].projectId && (
            <span>
              &nbsp;in&nbsp;
              <button
                className="underline"
                onClick={() => {
                  if (projectId !== props.notification[0].projectId) {
                    dispatch(setActiveProject(null))
                  }
                  router.push(
                    `/projects/${props.notification[0].projectId}/${props.notification[0].page}`,
                  )
                }}
              >
                {props.notification[0].projectName}
              </button>
            </span>
          )}
          )
          <div className="mt-1 text-left">
            {props.notification[0].timePassed} ago
          </div>
        </h3>
        <div className="flex-grow">
          {props.notification > 1 && (
            <Tooltip
              content={TOOLTIPS_DICT.GENERAL.MORE_INFO_AVAILABLE}
              color="invert"
              placement="left"
            >
              <button
                onClick={() => switchExpandedState(props.notification[0])}
                className="float-right inline-flex cursor-pointer items-center rounded-md border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800"
              >
                {props.notification.length}
              </button>
            </Tooltip>
          )}
        </div>
      </div>
      <div className={`mt-1 text-left text-sm text-${props.textColor}-700`}>
        <p>{props.notification[0].message}</p>
      </div>
      {expandedNotifications[props.notification[0].id] && (
        <div className="grid grid-cols-1 divide-y">
          {props.notification.map((notification, index) => (
            <Fragment key={notification.id}>
              {index > 0 && (
                <div className="py-1">
                  <div
                    className={`flex w-full justify-between text-sm text-${props.textColor}-700`}
                  >
                    <div>{props.notification[index].timePassed} ago</div>
                    <div>{props.notification[index].date}</div>
                  </div>
                </div>
              )}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  )
}
