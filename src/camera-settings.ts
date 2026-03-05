import * as THREE from 'three'

const CAMERA_INITIAL = {
  fov: 75,
  near: 0.1,
  far: 1000,
  zoom: 1.0,
}

export function setupCameraSettings(camera: THREE.PerspectiveCamera): void {
  const panel = document.getElementById('camera-settings-panel') as HTMLDivElement
  const toggleBtn = document.getElementById('camera-settings-toggle') as HTMLButtonElement
  const fovInput = document.getElementById('cam-fov') as HTMLInputElement
  const nearInput = document.getElementById('cam-near') as HTMLInputElement
  const farInput = document.getElementById('cam-far') as HTMLInputElement
  const zoomInput = document.getElementById('cam-zoom') as HTMLInputElement
  const resetBtn = document.getElementById('cam-reset') as HTMLButtonElement
  const setDefaultBtn = document.getElementById('cam-set-default') as HTMLButtonElement
  const closeBtn = document.getElementById('cam-close') as HTMLButtonElement

  let cameraDefaults = { ...CAMERA_INITIAL }

  toggleBtn.addEventListener('click', () => {
    panel.classList.toggle('hidden')
  })

  closeBtn.addEventListener('click', () => {
    panel.classList.add('hidden')
  })

  function applyToCamera(): void {
    const fov = parseFloat(fovInput.value)
    const near = parseFloat(nearInput.value)
    const far = parseFloat(farInput.value)
    const zoom = parseFloat(zoomInput.value)

    if (!isNaN(fov) && fov > 0 && fov < 180) camera.fov = fov
    if (!isNaN(near) && near > 0) camera.near = near
    if (!isNaN(far) && far > 0) camera.far = far
    if (!isNaN(zoom) && zoom > 0) camera.zoom = zoom

    camera.updateProjectionMatrix()
  }

  function setInputValues(values: typeof CAMERA_INITIAL): void {
    fovInput.value = String(values.fov)
    nearInput.value = String(values.near)
    farInput.value = String(values.far)
    zoomInput.value = String(values.zoom)
  }

  resetBtn.addEventListener('click', () => {
    setInputValues(cameraDefaults)
    applyToCamera()
  })

  setDefaultBtn.addEventListener('click', () => {
    cameraDefaults = {
      fov: parseFloat(fovInput.value),
      near: parseFloat(nearInput.value),
      far: parseFloat(farInput.value),
      zoom: parseFloat(zoomInput.value),
    }
  })

  ;[fovInput, nearInput, farInput, zoomInput].forEach(input => {
    input.addEventListener('change', applyToCamera)
  })

  setInputValues(cameraDefaults)
}
