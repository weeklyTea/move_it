import { Schema, MapSchema, Context, type } from "@colyseus/schema";
import { Player } from "./Player";
import { GameMap } from "./GameMap";

type GameStatus = 'waiting_players' | 'counting_down' | 'playing' | 'game_finished'

export class RoomState extends Schema {

  @type('string') status: GameStatus = 'waiting_players';
  @type({ map: Player }) players = new MapSchema<Player>
  @type(GameMap) gameMap = new GameMap()
  @type('string') owner: string = ''
}
