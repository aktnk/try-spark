import type * as THREE from 'three'
import type { SparkRenderer } from '@sparkjsdev/spark'

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
