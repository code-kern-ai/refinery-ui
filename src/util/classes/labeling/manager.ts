import { SessionManager } from './session-manager'
import { UserManager } from './user-manager'

export class LabelingSuiteManager {
  public static somethingLoading: boolean = true
  public static absoluteWarning: string

  public static checkAbsoluteWarning() {
    if (SessionManager?.absoluteWarning)
      SessionManager.absoluteWarning = SessionManager.absoluteWarning
    else if (UserManager?.absoluteWarning)
      this.absoluteWarning = UserManager.absoluteWarning
    else this.absoluteWarning = null
  }
}
