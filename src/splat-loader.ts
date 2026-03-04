import { SplatMesh } from '@sparkjsdev/spark'
import type * as THREE from 'three'

type FlipAxis = 'x' | 'y' | 'z'

let currentModel: SplatMesh | null = null

export function setupFileLoader(
  scene: THREE.Scene,
  fileInput: HTMLInputElement
): void {
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0]
    if (!file) return

    if (currentModel) {
      scene.remove(currentModel)
      currentModel.dispose()
      currentModel = null
    }

    const url = URL.createObjectURL(file)

    currentModel = new SplatMesh({
      url,
      onLoad: () => {
        URL.revokeObjectURL(url)
      },
    })
    scene.add(currentModel)
  })
}

export function flipModel(axis: FlipAxis): void {
  if (!currentModel) return

  const current = currentModel.rotation[axis]
  currentModel.rotation[axis] = current === 0 ? Math.PI : 0
}
