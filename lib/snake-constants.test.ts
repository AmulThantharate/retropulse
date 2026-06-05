import { describe, it, expect } from 'vitest'
import { getLevel, getDifficulty, LEVELS, DIFFICULTIES } from './snake-constants'

describe('snake-constants utility functions', () => {
  describe('getLevel', () => {
    it('returns level 1 for score 0', () => {
      const lvl = getLevel(0)
      expect(lvl.level).toBe(1)
      expect(lvl.tickMs).toBe(180)
    })

    it('returns level 1 for score below the level 2 threshold (5)', () => {
      const lvl = getLevel(4)
      expect(lvl.level).toBe(1)
    })

    it('returns level 2 for score 5', () => {
      const lvl = getLevel(5)
      expect(lvl.level).toBe(2)
      expect(lvl.tickMs).toBe(150)
    })

    it('returns maximum level (7) for high scores', () => {
      const lvl = getLevel(100)
      expect(lvl.level).toBe(7)
      expect(lvl.tickMs).toBe(60)
    })
  })

  describe('getDifficulty', () => {
    it('returns correct config for easy difficulty', () => {
      const diff = getDifficulty('easy')
      expect(diff.id).toBe('easy')
      expect(diff.multiplier).toBe(1.4)
    })

    it('returns correct config for normal difficulty', () => {
      const diff = getDifficulty('normal')
      expect(diff.id).toBe('normal')
      expect(diff.multiplier).toBe(1.0)
    })

    it('returns correct config for hard difficulty', () => {
      const diff = getDifficulty('hard')
      expect(diff.id).toBe('hard')
      expect(diff.multiplier).toBe(0.68)
    })

    it('defaults to normal difficulty for invalid inputs', () => {
      // @ts-expect-error - testing invalid runtime input
      const diff = getDifficulty('invalid')
      expect(diff.id).toBe('normal')
      expect(diff.multiplier).toBe(1.0)
    })
  })
})
