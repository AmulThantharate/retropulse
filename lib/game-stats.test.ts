import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

// Mock localStorage store
let store: Record<string, string> = {}
const localStorageMock = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  clear: () => { store = {} }
}

global.window = {} as any
global.localStorage = localStorageMock as any

import { getStats, recordSnakeGame, recordTicTacToeGame, resetStats, getStreak } from './game-stats'

describe('game-stats module', () => {
  beforeEach(() => {
    store = {}
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns default stats initially when localStorage is empty', () => {
    const stats = getStats()
    expect(stats.snake.gamesPlayed).toBe(0)
    expect(stats.snake.highScore).toBe(0)
    expect(stats.tictactoe.gamesPlayed).toBe(0)
    expect(stats.playDates).toEqual([])
  })

  it('records a snake game and updates stats correctly', () => {
    vi.setSystemTime(new Date('2026-06-05T12:00:00Z'))
    
    recordSnakeGame(10)
    
    const stats = getStats()
    expect(stats.snake.gamesPlayed).toBe(1)
    expect(stats.snake.highScore).toBe(10)
    expect(stats.snake.totalScore).toBe(10)
    expect(stats.snake.foodEaten).toBe(10)
    expect(stats.snake.maxLength).toBe(13) // 3 + score
    expect(stats.playDates).toContain('2026-06-05')
  })

  it('retains the high score when a lower score is recorded', () => {
    recordSnakeGame(15)
    recordSnakeGame(5)
    
    const stats = getStats()
    expect(stats.snake.gamesPlayed).toBe(2)
    expect(stats.snake.highScore).toBe(15)
    expect(stats.snake.totalScore).toBe(20)
  })

  it('records tic-tac-toe games correctly for X, O, and draw', () => {
    recordTicTacToeGame('X')
    recordTicTacToeGame('O')
    recordTicTacToeGame('draw')
    
    const stats = getStats()
    expect(stats.tictactoe.gamesPlayed).toBe(3)
    expect(stats.tictactoe.winsAsX).toBe(1)
    expect(stats.tictactoe.winsAsO).toBe(1)
    expect(stats.tictactoe.draws).toBe(1)
  })

  it('calculates current and longest streaks correctly', () => {
    // Play on June 3, June 4, June 5
    vi.setSystemTime(new Date('2026-06-03T12:00:00Z'))
    recordSnakeGame(1)
    
    vi.setSystemTime(new Date('2026-06-04T12:00:00Z'))
    recordSnakeGame(2)
    
    vi.setSystemTime(new Date('2026-06-05T12:00:00Z'))
    recordSnakeGame(3)
    
    const streak = getStreak()
    expect(streak.current).toBe(3)
    expect(streak.longest).toBe(3)
  })

  it('handles streak breaks and tracks longest vs current streak', () => {
    // Play on June 1, June 2 (streak 2)
    // No play on June 3, June 4 (break)
    // Play on June 5 (new current streak of 1)
    vi.setSystemTime(new Date('2026-06-01T12:00:00Z'))
    recordSnakeGame(1)
    vi.setSystemTime(new Date('2026-06-02T12:00:00Z'))
    recordSnakeGame(1)
    
    vi.setSystemTime(new Date('2026-06-05T12:00:00Z'))
    recordSnakeGame(1)
    
    const streak = getStreak()
    expect(streak.current).toBe(1)
    expect(streak.longest).toBe(2)
  })

  it('resets stats to empty state', () => {
    recordSnakeGame(10)
    recordTicTacToeGame('X')
    
    resetStats()
    
    const stats = getStats()
    expect(stats.snake.gamesPlayed).toBe(0)
    expect(stats.tictactoe.gamesPlayed).toBe(0)
    expect(stats.playDates).toEqual([])
  })
})
