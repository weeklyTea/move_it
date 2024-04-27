import { Schema, MapSchema, Context, type } from "@colyseus/schema";
import { Player } from "./Player";
import { GameMap } from "./GameMap";

type GameStatus = 'waiting_players' | 'counting_down' | 'playing' | 'game_finished'
type GamePhase = 'chasing' | 'switching_seeker'

export class RoomState extends Schema {

  @type('string') status: GameStatus = 'waiting_players';
  @type('string') gamePhase: GamePhase | '' = '';
  @type({ map: Player }) players = new MapSchema<Player>
  @type(GameMap) gameMap = new GameMap()
  // TODO: rename to ownerId
  @type('string') owner: string = ''
  // TODO: rename to seekerId
  @type('string') seeker: string = ''
}
