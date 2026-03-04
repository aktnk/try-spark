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
    color: 'aqua',
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
  update: (camera: THREE.Object3D) => void
} {
  const controls = new SparkControls({ canvas })

  return {
    update: (camera) => controls.update(camera),
  }
}
