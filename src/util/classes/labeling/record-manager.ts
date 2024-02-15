import { SessionManager } from './session-manager'

export class RecordManager {
  public static ignoreRlas(rlas: any): boolean {
    if (!rlas) return true
    if (rlas.length > 0 && rlas[0].recordId != SessionManager.currentRecordId)
      return true
    return false
  }
}
