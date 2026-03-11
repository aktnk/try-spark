import * as THREE from 'three'
import type { SparkRenderer } from '@sparkjsdev/spark'

type RenderSettingsState = {
  toneMapping: THREE.ToneMapping
  exposure: number
  premultipliedAlpha: boolean
  focalAdjustment: number
}

const DEFAULTS: RenderSettingsState = {
  toneMapping: THREE.NoToneMapping,
  exposure: 1.0,
  premultipliedAlpha: true,
  focalAdjustment: 1.0,
}

const STORAGE_KEY = 'renderSettings'

function loadSaved(): RenderSettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

function save(state: RenderSettingsState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function applyState(
  state: RenderSettingsState,
  renderer: THREE.WebGLRenderer,
  spark: SparkRenderer,
): void {
  renderer.toneMapping = state.toneMapping
  renderer.toneMappingExposure = state.exposure
  spark.premultipliedAlpha = state.premultipliedAlpha
  spark.focalAdjustment = state.focalAdjustment
  spark.needsUpdate = true
}

export function setupRenderSettings(
  renderer: THREE.WebGLRenderer,
  spark: SparkRenderer,
): void {
  const toggleBtn = document.getElementById('render-settings-toggle') as HTMLButtonElement | null
  const panel = document.getElementById('render-settings-panel')
  const closeBtn = document.getElementById('rnd-close')
  const toneMappingEl = document.getElementById('rnd-tone-mapping') as HTMLSelectElement | null
  const exposureEl = document.getElementById('rnd-exposure') as HTMLInputElement | null
  const premultEl = document.getElementById('rnd-premult') as HTMLInputElement | null
  const focalEl = document.getElementById('rnd-focal') as HTMLInputElement | null
  const defaultBtn = document.getElementById('rnd-default')
  const superSplatBtn = document.getElementById('rnd-supersplat')

  if (!toggleBtn || !panel || !closeBtn || !toneMappingEl || !exposureEl || !premultEl || !focalEl || !defaultBtn || !superSplatBtn) return

  let draft = loadSaved()

  function fillInputs(s: RenderSettingsState): void {
    toneMappingEl!.value = String(s.toneMapping)
    exposureEl!.value = String(s.exposure)
    premultEl!.checked = s.premultipliedAlpha
    focalEl!.value = String(s.focalAdjustment)
  }

  function applyAndSave(s: RenderSettingsState): void {
    applyState(s, renderer, spark)
    save(s)
    draft = { ...s }
  }

  // Apply saved settings on startup
  applyAndSave(draft)
  fillInputs(draft)

  toggleBtn.addEventListener('click', () => {
    const hidden = panel.classList.toggle('hidden')
    toggleBtn.classList.toggle('active', !hidden)
    if (!hidden) fillInputs(draft)
  })

  closeBtn.addEventListener('click', () => {
    panel.classList.add('hidden')
    toggleBtn.classList.remove('active')
  })

  toneMappingEl.addEventListener('change', () => {
    draft = { ...draft, toneMapping: Number(toneMappingEl.value) as THREE.ToneMapping }
    applyAndSave(draft)
  })

  exposureEl.addEventListener('input', () => {
    const v = parseFloat(exposureEl.value)
    if (!isNaN(v) && v > 0) {
      draft = { ...draft, exposure: v }
      applyAndSave(draft)
    }
  })

  premultEl.addEventListener('change', () => {
    draft = { ...draft, premultipliedAlpha: premultEl.checked }
    applyAndSave(draft)
  })

  focalEl.addEventListener('input', () => {
    const v = parseFloat(focalEl.value)
    if (!isNaN(v) && v > 0) {
      draft = { ...draft, focalAdjustment: v }
      applyAndSave(draft)
    }
  })

  defaultBtn.addEventListener('click', () => {
    draft = { ...DEFAULTS }
    fillInputs(draft)
    applyAndSave(draft)
  })

  superSplatBtn.addEventListener('click', () => {
    draft = { ...DEFAULTS, focalAdjustment: 2.0 }
    fillInputs(draft)
    applyAndSave(draft)
  })
}
