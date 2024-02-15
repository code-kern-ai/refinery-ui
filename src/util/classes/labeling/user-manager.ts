import { UserType } from '@/src/types/components/projects/projectId/labeling/labeling-main-component'
import {
  ALL_USERS_USER_ID,
  GOLD_STAR_USER_ID,
} from '../../components/projects/projectId/labeling/labeling-main-component-helper'
import { LabelSource } from '@/submodules/javascript-functions/enums/enums'
import { getUserAvatarUri } from '@/submodules/javascript-functions/general'
import { User } from '@/src/types/shared/general'

export class UserManager {
  public static absoluteWarning: string
  public static userIcons: any[]
  public static showUserIcons: boolean = false
  public static displayUserId: string

  public static prepareUserIcons(rlaData: any[], user: User, users: User[]) {
    const dict = {}

    dict[user.id] = {
      id: user.id,
      order: 2,
      name: user.firstName + ' ' + user.lastName,
      userType: UserType.REGISTERED,
      avatarUri: user.avatarUri,
      active: this.displayUserId == user.id,
    }
    for (const rla of rlaData) {
      if (rla.sourceType != LabelSource.MANUAL) continue
      if (rla.isGoldStar && !dict[GOLD_STAR_USER_ID]) {
        dict[GOLD_STAR_USER_ID] = {
          id: GOLD_STAR_USER_ID,
          order: 0,
          name: 'Combined gold labels',
          userType: UserType.GOLD,
          active: false,
        }
      } else {
        const userId = rla.createdBy
        if (!dict[userId]) {
          const user = users.find((u) => u.id == userId)
          if (!user || !user.firstName) {
            dict[userId] = {
              id: rla.createdBy,
              order: 4,
              name: 'Unknown User ID',
              userType: UserType.REGISTERED,
              avatarUri: getUserAvatarUri(null),
              active: this.displayUserId == rla.createdBy,
            }
          } else {
            dict[userId] = {
              id: rla.createdBy,
              order: rla.createdBy == user.id ? 2 : 3,
              name: user.firstName + ' ' + user.lastName,
              userType: UserType.REGISTERED,
              avatarUri: user.avatarUri,
              active: this.displayUserId == rla.createdBy,
            }
          }
        }
      }
    }

    if (Object.keys(dict).length > 1) {
      dict[ALL_USERS_USER_ID] = {
        id: ALL_USERS_USER_ID,
        order: 1,
        name: 'All users',
        userType: UserType.ALL,
        active: false,
      }
    }
    this.userIcons = Object.values(dict)
    this.userIcons.sort((a, b) => a.order - b.order)
    let c = 1
    this.userIcons.forEach((u) => (u.name += ' [' + c++ + ']'))
    this.showUserIcons = this.userIcons.length > 1
    if (this.userIcons.length > 10)
      console.log('warning: more than 10 users on this record')

    return [this.userIcons, this.showUserIcons]
  }
}
