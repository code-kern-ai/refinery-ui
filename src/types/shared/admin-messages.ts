export type AdminMessage = {
  id: string
  text: string
  archiveDate: string
  level: AdminMessageLevel
  displayDate: string
  textColor: string
  backgroundColor: string
  borderColor: string
  createdAt: string
  visible: boolean
}

export enum AdminMessageLevel {
  INFO = 'info',
  WARNING = 'Warning',
}

export type AdminMessagesProps = {
  adminMessages: AdminMessage[]
  setActiveAdminMessages: (adminMessages: AdminMessage[]) => void
}
