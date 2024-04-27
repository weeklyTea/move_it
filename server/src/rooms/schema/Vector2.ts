import { Schema, type } from "@colyseus/schema";
import Victor from "victor";

export class Vector2 extends Schema {
  @type('number') x: number
  @type('number') y: number

  constructor(x: number = 0, y: number = 0) {
    super({ x, y })
  }

  public copy = (v: Vector2) => {
    this.x = v.x
    this.y = v.y

    return this
  }
}