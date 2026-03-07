import { createSceneContext } from './scene'
import { setupFileLoader, flipModel, resetFlip } from './splat-loader'
import { setupJoystick, setupSparkControls } from './controls'
import { setupCameraSettings } from './camera-settings'

const BASE_JOYSTICK_SPEED = 0.05

function init(): void {
  const container = document.getElementById('canvas-container')
  const fileOpenBtn = document.getElementById('file-open-btn') as HTMLButtonElement
  const joystickZone = document.getElementById('joystick-zone')
  const flipControls = document.getElementById('flip-controls')

  if (!container || !fileOpenBtn || !joystickZone || !flipControls) {
    throw new Error('Required DOM elements not found')
  }

  const { scene, camera, renderer } = createSceneContext(container)
  const initialPosition = camera.position.clone()
  const initialQuaternion = camera.quaternion.clone()

  const { update: updateSpark, fpsMovement, pointerControls } = setupSparkControls(renderer.domElement)
  const { getSpeedMultiplier } = setupCameraSettings(camera, fpsMovement)
  setupFileLoader(scene, fileOpenBtn)
  const { getMoveVector } = setupJoystick(joystickZone)

  const resetViewBtn = document.getElementById('reset-view-btn') as HTMLButtonElement
  resetViewBtn.addEventListener('click', () => {
    camera.position.copy(initialPosition)
    camera.quaternion.copy(initialQuaternion)
    pointerControls.rotateVelocity.set(0, 0, 0)
    pointerControls.moveVelocity.set(0, 0, 0)
    pointerControls.scroll.set(0, 0, 0)
    fpsMovement.keydown = {}
    resetFlip()
    flipControls.querySelectorAll<HTMLButtonElement>('button[data-axis]').forEach(btn => {
      btn.classList.remove('active')
    })
  })

  flipControls.addEventListener('click', (e) => {
    const button = (e.target as HTMLElement).closest('button[data-axis]') as HTMLButtonElement | null
    if (!button) return

    const axis = button.dataset.axis as 'x' | 'y' | 'z'
    flipModel(axis)
    button.classList.toggle('active')
  })

  function animate(): void {
    requestAnimationFrame(animate)

    // SparkControls: WASD + mouse drag + Space/Shift
    updateSpark(camera)

    // Mobile joystick: supplementary movement
    const move = getMoveVector()
    if (move.x !== 0 || move.y !== 0) {
      const joystickSpeed = BASE_JOYSTICK_SPEED * getSpeedMultiplier()
      camera.translateX(move.x * joystickSpeed)
      camera.translateZ(-move.y * joystickSpeed)
    }

    renderer.render(scene, camera)
  }

  animate()
}

init()
