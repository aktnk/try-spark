export function synthesizeConvergeSound(): void {
  const ctx = new AudioContext()

  const osc1 = ctx.createOscillator()
  const gain1 = ctx.createGain()
  osc1.type = 'sine'
  osc1.frequency.setValueAtTime(180, ctx.currentTime)
  osc1.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.35)
  gain1.gain.setValueAtTime(0.0, ctx.currentTime)
  gain1.gain.linearRampToValueAtTime(0.32, ctx.currentTime + 0.02)
  gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55)
  osc1.connect(gain1)
  gain1.connect(ctx.destination)

  const osc2 = ctx.createOscillator()
  const gain2 = ctx.createGain()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(270, ctx.currentTime)
  osc2.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.32)
  gain2.gain.setValueAtTime(0.0, ctx.currentTime)
  gain2.gain.linearRampToValueAtTime(0.10, ctx.currentTime + 0.02)
  gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45)
  osc2.connect(gain2)
  gain2.connect(ctx.destination)

  osc1.start(ctx.currentTime)
  osc1.stop(ctx.currentTime + 0.6)
  osc2.start(ctx.currentTime)
  osc2.stop(ctx.currentTime + 0.5)

  setTimeout(() => { void ctx.close() }, 800)
}
