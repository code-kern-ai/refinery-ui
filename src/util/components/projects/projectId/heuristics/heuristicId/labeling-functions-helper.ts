import { Attribute } from "@/src/types/components/projects/projectId/settings/data-schema";
import { Embedding } from "@/src/types/components/projects/projectId/settings/embeddings";
import { LabelingTask } from "@/src/types/components/projects/projectId/settings/labeling-tasks";

export function embeddingRelevant(embedding: Embedding, attributes: Attribute[], labelingTasks: LabelingTask[], currentLabelingTaskId: string): boolean {
    if (!embedding) return false;
    const attributeType = attributes.find(a => a.id == embedding.attributeId)?.dataType;
    if (attributeType != 'TEXT') return false;
    const onlyAttribute = labelingTasks.find(lt => lt.id == currentLabelingTaskId)?.taskType == 'MULTICLASS_CLASSIFICATION';
    return (embedding.type == 'ON_ATTRIBUTE' && onlyAttribute) || (embedding.type != 'ON_ATTRIBUTE' && !onlyAttribute)
}