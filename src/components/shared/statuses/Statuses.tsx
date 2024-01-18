import { Status } from "@/src/types/shared/statuses";
import { Tooltip } from "@nextui-org/react";
import { useEffect, useState } from "react";

const DEFAULT_TOOLTIP_POSITION: any = "bottom";

export default function Statuses({ status, tooltipPosition = DEFAULT_TOOLTIP_POSITION, page = "heuristic", initialCaption = "Initial", useMargin = true }) {
    const [dataTip, setDataTip] = useState('');
    const [statusName, setStatusName] = useState('');
    const [color, setColor] = useState('');

    useEffect(() => {
        if (page == 'gates-integrator') {
            switch (status) {
                case Status.READY:
                    setStatusName('Ready to use');
                    setColor('green');
                    break;
                case Status.UPDATING:
                    setStatusName('Updating');
                    setColor('yellow');
                    break;
                case Status.NOT_READY:
                    setStatusName('Not ready');
                    setColor('red');
                    break;
            }
        } else {
            switch (status) {
                case Status.CREATED:
                case Status.RUNNING:
                    setDataTip(page === 'heuristics' ? 'Heuristic is currently being executed.' : 'Attribute is being calculated.');
                    setStatusName('Running');
                    setColor('yellow');
                    break;
                case Status.STARTED:
                    setDataTip('Annotator has started labeling');
                    setStatusName('Started');
                    setColor('yellow');
                    break;
                case Status.FINISHED:
                    setDataTip('Heuristic was successfully executed.');
                    setStatusName('Finished');
                    setColor('green');
                    break;
                case Status.FAILED:
                    setDataTip((page === 'heuristics' ? 'Heuristic' : 'Attribute') + ' ran into errors.');
                    setStatusName('Error');
                    setColor('red');
                    break;
                case Status.USABLE:
                    setDataTip('Attribute can be used');
                    setStatusName('Usable');
                    setColor('green');
                    break;
                case Status.UPLOADED:
                    setDataTip('Attribute was uploaded');
                    setStatusName('Uploaded');
                    setColor('indigo');
                    break;
                case Status.AUTOMATICALLY_CREATED:
                    setDataTip('Created during the upload process');
                    setStatusName('Auto. created');
                    setColor('indigo');
                    break;
                case Status.QUEUED:
                    setDataTip('Task is queued for processing');
                    setStatusName('Queued');
                    setColor('gray');
                    break;
                default:
                    setDataTip((page === 'heuristics' ? 'Heuristic' : 'Attribute') + ' was successfully registered.');
                    setStatusName(initialCaption);
                    setColor('gray');
                    break;
            }
        }
    }, [status, page]);

    return (<>
        {statusName && <>
            {dataTip ? (<Tooltip content={dataTip} placement={tooltipPosition} color="invert" className={`${useMargin ? 'ml-2' : 'ml-0'}`}>
                <StatusBadge color={color} statusName={statusName} />
            </Tooltip>) : (<StatusBadge color={color} statusName={statusName} />)}
        </>}
    </>);
}

function StatusBadge({ color, statusName }) {
    return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color === 'green'
        ? 'bg-green-300'
        : 'bg-' + color + '-100 text-' + color + '-800'} `}>
        <svg className={`mr-1.5 h-2 w-2 ${'text-' + color + '-400'} `} fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="3" />
        </svg>
        <span className={' text-' + color + '-800'}>{statusName}</span>
    </span>
}