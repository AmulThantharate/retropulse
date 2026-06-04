// Gentle chime sound for the seasonal particles toggle.
// Uses the same Web Audio API pattern as snake-sound.ts.

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  return ctx
}

function tone(
  ac: AudioContext,
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType,
  peak = 0.12,
) {
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

export function playToggleSound(on: boolean) {
  const ac = getCtx()
  if (!ac) return
  if (ac.state === "suspended") ac.resume()
  const t = ac.currentTime

  if (on) {
    // Rising chime — enabled
    tone(ac, 880, t, 0.08, "sine", 0.1)
    tone(ac, 1100, t + 0.06, 0.12, "sine", 0.08)
  } else {
    // Falling chime — disabled
    tone(ac, 660, t, 0.08, "sine", 0.1)
    tone(ac, 440, t + 0.06, 0.12, "sine", 0.08)
  }
}
