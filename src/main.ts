import { createSceneContext } from './scene'
import { setupFileLoader, flipModel, resetFlip } from './splat-loader'
import { setupJoystick, setupSparkControls } from './controls'
import { setupCameraSettings } from './camera-settings'
import { setupLockOnCamera } from './lockon-camera'
import { setupHud } from './hud'
import { setupRenderSettings } from './render-settings'
import { createPixieMorphController } from './pixie-morph'

const BASE_JOYSTICK_SPEED = 0.05

function init(): void {
  const container = document.getElementById('canvas-container')
  const fileOpenBtn = document.getElementById('file-open-btn') as HTMLButtonElement
  const joystickZone = document.getElementById('joystick-zone')
  const flipControls = document.getElementById('flip-controls')

  const lockOnIndicator = document.getElementById('lockon-indicator')

  if (!container || !fileOpenBtn || !joystickZone || !flipControls || !lockOnIndicator) {
    throw new Error('Required DOM elements not found')
  }

  const { scene, camera, renderer, spark } = createSceneContext(container)
  const initialPosition = camera.position.clone()
  const initialQuaternion = camera.quaternion.clone()

  const { update: updateSpark, fpsMovement, pointerControls } = setupSparkControls(renderer.domElement)
  const { getSpeedMultiplier } = setupCameraSettings(camera, fpsMovement)
  const lockOnCamera = setupLockOnCamera(fpsMovement, pointerControls, lockOnIndicator)
  const { showHud, pauseHud, resumeHud } = setupHud()
  setupRenderSettings(renderer, spark)
  const pixieMorph = createPixieMorphController(scene)
  setupFileLoader(scene, fileOpenBtn, showHud, { pause: pauseHud, resume: resumeHud }, pixieMorph)
  const { getMoveVector } = setupJoystick(joystickZone)

  const resetViewBtn = document.getElementById('reset-view-btn') as HTMLButtonElement
  resetViewBtn.addEventListener('click', () => {
    camera.position.copy(initialPosition)
    camera.quaternion.copy(initialQuaternion)
    pointerControls.rotateVelocity.set(0, 0, 0)
    pointerControls.moveVelocity.set(0, 0, 0)
    pointerControls.scroll.set(0, 0, 0)
    fpsMovement.keydown = {}
    lockOnCamera.deactivate()
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

    // Lock-on mode: force camera to look at the doll's fixed center while
    // scaling move speed by distance (see lockon-camera.ts)
    lockOnCamera.update(camera)

    // Mobile joystick: supplementary movement
    const move = getMoveVector()
    if (move.x !== 0 || move.y !== 0) {
      const joystickSpeed = lockOnCamera.isActive()
        ? BASE_JOYSTICK_SPEED * lockOnCamera.getSpeedScale()
        : BASE_JOYSTICK_SPEED * getSpeedMultiplier()
      camera.translateX(move.x * joystickSpeed)
      camera.translateZ(-move.y * joystickSpeed)
    }

    pixieMorph.update(performance.now() / 1000)

    renderer.render(scene, camera)
  }

  animate()
}

init()
