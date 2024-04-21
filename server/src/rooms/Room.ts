import { Room, Client } from "@colyseus/core";
import { SimulationCallback } from "@colyseus/core/build/Room";

import { RoomState } from "./schema/RoomState";
import { faker } from "@faker-js/faker";
import { Player, UserKey } from "./schema/Player";
import { config } from "../gameConfig";
import { resetPlayers, updateState } from "./updateState";

function getRandomName() {
  return `${faker.word.adjective()} ${faker.animal.type()}`
}

function getRandomPlayerName() {
  return faker.location.country()
}

function getRandomInt(low: number, high: number) {
  if (high <= low) return 0

  const len = high - low
  return low + Math.round(len * Math.random())
}

const colors = ['#0b6bcb', '#c41c1c', '#1f7a1f', '#9a5b13']

function getRandomColor() {
  const idx = Math.round(Math.random() * (colors.length - 1))
  return colors[idx]
}

type Color = string

type PlayerOptions = {
  name?: string,
  color?: Color,
  ready?: boolean
}

type RoomOptions = {
  roomName?: string,
  priv?: boolean,
}

const reconnectionTimeout = 20 // sec

export class MoveItRoom extends Room<RoomState> {
  maxClients = 4;
  autoDispose = false;

  onCreate(options?: RoomOptions) {
    this.setState(new RoomState());
    this.setPrivate(Boolean(options?.priv))
    this.setMetadata({ name: options?.roomName || getRandomPlayerName() })

    this.setSimulationInterval(delta => this._update(delta / 1000))

    this.onMessage('keydown', this._handleKeyDown);
    this.onMessage('keyup', this._handleKeyUp);
    this.onMessage('playerInfoChanged', this._handlePlayerInfo);
    this.onMessage('startGame', this._startCountDown)
  }

  private _startCountDown = () => {
    this.state.status = "counting_down"

    setTimeout(this._startGame, config.countdownTime)
  }

  private _startGame = () => {
    this.state.status = 'playing'
    resetPlayers(this.state)
  }

  private _handleKeyDown = (client: Client, key: UserKey) => {
    console.log('handleKeyDown call. key:', key)

    const sessionId = client.sessionId
    const player = this.state.players.get(sessionId)

    if (key === 'Space') {
      player.horizontal = !player.horizontal
    } else {
      player.inputs[key] = true
    }
  }

  private _handleKeyUp = (client: Client, key: UserKey) => {
    console.log('handleKeyUp call. key:', key)

    const sessionId = client.sessionId
    const player = this.state.players.get(sessionId)

    if (key !== 'Space') {
      player.inputs[key] = false
    }
  }

  private _handlePlayerInfo = (client: Client, options: PlayerOptions) => {
    console.log('handlePlayerInfo call. options:', options)

    const sessionId = client.sessionId
    const player = this.state.players.get(sessionId)

    // If player is ready it should not be possible to change info unless 'ready' is in the options
    if (player.ready && options.ready === undefined) return

    if (options.name) {
      player.name = options.name
    }
    if (options.color !== undefined) {
      player.color = options.color
    }
    if (options.ready !== undefined) {
      player.ready = options.ready
    }
  }

  // delta time in seconds
  private _update = (delta: number) => {
    updateState(this.state, delta)
  }

  onJoin(client: Client, options: PlayerOptions) {
    const name = options.name || getRandomName()
    const color = options.color || getRandomColor()
    console.log(`"${name}" joined! (sessionId: ${client.sessionId})`)

    const sessionId = client.sessionId
    const newPlayer = new Player({
      sessionId,
      name,
      color,
      length: config.defPlayerLength,
      thickness: config.defPlayerThickness,
      x: getRandomInt(-4, 4),
      y: getRandomInt(-4, 4),
    })

    if (this.state.players.size === 0) {
      this.state.owner = client.sessionId
    }

    this.state.players.set(sessionId, newPlayer)
  }

  onLeave = async (client: Client, consented: boolean) => {
    this.state.players.get(client.sessionId).connected = false;

    console.log(client.sessionId, "disconnected.");
    try {
      if (consented) {
        throw new Error("consented leave");
      }

      await this.allowReconnection(client, reconnectionTimeout)

      console.log(client.sessionId, "reconnected.");
      this.state.players.get(client.sessionId).connected = true;
    } catch (e) {
      console.log(client.sessionId, "left!");
      this.state.players.delete(client.sessionId)

      // Remove the room if the owner has left
      if (this.state.owner === client.sessionId) {
        console.log('Owner has left, disposing the room.');
        this.disconnect()
      }
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
