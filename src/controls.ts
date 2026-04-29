import nipplejs from 'nipplejs'
import { SparkControls } from '@sparkjsdev/spark'
import type * as THREE from 'three'
import type { MoveVector } from './types'

export function setupJoystick(zone: HTMLElement): { getMoveVector: () => MoveVector } {
  let moveVector: MoveVector = { x: 0, y: 0 }

  const manager = nipplejs.create({
    zone,
    mode: 'static',
    position: { left: '50%', top: '50%' },
    color: '#888888',
  })

  manager.on('move', (_evt, data) => {
    moveVector = {
      x: data.vector.x,
      y: data.vector.y,
    }
  })

  manager.on('end', () => {
    moveVector = { x: 0, y: 0 }
  })

  return {
    getMoveVector: () => moveVector,
  }
}

export function setupSparkControls(canvas: HTMLCanvasElement): {
  update: (camera: THREE.PerspectiveCamera) => void
  fpsMovement: SparkControls['fpsMovement']
  pointerControls: SparkControls['pointerControls']
} {
  const controls = new SparkControls({ canvas })

  return {
    update: (camera) => controls.update(camera),
    fpsMovement: controls.fpsMovement,
    pointerControls: controls.pointerControls,
  }
}
