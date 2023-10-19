import { CurrentPage } from "../types/shared/general";

export const TOOLTIPS_DICT = {
    [CurrentPage.PROJECT_SETTINGS]: {
        'ADD_NEW_ATTRIBUTE': 'Add a new attribute',
        'PROJECT_SNAPSHOT': 'Creates a snapshot compressed file of your current project',
        'ATTRIBUTE_NAME': 'Enter an attribute name',
        'SELECT_ATTRIBUTE_TYPE': 'Select an attribute type',
        'LATEST_SNAPSHOT': 'Latest prepared export file',
        'EMBEDDINGS': {
            'TARGET_ATTRIBUTE': 'Choose attribute that will be encoded',
            'FILTER_ATTRIBUTES': 'Filter attributes that will be encoded',
            'PLATFORM': 'Choose the platform to embed records',
            'GRANULARITY': 'One embedding per attribute vs. per token',
            'API_TOKEN': 'Enter your API token',
            'ENGINE': 'This will be your custom engine name. You can find this in the Azure OpenAI studio in the deployments section',
            'URL': 'This will be your custom URL, which looks like this: https://<your-api-base>.openai.azure.com/',
            'VERSION': 'The latest version of the Azure OpenAI service can also be found here.',
            'MODEL': 'Choose your model',
            'HAS_FILTER_ATTRIBUTES': 'Has filter attributes',
            'NO_FILTER_ATTRIBUTES': 'No filter attributes',
            'SUCCESSFULLY_CREATED': 'Successfully created',
            'ERROR': 'Embedding creation ran into errors',
            'GENERATE_EMBEDDING': 'Vectorize your attributes. Integration to Hugging Face available',
            'HOSTED_VERSION': 'Check out our hosted version to use this function',
            'NAVIGATE_MODELS_DOWNLOADED': 'See which models are downloaded'
        },
        'DATA_SCHEMA': {
            'UNIQUE_COMBINATION': 'Key combination is unique',
            'NOT_UNIQUE_COMBINATION': 'Key combination is not unique',
        },
        'META_DATA': {
            'STORE_CHANGES': 'Stores the changes',
            'CANNOT_BE_REVERTED': 'This action cannot be reverted',
        },
        'LABELING_TASK': {
            'NEW_LABELING_TASK': 'Currently supporting classifications and extractions',
            'TARGET_ATTRIBUTE': '',
            'NAME_LABELING_TASK': 'Name of your labeling task',
            'RENAME_LABEL': 'Rename label',
        }
    },
    [CurrentPage.MODELS_DOWNLOAD]: {
        'USED_ZS': 'Can be used for zero-shot',
        'NOT_USED_ZS': 'Cannot be used for zero-shot',
        'SUCCESS': 'Successfully downloaded',
        'ERROR': 'Model ran into errors',
        'DOWNLOADING': 'Model is downloading',
        'INITIALIZING': 'Model is initializing',
        'MODEL': 'Name of your Hugging Face model'
    },
    [CurrentPage.PROJECTS]: {
        'QUICK_DELETE': 'Admin function: Quick delete project'
    },
    [CurrentPage.LOOKUP_LISTS_DETAILS]: {
        'EDIT_NAME': 'Edit your lookup list name',
        'EDIT_DESCRIPTION': 'Edit your lookup list description',
        'PYTHON_VARIABLE': 'The variable name can be used inside a labeling function',
        'IMPORT': 'Copy import statement to clipboard',
        'UPLOAD_LOOKUP_LIST': 'Please ensure that the column is called "value"',
        'DOWNLOAD_LOOKUP_LIST': 'Download your lookup list to your local machine',
        'PASTE_LOOKUP_LIST': 'Paste your lookup list here',
        'DELETE_LOOKUP_LIST': 'Delete your lookup list',
        'SUBMIT': 'Submit',
        'CANCEL': 'Cancel',
    },
    [CurrentPage.MODEL_CALLBACKS]: {
        'ADD_LABELING_TASK': 'Add new labeling task',
        'ENABLE_ACTIONS': 'At least one model callback is needed to enable actions',
        'NAVIGATE_HEURISTICS': 'Go to heuristics overview',
        'NAVIGATE_LOOKUP_LISTS': 'Go to lookup lists overview',
    },
    [CurrentPage.ATTRIBUTE_CALCULATION]: {
        'CANNOT_EDIT_NAME': 'Cannot edit attribute\'s name, attribute is in use',
        'EDIT_NAME': 'Edit your attribute\'s name',
        'CANNOT_EDIT_DATATYPE': 'Cannot edit data type',
        'EDIT_DATATYPE': 'Edit your data type',
        'CLICK_TO_COPY': 'Click to copy',
        'IMPORT_STATEMENT': 'Click to copy import statement',
        'AVAILABLE_LIBRARIES': 'See available libraries for this attribute calculation',
        'BEING_EXECUTED': 'Currently being executed',
        'SUCCESS': 'Successfully executed',
        'ERROR': 'Execution ran into errors',
        'DELETE': 'Delete this attribute calculation',
        'EXECUTE_10_RECORDS': 'Execute the attribute on 10 records',

    },
    [CurrentPage.LOOKUP_LISTS_OVERVIEW]: {
        'ENABLE_ACTIONS': 'At least one lookup list is needed to enable actions',
        'CREATE_LOOKUP_LIST': 'Create a new lookup list',
        'NAVIGATE_HEURISTICS': 'Go to heuristics overview',
        'NAVIGATE_MODEL_CALLBACKS': 'Go to the model callbacks'

    },
    [CurrentPage.PROJECT_OVERVIEW]: {
        'VISUALIZATION': 'Choose the visualizations',
        'TARGET_TYPE': 'Choose the target type',
        'LABELING_TASK': 'Choose the labeling task',
        'STATIC_DATA_SLICE': 'Choose a static data slice',

    }
}