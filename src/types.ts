import type * as THREE from 'three'
import type { SparkRenderer, SplatMesh } from '@sparkjsdev/spark'

export interface MoveVector {
  readonly x: number
  readonly y: number
}

export interface SceneContext {
  readonly scene: THREE.Scene
  readonly camera: THREE.PerspectiveCamera
  readonly renderer: THREE.WebGLRenderer
  readonly spark: SparkRenderer
}

export interface PixieMorphController {
  startPhase1(): void
  setProgress(ratio: number): void
  startPhase2(mesh: SplatMesh, onComplete: () => void): void
  update(time: number): void
  cleanup(): void
}
