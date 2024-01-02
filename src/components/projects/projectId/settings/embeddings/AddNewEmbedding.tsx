import Modal from "@/src/components/shared/modal/Modal";
import { selectOrganization } from "@/src/reduxStore/states/general";
import { selectModal } from "@/src/reduxStore/states/modal";
import { setModelsDownloaded } from "@/src/reduxStore/states/pages/models-downloaded";
import { selectEmbeddings, selectRecommendedEncodersAll, selectRecommendedEncodersDict, selectUsableNonTextAttributes, selectUseableEmbedableAttributes, setAllRecommendedEncodersDict } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { CREATE_EMBEDDING } from "@/src/services/gql/mutations/project-settings";
import { GET_EMBEDDING_PLATFORMS } from "@/src/services/gql/queries/project-setting";
import { GET_MODEL_PROVIDER_INFO } from "@/src/services/gql/queries/projects";
import { ModelsDownloaded } from "@/src/types/components/models-downloaded/models-downloaded";
import { Attribute } from "@/src/types/components/projects/projectId/settings/data-schema";
import { EmbeddingPlatform, EmbeddingProps, EmbeddingType, PlatformType, SuggestionsProps } from "@/src/types/components/projects/projectId/settings/embeddings";
import { DataTypeEnum } from "@/src/types/shared/general";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { postProcessingModelsDownload } from "@/src/util/components/models-downloaded/models-downloaded-helper";
import { DEFAULT_AZURE_TYPE, GRANULARITY_TYPES_ARRAY, checkIfCreateEmbeddingIsDisabled, platformNamesDict, postProcessingEmbeddingPlatforms } from "@/src/util/components/projects/projectId/settings/embeddings-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { IconExternalLink } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Add embedding', disabled: false, useButton: true };

