"use client"

const STORAGE_KEY = "retropulse-stats"

export interface SnakeStats {
  gamesPlayed: number
  highScore: number
  totalScore: number
  foodEaten: number
  maxLength: number
}

export interface TicTacToeStats {
  gamesPlayed: number
  winsAsX: number
  winsAsO: number
  draws: number
}

export interface GameStatsData {
  snake: SnakeStats
  tictactoe: TicTacToeStats
  /** ISO date strings (YYYY-MM-DD) — one entry per day any game was played. */
  playDates: string[]
}

const DEFAULT_STATS: GameStatsData = {
  snake: { gamesPlayed: 0, highScore: 0, totalScore: 0, foodEaten: 0, maxLength: 0 },
  tictactoe: { gamesPlayed: 0, winsAsX: 0, winsAsO: 0, draws: 0 },
  playDates: [],
}

function todayKey(): string {
  return todayKeyFromDate(new Date())
}

function load(): GameStatsData {
  if (typeof window === "undefined") return DEFAULT_STATS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATS
    return JSON.parse(raw) as GameStatsData
  } catch {
    return DEFAULT_STATS
  }
}

function save(data: GameStatsData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage full or unavailable — silently ignore.
  }
}

function touchDate(data: GameStatsData) {
  const key = todayKey()
  if (!data.playDates.includes(key)) {
    data.playDates = [...data.playDates, key].sort()
  }
}

/** Read the current stats snapshot. */
export function getStats(): GameStatsData {
  return load()
}

/** Compute the current active streak (consecutive days including today). */
export function getStreak(): { current: number; longest: number } {
  const { playDates } = load()
  if (playDates.length === 0) return { current: 0, longest: 0 }

  const today = todayKey()
  const sorted = [...playDates].sort().reverse()

  // Longest streak: scan forward through sorted dates
  let longest = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diff = (prev.getTime() - curr.getTime()) / 86_400_000
    if (Math.abs(diff - 1) < 0.01) {
      run++
      if (run > longest) longest = run
    } else {
      run = 1
    }
  }

  // Current streak: walk backwards from today
  let current = 0
  const set = new Set(sorted)
  const d = new Date(today)
  while (set.has(todayKeyFromDate(d))) {
    current++
    d.setDate(d.getDate() - 1)
  }

  return { current, longest }
}

function todayKeyFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// ── Snake ──

export function recordSnakeGame(score: number) {
  const data = load()
  const s = data.snake
  s.gamesPlayed++
  if (score > s.highScore) s.highScore = score
  s.totalScore += score
  s.foodEaten += score // each point = one food eaten
  s.maxLength = Math.max(s.maxLength, 3 + score)
  touchDate(data)
  save(data)
}

// ── Tic-Tac-Toe ──

export function recordTicTacToeGame(winner: "X" | "O" | "draw") {
  const data = load()
  const t = data.tictactoe
  t.gamesPlayed++
  if (winner === "X") t.winsAsX++
  else if (winner === "O") t.winsAsO++
  else t.draws++
  touchDate(data)
  save(data)
}

/** Reset all stats back to zero. */
export function resetStats() {
  save(DEFAULT_STATS)
}
