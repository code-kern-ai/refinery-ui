export enum UploadType {
  DEFAULT = 'DEFAULT',
}

export enum UploadFileType {
  RECORDS = 'records',
  KNOWLEDGE_BASE = 'knowledge_base',
  PROJECT = 'project',
  RECORDS_NEW = 'records_new',
  RECORDS_ADD = 'records_add',
}

export type UploadProps = {
  uploadOptions?: UploadOptions
  startUpload?: boolean
  isFileUploaded?: (isFileUploaded: boolean) => void
  closeModalEvent?: () => void
}

export type UploadOptions = {
  /**
   * Option set for the upload component
   * @deleteProjectOnFail {boolean, optional} - If true, the project will be deleted if the upload fails
   * @reloadOnFinish {boolean, optional} - If true, the page will reload after the upload is finished
   * @tokenizerValues {string[], optional} - If set, the tokenizer dropdown will be shown and the values will be used as options
   * @knowledgeBaseId {string, optional} - Knowledge base id used for the upload terms
   * @projectName {string, optional} - Name of the project
   * @isModal {boolean, optional} - If true, it indicates that the upload component is used in a modal
   * @closeModalOnClick {boolean, optional} - If true, the modal will be closed after the upload is finished
   * @tokenizer {string, optional} - Tokenizer used for the upload
   * @navigateToProject {boolean, optional} - If true, the user will be redirected to the project after the upload is finished
   * @showBadPasswordMsg {boolean, optional} - If true, the user will be shown a message that the password is incorrect
   */
  deleteProjectOnFail?: boolean
  reloadOnFinish?: boolean
  tokenizerValues?: string[]
  knowledgeBaseId?: string
  projectName?: string
  isModal?: boolean
  closeModalOnClick?: boolean
  tokenizer?: string
  navigateToProject?: boolean
  showBadPasswordMsg?: boolean
}

export enum UploadStates {
  PENDING = 'PENDING',
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

export type UploadTask = {
  fileAdditionalInfo: string
  id: string
  progress: number
  state: string
  userId: string
}

export type UploadState = {
  progress: number
  state: UploadStates
}

export type UploadWrapperProps = {
  uploadStarted?: boolean
  doingSomething?: boolean
  uploadTask?: UploadTask
  progressState?: UploadState
  isModal?: boolean
  submitted?: boolean
  isFileCleared?: boolean
  submitUpload: () => void
  sendSelectedFile: (file: File) => void
  setKey: (key: string) => void
}

export type UploadFieldProps = {
  uploadStarted?: boolean
  doingSomething?: boolean
  uploadTask?: UploadTask
  progressState?: UploadState
  isFileCleared?: boolean
  sendSelectedFile?: (file: File) => void
}
