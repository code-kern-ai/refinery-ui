import { CurrentPage } from "../types/shared/general";

export const TOOLTIPS_DICT = {
    [CurrentPage.PROJECT_SETTINGS]: {
        ['EMBEDDINGS']: {
            ['TARGET_ATTRIBUTE']: 'Choose attribute that will be encoded',
            ['FILTER_ATTRIBUTES']: 'Filter attributes that will be encoded',
            ['PLATFORM']: 'Choose the platform to embed records',
            ['GRANULARITY']: 'One embedding per attribute vs. per token',
            ['API_TOKEN']: 'Enter your API token',
            ['ENGINE']: 'This will be your custom engine name. You can find this in the Azure OpenAI studio in the deployments section',
            ['URL']: 'This will be your custom URL, which looks like this: https://<your-api-base>.openai.azure.com/',
            ['VERSION']: 'The latest version of the Azure OpenAI service can also be found here.',
            ['MODEL']: 'Choose your model',
        }
    },
    [CurrentPage.MODELS_DOWNLOAD]: {
        ['USED_ZS']: 'Can be used for zero-shot',
        ['NOT_USED_ZS']: 'Cannot be used for zero-shot',
        ['SUCCESS']: 'Successfully downloaded',
        ['ERROR']: 'Model ran into errors',
        ['DOWNLOADING']: 'Model is downloading',
        ['INITIALIZING']: 'Model is initializing',
        ['MODEL']: 'Name of your Hugging Face model'
    },
    [CurrentPage.PROJECTS]: {
        ['QUICK_DELETE']: 'Admin function: Quick delete project'
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
    },
    [CurrentPage.MODEL_CALLBACKS]: {
        'ADD_LABELING_TASK': 'Add new labeling task',
    }
}