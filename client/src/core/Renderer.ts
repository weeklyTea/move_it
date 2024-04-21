import * as THREE from 'three';
import { Game } from './Game';

export class Renderer {
  private _game: Game
  private _scene: THREE.Scene
  private _camera: THREE.PerspectiveCamera
  private _tRenderer: THREE.WebGLRenderer

  private _players: Map<string, THREE.Mesh>

  constructor(canvas: HTMLCanvasElement, game: Game) {
    this._players = new Map()
    this._game = game
    this._scene = new THREE.Scene()
    this._camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    this._tRenderer = new THREE.WebGLRenderer({ canvas })
    this._tRenderer.setSize(canvas.width, canvas.height)

    this._camera.position.z = 5;

    this.render();
  }

  addPlayer = (playerId: string, player: any) => {
    if (this._players.has(playerId)) {
      throw `Player with sessionId ${playerId} has already been added to renderer.`
    }

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.setX(player.x)
    cube.position.setY(player.y)

    this._players.set(playerId, cube)
    this._scene.add(cube)
  }

  removePlayer = (playerId: string) => {
    if (!this._players.has(playerId)) return

    const obj = this._players.get(playerId)
    if (!obj) return
    this._scene.remove(obj)
  }

  render = () => {
    requestAnimationFrame(this.render);
    if (!this._game.isConnected()) return

    const state = this._game.getState()

    // Add new players
    state.players.forEach((p, playerId) => {
      if (!this._players.has(playerId)) {
        this.addPlayer(playerId, p)
      }
    })

    // Remove disconnected players
    this._players.forEach((p, playerId) => {
      if (!state.players.has(playerId)) {
        this.removePlayer(playerId)
      }
    })

    state.players.forEach((p, playerId) => {
      const obj = this._players.get(playerId)
      if (!obj) return

      obj.position.setX(p.x)
      obj.position.setY(p.y)
    })

    this._tRenderer.render(this._scene, this._camera);
  }

}