// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 2.0.29
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';
import { Vector2 } from './Vector2'

export class Player extends Schema {
    @type("string") public name!: string;
    @type("string") public color!: string;
    @type("number") public health!: number;
    @type("number") public length!: number;
    @type("number") public thickness!: number;
    @type("boolean") public horizontal!: boolean;
    @type("boolean") public ready!: boolean;
    @type("boolean") public connected!: boolean;
    @type(Vector2) public target: Vector2 = new Vector2();
    @type(Vector2) public position: Vector2 = new Vector2();
}
