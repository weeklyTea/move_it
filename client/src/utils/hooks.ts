import React from "react"
import { RoomT, game } from "../core/Game"

const reconnectTokenKey = 'reconnectToken'
const storage = window.sessionStorage
export function useReconnectToken() {
  const tokenLStore: string | undefined = storage.getItem(reconnectTokenKey) || undefined
  const [tokenState, setTokenState] = React.useState(tokenLStore)

  const setToken = React.useCallback((val: string | undefined) => {
    if (val === undefined) {
      storage.removeItem(reconnectTokenKey)
    } else {
      storage.setItem(reconnectTokenKey, val)
    }
    setTokenState(val)
  }, [])

  return [tokenState, setToken] as const
}

export function useCleanReconnectToken() {
  const [, setToken] = useReconnectToken()
  React.useEffect(() => {
    setToken(undefined)
  }, [])
}

export type ConnectMode = 'connect' | 'reconnect'
export function useConnectToRoom(
  roomId: string | undefined,
  reconnectToken: string | undefined,
  onConnect: (room: RoomT) => unknown,
  onError: (e: unknown, step: ConnectMode) => unknown
) {
  React.useEffect(() => {
    // Try to reconnect if reconnect token provided, otherwise try to connect via roomId.
    async function connect() {
      try {
        if (!reconnectToken) throw new Error('no token')

        const room = await game.connectToRoom(reconnectToken, true)
        onConnect(room)

      } catch (e: any) {
        if (e.message !== 'no token') onError(e, 'reconnect')

        game
          .connectToRoom(roomId || '')
          .then(onConnect)
          .catch(() => onError(e, 'connect'))
      }
    }

    if (game.isConnected()) {
      onConnect(game.room)
    } else {
      connect()
    }
  }, [])
}

