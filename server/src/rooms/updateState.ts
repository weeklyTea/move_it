import { Room } from "colyseus";
import { config } from "../gameConfig";
import { RoomState } from "./schema/RoomState";

const defPositions = [
  { x: -3, y: 3 },
  { x: 3, y: 3 },
  { x: 3, y: -3 },
  { x: -3, y: -3 },
]
export function resetPlayers(state: RoomState) {
  let idx = 0
  state.players.forEach(p => {
    const pos = defPositions[idx]
    p.x = pos.x
    p.y = pos.y

    idx += 1
  })
}

/**
 * Updates game state.
 * @param state state of the game which will be updated in place
 * @param delta time in seconds
 */
export function updateState(state: RoomState, delta: number) {
  state.players.forEach(player => {
    const { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } = player.inputs
    if (ArrowUp || ArrowDown) {
      let sign = ArrowUp ? 1 : -1
      player.y += sign * config.speed * delta
    }

    if (ArrowLeft || ArrowRight) {
      let sign = ArrowRight ? 1 : -1
      player.x += sign * config.speed * delta
    }
  })
}