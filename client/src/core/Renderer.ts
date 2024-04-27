import * as THREE from 'three';
import { Game } from './Game';
import { Player } from '../generated-schema/Player';
import { GameMap } from '../generated-schema/GameMap';
import { RoomState } from '../generated-schema/RoomState';
import { Vector2 } from '../generated-schema/Vector2';

abstract class EntityRenderer<T = any> {
  container: THREE.Object3D

  constructor(container: THREE.Object3D) {
    this.container = container
  }

  update = (info: T): void => {
    throw 'Not implemented'
  }

  remove = (): void => {
    throw 'Not implemented'
  }
}

class PlayerTargetR extends EntityRenderer {
  private _target: THREE.Mesh | null = null

  constructor(tInfo: Vector2, container: THREE.Object3D) {
    super(container)

    const geometry = new THREE.OctahedronGeometry(1);
    const material = new THREE.MeshBasicMaterial({ color: '#e91e63' });
    this._target = new THREE.Mesh(geometry, material)
    this.container.add(this._target)

    this.update(tInfo)
  }

  update = (tInfo: Vector2) => {
    if (!this._target) return

    this._target.position.setX(tInfo.x)
    this._target.position.setY(tInfo.y)
  }

  remove = () => {
    if (!this._target) return

    this.container.remove(this._target)
    this._target = null
  }
}

class PlayerR extends EntityRenderer {
  private _slug: THREE.Mesh;
  private _target: PlayerTargetR | undefined

  constructor(pInfo: Player, container: THREE.Object3D) {
    super(container)

    const geometry = new THREE.BoxGeometry(pInfo.length, pInfo.thickness, 1);
    const material = new THREE.MeshBasicMaterial({ color: pInfo.color });
    this._slug = new THREE.Mesh(geometry, material)
    this.container.add(this._slug)

    this.update(pInfo)
  }

  update = (pInfo: Player) => {
    this._slug.position.setX(pInfo.position.x)
    this._slug.position.setY(pInfo.position.y)
    if (!pInfo.horizontal) {
      this._slug.rotation.z = Math.PI / 2
    } else {
      this._slug.rotation.z = 0
    }

    (this._slug.material as THREE.MeshBasicMaterial).color.set(pInfo.color)

    this._target?.update(pInfo.target)
  }

  remove = () => {
    this.container.remove(this._slug)
    this._target?.remove()
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

  private _players: Map<string, PlayerR> = new Map()
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
    if (this._players.has(playerId)) {
      throw `Player with sessionId ${playerId} has already been added to renderer.`
    }

    const pSlug = new PlayerR(pInfo, this._scene)
    this._players.set(playerId, pSlug)
  }

  removePlayer = (playerId: string) => {
    if (!this._players.has(playerId)) return

    const playerR = this._players.get(playerId)
    if (!playerR) return
    playerR.remove()
  }

  render = () => {
    requestAnimationFrame(this.render);
    if (!this._game.isConnected()) return

    const state = this._game.getState()

    if (showLog) {
      if (this._game.getState().gameMap.points !== undefined) showLog = false
    }

    // Update game map
    this._gameMap.update(state.gameMap)

    // Add new players
    state.players.forEach((pInfo, playerId) => {
      if (!this._players.has(playerId)) {
        this.addPlayer(playerId, pInfo)
      }
    })

    // Remove disconnected players
    this._players.forEach((pInfo, playerId) => {
      if (!state.players.has(playerId)) {
        this.removePlayer(playerId)
      }
    })

    // Update players
    state.players.forEach((pInfo, playerId) => {
      const pSlug = this._players.get(playerId)
      if (!pSlug) return

      pSlug.update(pInfo)
    })

    this._tRenderer.render(this._scene, this._camera);
  }

}