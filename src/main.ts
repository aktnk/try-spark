import { createSceneContext } from './scene'
import { setupFileLoader, flipModel } from './splat-loader'
import { setupJoystick, setupSparkControls } from './controls'
import { setupCameraSettings } from './camera-settings'

function init(): void {
  const container = document.getElementById('canvas-container')
  const fileInput = document.getElementById('file-input') as HTMLInputElement
  const joystickZone = document.getElementById('joystick-zone')
  const flipControls = document.getElementById('flip-controls')

  if (!container || !fileInput || !joystickZone || !flipControls) {
    throw new Error('Required DOM elements not found')
  }

  const { scene, camera, renderer } = createSceneContext(container)
  setupCameraSettings(camera)
  setupFileLoader(scene, fileInput)
  const { getMoveVector } = setupJoystick(joystickZone)
  const sparkControls = setupSparkControls(renderer.domElement)

  flipControls.addEventListener('click', (e) => {
    const button = (e.target as HTMLElement).closest('button[data-axis]') as HTMLButtonElement | null
    if (!button) return

    const axis = button.dataset.axis as 'x' | 'y' | 'z'
    flipModel(axis)
    button.classList.toggle('active')
  })

  const joystickSpeed = 0.05

  function animate(): void {
    requestAnimationFrame(animate)

    // SparkControls: WASD + mouse drag + Space/Shift
    sparkControls.update(camera)

    // Mobile joystick: supplementary movement
    const move = getMoveVector()
    if (move.x !== 0 || move.y !== 0) {
      camera.translateX(move.x * joystickSpeed)
      camera.translateZ(-move.y * joystickSpeed)
    }

    renderer.render(scene, camera)
  }

  animate()
}

init()
