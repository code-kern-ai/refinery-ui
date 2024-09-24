import { CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";

export const TOOLTIPS_DICT = {
    ['GENERAL']: {
        'SUCCESSFULLY_CREATED': 'Successfully created',
        'ERROR': 'Execution ran into errors',
        'DOWNLOADING': 'Model is downloading',
        'INITIALIZING': 'Model is initializing',
        'IMPORT_STATEMENT': 'Copy import statement to clipboard',
        'SUBMIT': 'Submit',
        'CANCEL': 'Cancel',
        'CLICK_TO_COPY': 'Click to copy',
        'NOTIFICATION_CENTER': 'Notification center',
        'MORE_INFO_AVAILABLE': 'More information available',
        'DOWNLOAD_RECORDS': 'Download your records',
        'COMMENTS': 'Comments',
        'MOVE_COMMENT_LEFT': 'Move comment window left',
        'MOVE_COMMENT_RIGHT': 'Move comment window right',
        'CLOSE_ALL': 'Close all',
        'OPEN_ALL': 'Open all',
        'OPEN_BRICKS_INTEGRATOR': 'Open the Bricks integrator',
        'COPIED': 'Copied',
        'OPTIONAL': 'Optional',
        'CLEAR': 'Clear',
        'CANNOT_BE_REVERTED': 'This action cannot be reverted',
        'PROJECTS': 'Home page - Projects',
        'USERS': 'Home page - Users',
        'SHOW_PASSWORD': 'Show password',
        'HIDE_PASSWORD': 'Hide password',
    },
    ['SIDEBAR']: {
        'OVERVIEW': 'Overview',
        'DATA_BROWSER': 'Data browser',
        'LABELING': 'Labeling',
        'HEURISTICS': 'Heuristics',
        'SETTINGS': 'Settings',
        'ADMIN': 'Admin',
        'DOCUMENTATION': 'Documentation',
        'API': 'API',
        'JOIN_OUR_COMMUNITY': 'Join our community',
        'MAXIMIZE_SCREEN': 'Maximize screen',
        'MINIMIZE_SCREEN': 'Minimize screen',
        'VERSION_OVERVIEW': 'Version overview',
        'NEWER_VERSION_AVAILABLE': 'Newer version available',
        'LINUX/MAC': 'Linux/Mac',
        'PIP': 'Installed refinery with pip',
        'WINDOWS_TERMINAL': 'Windows Terminal',
        'WINDOWS_FILE_EXPLORER': 'Windows File Explorer',
    },
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
            'GENERATE_EMBEDDING': 'Vectorize your attributes. Integration to Hugging Face available',
            'HOSTED_VERSION': 'Check out our hosted version to use this function',
            'NAVIGATE_MODELS_DOWNLOADED': 'See which models are downloaded',
            'NOT_YET_ON_QDRANT': 'Embedding is not yet on Qdrant',
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
            'TARGET_ATTRIBUTE': 'Choose attribute to be labeled',
            'NAME_LABELING_TASK': 'Name of your labeling task',
            'RENAME_LABEL': 'Rename label',
            'OPEN_HEURISTICS': 'Open heuristics in new tab',
            'INFO_RENAME_LABEL': 'Before renaming a label, check the label occurrences. Renaming a label will not rename the label occurrences automatically. You can change them, or rename the label anyway.',
        }
    },
    [CurrentPage.MODELS_DOWNLOAD]: {
        'MODEL': 'Name of your Hugging Face model'
    },
    [CurrentPage.PROJECTS]: {
        'QUICK_DELETE': 'Admin function: Quick delete project'
    },
    [CurrentPage.LOOKUP_LISTS_DETAILS]: {
        'EDIT_NAME': 'Edit your lookup list name',
        'EDIT_DESCRIPTION': 'Edit your lookup list description',
        'PYTHON_VARIABLE': 'The variable name can be used inside a labeling function',
        'UPLOAD_LOOKUP_LIST': 'Please ensure that the column is called "value"',
        'DOWNLOAD_LOOKUP_LIST': 'Download your lookup list to your local machine',
        'PASTE_LOOKUP_LIST': 'Paste terms to your lookup list',
        'DELETE_LOOKUP_LIST': 'Delete terms from your lookup list',
    },
    [CurrentPage.ATTRIBUTE_CALCULATION]: {
        'CANNOT_EDIT_NAME': 'Cannot edit attribute\'s name, attribute is in use',
        'EDIT_NAME': 'Edit your attribute\'s name',
        'CANNOT_EDIT_DATATYPE': 'Cannot edit data type',
        'EDIT_DATATYPE': 'Edit your data type',
        'AVAILABLE_LIBRARIES': 'See available libraries for this attribute calculation',
        'BEING_EXECUTED': 'Currently being executed',
        'DELETE': 'Delete this attribute calculation',
        'EXECUTE_10_RECORDS': 'Execute the attribute on 10 records',
    },
    [CurrentPage.LOOKUP_LISTS_OVERVIEW]: {
        'ENABLE_ACTIONS': 'At least one lookup list is needed to enable actions',
        'CREATE_LOOKUP_LIST': 'Create a new lookup list',
        'NAVIGATE_HEURISTICS': 'Go to heuristics overview',

    },
    [CurrentPage.PROJECT_OVERVIEW]: {
        'VISUALIZATION': 'Choose the visualizations',
        'TARGET_TYPE': 'Choose the target type',
        'LABELING_TASK': 'Choose the labeling task',
        'STATIC_DATA_SLICE': 'Choose a static data slice',
    },
    [CurrentPage.HEURISTICS]: {
        'ADD_LABELING_TASK': 'Add new labeling task',
        'NAVIGATE_LOOKUP_LISTS': 'Go to lookup lists overview',
        'LABELING_FUNCTION': 'Labeling function',
        'ACTIVE_LEARNING': 'Active learning',
        'CHOOSE_LABELING_TASK': 'Choose a labeling task',
        'ENTER_FUNCTION_NAME': 'Enter a function name',
        'ENTER_DESCRIPTION': 'Enter a description',
        'ENTER_CLASS_NAME': 'Enter a class name',
        'CHOOSE_EMBEDDING': 'Choose an embedding',
        'ENTER_HEURISTIC_NAME': 'Enter heuristic name',
        'CHOOSE_ATTRIBUTE': 'Choose an input attribute for inference',
        'CHOOSE_MODEL': 'Choose a model',
        'ENABLE_ACTIONS': 'Enable actions',
        'ENABLED_NEW_HEURISTIC': 'Heuristics are noisy label signals',
        'DISABLED_NEW_HEURISTIC': 'At least one labeling task is needed to create heuristics',
        'SELECT_AT_LEAST_ONE_HEURISTIC': 'Please select at least one heuristic',
        'SELECT_AT_LEAST_ONE_VALID_HEURISTIC': 'At least one invalid heuristic is selected',
        'WEAK_SUPERVISION': 'Calculation of denoised labels can take up to a few minutes!',
        'LAST_WEAK_SUPERVISION_INFO': 'Last weak supervision run information',
        'EXECUTION_TIME': 'Execution time',
        'EDIT_NAME': 'Edit name',
        'EDIT_DESCRIPTION': 'Edit description',
        'RUN': 'Creates a task to run the function',
        'RUN_WS': 'Run weak supervision on current labeling task',
        'SWITCH_LABELING_TASK': 'Switching a task will reset the integrator progress!',
        'SUCCESSFULLY_EXECUTED': 'Successfully executed',
        'RUN_ON_10_RUNNING': 'Test run on 10 records is running',
    },
    [CurrentPage.LABELING_FUNCTION]: {
        'LABELING_TASK': 'Pick the labeling task',
        'CLICK_TO_COPY_ERROR': 'Click to copy - embedding failed',
        'CLICK_TO_COPY_RUNNING': 'Click to copy - embedding not finished yet',
        'INSTALLED_LIBRARIES': 'See available libraries for this labeling function',
        'SELECT_ATTRIBUTE': 'Select an attribute',
        'RUN_ON_10': 'Run on 10 records',
        'CURRENTLY_RUNNING': 'Currently being executed',
        'EXECUTION_TIME': 'Execution time',
    },
    [CurrentPage.DATA_BROWSER]: {
        'ONLY_MANAGED': 'Only usable for the managed version',
        'CLEAR_WS_CONFIDENCE': 'Clear filter for weakly supervised confidence',
        'CONNECT': 'Connection within atomic filters',
        'SAVE_SLICE': 'Store filters to disk',
        'CONFIGURATION': 'Change the data browser configurations',
        'INTERSECTION': 'intersection (AND)',
        'EDIT_RECORD': 'Edit record',
        'RECORD_COMMENTS': 'Record comments',
        'ADD_EMBEDDING': 'Add an embedding in the project settings',
        'UPDATE_SLICE': 'Update your current data slice',
        'CREATE_EMBEDDINGS': 'Create embedding to find outliers',
        'STATIC_DATA_SLICE': 'Creates a static data slice'
    },
    [CurrentPage.LABELING]: {
        'NAVIGATE_TO_DATA_BROWSER': 'Go to the data browser',
        'NAVIGATE_TO_RECORD_IDE': 'See the programmatic view for your current record',
        'REACH_END': 'If you reached the end, you can select new filters in the browser',
        'CHANGE_SLICES': 'Slices can be changed by the engineer in your team',
        'ARROW_LEFT': 'Arrow left',
        'ARROW_RIGHT': 'Arrow right',
        'DELETE_CURRENT_RECORD': 'Delete current record',
        'OPEN_SETTINGS': 'Open Labeling Suite settings',
        'AUTO_NEXT_RECORD': 'Jump to the next record after setting a manual classification label',
        'HOVER_BACKGROUND': 'Choose a color for the hover effects of the tables',
        'LINE_BREAKS': 'If checked, the attributes in the data-browser and labeling page will be shown with line breaks',
        'PRE_WRAP': 'Preserves whitespace and line breaks',
        'PRE_LINE': 'Collapses multiple whitespaces and line breaks into a single space',
        'IS_COLLAPSED': 'Only show the quick selection buttons',
        'QUICK_BUTTON': 'Hide/show quick buttons in expanded form',
        'CLOSE_LABEL_BOX': 'Close the label box after assigning a label',
        'SHOW_TASK_NAMES': 'Display the corresponding task names next to the attribute names in the labeling grid',
        'LABEL_DISPLAY': 'Reduce the display size of classification labels by ordering them into less rows',
        'SHOW_HEURISTICS': 'Hide/Show heuristics in overview table to reduce bias',
        'INFO_LABEL_BOX': 'What can I do here?',
        'ACTIVATE_ALL': 'Activate all',
        'CLEAR_ALL': 'Clear all',
        'REMOVE_LABELS_GOLD_STAR': 'Remove manual task labels from gold state',
        'SET_LABELS_GOLD_STAR': 'Set manual task labels as gold labels',
        'CHOOSE_LABELS': 'Choose from your labels',
        'CREATE_LABEL': 'Create label'
    },
    [CurrentPage.RECORD_IDE]: {
        'GO_TO_LABELING': 'Go to labeling page',
        'LOAD_STORAGE': 'Load code from local (browser) storage',
        'SAVE_STORAGE': 'Save code to local (browser) storage',
        'SWITCH_TO_HORIZONTAL': 'Switch to horizontal view',
        'SWITCH_TO_VERTICAL': 'Switch to vertical view',
        'IDX_SESSION': 'Number of the current index in session',
        'CLEAR_SHELL': 'Clear shell output screen'
    },
    [CurrentPage.EDIT_RECORDS]: {
        'GO_TO_DATA_BROWSER': 'Go to data browser',
        'DIFFERENT_RECORDS': 'If you want different records, you can select new filters in the browser',
        'PERSIST_CHANGES': 'Persist changes',
        'SWITCH_COLUMN': 'Switch column count',
        'CACHED_VALUES': 'Cached values - not yet synchronized with backend',
        'LABEL_ASSOCIATIONS': 'Has label associations',
        'STOP_EDIT': 'Stop editing record',
        'EDIT_RECORD': 'Editing record',
    }
}