// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 2.0.29
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';
import { Player } from './Player'
import { GameMap } from './GameMap'

export class RoomState extends Schema {
    @type("string") public status!: string;
    @type("string") public gamePhase!: string;
    @type({ map: Player }) public players: MapSchema<Player> = new MapSchema<Player>();
    @type(GameMap) public gameMap: GameMap = new GameMap();
    @type("string") public owner!: string;
    @type("string") public seeker!: string;
}
