import * as THREE from 'three';
import { Game } from './Game';
import { Player } from '../generated-schema/Player';
import { GameMap } from '../generated-schema/GameMap';
import { RoomState } from '../generated-schema/RoomState';

class PlayerSlugR extends THREE.Mesh {
  constructor(pInfo: Player) {
    const geometry = new THREE.BoxGeometry(pInfo.length, pInfo.thickness, 1);
    const material = new THREE.MeshBasicMaterial({ color: pInfo.color });
    super(geometry, material)

    this.update(pInfo)
  }

  update = (pInfo: Player) => {
    this.position.setX(pInfo.x)
    this.position.setY(pInfo.y)
    if (!pInfo.horizontal) {
      this.rotation.z = Math.PI / 2
    } else {
      this.rotation.z = 0
    }

    (this.material as THREE.MeshBasicMaterial).color.set(pInfo.color)
  }
}

class GameMapR extends THREE.Group {
  constructor(mInfo: GameMap) {
    super()
    const points = mInfo.points.map(point => {
      const pObj = this._createPoint(point.x, point.y)

      return pObj
    })

    this.add(...points)
  }

  private _createPoint = (x: number, y: number) => {
    const geometry = new THREE.SphereGeometry(1);
    const material = new THREE.MeshBasicMaterial({ color: '#673ab7' });
    const pObj = new THREE.Mesh(geometry, material)
    pObj.position.set(x, y, 0)

    return pObj
  }

  update = (mInfo: GameMap) => {
    mInfo.points?.forEach((point, idx) => {
      const pObj = this.children[idx] || this._createPoint(point.x, point.y)
      pObj.position.set(point.x, point.y, 0)
    })
  }
}

let showLog = true

export class Renderer {
  private _game: Game
  private _scene: THREE.Scene = new THREE.Scene()
  private _camera: THREE.PerspectiveCamera
  private _tRenderer: THREE.WebGLRenderer

  private _playersSlugs: Map<string, PlayerSlugR> = new Map()
  private _gameMap: GameMapR;

  constructor(canvasContainer: HTMLDivElement, game: Game, initialState: RoomState, width: number, height: number) {
    this._game = game

    this._camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this._tRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    this._tRenderer.setSize(width, height)
    canvasContainer.appendChild(this._tRenderer.domElement)

    this._camera.position.z = 44;

    this._gameMap = new GameMapR(initialState.gameMap)
    this._scene.add(this._gameMap)

    this.render();
  }

  addPlayer = (playerId: string, pInfo: Player) => {
    if (this._playersSlugs.has(playerId)) {
      throw `Player with sessionId ${playerId} has already been added to renderer.`
    }

    const pSlug = new PlayerSlugR(pInfo)
    this._playersSlugs.set(playerId, pSlug)
    this._scene.add(pSlug)
  }

  removePlayer = (playerId: string) => {
    if (!this._playersSlugs.has(playerId)) return

    const obj = this._playersSlugs.get(playerId)
    if (!obj) return
    this._scene.remove(obj)
  }

  render = () => {
    requestAnimationFrame(this.render);
    if (!this._game.isConnected()) return

    const state = this._game.getState()

    if (showLog) {
      console.log('points in render: ', this._game.getState().gameMap.points)

      if (this._game.getState().gameMap.points !== undefined) showLog = false
    }

    // Update game map
    this._gameMap.update(state.gameMap)

    // Add new players
    state.players.forEach((pInfo, playerId) => {
      if (!this._playersSlugs.has(playerId)) {
        this.addPlayer(playerId, pInfo)
      }
    })

    // Remove disconnected players
    this._playersSlugs.forEach((pInfo, playerId) => {
      if (!state.players.has(playerId)) {
        this.removePlayer(playerId)
      }
    })

    // Update players
    state.players.forEach((pInfo, playerId) => {
      const pSlug = this._playersSlugs.get(playerId)
      if (!pSlug) return

      pSlug.update(pInfo)
    })

    this._tRenderer.render(this._scene, this._camera);
  }

}