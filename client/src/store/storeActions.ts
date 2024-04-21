import * as atoms from './atoms'
import { PlayerInfo } from './atoms'
import { store } from './store'

export function addPlayerId(playerId: string) {
  store.set(atoms.playersIds, prev => [...prev, playerId])
}

export function setPlayerInfo(playerId: string, info: Partial<PlayerInfo>) {
  store.set(atoms.playersInfos, prev => ({
    ...prev,
    [playerId]: {
      ...prev[playerId],
      ...info,
    }
  }))
}

export function addPlayer(player: PlayerInfo) {
  addPlayerId(player.id)
  setPlayerInfo(player.id, player)
}

export function removePlayerId(playerId: string) {
  store.set(atoms.playersIds, prev => prev.filter(pId => pId !== playerId))
}

export function removePlayerInfo(playerId: string) {
  store.set(atoms.playersInfos, prev => {
    const res = { ...prev }
    delete res[playerId]
    return res
  })
}

export function removePlayer(playerId: string) {
  removePlayerId(playerId)
  removePlayerInfo(playerId)
}

export function cleanStore() {
  store.set(atoms.playersIds, [])
  store.set(atoms.playersInfos, {})
}
