import { ContainerLogsProps } from '@/src/types/components/projects/projectId/settings/attribute-calculation'
import { copyToClipboard } from '@/submodules/javascript-functions/general'
import { Tooltip } from '@nextui-org/react'
import { IconCheck, IconClipboard, IconClipboardOff } from '@tabler/icons-react'
import { useState } from 'react'
import { first, timer } from 'rxjs'
import Logs from './Logs'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'

export default function ContainerLogs(props: ContainerLogsProps) {
  const [copyClicked, setCopyClicked] = useState(-1)

  function copyToClipboardLogs(text: string, i = -1) {
    copyToClipboard(text)
    if (i != -1) {
      setCopyClicked(i)
      timer(1000)
        .pipe(first())
        .subscribe(() => {
          setCopyClicked(-1)
        })
    }
  }

  return (
    <div>
      <div className="mt-8 flex w-full items-center text-sm leading-5">
        <div className="font-medium text-gray-700">Container Logs</div>

        {props.logs ? (
          <Tooltip
            content={TOOLTIPS_DICT.GENERAL.CLICK_TO_COPY}
            color="invert"
            placement="top"
          >
            <button
              onClick={() => copyToClipboardLogs(props.logs.join('\n'), 0)}
            >
              {copyClicked != 0 ? (
                <IconClipboard className="transition-all duration-500 ease-in-out" />
              ) : (
                <IconCheck className="transition-all duration-500 ease-in-out" />
              )}
            </button>
          </Tooltip>
        ) : (
          <Tooltip
            content="No runs to copy"
            color="invert"
            placement="top"
            className="cursor-auto"
          >
            <IconClipboardOff className="mx-1 h-5 w-5 text-gray-400" />
          </Tooltip>
        )}

        <div className="pt-0.5 font-normal text-gray-500">
          Please send this log to the support if you face problems with your{' '}
          {props.type}
        </div>
      </div>

      <Logs logs={props.logs} />
    </div>
  )
}
