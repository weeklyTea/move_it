import { Schema, MapSchema, Context, type } from "@colyseus/schema";

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
  initialLife?: number,
}

export class Player extends Schema {
  sessionId: string;

  @type('string') name: string
  @type('string') color: string
  @type('number') life: number
  @type('number') length: number
  @type('number') thickness: number
  @type('number') x: number
  @type('number') y: number
  @type('boolean') horizontal: boolean
  @type('boolean') ready: boolean
  @type('boolean') connected: boolean

  inputs: UserInputs

  constructor({
    sessionId,
    name,
    color,
    length,
    thickness,
    x,
    y,
    initialLife = 100
  }: PlayerProps) {
    super()
    this.sessionId = sessionId
    this.name = name
    this.color = color

    // Life should be between 0 and 100
    this.life = Math.max(0, Math.min(100, initialLife))
    this.length = length
    this.thickness = thickness
    this.x = x
    this.y = y
    this.horizontal = true
    this.ready = false
    this.connected = true

    this.inputs = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
    }
  }
}
