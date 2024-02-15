import { NextRouter } from 'next/router'
import { WebSocketsService } from './WebSocketsService'
import { CurrentPage, CurrentPageSubKey } from '@/src/types/shared/general'

export type NotificationSubscription = {
  projectId?: string
  whitelist?: string[]
  func: (msg) => void
}

export type NotificationScope = {
  projectId: string // uuid | "GLOBAL";
  page: CurrentPage
  subKey?: CurrentPageSubKey | string
}

const stablePageKeyCache = new Map<string, NotificationScope>()

export function getStableWebsocketPageKey(
  projectId: string,
  page: CurrentPage,
  subKey?: CurrentPageSubKey | string,
): NotificationScope {
  const _subKey = subKey || 'NONE'
  const lookupKey = `${projectId}_${page}_${_subKey}`
  if (!stablePageKeyCache.has(lookupKey)) {
    stablePageKeyCache.set(lookupKey, { projectId, page, subKey: _subKey })
  }
  return stablePageKeyCache.get(lookupKey)
}
