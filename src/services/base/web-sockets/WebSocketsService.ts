import { timer } from 'rxjs'
import { webSocket } from 'rxjs/webSocket'
import {
  NotificationScope,
  NotificationSubscription,
  getStableWebsocketPageKey,
} from './web-sockets-helper'
import { CurrentPage, CurrentPageSubKey } from '@/src/types/shared/general'

export class WebSocketsService {
  private static wsConnection: any
  private static timeOutIteration: number = 0
  private static registeredNotificationListeners: Map<
    NotificationScope,
    NotificationSubscription
  > = new Map<NotificationScope, NotificationSubscription>()
  private static connectionOpened: boolean = false

  public static getConnectionOpened() {
    return WebSocketsService.connectionOpened
  }

  public static setConnectionOpened(value: boolean) {
    WebSocketsService.connectionOpened = value
  }

  public static updateFunctionPointer(
    projectId: string,
    page: CurrentPage,
    funcPointer: (msg: string[]) => void,
    subKey?: CurrentPageSubKey,
  ) {
    if (!projectId) projectId = 'GLOBAL'
    const scope = getStableWebsocketPageKey(projectId, page, subKey)

    if (!WebSocketsService.registeredNotificationListeners.has(scope)) {
      console.warn('Nothing registered for scope: ' + scope)
      return
    }
    WebSocketsService.registeredNotificationListeners.get(scope).func =
      funcPointer
  }

  public static initWsNotifications() {
    const address = WebSocketsService.findWebsocketAddress()
    if (address) {
      WebSocketsService.wsConnection = webSocket({
        url: address,
        deserializer: (msg) => msg.data,
        openObserver: {
          next: () => {
            if (WebSocketsService.timeOutIteration)
              console.log('Websocket connected')
            WebSocketsService.timeOutIteration = 0
          },
        },
        closeObserver: {
          next: (closeEvent) => {
            const timeout = WebSocketsService.getTimeout(
              WebSocketsService.timeOutIteration,
            )
            timer(timeout).subscribe(() => {
              WebSocketsService.timeOutIteration++
              WebSocketsService.initWsNotifications()
            })
          },
        },
      })
      WebSocketsService.wsConnection.subscribe(
        (msg) => WebSocketsService.handleWebsocketNotificationMessage(msg),
        (err) => WebSocketsService.handleError(err),
        () => WebSocketsService.handleWsClosed(),
      )
    }
  }

  private static getTimeout(iteration: number) {
    if (iteration <= 0) return 1000
    else {
      switch (iteration) {
        case 1:
          return 2000
        case 2:
          return 5000
        case 3:
          return 15000
        case 4:
          return 30000
        case 5:
          return 60000
        default:
          return 60 * 5 * 1000 //5 min
      }
    }
  }

  private static findWebsocketAddress() {
    let address = window.location.protocol == 'https:' ? 'wss:' : 'ws:'
    address += '//' + window.location.host + '/notify/ws'
    return address //'ws://localhost:4455/notify/ws'
  }

  private static handleError(err) {
    console.log('error', err)
  }

  private static handleWsClosed() {
    console.log('ws closed')
  }

  private static handleWebsocketNotificationMessage(msg: string) {
    if (WebSocketsService.registeredNotificationListeners.size == 0) return
    if (msg.includes('\n')) {
      msg
        .split('\n')
        .forEach((element) =>
          WebSocketsService.handleWebsocketNotificationMessage(element),
        )
      return
    }
    const scopes = WebSocketsService.registeredNotificationListeners.keys()

    const msgParts = msg.split(':')
    const projectId = msgParts[0] // uuid | "GLOBAL";

    for (let scope of scopes) {
      if (scope.projectId != projectId) continue
      const sub = WebSocketsService.registeredNotificationListeners.get(scope)
      if (sub.whitelist.includes(msgParts[1])) {
        sub.func(msgParts)
      }
    }
  }

  public static subscribeToNotification(
    key: CurrentPage,
    params: NotificationSubscription,
    subKey?: CurrentPageSubKey,
  ) {
    if (!params.projectId) params.projectId = 'GLOBAL'

    const scope = getStableWebsocketPageKey(params.projectId, key, subKey)

    WebSocketsService.registeredNotificationListeners.set(scope, params)
  }

  public static unsubscribeFromNotification(
    key: CurrentPage,
    projectId: string = null,
    subKey?: CurrentPageSubKey,
  ) {
    if (!projectId) projectId = 'GLOBAL'
    const scope = getStableWebsocketPageKey(projectId, key, subKey)

    if (WebSocketsService.registeredNotificationListeners.has(scope)) {
      WebSocketsService.registeredNotificationListeners.delete(scope)
    }
  }
}
