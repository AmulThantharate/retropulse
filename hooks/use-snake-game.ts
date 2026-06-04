"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  GRID_SIZE,
  DIRECTION_VECTORS,
  OPPOSITES,
  TIMED_DURATION,
  getLevel,
  getDifficulty,
  type Difficulty,
  type Direction,
  type GameMode,
  type Point,
} from "@/lib/snake-constants"
import { playSound } from "@/lib/snake-sound"

type GameStatus = "idle" | "playing" | "paused" | "over"

type Options = {
  difficulty: Difficulty
  mode: GameMode
  soundEnabled: boolean
}

const INITIAL_SNAKE: Point[] = [
  { x: 8, y: 10 },
  { x: 7, y: 10 },
  { x: 6, y: 10 },
]

function randomFood(snake: Point[]): Point {
  while (true) {
    const food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }
    if (!snake.some((s) => s.x === food.x && s.y === food.y)) return food
  }
}

export function useSnakeGame({ difficulty, mode, soundEnabled }: Options) {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE)
  const [food, setFood] = useState<Point>({ x: 14, y: 10 })
  const [direction, setDirection] = useState<Direction>("RIGHT")
  const [status, setStatus] = useState<GameStatus>("idle")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [justAte, setJustAte] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMED_DURATION)

  // Refs hold the live values used inside the game loop so the interval
  // always reads fresh state without being recreated each render.
  const directionRef = useRef<Direction>("RIGHT")
  const queueRef = useRef<Direction[]>([])
  const statusRef = useRef<GameStatus>("idle")
  const modeRef = useRef<GameMode>(mode)
  const soundRef = useRef<boolean>(soundEnabled)
  const prevLevelRef = useRef(1)

  statusRef.current = status
  modeRef.current = mode
  soundRef.current = soundEnabled

  const level = getLevel(score)
  const tickMs = Math.round(level.tickMs * getDifficulty(difficulty).multiplier)

  const sfx = useCallback((type: Parameters<typeof playSound>[0]) => {
    if (soundRef.current) playSound(type)
  }, [])

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE)
    setFood(randomFood(INITIAL_SNAKE))
    setDirection("RIGHT")
    directionRef.current = "RIGHT"
    queueRef.current = []
    prevLevelRef.current = 1
    setScore(0)
    setTimeLeft(TIMED_DURATION)
    setJustAte(false)
    setStatus("playing")
    sfx("start")
  }, [sfx])

  const backToMenu = useCallback(() => {
    setStatus("idle")
  }, [])

  const togglePause = useCallback(() => {
    setStatus((s) => (s === "playing" ? "paused" : s === "paused" ? "playing" : s))
  }, [])

  const changeDirection = useCallback((next: Direction) => {
    const last = queueRef.current.length
      ? queueRef.current[queueRef.current.length - 1]
      : directionRef.current
    if (next === last || next === OPPOSITES[last]) return
    queueRef.current.push(next)
  }, [])

  const tick = useCallback(() => {
    setSnake((prev) => {
      let dir = directionRef.current
      if (queueRef.current.length) {
        dir = queueRef.current.shift() as Direction
        directionRef.current = dir
        setDirection(dir)
      }

      const vec = DIRECTION_VECTORS[dir]
      const head = prev[0]
      let nx = head.x + vec.x
      let ny = head.y + vec.y

      const offBoard = nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE

      if (offBoard) {
        if (modeRef.current === "endless") {
          // Wrap around to the opposite edge.
          nx = (nx + GRID_SIZE) % GRID_SIZE
          ny = (ny + GRID_SIZE) % GRID_SIZE
        } else {
          setStatus("over")
          sfx("crash")
          return prev
        }
      }

      const newHead = { x: nx, y: ny }

      // Self collision (ignore tail tip which will move away)
      const body = prev.slice(0, -1)
      if (body.some((s) => s.x === newHead.x && s.y === newHead.y)) {
        setStatus("over")
        sfx("crash")
        return prev
      }

      const ate = newHead.x === food.x && newHead.y === food.y
      const newSnake = [newHead, ...prev]
      if (ate) {
        setScore((sc) => sc + 1)
        setFood(randomFood(newSnake))
        setJustAte(true)
        sfx("eat")
        setTimeout(() => setJustAte(false), 150)
      } else {
        newSnake.pop()
      }
      return newSnake
    })
  }, [food, sfx])

  // Main game loop
  useEffect(() => {
    if (status !== "playing") return
    const id = setInterval(tick, tickMs)
    return () => clearInterval(id)
  }, [status, tick, tickMs])

  // Countdown timer for Timed mode
  useEffect(() => {
    if (status !== "playing" || mode !== "timed") return
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setStatus("over")
          sfx("crash")
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [status, mode, sfx])

  // Level-up chime
  useEffect(() => {
    if (status === "playing" && level.level > prevLevelRef.current) {
      sfx("level")
    }
    prevLevelRef.current = level.level
  }, [level.level, status, sfx])

  // High score tracking
  useEffect(() => {
    if (score > highScore) setHighScore(score)
  }, [score, highScore])

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
        w: "UP",
        s: "DOWN",
        a: "LEFT",
        d: "RIGHT",
      }
      const dir = keyMap[e.key]
      if (dir) {
        e.preventDefault()
        if (statusRef.current === "idle" || statusRef.current === "over") {
          resetGame()
        }
        changeDirection(dir)
        return
      }
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        if (statusRef.current === "idle" || statusRef.current === "over") {
          resetGame()
        } else {
          togglePause()
        }
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [changeDirection, resetGame, togglePause])

  return {
    snake,
    food,
    direction,
    status,
    score,
    highScore,
    level,
    justAte,
    timeLeft,
    resetGame,
    togglePause,
    backToMenu,
    changeDirection,
  }
}
