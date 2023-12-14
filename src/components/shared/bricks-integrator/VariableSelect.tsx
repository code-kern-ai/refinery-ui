import { selectBricksIntegratorAttributes, selectBricksIntegratorEmbeddings, selectBricksIntegratorLabelingTasks, selectBricksIntegratorLanguages, selectBricksIntegratorLookupLists, setAttributesBricksIntegrator, setEmbeddingsBricksIntegrator, setLabelingTasksBricksIntegrator, setLanguagesBricksIntegrator, setLookupListsBricksIntegrator } from "@/src/reduxStore/states/general";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { LOOKUP_LISTS_BY_PROJECT_ID } from "@/src/services/gql/queries/lookup-lists";
import { GET_ATTRIBUTES_BY_PROJECT_ID, GET_EMBEDDING_SCHEMA_BY_PROJECT_ID, GET_LABELING_TASKS_BY_PROJECT_ID } from "@/src/services/gql/queries/project-setting";
import { LabelingTaskTarget, LabelingTaskTaskType } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { BricksVariable, BricksVariableType, VariableSelectProps } from "@/src/types/shared/bricks-integrator";
import { BricksVariableComment, isCommentTrue } from "@/src/util/classes/bricks-integrator/comment-lookup";
import { postProcessingAttributes } from "@/src/util/components/projects/projectId/settings/data-schema-helper";
import { postProcessLabelingTasks } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { getIsoCodes } from "@/src/util/shared/bricks-integrator-helper";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { useLazyQuery } from "@apollo/client";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function VariableSelect(props: VariableSelectProps) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const attributes = useSelector(selectBricksIntegratorAttributes);
    const languages = useSelector(selectBricksIntegratorLanguages);
    const embeddings = useSelector(selectBricksIntegratorEmbeddings);
    const labelingTasks = useSelector(selectBricksIntegratorLabelingTasks);
    const lookupLists = useSelector(selectBricksIntegratorLookupLists);
    const labels = [];

    const [refetchAttributes] = useLazyQuery(GET_ATTRIBUTES_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchEmbeddings] = useLazyQuery(GET_EMBEDDING_SCHEMA_BY_PROJECT_ID, { fetchPolicy: "no-cache" });
    const [refetchLookupLists] = useLazyQuery(LOOKUP_LISTS_BY_PROJECT_ID);
    const [refetchLabelingTasksByProjectId] = useLazyQuery(GET_LABELING_TASKS_BY_PROJECT_ID, { fetchPolicy: "network-only" });

    useEffect(() => {
        if (!props.variable) return;
        setAllowedValues(props.variable.type, props.variable.comment);
    }, [props.variable]);

    function setAllowedValues(forType: BricksVariableType, comment: string) {
        switch (forType) {
            case BricksVariableType.LANGUAGE:
                const allLanguages = isCommentTrue(comment, BricksVariableComment.LANGUAGE_ALL);
                refetchLanguagesAndProcess(!allLanguages);
                break;
            case BricksVariableType.ATTRIBUTE:
                if (isCommentTrue(comment, BricksVariableComment.ATTRIBUTE_ONLY_TEXT_LIKE)) {
                    refetchAttributesAndProcess(['TEXT', 'CATEGORY']);
                    return;
                }
                else if (isCommentTrue(comment, BricksVariableComment.ATTRIBUTE_ONLY_TEXT)) {
                    refetchAttributesAndProcess(['TEXT']);
                    return;
                }
                refetchAttributesAndProcess();
                break;
            case BricksVariableType.LABELING_TASK:
                let typeFilter = null;
                if (isCommentTrue(comment, BricksVariableComment.LABELING_TASK_ONLY_CLASSIFICATION)) typeFilter = 'MULTICLASS_CLASSIFICATION';
                else if (isCommentTrue(comment, BricksVariableComment.LABELING_TASK_ONLY_EXTRACTION)) typeFilter = 'INFORMATION_EXTRACTION';
                refetchLabelingTasksAndProcess(typeFilter)
                break;
            // case BricksVariableType.LABEL:
            //     if (!this.base.labelingTaskId) {
            //         console.log("no labeling task id given -> can't collect allowed labels");
            //         return;
            //     }
            //     return this.base.dataRequestor.getLabels(this.base.labelingTaskId);
            case BricksVariableType.EMBEDDING:
                if (!props.labelingTaskId) {
                    refetchEmbeddingsAndProcess();
                    return;
                }
                refetchEmbeddingsAndProcess(props.labelingTaskId);
                break;
            case BricksVariableType.LOOKUP_LIST:
                refetchLookupListsAndProcess();
                break;
            default:
                return null;
        }
    }

    function refetchAttributesAndProcess(typeFilter: string[] = ['TEXT'], stateFilter: string[] = ["UPLOADED", "USABLE", "AUTOMATICALLY_CREATED"]) {
        refetchAttributes({ variables: { projectId: projectId, stateFilter: ['ALL'] } }).then((res) => {
            const attributes = postProcessingAttributes(res.data['attributesByProjectId']);
            let filtered = attributes.filter(att => stateFilter.includes(att.state));
            if (typeFilter) {
                filtered = filtered.filter(att => typeFilter.includes(att.dataType));
            }
            if (filtered.length == 0) return dispatch(setAttributesBricksIntegrator(['No useable attributes']));
            dispatch(setAttributesBricksIntegrator(filtered));
        });
    }

    function refetchLanguagesAndProcess(allLanguages: boolean) {
        dispatch(setLanguagesBricksIntegrator(getIsoCodes(allLanguages)))
    }

    function refetchEmbeddingsAndProcess(labelingTaskId: string | null = null) {
        refetchEmbeddings({ variables: { projectId: projectId } }).then((res) => {
            const embeddings = res.data['projectByProjectId']['embeddings']['edges'].map((e) => e['node']);
            if (!embeddings || !labelingTasks) {
                console.log("labeling Tasks or embeddings not yet loaded");
                return null;
            }
            if (!labelingTaskId) return dispatch(setEmbeddingsBricksIntegrator(embeddings.map(x => x))); //copy of array not of values
            const task = labelingTasks.find(lt => lt.id == labelingTaskId);
            if (!task) return dispatch(setEmbeddingsBricksIntegrator(['No useable embeddings']));
            const onlyAttribute = task.taskType == LabelingTaskTaskType.MULTICLASS_CLASSIFICATION
            let filtered = embeddings.filter(e => (e.type == LabelingTaskTarget.ON_ATTRIBUTE && onlyAttribute) || (e.type != LabelingTaskTarget.ON_ATTRIBUTE && !onlyAttribute));
            if (filtered && filtered.length > 0) return dispatch(setEmbeddingsBricksIntegrator(filtered));
            else return dispatch(setEmbeddingsBricksIntegrator(['No useable embeddings']));
        });
    }

    function refetchLookupListsAndProcess() {
        refetchLookupLists({ variables: { projectId: projectId } }).then((res) => {
            const lookupLists = res.data["knowledgeBasesByProjectId"];
            if (!lookupLists) {
                console.log("lookup lists not yet loaded");
                return null;
            }
            if (lookupLists.length > 0) return dispatch(setLookupListsBricksIntegrator(lookupLists));
            else return dispatch(setLookupListsBricksIntegrator(['No useable lookup lists']));
        });
    }

    function refetchLabelingTasksAndProcess(typeFilter: string) {
        refetchLabelingTasksByProjectId({ variables: { projectId: projectId } }).then((res) => {
            const labelingTasks = postProcessLabelingTasks(res['data']['projectByProjectId']['labelingTasks']['edges']);
            if (!labelingTasks) {
                console.log("labeling Tasks not yet loaded");
                return null;
            }
            let filtered = labelingTasks;
            if (typeFilter) {
                filtered = filtered.filter(lt => lt.taskType == typeFilter);

            }
            if (filtered.length == 0) return dispatch(setLabelingTasksBricksIntegrator(['No useable labeling tasks']));
            return dispatch(setLabelingTasksBricksIntegrator(filtered));
        });
    }

    function changeInputValue(index: number, value: string) {
        const propsCopy = { ...props };
        propsCopy.variable.values[index] = value
        props.sendOption();
    }

    function setActiveNegateColorAndValue(index: number) {
        if (props.variable.type != BricksVariableType.GENERIC_BOOLEAN) return;
        const propsCopy = { ...props };
        if (propsCopy.variable.values[index] == null) {
            propsCopy.variable.values[index] = "True";
            propsCopy.variable.options.colors[index] = "#2563eb";
        } else if (propsCopy.variable.values[index] == "True") {
            propsCopy.variable.values[index] = "False";
            propsCopy.variable.options.colors[index] = "#ef4444";
        } else {
            propsCopy.variable.values[index] = null;
            propsCopy.variable.options.colors[index] = null;
        }
        props.sendOption();
    }

    return (<>
        {props.variable && props.variable.values.map((v, index) => (<div key={index} className="col-start-2 flex flex-row flex-nowrap items-center gap-x-2">
            {props.variable.type == BricksVariableType.ATTRIBUTE &&
                <Dropdown options={attributes} buttonName={props.variable.values[index] ? props.variable.values[index] : 'Select attribute'}
                    selectedOption={(option: any) => {
                        const propsCopy = { ...props };
                        propsCopy.variable.values[index] = option;
                        props.sendOption();
                    }}
                />}
            {props.variable.type == BricksVariableType.LANGUAGE &&
                <Dropdown options={languages} buttonName={props.variable.values[index] ? props.variable.values[index] : 'Select language'}
                    selectedOption={(option: any) => {
                        const propsCopy = { ...props };
                        propsCopy.variable.values[index] = option;
                        props.sendOption();
                    }}
                />}
            {props.variable.type == BricksVariableType.EMBEDDING &&
                <Dropdown options={embeddings} buttonName={props.variable.values[index] ? props.variable.values[index] : 'Select embedding'}
                    selectedOption={(option: any) => {
                        const propsCopy = { ...props };
                        propsCopy.variable.values[index] = option;
                        props.sendOption();
                    }}
                />}
            {props.variable.type == BricksVariableType.LOOKUP_LIST &&
                <Dropdown options={lookupLists ?? []} buttonName={props.variable.values[index] ? props.variable.values[index] : 'Select lookup list'}
                    selectedOption={(option: any) => {
                        const propsCopy = { ...props };
                        propsCopy.variable.values[index] = option;
                        props.sendOption();
                    }}
                />}
            {/* {props.variable.type == BricksVariableType.LABEL &&
                <Dropdown options={labels} buttonName={props.variable.values[props.index] ? props.variable.values[props.index] : 'Select label'}
                    selectedOption={(option: any) => {
                        const propsCopy = { ...props };
                        propsCopy.variable.values[index] = option;
                        props.sendOption();
                    }}
                />} */}
            {props.variable.type == BricksVariableType.LABELING_TASK &&
                <Dropdown options={labelingTasks} buttonName={props.variable.values[index] ? props.variable.values[index] : 'Select task'}
                    selectedOption={(option: any) => {
                        const propsCopy = { ...props };
                        propsCopy.variable.values[index] = option;
                        props.sendOption();
                    }}
                />}

            {props.variable.type == BricksVariableType.GENERIC_CHOICE &&
                <Dropdown options={props.variable.allowedValues} buttonName={props.variable.values[index] ? props.variable.values[index] : 'Select option'}
                    selectedOption={(option: any) => {
                        const propsCopy = { ...props };
                        propsCopy.variable.values[index] = option;
                        props.sendOption();
                    }}
                />}

            {props.variable.type == BricksVariableType.REGEX &&
                <input type="text" value={props.variable.values[index]} id={'REGEX_' + props.index + '_' + index}
                    onChange={(e) => changeInputValue(index, e.target.value)}
                    className="h-9 w-full border-gray-300 rounded-md leading-8 placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />}

            {props.variable.type == BricksVariableType.GENERIC_STRING &&
                <input type="text" value={props.variable.values[index]} id={'GENERIC_STRING_' + props.index + '_' + index}
                    onChange={(e) => changeInputValue(index, e.target.value)} style={{ minWidth: '10rem', maxWidth: '25rem' }}
                    className={`h-9 border-gray-300 rounded-md leading-8 placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100 ${props.variable.values[index]?.length > 20 ? 'w-60' : 'w-50'}`} />}

            {props.variable.type == BricksVariableType.GENERIC_INT &&
                <input type="number" step="1" value={props.variable.values[index]} id={'GENERIC_INT_' + props.index + '_' + index}
                    onChange={(e) => changeInputValue(index, e.target.value)}
                    className={`h-9 w-20 border-gray-300 rounded-md leading-8 placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100`} />}

            {props.variable.type == BricksVariableType.GENERIC_FLOAT &&
                <input type="number" step="0.01" value={props.variable.values[index]} id={'GENERIC_FLOAT_' + props.index + '_' + index}
                    onChange={(e) => changeInputValue(index, e.target.value)}
                    className={`h-9 w-20 border-gray-300 rounded-md leading-8 placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100`} />}

            {props.variable.type == BricksVariableType.GENERIC_BOOLEAN && <div className="mr-2 h-4 w-4 border-gray-300 border rounded cursor-pointer hover:bg-gray-200"
                id={'GENERIC_BOOLEAN_' + props.index + '_' + index} style={{ backgroundColor: props.variable.options.colors[index], borderColor: props.variable.options.colors[index] }}
                onClick={() => setActiveNegateColorAndValue(index)}>
            </div>}

            {props.variable.type == BricksVariableType.GENERIC_RANGE &&
                <div className="flex flex-row flex-nowrap items-center gap-x-2">
                    <input type="range" step="0.1" value={props.variable.values[index]} id={'GENERIC_RANGE_' + props.index + '_' + index}
                        min={props.variable.allowedValues[0]} max={props.variable.allowedValues[1]}
                        onChange={(e) => changeInputValue(index, e.target.value)} style={{ minWidth: '10rem', maxWidth: '25rem' }}
                        className={`h-9 border-gray-300 rounded-md leading-8 placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100`} />
                    <output>{props.variable.values[index]}</output>
                </div>
            }

            {props.variable.values.length > 1 && <div onClick={() => {
                const propsCopy = { ...props };
                propsCopy.variable.values.splice(index, 1);
                if (props.variable.type == BricksVariableType.GENERIC_BOOLEAN) {
                    propsCopy.variable.options.colors.splice(index, 1);
                }
                props.sendOption();
            }} className="cursor-pointer btn hover:border-transparent hover:bg-transparent border-transparent bg-transparent btn-xs px-0">
                <IconTrash className="text-gray-900 h-4 w-4" />
            </div>}

            {props.variable.canMultipleValues && index == props.variable.values.length - 1 && <label onClick={() => {
                const propsCopy = { ...props };
                propsCopy.variable.values.push('');
                props.sendOption();
            }} className="inline-flex items-center px-0.5 py-0.5 border border-gray-200 shadow-sm text-xs font-medium rounded text-gray-700 bg-white focus:outline-none cursor-pointer">
                <IconPlus className="h-4 w-4 text-gray-700" />
            </label>}
        </div>))}
    </>)
}