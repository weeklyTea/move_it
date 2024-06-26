import { Room } from "colyseus.js";
import { client } from "./client";
import { RoomState } from "../generated-schema/RoomState";

export type Color = string;
export type Key = 'ArrowUp' | 'ArrowDown' | 'ArrowRight' | 'ArrowLeft' | 'Space'
export type PlayerEvent = 'add' | 'remove' | 'infoChange'
export type RoomT = Room<RoomState>

const allowedKeys: Key[] = ['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space']

type EventType = 'onConnect' | 'onDisconnect'
type OnConnectListener = (room: RoomT) => unknown

export class Game {
  private _connectingPromise: Promise<RoomT> | undefined = undefined
  private _room: RoomT | undefined = undefined;
  private _stateFetched: boolean = false

  private _eventListeners: {
    onConnect: OnConnectListener[]
    onDisconnect: OnConnectListener[]
  } = {
      onConnect: [],
      onDisconnect: []
    }

  public get room(): RoomT {
    if (!this._room || !this._stateFetched) throw ('State is not fetched from the server');

    return this._room!
  }
  public set room(r: RoomT | undefined) {
    this._room = r
    this._room?.onLeave(() => {
      this._fireEvent('onDisconnect')
      this.room = undefined
    })
  }

  _fireEvent = (event: EventType) => {
    this._eventListeners[event].forEach(listener => listener(this.room))
  }

  addEventListener = (event: EventType, callback: (args: any) => unknown) => {
    this._eventListeners[event].push(callback)
  }

  removeEventListener = (event: EventType, callback: (args: any) => unknown) => {
    this._eventListeners[event] = this._eventListeners[event].filter(l => l !== callback)
  }

  constructor() {
  }

  isConnected = () => {
    return this._room !== undefined && this._room.connection.isOpen
  };

  private _fetchInitialState = (room: RoomT): Promise<RoomT> => {
    return new Promise((resolve) => {
      room.onStateChange.once(() => {
        resolve(room)
        this._stateFetched = true
      })
    })
  }

  createRoom = async (roomName: string, priv: boolean = false) => {
    this._connectingPromise = client.create<RoomState>('moveIt', { roomName, priv })
    const roomRes = await this._connectingPromise

    this._connectingPromise = this._fetchInitialState(roomRes)
    this.room = await this._connectingPromise

    this._fireEvent('onConnect')

    return this.room
  }

  connectToRoom = async (roomIdOrToken: string, reconnect?: boolean) => {
    if (this.isConnected()) return this.room
    if (this._connectingPromise) return this._connectingPromise

    if (reconnect) {
      this._connectingPromise = client.reconnect(roomIdOrToken)
    } else {
      this._connectingPromise = client.joinById(roomIdOrToken)
    }

    try {
      const roomRes = await this._connectingPromise

      this._connectingPromise = this._fetchInitialState(roomRes)
      this.room = await this._connectingPromise
    } catch (e) {
      this._connectingPromise = undefined
      throw e
    }

    this._connectingPromise = undefined
    this._fireEvent('onConnect')

    return this.room
  };

  // TODO: merge with room.onLeave handler
  disconnect = () => {
    if (this.isConnected()) {
      this._fireEvent('onDisconnect')
      this.room.leave()
    }
    this.room = undefined
  }

  start = () => {
    this.room.send('startGame')
  }

  sendKeyEvent = (key: Key, type: 'keydown' | 'keyup') => {
    if (!allowedKeys.includes(key)) return
    this.room.send(type, key)
  }

  setPlayerName = (name: string) => {
    this.room.send('playerInfoChanged', { name })
  };

  setPlayerColor = (color: Color) => {
    this.room.send('playerInfoChanged', { color })
  };

  setPlayerReady = () => {
    this.room.send('playerInfoChanged', { ready: true })
  };

  getState = () => {
    return this.room.state;
  };
}

export const game = new Game();
