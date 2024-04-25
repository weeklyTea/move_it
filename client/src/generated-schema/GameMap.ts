// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 2.0.29
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';
import { Vector2 } from './Vector2'

export class GameMap extends Schema {
    @type([ Vector2 ]) public points: ArraySchema<Vector2> = new ArraySchema<Vector2>();
}
