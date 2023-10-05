import { Organization } from "@/src/reduxStore/states/general";
import { Attribute } from "@/src/types/components/projects/projectId/settings/data-schema";
import { Embedding, EmbeddingPlatform, EmbeddingState, EmbeddingType, PlatformType, RecommendedEncoder } from "@/src/types/components/projects/projectId/settings/embeddings";
import { jsonCopy } from "@/submodules/javascript-functions/general";

export const DEFAULT_AZURE_TYPE = 'azure';

export function postProcessingEmbeddings(embeddings: Embedding[], queuedEmbeddings: any[]): Embedding[] {
    const preparedEmbeddings: Embedding[] = jsonCopy(embeddings);
    queuedEmbeddings.forEach((task) => {
        queuedEmbeddings.push({
            id: task.id,
            name: task.taskInfo["embedding_name"],
            custom: false,
            type: task.taskInfo["type"] == EmbeddingType.ON_ATTRIBUTE ? EmbeddingType.ON_ATTRIBUTE : EmbeddingType.ON_TOKEN,
            state: EmbeddingState.QUEUED,
            progress: 0,
            dimension: 0,
            count: 0
        });
    });
    return preparedEmbeddings;
}

export const GRANULARITY_TYPES_ARRAY = [
    { name: 'Attribute', value: EmbeddingType.ON_ATTRIBUTE },
    { name: 'Token', value: EmbeddingType.ON_TOKEN }
];

export function postProcessingEmbeddingPlatforms(platforms: EmbeddingPlatform[], organization: Organization) {
    const preparedPlatforms: EmbeddingPlatform[] = [];
    if (organization.gdprCompliant) {
        platforms = platforms.filter((platform) => platform.terms == null);
    }
    platforms.forEach((platform: EmbeddingPlatform) => {
        platform = { ...platform, name: platformNamesDict[platform.platform] };
        if (platform.terms != null) {
            platform.splitTerms = platform.terms.split('@@PLACEHOLDER@@');
            platform.splitTerms[1] = platform.splitTerms[1].substring(1);
        }
        preparedPlatforms.push(platform);
    });
    return preparedPlatforms;
}

export const platformNamesDict = {
    [PlatformType.HUGGING_FACE]: "Hugging Face",
    [PlatformType.OPEN_AI]: "OpenAI",
    [PlatformType.COHERE]: "Cohere",
    [PlatformType.PYTHON]: "Python",
    [PlatformType.AZURE]: "Azure"
}

export function postProcessingRecommendedEncoders(attributes: Attribute[], tokenizer: string, encoderSuggestions: any): { [embeddingId: string]: RecommendedEncoder } {
    let embeddingHandles: { [embeddingId: string]: any } = {};
    let encoderSuggestionsCopy = [];
    encoderSuggestions = encoderSuggestions.filter(e => e.tokenizers.includes("all") || e.tokenizers.includes(tokenizer));
    if (!encoderSuggestions.length) return;
    if (encoderSuggestions) encoderSuggestions.forEach(element => {
        element = { ...element };
        if (typeof element.applicability === 'string' || element.applicability instanceof String) {
            element.applicability = JSON.parse(element.applicability);
        }
        encoderSuggestionsCopy.push(element);
    });
    attributes.forEach(att => {
        embeddingHandles[att.name] = encoderSuggestionsCopy;
    });
    return embeddingHandles;
}