export const GRID_SIZE = 20

export type Point = { x: number; y: number }
export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"

export const DIRECTION_VECTORS: Record<Direction, Point> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
}

export const OPPOSITES: Record<Direction, Direction> = {
  UP: "DOWN",
  DOWN: "UP",
  LEFT: "RIGHT",
  RIGHT: "LEFT",
}

// Levels increase as the score rises. Lower tickMs = faster snake.
export type Level = {
  level: number
  threshold: number // score needed to reach this level
  tickMs: number
}

export const LEVELS: Level[] = [
  { level: 1, threshold: 0, tickMs: 180 },
  { level: 2, threshold: 5, tickMs: 150 },
  { level: 3, threshold: 10, tickMs: 125 },
  { level: 4, threshold: 18, tickMs: 105 },
  { level: 5, threshold: 28, tickMs: 88 },
  { level: 6, threshold: 40, tickMs: 72 },
  { level: 7, threshold: 55, tickMs: 60 },
]

export function getLevel(score: number): Level {
  let current = LEVELS[0]
  for (const lvl of LEVELS) {
    if (score >= lvl.threshold) current = lvl
  }
  return current
}

// Difficulty scales the tick speed. Higher multiplier = slower = easier.
export type Difficulty = "easy" | "normal" | "hard"

export const DIFFICULTIES: { id: Difficulty; label: string; multiplier: number }[] = [
  { id: "easy", label: "Easy", multiplier: 1.4 },
  { id: "normal", label: "Normal", multiplier: 1 },
  { id: "hard", label: "Hard", multiplier: 0.68 },
]

export function getDifficulty(id: Difficulty) {
  return DIFFICULTIES.find((d) => d.id === id) ?? DIFFICULTIES[1]
}

// Game modes change the win/lose rules.
export type GameMode = "classic" | "timed" | "endless"

export const MODES: { id: GameMode; label: string; description: string }[] = [
  { id: "classic", label: "Classic", description: "Hit a wall and it's over." },
  { id: "timed", label: "Timed", description: "Score as much as you can in 60s." },
  { id: "endless", label: "Endless", description: "Walls wrap around. Only you can end it." },
]

export const TIMED_DURATION = 60 // seconds

// Color skins. Applied to the board via CSS custom properties.
export type Theme = { id: string; name: string; snake: string; food: string }

export const THEMES: Theme[] = [
  { id: "emerald", name: "Emerald", snake: "oklch(0.78 0.18 150)", food: "oklch(0.82 0.16 85)" },
  { id: "ocean", name: "Ocean", snake: "oklch(0.7 0.14 230)", food: "oklch(0.86 0.13 195)" },
  { id: "sunset", name: "Sunset", snake: "oklch(0.72 0.19 45)", food: "oklch(0.84 0.16 90)" },
  { id: "rose", name: "Rose", snake: "oklch(0.7 0.19 12)", food: "oklch(0.85 0.12 55)" },
  { id: "mono", name: "Monochrome", snake: "oklch(0.6 0 0)", food: "oklch(0.85 0 0)" },
  { id: "neon", name: "Neon", snake: "oklch(0.8 0.22 190)", food: "oklch(0.78 0.24 330)" },
  { id: "retro", name: "Retro", snake: "oklch(0.82 0.18 85)", food: "oklch(0.75 0.2 145)" },
  { id: "candy", name: "Candy", snake: "oklch(0.78 0.18 350)", food: "oklch(0.72 0.16 290)" },
  { id: "forest", name: "Forest", snake: "oklch(0.55 0.12 150)", food: "oklch(0.72 0.14 120)" },
  { id: "midnight", name: "Midnight", snake: "oklch(0.5 0.14 260)", food: "oklch(0.72 0.12 200)" },
  { id: "fire", name: "Fire", snake: "oklch(0.7 0.2 30)", food: "oklch(0.82 0.18 65)" },
  { id: "ice", name: "Ice", snake: "oklch(0.82 0.06 200)", food: "oklch(0.95 0 0)" },
]
