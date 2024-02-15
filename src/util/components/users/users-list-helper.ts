import { User } from '@/src/types/shared/general'
import { getUserAvatarUri } from '@/submodules/javascript-functions/general'

export function postProcessUsersList(users: User[]) {
  return users.map((user) => {
    return { ...user, avatarUri: getUserAvatarUri(user) }
  })
}
