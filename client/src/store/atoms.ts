import { atom } from 'jotai'

export type PlayerInfo = {
  id: string,
  name: string,
  color: string,
  ready: boolean,
  health: number,
  connected: boolean,
}

export type GameStatus = 'waiting_players' | 'counting_down' | 'playing' | 'game_finished'

export const gameStatus = atom<GameStatus | undefined>(undefined)
export const playersIds = atom<string[]>([])
export const playersInfos = atom<Record<string, PlayerInfo>>({})
export const roomOwnerId = atom<string | undefined>(undefined)
export const curPlayerId = atom<string | undefined>(undefined)
