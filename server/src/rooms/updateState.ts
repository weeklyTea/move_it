import { Room } from "colyseus";
import { gameConfig, maxX, maxY } from "../gameConfig";
import { RoomState } from "./schema/RoomState";
import Victor from "victor";
import { Player } from "./schema/Player";

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
    p.target.x = pos.x
    p.target.y = pos.y

    p.life = 100

    idx += 1
  })
}

function getBoundaryPoints(player: Player, leftBottomPoint: Victor, rightTopPoint: Victor) {
  // Assume that the player is oriented vertically.
  const thickness = player.thickness
  const length = player.length
  leftBottomPoint.x = player.position.x - thickness / 2
  leftBottomPoint.y = player.position.y - length / 2

  rightTopPoint.x = player.position.x + thickness / 2
  rightTopPoint.y = player.position.y + length / 2

  // Change values if it's oriented horizontally
  if (player.horizontal) {
    leftBottomPoint.x = player.position.x - length / 2
    leftBottomPoint.y = player.position.y - thickness / 2

    rightTopPoint.x = player.position.x + length / 2
    rightTopPoint.y = player.position.y + thickness / 2
  }
}

function checkSeekerCollisions(state: RoomState, delta: number, fireEvent: (evt: 'switching_seeker_phase') => unknown) {
  const seekerId = state.seeker
  const seekerP = state.players.get(seekerId)

  if (!seekerP) return

  const sMinPoint = new Victor(0, 0)
  const sMaxPoint = new Victor(0, 0)
  getBoundaryPoints(seekerP, sMinPoint, sMaxPoint)

  const pMinPoint = new Victor(0, 0)
  const pMaxPoint = new Victor(0, 0)

  state.players.forEach(player => {
    if (player.sessionId === seekerId || state.gamePhase === 'switching_seeker') return

    getBoundaryPoints(player, pMinPoint, pMaxPoint)

    // Find intersection, and check if sides of the intersection are positive.
    const widthIsPositive = Math.min(sMaxPoint.x, pMaxPoint.x) > Math.max(sMinPoint.x, pMinPoint.x)
    const heightIsPositive = Math.min(sMaxPoint.y, pMaxPoint.y) > Math.max(sMinPoint.y, pMinPoint.y)

    if (widthIsPositive && heightIsPositive) {
      state.gamePhase = 'switching_seeker'
      state.seeker = player.sessionId
      fireEvent('switching_seeker_phase')
    }
  })
}

function movePlayers(state: RoomState, delta: number) {
  state.players.forEach(player => {
    if (!player.target) return
    if (player.sessionId === state.seeker && state.gamePhase === 'switching_seeker') return

    // Forbid moving outside of the map.
    let xOutOfMap = false
    if (player.position.x > maxX || player.position.x < -maxX) {
      const newP = player.position.x > maxX ? maxX : -maxX
      player.position.x = newP
      player.target.x = newP
      player.velocity.x = 0
      xOutOfMap = true
    }

    let yOutOfMap = false
    if (player.position.y > maxY || player.position.y < -maxY) {
      const newP = player.position.y > maxY ? maxY : -maxY
      player.position.y = newP
      player.target.y = newP
      player.velocity.y = 0
      yOutOfMap = true
    }

    if (yOutOfMap || xOutOfMap) return

    // Spring physics is used:
    // Fs = stiffness * l
    // Fd = -dampingFactor * v 
    // F = Fd + Fs
    // F = m * a
    // a = F / m
    // newV = v + a * t
    // newPos = pos + newV * t

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

/**
 * Updates game state.
 * @param state state of the game which will be updated in place
 * @param delta time in seconds
 */
export function updateState(state: RoomState, delta: number, fireEvent: (evt: 'switching_seeker_phase') => unknown) {

  // Move players
  movePlayers(state, delta)

  // Check player-player collisions
  if (state.status === 'playing' && state.gamePhase !== 'switching_seeker') {
    checkSeekerCollisions(state, delta, fireEvent)
  }
}