import { SplatMesh } from '@sparkjsdev/spark'
import type * as THREE from 'three'

type FlipAxis = 'x' | 'y' | 'z'

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

let currentModel: SplatMesh | null = null

async function pickFileUrl(): Promise<string | null> {
  if (isTauri) {
    const { open } = await import('@tauri-apps/plugin-dialog')
    const { convertFileSrc } = await import('@tauri-apps/api/core')
    const filePath = await open({
      title: 'Open Splat File',
      filters: [
        { name: 'Splat Files', extensions: ['ply', 'splat', 'spz', 'ksplat', 'sog'] },
      ],
    })
    if (!filePath) return null
    return convertFileSrc(filePath as string)
  }

  // Browser fallback: programmatic file input
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.ply,.splat,.spz,.ksplat,.sog'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) { resolve(null); return }
      resolve(URL.createObjectURL(file))
    }
    input.oncancel = () => resolve(null)
    input.click()
  })
}

export function setupFileLoader(
  scene: THREE.Scene,
  openButton: HTMLButtonElement
): void {
  openButton.addEventListener('click', async () => {
    const url = await pickFileUrl()
    if (!url) return

    if (currentModel) {
      scene.remove(currentModel)
      currentModel.dispose()
      currentModel = null
    }

    const isBlobUrl = url.startsWith('blob:')
    currentModel = new SplatMesh({
      url,
      onLoad: isBlobUrl ? () => URL.revokeObjectURL(url) : undefined,
    })
    scene.add(currentModel)
  })
}

export function flipModel(axis: FlipAxis): void {
  if (!currentModel) return

  const current = currentModel.rotation[axis]
  currentModel.rotation[axis] = current === 0 ? Math.PI : 0
}

export function resetFlip(): void {
  if (!currentModel) return

  currentModel.rotation.set(0, 0, 0)
}
