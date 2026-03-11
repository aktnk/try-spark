import { SplatMesh } from '@sparkjsdev/spark'
import type * as THREE from 'three'

type FlipAxis = 'x' | 'y' | 'z'

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

let currentModel: SplatMesh | null = null

type PickedFile = { url: string; label: string }

async function pickFileUrl(): Promise<PickedFile | null> {
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
    return { url: convertFileSrc(filePath as string), label: filePath as string }
  }

  // Browser fallback: programmatic file input
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.ply,.splat,.spz,.ksplat,.sog'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) { resolve(null); return }
      resolve({ url: URL.createObjectURL(file), label: file.name })
    }
    input.oncancel = () => resolve(null)
    input.click()
  })
}

function setupLoadingOverlay(): {
  showLoading: () => void
  showError: (msg?: string) => void
  hide: () => void
} {
  const overlay = document.getElementById('loading-overlay')!
  const errorText = document.getElementById('loading-error-text')!
  const closeBtn = document.getElementById('loading-close-btn')!

  const hide = () => {
    overlay.className = 'hidden'
  }

  closeBtn.addEventListener('click', hide)

  return {
    showLoading: () => {
      overlay.className = ''
    },
    showError: (msg = '読み込みに失敗しました') => {
      errorText.textContent = msg
      overlay.className = 'error'
    },
    hide,
  }
}

const loadingOverlay = setupLoadingOverlay()

export function setupFileLoader(
  scene: THREE.Scene,
  openButton: HTMLButtonElement,
  onFirstLoad?: () => void
): void {
  let firstLoaded = false
  const fileNameDisplay = document.getElementById('file-name-display')

  openButton.addEventListener('click', async () => {
    const picked = await pickFileUrl()
    if (!picked) return

    const { url, label } = picked

    if (currentModel) {
      scene.remove(currentModel)
      currentModel.dispose()
      currentModel = null
    }

    openButton.disabled = true
    loadingOverlay.showLoading()
    if (fileNameDisplay) fileNameDisplay.textContent = label

    const isBlobUrl = url.startsWith('blob:')
    const mesh = new SplatMesh({ url })
    currentModel = mesh
    scene.add(mesh)

    mesh.initialized
      .then(() => {
        if (isBlobUrl) URL.revokeObjectURL(url)
        loadingOverlay.hide()
        openButton.disabled = false
        if (!firstLoaded) {
          firstLoaded = true
          onFirstLoad?.()
        }
      })
      .catch((err: unknown) => {
        if (isBlobUrl) URL.revokeObjectURL(url)
        const msg = err instanceof Error ? err.message : 'ファイルを読み込めませんでした'
        loadingOverlay.showError(msg)
        openButton.disabled = false
        if (fileNameDisplay) fileNameDisplay.textContent = ''
        scene.remove(mesh)
        mesh.dispose()
        if (currentModel === mesh) currentModel = null
      })
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
