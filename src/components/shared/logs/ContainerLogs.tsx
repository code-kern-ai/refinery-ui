import { ContainerLogsProps } from "@/src/types/components/projects/projectId/settings/attribute-calculation";
import { copyToClipboard } from "@/submodules/javascript-functions/general";
import { Tooltip } from "@nextui-org/react";
import { IconCheck, IconClipboard, IconClipboardOff } from "@tabler/icons-react";
import { useState } from "react";
import { first, timer } from "rxjs";
import Logs from "./Logs";

export default function ContainerLogs(props: ContainerLogsProps) {

    const [copyClicked, setCopyClicked] = useState(-1);

    function copyToClipboardLogs(text: string, i = -1) {
        copyToClipboard(text);
        if (i != -1) {
            setCopyClicked(i);
            timer(1000).pipe(first()).subscribe(() => {
                setCopyClicked(-1);
            })
        }
    }

    return (<div>

        <div className="mt-8 text-sm leading-5 w-full flex items-center">
            <div className="font-medium text-gray-700">Container Logs</div>

            {props.logs ? (
                <Tooltip content="Click to copy" color="invert" placement="top">
                    <button onClick={() => copyToClipboardLogs(props.logs.join('\n'), 0)}>
                        {copyClicked != 0 ? (<IconClipboard className="transition-all duration-500 ease-in-out" />) : (<IconCheck className="transition-all duration-500 ease-in-out" />)}
                    </button>
                </Tooltip>
            ) : (
                <Tooltip content='No runs to copy' color="invert" placement="top">
                    <IconClipboardOff className="text-gray-400 h-5 w-5 mx-1" />
                </Tooltip>)}


            <div className="font-normal text-gray-500 pt-0.5">Please send this log to the support if you face problems with your {props.type}</div>
        </div>

        <Logs logs={props.logs} />
    </div>)
}