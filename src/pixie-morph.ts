import * as THREE from 'three'
import { type SplatMesh } from '@sparkjsdev/spark'
import {
  type ParticleSystem,
  createParticleSystem,
  spawnParticles,
  startConverging,
  startFadeOut,
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

    // Pre-warm: make mesh visible at opacity 0 so Spark compiles shaders
    // during the convergence animation, eliminating the gap on Phase 3 start
    mesh.visible = true
    mesh.opacity = 0

    const currentTime = performance.now() / 1000
    let newPs = spawnParticles(state.ps, MAX_PARTICLES)
    // Converge particles to their spawn positions (they stop floating in place),
    // avoiding the main-thread block that forEachSplat caused on large models
    newPs = startConverging(newPs, currentTime)

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

    // Keep ps alive for fade-out; mesh.visible/opacity=0 already set in startPhase2
    const fadingPs = startFadeOut(ps, time)

    state = {
      ...state,
      phase: 'phase3',
      ps: fadingPs,
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
      const mesh = state.mesh

      // Fade out particles in parallel with mesh fade-in
      if (state.ps) {
        const newPs = updateParticleSystem(state.ps, time)
        if (newPs.phase === 'done') {
          disposeParticleSystem(newPs, scene)
          state = { ...state, ps: null }
        } else {
          state = { ...state, ps: newPs }
        }
      }

      const elapsed = time - state.phaseStartTime
      const t = Math.min(elapsed / PHASE3_DURATION, 1.0)
      mesh.opacity = t

      if (t >= 1.0) {
        mesh.opacity = 1
        if (state.ps) {
          disposeParticleSystem(state.ps, scene)
        }
        state.onComplete?.()
        state = { ...state, phase: 'complete', ps: null }
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
