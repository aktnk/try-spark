import * as THREE from 'three'
import type { FpsMovement, PointerControls } from '@sparkjsdev/spark'

// Fixed target: center of the doll model. Adjust if the model isn't centered at the origin.
const LOCKON_TARGET = new THREE.Vector3(0, 0, 0)

// moveSpeed = clamp(distance * SPEED_FACTOR, MIN_SPEED, MAX_SPEED)
const SPEED_FACTOR = 0.3
const MIN_SPEED = 0.05
const MAX_SPEED = 3.0

// Invisible barrier: camera is never allowed closer than this to the target.
const MIN_APPROACH_DISTANCE = 0.3

const TOGGLE_KEYS = new Set([' ', 'Spacebar', 'l', 'L', 'f', 'F'])

export interface LockOnCamera {
  isActive: () => boolean
  getSpeedScale: () => number
  update: (camera: THREE.PerspectiveCamera) => void
  deactivate: () => void
}

export function setupLockOnCamera(
  fpsMovement: FpsMovement,
  pointerControls: PointerControls,
  indicator: HTMLElement,
): LockOnCamera {
  let active = false
  let speedScale = MIN_SPEED
  let savedMoveSpeed = fpsMovement.moveSpeed
  let savedPointerEnable = pointerControls.enable

  function activate(): void {
    if (active) return
    active = true
    savedMoveSpeed = fpsMovement.moveSpeed
    savedPointerEnable = pointerControls.enable
    pointerControls.enable = false
    indicator.classList.remove('hidden')
  }

  function deactivate(): void {
    if (!active) return
    active = false
    fpsMovement.moveSpeed = savedMoveSpeed
    pointerControls.enable = savedPointerEnable
    indicator.classList.add('hidden')
  }

  document.addEventListener('keydown', (e) => {
    if (!TOGGLE_KEYS.has(e.key)) return
    const tag = (e.target as HTMLElement).tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
    e.preventDefault()
    if (active) deactivate()
    else activate()
  })

  const toTarget = new THREE.Vector3()

  function update(camera: THREE.PerspectiveCamera): void {
    if (!active) return

    const distance = camera.position.distanceTo(LOCKON_TARGET)
    speedScale = THREE.MathUtils.clamp(distance * SPEED_FACTOR, MIN_SPEED, MAX_SPEED)
    fpsMovement.moveSpeed = speedScale

    toTarget.copy(camera.position).sub(LOCKON_TARGET)
    const len = toTarget.length()
    if (len < MIN_APPROACH_DISTANCE) {
      if (len < 1e-6) {
        toTarget.set(0, 0, 1)
      } else {
        toTarget.normalize()
      }
      camera.position.copy(LOCKON_TARGET).addScaledVector(toTarget, MIN_APPROACH_DISTANCE)
    }

    camera.lookAt(LOCKON_TARGET)
  }

  return {
    isActive: () => active,
    getSpeedScale: () => speedScale,
    update,
    deactivate,
  }
}
