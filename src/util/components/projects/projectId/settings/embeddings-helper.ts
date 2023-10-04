import { Embedding, EmbeddingType } from "@/src/types/components/projects/projectId/settings/embeddings";
import { jsonCopy } from "@/submodules/javascript-functions/general";

export function postProcessingEmbeddings(embeddings: Embedding[], queuedEmbeddings: any[]): Embedding[] {
    const preparedEmbeddings: Embedding[] = jsonCopy(embeddings);
    queuedEmbeddings.forEach((task) => {
        queuedEmbeddings.push({
            id: task.id,
            name: task.taskInfo["embedding_name"],
            custom: false,
            type: task.taskInfo["type"] == EmbeddingType.ON_ATTRIBUTE ? EmbeddingType.ON_ATTRIBUTE : EmbeddingType.ON_TOKEN,
            state: "QUEUED",
            progress: 0,
            dimension: 0,
            count: 0
        });
    });
    return preparedEmbeddings;
}


export const granularityTypesArray = [
    { name: 'Attribute', value: EmbeddingType.ON_ATTRIBUTE },
    { name: 'Token', value: EmbeddingType.ON_TOKEN }
];