export default function AddNewEmbedding(props: EmbeddingProps) {
    const dispatch = useDispatch();

    const useableEmbedableAttributes = useSelector(selectUseableEmbedableAttributes);
    const embeddingHandles = useSelector(selectRecommendedEncodersDict);
    const embeddingHandlesAll = useSelector(selectRecommendedEncodersAll);
    const organization = useSelector(selectOrganization);
    const projectId = useSelector(selectProjectId);
    const useableNonTextAttributes = useSelector(selectUsableNonTextAttributes);
    const modalEmbedding = useSelector(selectModal(ModalEnum.ADD_EMBEDDING));
    const embeddings = useSelector(selectEmbeddings);

    const [targetAttribute, setTargetAttribute] = useState(null);
    const [platform, setPlatform] = useState(null);
    const [filteredAttributes, setFilteredAttributes] = useState([]);
    const [granularity, setGranularity] = useState(null);
    const [model, setModel] = useState(null);
    const [apiToken, setApiToken] = useState('');
    const [engine, setEngine] = useState('');
    const [url, setUrl] = useState('');
    const [version, setVersion] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    const [embeddingPlatforms, setEmbeddingPlatforms] = useState([]);
    const [azureEngines, setAzureEngines] = useState([]);
    const [azureUrls, setAzureUrls] = useState([]);
    const [azureVersions, setAzureVersions] = useState([]);
    const [selectedPlatform, setSelectedPlatform] = useState<EmbeddingPlatform>(null);
    const [granularityArray, setGranularityArray] = useState(GRANULARITY_TYPES_ARRAY);
    const [filteredAttributesArray, setFilteredAttributesArray] = useState<Attribute[]>([]);

    const [refetchEmbeddingPlatforms] = useLazyQuery(GET_EMBEDDING_PLATFORMS, { fetchPolicy: 'cache-first' });
    const [createEmbeddingMut] = useMutation(CREATE_EMBEDDING);

    const gdprText = useRef<HTMLLabelElement>(null);

    useEffect(() => {
        prepareSuggestions();
        refetchEmbeddingPlatforms().then((res) => {
            setEmbeddingPlatforms(postProcessingEmbeddingPlatforms(res.data['embeddingPlatforms'], organization));
            checkIfPlatformHasToken();
        });
    }, []);

    useEffect(() => {
        if (useableEmbedableAttributes.length == 0) return;
        setTargetAttribute(useableEmbedableAttributes[0].name);
        setPlatform(embeddingPlatforms[0]?.name);
        setGranularity(GRANULARITY_TYPES_ARRAY[0].name);
    }, [useableEmbedableAttributes]);

    useEffect(() => {
        if (!platform) return;
        if (embeddingHandlesAll.length == 0) return;
        prepareSuggestions();
        changePlatformOrGranularity();
    }, [platform, embeddingHandlesAll]);

    useEffect(() => {
        setFilteredAttributesArray(useableNonTextAttributes.map((a) => a.name));
    }, [useableNonTextAttributes]);

    function prepareSuggestions() {
        if (!targetAttribute || !platform) return;
        const platformVal = embeddingPlatforms.find((p: EmbeddingPlatform) => p.name == platform).platform;
        const suggestionList = embeddingHandlesAll.filter((suggestion: any) => suggestion.platform == platformVal);
        const embeddingHandlesCopy = jsonCopy(embeddingHandles);
        embeddingHandlesCopy[targetAttribute] = suggestionList;
        dispatch(setAllRecommendedEncodersDict(embeddingHandlesCopy));
    }

    function checkIfAttributeHasToken() {
        const attribute = useableEmbedableAttributes.find((a) => a.id == targetAttribute);
        if (attribute?.dataType == DataTypeEnum.EMBEDDING_LIST) {
            setGranularityArray(GRANULARITY_TYPES_ARRAY.filter((g) => g.value != EmbeddingType.ON_TOKEN));
        } else {
            checkIfPlatformHasToken();
        }
    }

    function changePlatformOrGranularity() {
        prepareSuggestions();
        const savePlatform = embeddingPlatforms.find((p: EmbeddingPlatform) => p.name == platform).platform;
        if (savePlatform == PlatformType.COHERE || savePlatform == PlatformType.OPEN_AI || savePlatform == PlatformType.AZURE) {
            setGranularity(GRANULARITY_TYPES_ARRAY.find((g) => g.value == EmbeddingType.ON_ATTRIBUTE).name);
            if (savePlatform == PlatformType.AZURE) {
                const azureUrls = localStorage.getItem('azureUrls');
                if (azureUrls) {
                    setAzureUrls(JSON.parse(azureUrls));
                }
                const azureVersions = localStorage.getItem('azureVersions');
                if (azureVersions) {
                    setAzureVersions(JSON.parse(azureVersions));
                }
                const azureEngines = localStorage.getItem('azureEngines');
                if (azureEngines) {
                    setAzureEngines(JSON.parse(azureEngines));
                }
            }
        }
        checkIfAttributeHasToken();
        const acceptButtonCopy = jsonCopy(ACCEPT_BUTTON);
        acceptButtonCopy.disabled = checkIfCreateEmbeddingIsDisabled({ platform, model, apiToken, termsAccepted, embeddings, targetAttribute, granularity, engine, url, version, embeddingPlatforms });
        setAcceptButton(acceptButtonCopy);
        setTermsAccepted(false);
        setModel(null);
        setApiToken('');
    }

    function checkIfPlatformHasToken() {
        if (platform == platformNamesDict[PlatformType.COHERE] || platform == platformNamesDict[PlatformType.OPEN_AI] || platform == platformNamesDict[PlatformType.AZURE]) {
            setGranularityArray(GRANULARITY_TYPES_ARRAY.filter((g) => g.value != EmbeddingType.ON_TOKEN));
        } else {
            setGranularityArray(GRANULARITY_TYPES_ARRAY);
        }
    }

    const prepareAzureData = useCallback(() => {
        const getAzureUrl = localStorage.getItem('azureUrls');
        const getAzureVersion = localStorage.getItem('azureVersions');
        const getAzureEngine = localStorage.getItem('azureEngines');

        if (getAzureUrl == undefined || !azureUrls.includes(url)) {
            const azureUrlsCopy = jsonCopy(azureUrls);
            azureUrlsCopy.push(url);
            setAzureUrls(azureUrlsCopy);
            localStorage.setItem('azureUrls', JSON.stringify(azureUrlsCopy));
        }
        if (getAzureVersion == undefined || !azureVersions.includes(version)) {
            const azureVersionsCopy = jsonCopy(azureVersions);
            azureVersionsCopy.push(version);
            setAzureUrls(azureVersionsCopy);
            localStorage.setItem('azureVersions', JSON.stringify(azureVersionsCopy));
        }

        if (getAzureEngine == undefined || !azureEngines.includes(engine)) {
            const azureEnginesCopy = jsonCopy(azureEngines);
            azureEnginesCopy.push(engine);
            setAzureUrls(azureEnginesCopy);
            localStorage.setItem('azureEngines', JSON.stringify(azureEnginesCopy));
        }
    }, [url, version, engine]);

    const addEmbedding = useCallback(() => {
        const config: any = {
            platform: embeddingPlatforms.find((p: EmbeddingPlatform) => p.name == platform).platform,
            termsText: gdprText.current != null ? gdprText.current.innerText : null,
            termsAccepted: termsAccepted,
            embeddingType: GRANULARITY_TYPES_ARRAY.find((g) => g.name == granularity).value == EmbeddingType.ON_TOKEN ? EmbeddingType.ON_TOKEN : EmbeddingType.ON_ATTRIBUTE,
            filterAttributes: filteredAttributes
        }

        if (platform == platformNamesDict[PlatformType.HUGGING_FACE] || platform == platformNamesDict[PlatformType.PYTHON]) {
            config.model = model;
        } else if (platform == platformNamesDict[PlatformType.OPEN_AI]) {
            config.model = model;
            config.apiToken = apiToken;
        } else if (platform == platformNamesDict[PlatformType.COHERE]) {
            config.apiToken = apiToken;
        } else if (platform == platformNamesDict[PlatformType.AZURE]) {
            config.model = engine; //note that is handled internally as model so we use the model field for the request
            config.apiToken = apiToken;
            config.base = url;
            config.type = DEFAULT_AZURE_TYPE;
            config.version = version;
            prepareAzureData();
        }

        const attributeId = useableEmbedableAttributes.find((a) => a.name == targetAttribute).id;
        createEmbeddingMut({ variables: { projectId: projectId, attributeId: attributeId, config: JSON.stringify(config) } }).then((res) => { });

    }, [embeddingPlatforms, platform, granularity, model, apiToken, engine, url, version, termsAccepted, modalEmbedding]);

    useEffect(() => {
        props.refetchWS();
    }, [addEmbedding]);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    useEffect(() => {
        setAcceptButton({ ...acceptButton, emitFunction: addEmbedding, disabled: checkIfCreateEmbeddingIsDisabled({ platform, model, apiToken, termsAccepted, embeddings, targetAttribute, granularity, engine, url, version, embeddingPlatforms }) });
    }, [addEmbedding, embeddingPlatforms]);

    return (
        <Modal modalName={ModalEnum.ADD_EMBEDDING} acceptButton={acceptButton}>
            <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
                Add an embedding </div>
            <div className="mb-2 flex flex-grow justify-center text-sm text-gray-500">
                {useableEmbedableAttributes ? 'Pick from the below solutions to build a vector representation' : 'No usable text attributes to embed exist'}
            </div>
            <form>
                <div className="grid grid-cols-2 gap-2 items-center" style={{ gridTemplateColumns: 'max-content auto' }}>
                    <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS.TARGET_ATTRIBUTE} placement="right" color="invert">
                        <span className="card-title mb-0 label-text flex"><span className="cursor-help underline filtersUnderline">Target Attribute</span></span>
                    </Tooltip>
                    <Dropdown options={useableEmbedableAttributes} buttonName={targetAttribute ?? 'Choose'} selectedOption={(option: string) => {
                        setTargetAttribute(option);
                    }} />

                    <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS.FILTER_ATTRIBUTES} placement="right" color="invert">
                        <span className="card-title mb-0 label-text flex"><span className="cursor-help underline filtersUnderline">Filter Attributes</span></span>
                    </Tooltip>
                    <Dropdown options={filteredAttributesArray} buttonName={filteredAttributes.length == 0 ? 'None selected' : filteredAttributes.join(',')} hasCheckboxes={true} hasSelectAll={true}
                        selectedOption={(option: any) => {
                            const filteredAttributes = [];
                            option.forEach((a: any) => {
                                if (a.checked) filteredAttributes.push(a.name);
                            });
                            setFilteredAttributes(filteredAttributes);
                        }} />

                    <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS.PLATFORM} placement="right" color="invert">
                        <span className="card-title mb-0 label-text flex"><span className="cursor-help underline filtersUnderline">Platform</span></span>
                    </Tooltip>
                    <Dropdown options={embeddingPlatforms} buttonName={platform ?? 'Choose'} selectedOption={(option: string) => {
                        setPlatform(option);
                        setSelectedPlatform(embeddingPlatforms.find((p: EmbeddingPlatform) => p.name == option));
                    }} />

                    <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS.GRANULARITY} placement="right" color="invert">
                        <span className="card-title mb-0 label-text flex"><span className="cursor-help underline filtersUnderline">Granularity</span></span>
                    </Tooltip>
                    <Dropdown options={granularityArray} buttonName={granularity ?? 'Choose'} selectedOption={(option: string) => {
                        setGranularity(option);
                    }} />
                    {platform == platformNamesDict[PlatformType.HUGGING_FACE] && <SuggestionsModel options={embeddingHandles[targetAttribute]} selectedOption={(model: string) => setModel(model)} />}
                    {platform == platformNamesDict[PlatformType.OPEN_AI] && <>
                        <SuggestionsModel options={embeddingHandles[targetAttribute]} selectedOption={(model: string) => setModel(model)} />
                        <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS.API_TOKEN} placement="right" color="invert">
                            <span className="card-title mb-0 label-text flex"><span className="cursor-help underline filtersUnderline">API token</span></span>
                        </Tooltip>
                        <input placeholder="Enter your API token" onChange={(e) => setApiToken(e.target.value)} value={apiToken}
                            className="h-9 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
                    </>}
                    {platform == platformNamesDict[PlatformType.COHERE] && <>
                        <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS.API_TOKEN} placement="right" color="invert">
                            <span className="card-title mb-0 label-text flex"><span className="cursor-help underline filtersUnderline">API token</span></span>
                        </Tooltip>
                        <input placeholder="Enter your API token" onChange={(e) => setApiToken(e.target.value)} value={apiToken}
                            className="h-9 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
                    </>}
                    {platform == platformNamesDict[PlatformType.PYTHON] && <SuggestionsModel options={embeddingHandles[targetAttribute]} selectedOption={(option: string) => setModel(option)} />}

                    {platform == platformNamesDict[PlatformType.AZURE] && <>
                        <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS.API_TOKEN} placement="right" color="invert">
                            <span className="card-title mb-0 label-text flex"><span className="cursor-help underline filtersUnderline">API token</span></span>
                        </Tooltip>
                        <input placeholder="Enter your API token" onChange={(e) => setApiToken(e.target.value)} value={apiToken}
                            className="h-9 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />

                        {azureEngines.length == 0 ? <>
                            <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS.ENGINE} placement="right" color="invert">
                                <span className="card-title mb-0 label-text flex"><span className="cursor-help underline filtersUnderline">Engine</span></span>
                            </Tooltip>
                            <input placeholder="Enter Azure engine" onChange={(e) => setEngine(e.target.value)} value={engine}
                                className="h-9 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
                        </> : <>
                            <SuggestionsAzure options={azureEngines} selectedOption={(option: string) => setEngine(option)} name="Engine" tooltip="This will be your custom engine name. You can find this in the Azure OpenAI studio in the deployments section." />
                        </>}

                        {azureUrls.length == 0 ? <>
                            <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS.URL} placement="right" color="invert">
                                <span className="card-title mb-0 label-text flex"><span className="cursor-help underline filtersUnderline">Azure URL</span></span>
                            </Tooltip>
                            <input placeholder="Enter Azure URL" onChange={(e) => setUrl(e.target.value)} value={url}
                                className="h-9 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
                        </> : <>
                            <SuggestionsAzure options={azureUrls} selectedOption={(option: string) => setUrl(option)} name="Azure URL" tooltip="This will be your custom URL, which looks like this: https://<your-api-base>.openai.azure.com/" />
                        </>}

                        {azureVersions.length == 0 ? <>
                            <div className="flex flex-row items-center">
                                <span className="card-title mb-0 label-text flex"><span className="cursor-help underline filtersUnderline">Version</span></span>
                                <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS.VERSION} placement="right" color="invert">
                                    <a href="https://learn.microsoft.com/en-us/rest/api/azureopenai/models/list" target="_blank">
                                        <IconExternalLink className="cursor-help ml-1 h-5 w-5" /></a>
                                </Tooltip>
                            </div>
                            <input placeholder="Enter Azure version" onChange={(e) => setVersion(e.target.value)} value={version}
                                className="h-9 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
                        </> : <>
                            <SuggestionsAzure options={azureVersions} selectedOption={(option: string) => setVersion(option)} name="Version" tooltip="The latest version of the Azure OpenAI service can also be found here." />
                        </>}
                    </>}
                </div>
                {(platform == platformNamesDict[PlatformType.COHERE] || platform == platformNamesDict[PlatformType.OPEN_AI] || platform == platformNamesDict[PlatformType.AZURE]) && <div className="text-center mt-3">
                    <div className="border border-gray-300 text-xs text-gray-500 p-2.5 rounded-lg text-justify">
                        <label ref={gdprText} className="text-gray-700">
                            {selectedPlatform.splitTerms[0]}
                            {platform == platformNamesDict[PlatformType.COHERE] && <a href={selectedPlatform.link} target="_blank" className="underline">cohere terms of service.</a>}
                            {platform == platformNamesDict[PlatformType.OPEN_AI] && <a href={selectedPlatform.link} target="_blank" className="underline">openai terms of service.</a>}
                            {platform == platformNamesDict[PlatformType.AZURE] && <a href={selectedPlatform.link} target="_blank" className="underline">azure terms of service.</a>}
                            <div>{selectedPlatform.splitTerms[1]}</div>
                        </label>
                    </div>
                    <div className="flex flex-row items-center justify-center m-3">
                        <input type="checkbox" id="termsAccepted" className="cursor-pointer" checked={termsAccepted} onChange={(e) => setTermsAccepted(!termsAccepted)} />
                        <label htmlFor="termsAccepted" className="text-gray-500 text-sm font-medium ml-1 cursor-pointer">
                            I have read and accept the terms
                        </label>
                    </div>
                </div>}
            </form>
        </Modal>
    )
}

