import * as THREE from 'three'
import type { FpsMovement } from '@sparkjsdev/spark'

const CAMERA_INITIAL = {
  fov: 75,
  zoom: 1.0,
  speed: 1.0,
}

const TURBO_MULTIPLIERS = [1, 2, 3] as const

export function setupCameraSettings(
  camera: THREE.PerspectiveCamera,
  fpsMovement: FpsMovement,
): { getSpeedMultiplier: () => number } {
  const panel = document.getElementById('camera-settings-panel') as HTMLDivElement
  const toggleBtn = document.getElementById('camera-settings-toggle') as HTMLButtonElement
  const fovInput = document.getElementById('cam-fov') as HTMLInputElement
  const zoomInput = document.getElementById('cam-zoom') as HTMLInputElement
  const speedInput = document.getElementById('cam-speed') as HTMLInputElement
  const defaultBtn = document.getElementById('cam-default') as HTMLButtonElement
  const okBtn = document.getElementById('cam-ok') as HTMLButtonElement
  const cancelBtn = document.getElementById('cam-cancel') as HTMLButtonElement
  const closeBtn = document.getElementById('cam-close') as HTMLButtonElement
  const turboIndicator = document.getElementById('turbo-indicator') as HTMLDivElement
  const turboLabel = document.getElementById('turbo-multiplier-label') as HTMLSpanElement

  const baseMoveSpeed = fpsMovement.moveSpeed

  // Current applied speed multiplier (shared with animation loop via getter)
  let appliedSpeedMultiplier = CAMERA_INITIAL.speed
  // Turbo index cycles: 0=1x, 1=2x, 2=3x
  let turboIndex = 0

  // Snapshot captured when panel opens — used by Cancel
  let snapshot = { fov: camera.fov, zoom: camera.zoom, speed: appliedSpeedMultiplier }

  function setInputValues(values: typeof CAMERA_INITIAL): void {
    fovInput.value = String(values.fov)
    zoomInput.value = String(values.zoom)
    speedInput.value = String(values.speed)
  }

  function applyMoveSpeed(): void {
    fpsMovement.moveSpeed = baseMoveSpeed * appliedSpeedMultiplier * TURBO_MULTIPLIERS[turboIndex]
  }

  function updateTurboIndicator(): void {
    const mult = TURBO_MULTIPLIERS[turboIndex]
    turboIndicator.classList.remove('x2', 'x3')
    if (mult === 1) {
      turboIndicator.classList.add('hidden')
    } else {
      turboLabel.textContent = String(mult)
      turboIndicator.classList.remove('hidden')
      turboIndicator.classList.add(`x${mult}`)
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.key !== 't' && e.key !== 'T') return
    const tag = (e.target as HTMLElement).tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
    turboIndex = (turboIndex + 1) % TURBO_MULTIPLIERS.length
    applyMoveSpeed()
    updateTurboIndicator()
  })

  // Live preview: apply FOV and Zoom immediately
  function applyFovZoom(): void {
    const fov = parseFloat(fovInput.value)
    const zoom = parseFloat(zoomInput.value)
    if (!isNaN(fov) && fov > 0 && fov < 180) camera.fov = fov
    if (!isNaN(zoom) && zoom > 0) camera.zoom = zoom
    camera.updateProjectionMatrix()
  }

  function applySpeed(): void {
    const speed = parseFloat(speedInput.value)
    if (!isNaN(speed) && speed > 0) {
      appliedSpeedMultiplier = speed
      applyMoveSpeed()
    }
  }

  function openPanel(): void {
    snapshot = { fov: camera.fov, zoom: camera.zoom, speed: appliedSpeedMultiplier }
    setInputValues(snapshot)
    panel.classList.remove('hidden')
  }

  function closeWithCancel(): void {
    camera.fov = snapshot.fov
    camera.zoom = snapshot.zoom
    camera.updateProjectionMatrix()
    setInputValues(snapshot)
    panel.classList.add('hidden')
  }

  toggleBtn.addEventListener('click', () => {
    if (panel.classList.contains('hidden')) {
      openPanel()
    } else {
      closeWithCancel()
    }
  })

  // Live preview on input change
  fovInput.addEventListener('input', applyFovZoom)
  zoomInput.addEventListener('input', applyFovZoom)

  defaultBtn.addEventListener('click', () => {
    setInputValues(CAMERA_INITIAL)
    applyFovZoom()
  })

  okBtn.addEventListener('click', () => {
    applySpeed()
    panel.classList.add('hidden')
  })

  cancelBtn.addEventListener('click', closeWithCancel)
  closeBtn.addEventListener('click', closeWithCancel)

  // Apply initial values
  applySpeed()
  setInputValues(CAMERA_INITIAL)

  return {
    getSpeedMultiplier: () => appliedSpeedMultiplier * TURBO_MULTIPLIERS[turboIndex],
  }
}
