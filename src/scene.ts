import * as THREE from 'three'
import { SparkRenderer } from '@sparkjsdev/spark'
import type { SceneContext } from './types'

export function createSceneContext(container: HTMLElement): SceneContext {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(0, 1.5, 3)

  // antialias: false is recommended for Gaussian Splatting performance
  const renderer = new THREE.WebGLRenderer({ antialias: false })
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

  const spark = new SparkRenderer({ renderer })
  scene.add(spark)

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  return { scene, camera, renderer, spark }
}
