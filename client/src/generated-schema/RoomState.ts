// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 2.0.29
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';
import { Player } from './Player'

export class RoomState extends Schema {
    @type("string") public status!: string;
    @type({ map: Player }) public players: MapSchema<Player> = new MapSchema<Player>();
    @type("string") public owner!: string;
}
