// Lightweight sound effects generated with the Web Audio API.
// No external assets required.

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  return ctx
}

// Some browsers start the context suspended until a user gesture.
export function resumeAudio() {
  const ac = getCtx()
  if (ac && ac.state === "suspended") ac.resume()
}

function tone(
  ac: AudioContext,
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType,
  peak = 0.18,
) {
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

export type SoundType = "eat" | "crash" | "level" | "start"

export function playSound(type: SoundType) {
  const ac = getCtx()
  if (!ac) return
  if (ac.state === "suspended") ac.resume()
  const t = ac.currentTime

  switch (type) {
    case "eat":
      tone(ac, 520, t, 0.09, "square", 0.16)
      tone(ac, 780, t + 0.06, 0.09, "square", 0.14)
      break
    case "level":
      tone(ac, 523, t, 0.12, "triangle", 0.18)
      tone(ac, 659, t + 0.1, 0.12, "triangle", 0.18)
      tone(ac, 784, t + 0.2, 0.16, "triangle", 0.18)
      break
    case "start":
      tone(ac, 392, t, 0.1, "triangle", 0.16)
      tone(ac, 587, t + 0.09, 0.14, "triangle", 0.16)
      break
    case "crash":
      tone(ac, 200, t, 0.18, "sawtooth", 0.2)
      tone(ac, 120, t + 0.08, 0.28, "sawtooth", 0.2)
      break
  }
}
