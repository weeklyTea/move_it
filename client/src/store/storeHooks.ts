import React from 'react'
import { atom, useAtomValue } from 'jotai'
import * as atoms from './atoms'
import { PlayerInfo, GameStatus } from './atoms'

export function usePlayersIds() {
  return useAtomValue(atoms.playersIds)
}

export function usePlayerInfo(playerId: string): PlayerInfo | undefined {
  const pInfoAtom = React.useMemo(() => {
    return atom(get => get(atoms.playersInfos)[playerId])
  }, [playerId])

  return useAtomValue(pInfoAtom)
}

export function useCurPlayer(): PlayerInfo | undefined {
  const id = useAtomValue(atoms.curPlayerId)
  const curPlayer = usePlayerInfo(id || 'fake_id')

  return curPlayer
}

export function useIsRoomOwner(pId: string) {
  const ownerId = useAtomValue(atoms.roomOwnerId)

  return ownerId !== undefined && pId === ownerId
}

export function useEveryoneIsReady() {
  const pInfos = useAtomValue(atoms.playersInfos)
  const curPId = useAtomValue(atoms.curPlayerId)

  const notReadyPlayers = Object.values(pInfos).filter(p => !p.ready)

  return notReadyPlayers.length < 2 && notReadyPlayers[0]?.id === curPId
}

export function useGameIsInProgress() {
  const status = useAtomValue(atoms.gameStatus)
  return status !== undefined && (status === 'counting_down' || status === 'playing')
}

export function useWinner() {
  const pInfos = useAtomValue(atoms.playersInfos)
  const pInfosArr = Object.values(pInfos).sort((a, b) => a.health - b.health)
  return pInfosArr[pInfosArr.length - 1]
}

