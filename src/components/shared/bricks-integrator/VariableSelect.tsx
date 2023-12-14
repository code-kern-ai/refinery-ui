import { selectBricksIntegratorAttributes, setAttributesBricksIntegrator } from "@/src/reduxStore/states/general";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { GET_ATTRIBUTES_BY_PROJECT_ID } from "@/src/services/gql/queries/project-setting";
import { BricksVariableType, VariableSelectProps } from "@/src/types/shared/bricks-integrator";
import { BricksVariableComment, isCommentTrue } from "@/src/util/classes/bricks-integrator/comment-lookup";
import { postProcessingAttributes } from "@/src/util/components/projects/projectId/settings/data-schema-helper";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { useLazyQuery } from "@apollo/client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function VariableSelect(props: VariableSelectProps) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const attributes = useSelector(selectBricksIntegratorAttributes);

    const [refetchAttributes] = useLazyQuery(GET_ATTRIBUTES_BY_PROJECT_ID, { fetchPolicy: "network-only" });

    useEffect(() => {
        if (!props.variable) return;
        setAllowedValues(props.variable.type, props.variable.comment);
    }, [props.variable])

    function setAllowedValues(forType: BricksVariableType, comment: string) {
        switch (forType) {
            // case BricksVariableType.LANGUAGE:
            //     const allLanguages = isCommentTrue(comment, BricksVariableComment.LANGUAGE_ALL);
            //     return this.base.dataRequestor.getIsoCodes(!allLanguages);
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
            // case BricksVariableType.LABELING_TASK:
            //     let typeFilter = null;
            //     if (isCommentTrue(comment, BricksVariableComment.LABELING_TASK_ONLY_CLASSIFICATION)) typeFilter = 'MULTICLASS_CLASSIFICATION';
            //     else if (isCommentTrue(comment, BricksVariableComment.LABELING_TASK_ONLY_EXTRACTION)) typeFilter = 'INFORMATION_EXTRACTION';
            //     return this.base.dataRequestor.getLabelingTasks(typeFilter);
            // case BricksVariableType.LABEL:
            //     if (!this.base.labelingTaskId) {
            //         console.log("no labeling task id given -> can't collect allowed labels");
            //         return;
            //     }
            //     return this.base.dataRequestor.getLabels(this.base.labelingTaskId);
            // case BricksVariableType.EMBEDDING:
            //     if (!this.base.labelingTaskId) {
            //         return this.base.dataRequestor.getEmbeddings();
            //     }
            //     return this.base.dataRequestor.getEmbeddings(this.base.labelingTaskId);
            // case BricksVariableType.LOOKUP_LIST:
            //     return this.base.dataRequestor.getLookupLists();
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
            if (filtered.length == 0) return ['No useable attributes'];
            dispatch(setAttributesBricksIntegrator(filtered));
        });
    }

    return (<>
        {props.variable && props.variable.values.map((v, index) => (<div key={index} className="col-start-2 flex flex-row flex-nowrap items-center gap-x-2">
            {props.variable.type == BricksVariableType.ATTRIBUTE &&
                <Dropdown options={attributes} buttonName={props.variable.values[props.index] ? props.variable.values[props.index] : 'Select attribute'}
                    selectedOption={(option: any) => {
                        const propsCopy = { ...props };
                        propsCopy.variable.values[index] = option;
                        props.sendOption();
                    }}
                />}
        </div>))}
    </>)
}