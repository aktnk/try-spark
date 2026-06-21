import * as THREE from 'three'
import { type SplatMesh } from '@sparkjsdev/spark'
import { synthesizeConvergeSound } from './audio-synth'
import {
  type ParticleSystem,
  createParticleSystem,
  spawnParticles,
  setConvergenceTargets,
  updateParticleSystem,
  disposeParticleSystem,
} from './particle-system'

const MAX_PARTICLES = 50_000
const PHASE3_DURATION = 1.2

type MorphPhase = 'idle' | 'phase1' | 'phase2' | 'phase3' | 'complete'

interface MorphState {
  readonly phase: MorphPhase
  readonly ps: ParticleSystem | null
  readonly mesh: SplatMesh | null
  readonly phaseStartTime: number
  readonly downloadProgress: number
  readonly onComplete: (() => void) | null
}

export interface PixieMorphController {
  startPhase1(): void
  setProgress(ratio: number): void
  startPhase2(mesh: SplatMesh, onComplete: () => void): void
  update(time: number): void
  cleanup(): void
}

function collectSplatSamples(mesh: SplatMesh): { positions: Float32Array; colors: Float32Array } {
  const positions: number[] = []
  const colors: number[] = []

  mesh.forEachSplat((_idx, center, _scales, _quat, _opacity, color) => {
    if (positions.length / 3 < MAX_PARTICLES) {
      positions.push(center.x, center.y, center.z)
      colors.push(color.r, color.g, color.b)
    }
  })

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
  }
}

export function createPixieMorphController(
  scene: THREE.Scene,
): PixieMorphController {
  let state: MorphState = {
    phase: 'idle',
    ps: null,
    mesh: null,
    phaseStartTime: 0,
    downloadProgress: 0,
    onComplete: null,
  }

  const startPhase1 = (): void => {
    if (state.ps) disposeParticleSystem(state.ps, scene)
    if (state.mesh) state.mesh.opacity = 1
    const ps = createParticleSystem(scene)
    state = { phase: 'phase1', ps, mesh: null, phaseStartTime: 0, downloadProgress: 0, onComplete: null }
  }

  const setProgress = (ratio: number): void => {
    if (state.phase !== 'phase1' || !state.ps) return
    const clampedRatio = Math.max(0, Math.min(1, ratio))
    const targetCount = Math.floor(clampedRatio * MAX_PARTICLES)
    const newPs = spawnParticles(state.ps, targetCount)
    state = { ...state, ps: newPs, downloadProgress: clampedRatio }
  }

  const startPhase2 = (mesh: SplatMesh, onComplete: () => void): void => {
    if (!state.ps) {
      // Fallback: file loaded before Phase 1 particles were created
      mesh.visible = true
      onComplete()
      return
    }

    // Pre-warm: make mesh visible at opacity 0 now so Spark compiles shaders
    // during the 1.5s convergence animation, eliminating the gap on Phase 3 start
    mesh.visible = true
    mesh.opacity = 0

    synthesizeConvergeSound()

    const { positions, colors } = collectSplatSamples(mesh)
    const currentTime = performance.now() / 1000

    let newPs = spawnParticles(state.ps, MAX_PARTICLES)
    newPs = setConvergenceTargets(newPs, positions, colors, currentTime)

    state = {
      ...state,
      phase: 'phase2',
      ps: newPs,
      mesh,
      onComplete,
    }
  }

  const startPhase3 = (time: number): void => {
    const { mesh, ps, onComplete } = state
    if (!mesh || !ps) return

    disposeParticleSystem(ps, scene)

    // mesh.visible and mesh.opacity = 0 were already set in startPhase2

    state = {
      ...state,
      phase: 'phase3',
      ps: null,
      phaseStartTime: time,
      onComplete,
    }
  }

  const update = (time: number): void => {
    if (state.phase === 'phase1' && state.ps) {
      const newPs = updateParticleSystem(state.ps, time)
      state = { ...state, ps: newPs }
      return
    }

    if (state.phase === 'phase2' && state.ps) {
      const newPs = updateParticleSystem(state.ps, time)
      state = { ...state, ps: newPs }
      if (newPs.phase === 'done') {
        startPhase3(time)
      }
      return
    }

    if (state.phase === 'phase3' && state.mesh) {
      const elapsed = time - state.phaseStartTime
      const t = Math.min(elapsed / PHASE3_DURATION, 1.0)
      state.mesh.opacity = t

      if (t >= 1.0) {
        state.mesh.opacity = 1
        state.onComplete?.()
        state = { ...state, phase: 'complete' }
      }
    }
  }

  const cleanup = (): void => {
    if (state.ps) disposeParticleSystem(state.ps, scene)
    if (state.mesh) {
      state.mesh.visible = true
      state.mesh.opacity = 1
    }
    state = {
      phase: 'idle',
      ps: null,
      mesh: null,
      phaseStartTime: 0,
      downloadProgress: 0,
      onComplete: null,
    }
  }

  return { startPhase1, setProgress, startPhase2, update, cleanup }
}
