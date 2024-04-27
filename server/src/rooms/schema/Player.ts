import { Schema, type } from "@colyseus/schema";
import Victor from 'victor'
import { gameConfig } from "../../gameConfig";
import { Vector2 } from "./Vector2";

export type UserKey = 'ArrowUp' | 'ArrowDown' | 'ArrowRight' | 'ArrowLeft' | 'Space'
export type UserInputs = Record<Exclude<UserKey, 'Space'>, boolean>

export type PlayerProps = {
  sessionId: string,
  name: string,
  color: string,
  length: number,
  thickness: number,
  x: number,
  y: number,
  life?: number,
  mass: number,
}

export class Player extends Schema {
  // TODO: rename to id
  sessionId: string;

  @type('string') name: string
  @type('string') color: string
  @type('number') life: number
  @type('number') length: number
  @type('number') thickness: number
  @type('boolean') horizontal: boolean
  @type('boolean') ready: boolean
  @type('boolean') connected: boolean
  @type(Vector2) target: Vector2 | null = null
  @type(Vector2) position: Vector2
  // TODO: Next two props should be removed from this class
  mass: number
  velocity: Victor

  inputs: UserInputs

  constructor({
    sessionId,
    name,
    color,
    length,
    thickness,
    x,
    y,
    mass,
    life = 100
  }: PlayerProps) {
    super()
    this.sessionId = sessionId
    this.name = name
    this.color = color
    this.ready = false
    this.connected = true
    this.life = life

    this.length = length
    this.thickness = thickness
    this.position = new Vector2(x, y)
    this.horizontal = true
    this.velocity = new Victor(0, 0)
    this.mass = mass
    this.target = new Vector2().copy(this.position)

    this.inputs = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
    }
  }

  // TODO: probably it makes sense to have next two methods outside of Player class
  onKeyDown(key: UserKey) {
    if (key === 'Space') return
    this.inputs[key] = true
  }

  onKeyUp(key: UserKey) {
    if (key === 'Space') {
      this.horizontal = !this.horizontal
    } else {
      this.inputs[key] = false

      if (
        Math.abs(this.target.x - this.position.x) > 0.3 ||
        Math.abs(this.target.y - this.position.y) > 0.3
      ) {
        return
      }

      if (key === 'ArrowDown' || key === 'ArrowUp') {
        let stepSize = gameConfig.stepSize
        if (this.horizontal) {
          stepSize *= gameConfig.perpendicularFine
        }
        const sign = key === 'ArrowDown' ? -1 : 1

        this.target.y += sign * stepSize
      } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
        let stepSize = gameConfig.stepSize
        if (!this.horizontal) {
          stepSize *= gameConfig.perpendicularFine
        }
        const sign = key === 'ArrowLeft' ? -1 : 1

        this.target.x += sign * stepSize
      }
    }
  }
}
