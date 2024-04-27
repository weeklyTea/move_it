import { Room } from "colyseus";
import { gameConfig, maxX, maxY } from "../gameConfig";
import { RoomState } from "./schema/RoomState";
import Victor from "victor";

const defPositions = [
  { x: -maxX + gameConfig.defPlayerLength, y: maxY - gameConfig.defPlayerLength },
  { x: maxX - gameConfig.defPlayerLength, y: maxY - gameConfig.defPlayerLength },
  { x: maxX - gameConfig.defPlayerLength, y: -maxY + gameConfig.defPlayerLength },
  { x: -maxX + gameConfig.defPlayerLength, y: -maxY + gameConfig.defPlayerLength },
]

export function resetPlayers(state: RoomState) {
  let idx = 0
  state.players.forEach(p => {
    const pos = defPositions[idx]
    p.position.x = pos.x
    p.position.y = pos.y

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
    if (!player.target) return

    // Spring physics is used:
    // Fs = -stiffness * l
    // Fd = dampingFactor * v 
    // F = Fd + Fs
    // F = m * a
    // a = F / m
    // v' = v + a * t
    // pos' = pos + v' * t

    // TODO: performance improvement: create all vectors outside of updateState function
    const posV = new Victor(player.position.x, player.position.y)
    const targetV = new Victor(player.target.x, player.target.y)
    const velocity = player.velocity.clone()

    const springForce = targetV.clone().subtract(posV).multiplyScalar(gameConfig.stiffness)
    const dampingForce = velocity.clone().multiplyScalar(-gameConfig.dampingFactor)
    const acceleration = springForce.clone().add(dampingForce).multiplyScalar(player.mass)
    acceleration.multiplyScalar(delta)

    const newVelocity = velocity.clone().add(acceleration)
    player.velocity.copy(newVelocity)
    newVelocity.multiplyScalar(delta)
    posV.add(newVelocity)
    player.position.x = posV.x
    player.position.y = posV.y
  })
}