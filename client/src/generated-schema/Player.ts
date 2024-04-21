// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 2.0.29
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';


export class Player extends Schema {
    @type("string") public name!: string;
    @type("string") public color!: string;
    @type("number") public life!: number;
    @type("number") public length!: number;
    @type("number") public thickness!: number;
    @type("number") public x!: number;
    @type("number") public y!: number;
    @type("boolean") public horizontal!: boolean;
    @type("boolean") public ready!: boolean;
    @type("boolean") public connected!: boolean;
}
