import { Organization } from "@/src/reduxStore/states/general";
import { Attribute } from "@/src/types/components/projects/projectId/settings/data-schema";
import { Embedding, EmbeddingCreationEnabledProps, EmbeddingPlatform, EmbeddingState, EmbeddingType, PlatformType, RecommendedEncoder } from "@/src/types/components/projects/projectId/settings/embeddings";
import { jsonCopy } from "@/submodules/javascript-functions/general";

export const DEFAULT_AZURE_TYPE = 'azure';

export function postProcessingEmbeddings(embeddings: Embedding[], queuedEmbeddings: any[]): any[] {
    const preparedEmbeddings: any[] = jsonCopy(embeddings);
    queuedEmbeddings.forEach((task: any) => {
        console.log(task)
        preparedEmbeddings.push({
            id: task.id,
            name: task.taskInfo.embeddingName,
            custom: false,
            type: task.taskInfo.embeddingType == EmbeddingType.ON_ATTRIBUTE ? EmbeddingType.ON_ATTRIBUTE : EmbeddingType.ON_TOKEN,
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
    if (organization?.gdprCompliant) {
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

function buildExpectedEmbeddingName(data: any): string {
    let toReturn = data.targetAttribute.name;
    toReturn += "-" + (data.granularity.value == EmbeddingType.ON_ATTRIBUTE ? 'classification' : 'extraction');
    const platform = data.platform;
    if (platform == PlatformType.HUGGING_FACE || platform == PlatformType.PYTHON) {
        toReturn += "-" + platform + "-" + data.model;
    } else if (platform == PlatformType.OPEN_AI || platform == PlatformType.COHERE || platform == PlatformType.AZURE) {
        toReturn += buildEmbeddingNameWithApiToken(data);
    }
    return toReturn;
}

function buildEmbeddingNameWithApiToken(data: any) {
    if (data.apiToken == null) return "";
    if (data.platform == PlatformType.AZURE) data.model = data.engine;
    const platformStr = "-" + data + "-";
    const apiTokenCut = data.apiToken.substring(0, 3) + "..." + data.apiToken.substring(data.apiToken.length - 4, data.apiToken.length);
    if (data.platform == PlatformType.OPEN_AI || data.platform == PlatformType.AZURE) return platformStr + data.model + "-" + apiTokenCut;
    else return platformStr + apiTokenCut;
}

export function checkDuplicates(embeddings: any, data: any): boolean {
    const currentName = buildExpectedEmbeddingName(data);
    if (currentName.slice(-1) == "-") return false;
    else {
        for (const embedding of embeddings) {
            if (embedding.name == currentName) return false;
        }
    }
    return true;
}

export function checkIfCreateEmbeddingIsDisabled(props: EmbeddingCreationEnabledProps) {
    let checkFormFields: boolean = false;
    const platform = props.platform;
    if (!platform) return true;
    const model = props.model;
    const apiToken = props.apiToken;
    const termsAccepted = props.termsAccepted;
    const engine = props.engine;
    const version = props.version;
    const url = props.url;
    if (platform.name == platformNamesDict[PlatformType.HUGGING_FACE] || platform.name == platformNamesDict[PlatformType.PYTHON]) {
        checkFormFields = model == null || model == "";
    } else if (platform.name == platformNamesDict[PlatformType.OPEN_AI]) {
        checkFormFields = model == null || apiToken == null || apiToken == "" || !termsAccepted;
    } else if (platform.name == platformNamesDict[PlatformType.COHERE]) {
        checkFormFields = apiToken == null || apiToken == "" || !termsAccepted;
    } else if (platform.name == platformNamesDict[PlatformType.AZURE]) {
        checkFormFields = apiToken == null || apiToken == "" || url == null || url == "" || version == null || version == "" || !termsAccepted || !engine;
    }
    const data = {
        targetAttribute: props.targetAttribute,
        platform: props.embeddingPlatforms.find((p: EmbeddingPlatform) => p.name == platform.name)?.platform,
        granularity: props.granularity,
        model: model,
        apiToken: apiToken,
        engine: engine,
        url: url,
        version: version
    }
    return checkFormFields || !checkDuplicates(props.embeddings, data);
}