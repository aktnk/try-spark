export function setupHud(): void {
  const overlay = document.getElementById('hud-overlay')
  const toggleBtn = document.getElementById('hud-toggle-btn') as HTMLButtonElement | null
  if (!overlay || !toggleBtn) return

  let visible = true

  toggleBtn.addEventListener('click', () => {
    visible = !visible
    overlay.classList.toggle('hidden', !visible)
    toggleBtn.classList.toggle('active', visible)
  })
}
