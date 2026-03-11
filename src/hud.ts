export function setupHud(): { showHud: () => void } {
  const overlay = document.getElementById('hud-overlay')
  const toggleBtn = document.getElementById('hud-toggle-btn') as HTMLButtonElement | null
  if (!overlay || !toggleBtn) return { showHud: () => {} }

  let visible = false

  toggleBtn.addEventListener('click', () => {
    visible = !visible
    overlay.classList.toggle('hidden', !visible)
    toggleBtn.classList.toggle('active', visible)
  })

  return {
    showHud: () => {
      visible = true
      overlay.classList.remove('hidden')
      toggleBtn.classList.add('active')
    },
  }
}
