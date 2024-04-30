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

  update = (info: T, roomState: RoomState): void => {
    throw 'Not implemented'
  }

  remove = (): void => {
    throw 'Not implemented'
  }
}

class PlayerTargetR extends EntityRenderer {
  private _target: THREE.Mesh | null = null

  constructor(container: THREE.Object3D, tInfo: Vector2) {
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
  private _id: string
  private _slug: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>;
  private _wireFrame: THREE.LineSegments
  private _target: PlayerTargetR | undefined

  constructor(container: THREE.Object3D, playerId: string, pInfo: Player, roomState: RoomState) {
    super(container)
    this._id = playerId

    const geometry = new THREE.BoxGeometry(pInfo.length, pInfo.thickness, 1);
    const material = new THREE.MeshBasicMaterial({
      color: pInfo.color,
      alphaHash: true,
      opacity: 0.5,
    });
    this._slug = new THREE.Mesh(geometry, material)
    this.container.add(this._slug)

    // this._target = new PlayerTargetR(container, pInfo.target)

    var wGeometry = new THREE.EdgesGeometry(this._slug.geometry);
    var wMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    this._wireFrame = new THREE.LineSegments(wGeometry, wMaterial);

    this.update(pInfo, roomState)
  }

  update = (pInfo: Player, roomState: RoomState) => {
    if (this._id === roomState.seeker) {
      this._slug.add(this._wireFrame)
    } else {
      this._slug.remove(this._wireFrame)
    }

    this._slug.position.setX(pInfo.position.x)
    this._slug.position.setY(pInfo.position.y)
    if (!pInfo.horizontal) {
      this._slug.rotation.z = Math.PI / 2
    } else {
      this._slug.rotation.z = 0
    }

    (this._slug.material as THREE.MeshBasicMaterial).color.set(pInfo.color)
    this._slug.material.opacity = pInfo.health / 100

    this._target?.update(pInfo.target)
  }

  remove = () => {
    this.container.remove(this._slug)
    this._target?.remove()
  }
}

// TODO: inherit GameMap renderer from EntityRenderer
class GameMapR extends THREE.Group {
  constructor(mInfo: GameMap) {
    super()

    const lines = [
      this._createLine(mInfo.points[0], mInfo.points[1]),
      this._createLine(mInfo.points[1], mInfo.points[2]),
      this._createLine(mInfo.points[2], mInfo.points[3]),
      this._createLine(mInfo.points[3], mInfo.points[0]),
    ]
    this.add(...lines)
  }

  private _createLine = (startP: Vector2, endP: Vector2) => {
    const material = new THREE.LineBasicMaterial({ color: '#e0f7fa' });

    const points = [];
    points.push(new THREE.Vector3(startP.x, startP.y, 0));
    points.push(new THREE.Vector3(endP.x, endP.y, 0));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    return line
  }

  update = (mInfo: GameMap) => {
    // TODO.
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

    this._camera.position.z = 47;

    this._gameMap = new GameMapR(initialState.gameMap)
    this._scene.add(this._gameMap)

    this.render();
  }

  addPlayer = (playerId: string, pInfo: Player) => {
    if (this._players.has(playerId)) {
      throw `Player with sessionId ${playerId} has already been added to renderer.`
    }

    const pSlug = new PlayerR(this._scene, playerId, pInfo, this._game.getState())
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
      const pRenderer = this._players.get(playerId)
      if (!pRenderer) return

      pRenderer.update(pInfo, this._game.getState())
    })

    this._tRenderer.render(this._scene, this._camera);
  }

}