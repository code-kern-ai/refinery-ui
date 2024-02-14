import { selectBricksIntegrator, selectBricksIntegratorLabelingTasks, setBricksIntegrator } from "@/src/reduxStore/states/general";
import { IntegratorPage, PageIntegrationProps } from "@/src/types/shared/bricks-integrator";
import { BricksCodeParser } from "@/src/util/classes/bricks-integrator/bricks-integrator";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { Tooltip } from "@nextui-org/react";
import { IconAlertTriangle, IconCheck, IconChevronsDown, IconInfoCircle, IconTrash, IconX } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import VariableSelect from "./VariableSelect";
import { copyToClipboard, jsonCopy } from "@/submodules/javascript-functions/general";
import style from '@/src/styles/shared/bricks-integrator.module.css';
import { Fragment, useEffect } from "react";
import { selectLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { CREATE_LABELS } from "@/src/services/gql/queries/project-setting";
import { useMutation } from "@apollo/client";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { CREATE_TASK_AND_LABELS } from "@/src/services/gql/mutations/project-settings";
import Dropdown2 from "@/submodules/react-components/components/Dropdown2";

export default function PageIntegration(props: PageIntegrationProps) {
    const dispatch = useDispatch();

    const config = useSelector(selectBricksIntegrator);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const projectId = useSelector(selectProjectId);
    const labelingTasksBricks = useSelector(selectBricksIntegratorLabelingTasks);

    const [createLabelsMut] = useMutation(CREATE_LABELS);
    const [createTaskAndLabelsMut] = useMutation(CREATE_TASK_AND_LABELS);

    useEffect(() => {
        if (!labelingTasksBricks || labelingTasksBricks.length == 0 || !props.labelingTaskId) return;
        const configCopy = BricksCodeParser.checkVariableLines(jsonCopy(config), props.executionTypeFilter, props.labelingTaskId, props.forIde, labelingTasksBricks);
        dispatch(setBricksIntegrator(configCopy));
    }, [labelingTasksBricks, props.labelingTaskId]);

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

    function createNewLabelingTask(taskName: string, includedLabels: string[]) {
        if (!includedLabels.length) return;
        const taskType = 'MULTICLASS_CLASSIFICATION';// currently only option since extraction would require a new attribute as well!!
        let finalTaskName = taskName;

        let c = 0;
        while (!!labelingTasks.find(lt => lt.name == finalTaskName)) {
            finalTaskName = taskName + " " + ++c;
        }
        createTaskAndLabelsMut({ variables: { projectId: projectId, labelingTaskName: finalTaskName, labelingTaskType: taskType, labelingTaskTargetId: null, labels: includedLabels } }).then((res) => {
            const taskId = res.data?.createTaskAndLabels?.taskId;
            if (taskId) {
                props.selectDifferentTask(taskId);
            }
        });
    }

    function addMissingLabelsToTask() {
        if (!props.labelingTaskId) return;
        const missing = BricksCodeParser.expected.expectedTaskLabels.filter(x => !x.exists).map(x => x.label);
        createLabelsMut({ variables: { projectId: projectId, labelingTaskId: props.labelingTaskId, labels: missing } }).then((res) => {
            props.selectDifferentTask(props.labelingTaskId)
        });
    }

    return (<>
        {config && <div className={`flex flex-col gap-y-2 justify-center items-center my-4 ${config.page != IntegratorPage.INTEGRATION ? 'hidden' : ''}`}>
            {BricksCodeParser?.errors.length > 0 && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex flex-col">
                <div className="self-center flex flex-row flex-nowrap items-center -mt-1 mb-1">
                    <strong className="font-bold">Couldn&apos;t parse code</strong>
                    <IconAlertTriangle className="ml-1 w-5 h-5 text-red-400" />
                </div>
                <pre className="text-sm overflow-x-auto whitespace-pre-wrap">{BricksCodeParser.errors.join("\n")}</pre>
            </div>}
            {BricksCodeParser?.expected.expectedTaskLabels && BricksCodeParser.expected.expectedTaskLabels.length > 0 && <>
                {BricksCodeParser.expected.labelWarning ? (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative flex flex-col gap-y-2">
                        <div className="self-center flex flex-row flex-nowrap items-center -mt-1">
                            <strong className="font-bold">Warning</strong>
                            <IconAlertTriangle className="ml-1 w-5 h-5 text-yellow-400" />
                        </div>
                        <label className="text-sm -mt-1">Your selected task doesn&apos;t have all necessary labels:</label>
                        <div className="flex flex-row flex-wrap gap-2" style={{ maxWidth: '30rem' }}>
                            {BricksCodeParser.expected.expectedTaskLabels.map((label, index) => (<span key={label.label} className="text-sm inline-flex items-center">
                                <label className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${label.backgroundColor} ${label.textColor} ${label.borderColor}`}>
                                    {label.label}
                                    {label.exists ? (<IconInfoCircle className="ml-1 w-4 h-4 text-green-400" />) : (<IconX className="ml-1 w-4 h-4 text-gray-400" />)}
                                </label>
                            </span>))}
                        </div>
                        <div className="flex flex-row justify-center gap-x-1">
                            <button onClick={() => {
                                const configCopy = BricksCodeParser.activeLabelMapping(jsonCopy(config), props.executionTypeFilter, props.labelingTaskId, props.forIde, labelingTasks);
                                dispatch(setBricksIntegrator(configCopy));
                            }}
                                className="cursor-pointer bg-white text-gray-700 text-xs font-semibold whitespace-nowrap px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none">
                                Map labels
                            </button>
                            {BricksCodeParser.expected.canCreateTask && <button onClick={() => createNewLabelingTask(config.api.data.data.attributes.name, BricksCodeParser.expected.expectedTaskLabels.map(x => x.label))}
                                className="cursor-pointer bg-white text-gray-700 text-xs font-semibold whitespace-nowrap px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none">
                                Create new task
                            </button>}
                            <button onClick={addMissingLabelsToTask}
                                className="cursor-pointer bg-white text-gray-700 text-xs font-semibold whitespace-nowrap px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none">
                                Add missing labels ({BricksCodeParser.expected.labelsToBeCreated}x)
                            </button>
                        </div>
                    </div>
                ) : (<div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative flex flex-col gap-y-2 w-4/5">
                    <div className="self-center flex flex-row flex-nowrap items-center -mt-1">
                        <strong className="font-bold">Information</strong>
                        <IconInfoCircle className="ml-1 w-5 h-5 text-blue-400" />
                    </div>
                    <label className="text-sm -mt-1">All necessary labels found in task:</label>
                    <div className="flex flex-row flex-wrap gap-2" style={{ maxWidth: '30rem' }}>
                        {BricksCodeParser.expected.expectedTaskLabels.map((label: any, index: number) => (<span key={index} className="text-sm inline-flex items-center">
                            <label className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${label.backgroundColor} ${label.textColor} ${label.borderColor}`}>
                                {label.label}
                                <IconCheck className="ml-1 w-4 h-4 text-green-400" />
                            </label>
                        </span>))}
                    </div>
                    <div className="flex flex-row justify-center gap-x-1">
                        <button onClick={() => {
                            const configCopy = BricksCodeParser.activeLabelMapping(jsonCopy(config), props.executionTypeFilter, props.labelingTaskId, props.forIde, labelingTasks);
                            dispatch(setBricksIntegrator(configCopy));
                        }} className="cursor-pointer bg-white text-gray-700 text-xs font-semibold whitespace-nowrap px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none">
                            Map labels anyway
                        </button>
                    </div>
                </div>)}
            </>}

            {BricksCodeParser.globalComments && BricksCodeParser.globalComments.length > 0 && <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative flex flex-col">
                <div className="self-center flex flex-row flex-nowrap items-center -mt-1 mb-1">
                    <strong className="font-bold">Information</strong>
                    <IconInfoCircle className="ml-1 w-5 h-5 text-blue-400" />
                </div>
                <div className="flex flex-col" style={{ maxWidth: '30rem' }}>
                    {BricksCodeParser.globalComments.map((cLine, index) => (<span key={cLine} className="text-sm">{cLine}</span>))}
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
                        {BricksCodeParser.nameTaken && <Tooltip content={BricksCodeParser.functionName + ' name exists'} color="invert" placement="top" className="cursor-auto">
                            <IconAlertTriangle className="w-6 h-6 text-red-700" stroke={1.5} />
                        </Tooltip>}
                    </div>
                    {BricksCodeParser.labelingTaskName && <Fragment>
                        <label className="font-bold col-start-1">Labeling Task</label>
                        <Dropdown2 options={labelingTasks} buttonName={BricksCodeParser.labelingTaskName}
                            selectedOption={(option: any) => {
                                BricksCodeParser.labelingTaskName = option.name;
                                props.selectDifferentTask(option.id);
                            }} />
                        <Tooltip content={TOOLTIPS_DICT.HEURISTICS.SWITCH_LABELING_TASK} color="invert" placement="top" className="cursor-auto">
                            <IconAlertTriangle className="w-6 h-6 text-yellow-700" stroke={1.5} />
                        </Tooltip>
                    </Fragment>}

                    <label className="font-bold">Variable</label>
                    <label className="font-bold">Value</label>
                    <label></label>
                    {BricksCodeParser.variables.map((v, index) => (<Fragment key={v.baseName}>
                        <div>
                            <Tooltip content={v.optional ? TOOLTIPS_DICT.GENERAL.OPTIONAL : ''} color="invert" placement="left" className="cursor-auto">
                                <label className={`text-sm col-start-1 ${v.optional ? 'text-gray-400 text-left' : ''}`}>{v.displayName}
                                    {!v.optional && <span>*</span>}
                                </label>
                            </Tooltip>
                        </div>
                        <div>
                            <VariableSelect variable={v} index={index} sendOption={() => {
                                const configCopy = BricksCodeParser.replaceVariables(jsonCopy(config), props.executionTypeFilter, null, props.forIde);
                                dispatch(setBricksIntegrator(configCopy));
                            }} labelingTaskId={props.labelingTaskId} /></div>
                        <div>
                            {v.comment &&
                                <Tooltip content={v.comment} color="invert" placement="top" className="cursor-auto">
                                    <IconInfoCircle className="w-6 h-6 " stroke={2} />
                                </Tooltip>}
                        </div>
                    </Fragment>))}
                    {BricksCodeParser.expected.labelMappingActive && <Fragment>
                        <label className="font-bold col-start-1">Bricks label</label>
                        <label className="font-bold">Refinery label</label>
                        {BricksCodeParser.expected.expectedTaskLabels.map((l, index) => (<div key={l.label} className="contents">
                            <label className="text-sm col-start-1">{l.label}</label>
                            <Dropdown2 options={BricksCodeParser.expected.availableLabels} buttonName={l.mappedLabel ? l.mappedLabel : 'Ignore'}
                                selectedOption={(option: any) => {
                                    BricksCodeParser.expected.expectedTaskLabels[index].mappedLabel = option.name;
                                    const configCopy = BricksCodeParser.replaceVariables(jsonCopy(config), props.executionTypeFilter, null, props.forIde);
                                    dispatch(setBricksIntegrator(configCopy));
                                }} />
                            {BricksCodeParser.expected.expectedTaskLabels[index].mappedLabel && <Tooltip content={TOOLTIPS_DICT.GENERAL.CLEAR}>
                                <IconTrash strokeWidth={1.5} onClick={() => {
                                    BricksCodeParser.expected.expectedTaskLabels[index].mappedLabel = null;
                                    const configCopy = BricksCodeParser.replaceVariables(jsonCopy(config), props.executionTypeFilter, null, props.forIde);
                                    dispatch(setBricksIntegrator(configCopy));
                                }} />
                            </Tooltip>}
                        </div>))}
                    </Fragment>}
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
                    <div className="overflow-y-auto w-full" style={{ maxHeight: '15rem' }}>
                        <pre className={`${style.editorPre}`} style={{ overflowX: config.integratorCodeOpen ? 'auto' : 'hidden' }}>{config.preparedCode}</pre>
                    </div>
                </div>
            </div>
            {config.api.moduleId == -2 && <div className="w-full">
                <div className="flex flex-row justify-between cursor-pointer items-center" onClick={() => {
                    const configCopy = BricksCodeParser.replaceVariables(jsonCopy(config), props.executionTypeFilter, null, props.forIde);
                    configCopy.integratorParseOpen = !configCopy.integratorParseOpen;
                    dispatch(setBricksIntegrator(configCopy));
                }}>
                    <label className="text-base font-bold text-gray-900 cursor-pointer">Final Json</label>
                    <IconChevronsDown className={`w-6 h-6 ${config.integratorParseOpen ? style.rotateTransform : null}`} />
                </div>
                <div className={`flex flex-col mt-1 items-center ${config.integratorParseOpen ? '' : 'hidden'}`}>
                    <div className="overflow-y-auto" style={{ maxHeight: '15rem', maxWidth: '35rem' }}>
                        <pre className={`${style.editorPre}`} style={{ overflowX: config.overviewCodeOpen ? 'auto' : 'hidden' }}>{config.preparedJson}</pre>
                    </div>
                    <div className="flex flex-row flex-wrap gap-2">
                        <div className="flex flex-row flex-nowrap cursor-pointer" onClick={() => {
                            const configCopy = BricksCodeParser.replaceVariables(jsonCopy(config), props.executionTypeFilter, null, props.forIde);
                            configCopy.prepareJsonAsPythonEnum = !configCopy.prepareJsonAsPythonEnum;
                            dispatch(setBricksIntegrator(configCopy));
                        }}>
                            <input className="h-5 w-5 cursor-pointer" type="checkbox" checked={config.prepareJsonAsPythonEnum} onChange={() => { }} />
                            <label className="text-sm ml-1">Prepare as enum</label>
                        </div>
                        <div className="flex flex-row flex-nowrap cursor-pointer" onClick={() => {
                            const configCopy = BricksCodeParser.replaceVariables(jsonCopy(config), props.executionTypeFilter, null, props.forIde);
                            configCopy.prepareJsonRemoveYOUR = !configCopy.prepareJsonRemoveYOUR;
                            dispatch(setBricksIntegrator(configCopy));
                        }}>
                            <input className="h-5 w-5 cursor-pointer" type="checkbox" checked={config.prepareJsonRemoveYOUR} onChange={() => { }} />
                            <label className="text-sm ml-1">Remove YOUR_</label>
                        </div>
                    </div>
                    <Tooltip content={config.copied ? TOOLTIPS_DICT.GENERAL.COPIED : TOOLTIPS_DICT.GENERAL.CLICK_TO_COPY} color="invert" placement="top" className="mt-2">
                        <button type="button" onClick={() => copyToClipboard(config.preparedJson)}
                            className="bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-md border hover:bg-indigo-800 focus:outline-none">Copy</button>
                    </Tooltip>
                </div>
            </div>}
        </div >}
    </>);
}