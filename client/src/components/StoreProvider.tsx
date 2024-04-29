import React from 'react'
import { Provider } from 'jotai'

import { GameStatus, atoms, sActions, store } from '../store';
import { RoomT, game } from '../core/Game';

const onGameConnect = (room: RoomT) => {
  store.set(atoms.curPlayerId, room.sessionId)

  room.state.listen('owner', (curVal: string) => {
    store.set(atoms.roomOwnerId, curVal)
  })

  room.state.listen('status', (curVal: string) => {
    store.set(atoms.gameStatus, curVal as GameStatus)
  })

  room.state.players.onAdd((player, key) => {
    sActions.addPlayer({
      id: key,
      ...player,
    })

    player.listen('name', name => {
      sActions.setPlayerInfo(key, { name })
    })

    player.listen('color', color => {
      sActions.setPlayerInfo(key, { color })
    })

    player.listen('ready', ready => {
      sActions.setPlayerInfo(key, { ready })
    })

    player.listen('connected', connected => {
      sActions.setPlayerInfo(key, { connected })
    })

    player.listen('health', health => {
      sActions.setPlayerInfo(key, { health })
    })
  })

  room.state.players.onRemove((player, key) => {
    sActions.removePlayer(key)
  })
}

const onGameDisconnect = (room: RoomT) => {
  sActions.cleanStore()
}

export const StoreProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  React.useEffect(() => {
    game.addEventListener('onConnect', onGameConnect)
    game.addEventListener('onDisconnect', onGameDisconnect)

    return () => {
      game.removeEventListener('onConnect', onGameConnect)
      game.removeEventListener('onDisconnect', onGameDisconnect)
    }
  })

  return <Provider store={store}>
    {children}
  </Provider>
}
