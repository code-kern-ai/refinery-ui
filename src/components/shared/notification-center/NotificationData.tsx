import { NotificationDataProps } from "@/src/types/shared/notification-center";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { Tooltip } from "@nextui-org/react";
import { useRouter } from "next/router";
import { Fragment, useState } from "react";

export default function NotificationData(props: NotificationDataProps) {
    const router = useRouter();

    const [expandedNotifications, setExpandedNotifications] = useState({});

    function switchExpandedState(notification) {
        if (expandedNotifications[notification.id]) {
            setExpandedNotifications({ ...expandedNotifications, [notification.id]: false });
        } else {
            setExpandedNotifications({ ...expandedNotifications, [notification.id]: true });
        }
    }

    return (<div className="ml-3 w-full">
        <div className="flex">
            <h3 className={`text-sm font-medium text-${props.textColor}-800`}>
                <a className="underline" href={props.notification[0].docs} target="_blank" >{props.notification[0].title}</a>
                ({props.notification[0].date}
                {props.notification[0].projectId && <button className="underline" onClick={() => router.push(`/projects/${props.notification[0].projectId}/${props.notification[0].page}`)}>
                    in {props.notification[0].projectName}
                </button>})<div className="mt-1 text-left">{props.notification[0].timePassed} ago</div>
            </h3>
            <div className="flex-grow">
                {props.notification > 1 && <Tooltip content={TOOLTIPS_DICT.GENERAL.MORE_INFO_AVAILABLE} color="invert" placement="left">
                    <button onClick={() => switchExpandedState(props.notification[0])}
                        className="border border-gray-200 float-right inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 cursor-pointer">
                        {props.notification.length}
                    </button>
                </Tooltip>}
            </div>
        </div>
        <div className={`mt-1 text-sm text-left text-${props.textColor}-700`}>
            <p>{props.notification[0].message}</p>
        </div>
        {expandedNotifications[props.notification[0].id] && <div className="grid grid-cols-1 divide-y">
            {props.notification.map((notification, index) => (<Fragment key={index}>
                {index > 0 && <div className="py-1">
                    <div className={`w-full flex justify-between text-sm text-${props.textColor}-700`}>
                        <div>{props.notification[index].timePassed} ago</div>
                        <div>{props.notification[index].date}</div>
                    </div>
                </div>}
            </Fragment>))}
        </div>}
    </div>)
}