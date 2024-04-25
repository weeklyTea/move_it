import { Schema, ArraySchema, type } from "@colyseus/schema";
import { maxX, maxY } from "../../gameConfig";
import { Vector2 } from "./Vector2";

export class GameMap extends Schema {
  @type([Vector2]) points = new ArraySchema(
    new Vector2({ x: -maxX, y: maxY }),
    new Vector2({ x: maxX, y: maxY }),
    new Vector2({ x: maxX, y: -maxY }),
    new Vector2({ x: -maxX, y: -maxY }),
  )
}
