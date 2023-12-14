import { selectBricksIntegrator, setBricksIntegrator } from "@/src/reduxStore/states/general";
import { IntegratorPage, PageIntegrationProps } from "@/src/types/shared/bricks-integrator";
import { BricksCodeParser } from "@/src/util/classes/bricks-integrator/bricks-integrator";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { Tooltip } from "@nextui-org/react";
import { IconAlertTriangle, IconChevronsDown, IconInfoCircle } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import VariableSelect from "./VariableSelect";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import style from '@/src/styles/shared/bricks-integrator.module.css';

export default function PageIntegration(props: PageIntegrationProps) {
    const dispatch = useDispatch();

    const config = useSelector(selectBricksIntegrator);

    function onInputFunctionName(event: Event) {
        if (!(event.target instanceof HTMLInputElement)) return;
        let configCopy = { ...config };
        const start = event.target.selectionStart;
        let value = event.target.value;
        configCopy = BricksCodeParser.checkFunctionNameAndSet(value, configCopy, props.executionTypeFilter, props.nameLookups);
        event.target.value = BricksCodeParser.functionName;
        event.target.selectionStart = start;
        event.target.selectionEnd = start;
        props.checkCanAccept(configCopy);
    }

    return (<>
        {config && <div className={`flex flex-col gap-y-2 justify-center items-center my-4 ${config.page != IntegratorPage.INTEGRATION ? 'hidden' : ''}`}>
            {BricksCodeParser?.errors.length > 0 && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex flex-col">
                <div className="self-center flex flex-row flex-nowrap items-center -mt-1 mb-1">
                    <strong className="font-bold">Couldn't parse code</strong>
                    <IconAlertTriangle className="ml-1 w-5 h-5 text-red-400" />
                </div>
                <pre className="text-sm overflow-x-auto">{BricksCodeParser.errors.join("\n")}</pre>
            </div>}
            {/* TODO: [ngIf]="codeParser?.expected.expectedTaskLabels && codeParser.expected.expectedTaskLabels.length>0" */}
            {BricksCodeParser.globalComments && BricksCodeParser.globalComments.length > 0 && <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative flex flex-col">
                <div className="self-center flex flex-row flex-nowrap items-center -mt-1 mb-1">
                    <strong className="font-bold">Information</strong>
                    <IconInfoCircle className="ml-1 w-5 h-5 text-blue-400" />
                </div>
                <div className="flex flex-col" style={{ maxWidth: '30rem' }}>
                    {BricksCodeParser.globalComments.map((cLine, index) => (<span className="text-sm">{cLine}</span>))}
                </div>
            </div>}
            {BricksCodeParser?.variables.length == 0 ? (<label>Nothing to parse, code can be used without changes</label>) : (
                <div className="grid grid-cols-3 gap-x-2 gap-y-2 items-center text-left pb-4 px-4" style={{ gridTemplateColumns: 'max-content max-content max-content' }}>
                    <label className="font-bold col-start-1">{props.functionType} name</label>
                    <div className="contents">
                        <input className="h-9 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" type="text"
                            value={BricksCodeParser.functionName} onChange={(e: any) => onInputFunctionName(e)} />
                    </div>
                    <div className="col-span-1 inline-flex">
                        {BricksCodeParser.nameTaken && <Tooltip content={BricksCodeParser.functionName + ' name exists'} color="invert" placement="top">
                            <IconAlertTriangle className="w-6 h-6 text-red-700" stroke={1.5} />
                        </Tooltip>}
                    </div>
                    {/* TODO [ngIf]="codeParser.labelingTaskName" */}
                    <label className="font-bold">Variable</label>
                    <label className="font-bold">Value</label>
                    {BricksCodeParser.variables.map((v, index) => (<div key={index} className="contents">
                        <Tooltip content={TOOLTIPS_DICT.GENERAL.OPTIONAL} color="invert" placement="left">
                            <label className={`text-sm col-start-1 ${v.optional ? 'text-gray-400 text-left' : ''}`}>{v.displayName}
                                {!v.optional && <span>*</span>}
                            </label>
                        </Tooltip>
                        <VariableSelect variable={v} index={index} sendOption={() => {
                            const configCopy = BricksCodeParser.replaceVariables(jsonCopy(config), props.executionTypeFilter);
                            dispatch(setBricksIntegrator(configCopy));
                        }} />
                        {v.comment && <Tooltip content={v.comment} color="invert" placement="top">
                            <IconInfoCircle className="w-6 h-6 " stroke={2} />
                        </Tooltip>}
                    </div>))}
                    {/* TODO [ngIf]="codeParser.expected.labelMappingActive" */}
                </div>)}
            <div className="w-full">
                <div className="flex flex-row justify-between cursor-pointer items-center" onClick={() => {
                    const configCopy = { ...config };
                    configCopy.integratorCodeOpen = !configCopy.integratorCodeOpen;
                    dispatch(setBricksIntegrator(configCopy));
                }}>
                    <label className="text-base font-bold text-gray-900 cursor-pointer underline">Final Code</label>
                    <IconChevronsDown className={`w-6 h-6 ${config.integratorCodeOpen ? style.rotateTransform : null}`} />
                </div>
                <div className={`flex flex-col mt-1 items-center ${config.integratorCodeOpen ? '' : 'hidden'}`}>
                    <div className="overflow-y-auto" style={{ maxHeight: '15rem', maxWidth: '35rem' }}>
                        <pre className={`${style.editorPre}`} style={{ overflowX: config.integratorCodeOpen ? 'auto' : 'hidden' }}>{config.preparedCode}</pre>
                    </div>
                </div>
            </div>
        </div >}
    </>);
}