function SuggestionsModel(props: SuggestionsProps) {
    const dispatch = useDispatch();

    const [colorDownloadedModels, setColorDownloadedModels] = useState<boolean[]>([]);

    const [refetchModelsDownload] = useLazyQuery(GET_MODEL_PROVIDER_INFO, { fetchPolicy: 'network-only', nextFetchPolicy: 'cache-first' });

    useEffect(() => {
        if (!props.options) return;
        refetchModelsDownload().then((res) => {
            const modelsDownloaded = postProcessingModelsDownload(res.data['modelProviderInfo']);
            dispatch(setModelsDownloaded(modelsDownloaded));
            const colorDownloadedModels = props.options.map((model: any) => {
                const checkIfModelExists = modelsDownloaded.find((modelDownloaded: ModelsDownloaded) => modelDownloaded.name === model.configString);
                return checkIfModelExists !== undefined;
            });
            setColorDownloadedModels(colorDownloadedModels);
        });
    }, [props.options]);

    return <><Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS.MODEL} placement="right" color="invert">
        <span className="card-title mb-0 label-text flex"><span className="cursor-help underline filtersUnderline">Model</span></span>
    </Tooltip>
        <Dropdown options={props.options.map((option: any) => option.configString)} hasSearchBar={true} differentTextColor="green" useDifferentTextColor={colorDownloadedModels}
            selectedOption={(option: string) => props.selectedOption(option)} />
    </>
}


function SuggestionsAzure(props: SuggestionsProps) {
    return <><Tooltip content={props.tooltip} placement="right" color="invert">
        <span className="card-title mb-0 label-text flex"><span className="cursor-help underline filtersUnderline">{props.name}</span></span>
    </Tooltip>
        <Dropdown options={props.options} hasSearchBar={true} selectedOption={(option: string) => props.selectedOption(option)} />
    </>
}