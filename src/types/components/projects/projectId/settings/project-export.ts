export type ProjectSize = {
  desc: string
  export: boolean
  moveRight: boolean
  name: string
  sizeReadable: string
  sizeNumber: number
}

export enum DownloadState {
  NONE,
  PREPARATION,
  DOWNLOAD,
  COMPLETED,
  ERROR,
}
