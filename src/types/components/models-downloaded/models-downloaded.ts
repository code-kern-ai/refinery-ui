export type ModelsDownloaded = {
  date: string
  link?: string
  name: string
  revision?: string
  size?: number
  status: ModelsDownloadedStatus
  zeroShotPipeline?: boolean
  sizeFormatted?: string
  parseDate?: string
  prio?: number
}

export enum ModelsDownloadedStatus {
  FINISHED = 'finished',
  DOWNLOADING = 'downloading',
  INITIALIZING = 'initializing',
  FAILED = 'failed',
}
