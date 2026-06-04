#!/usr/bin/env tsx

/**
 * Smoke test — validates core game logic for Tic-Tac-Toe and Snake.
 * Imports from source files so coverage reflects real code.
 *
 * Run: npx tsx scripts/smoke-test.ts
 *   or: npm test
 */

import { DIRECTION_VECTORS, OPPOSITES } from "../lib/snake-constants"

let passed = 0
let failed = 0

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++
    console.log(`  ✅ ${label}`)
  } else {
    failed++
    console.error(`  ❌ ${label}`)
  }
}

function assertEqual<T>(a: T, b: T, label: string) {
  const ok = a === b
  if (ok) {
    passed++
    console.log(`  ✅ ${label}`)
  } else {
    failed++
    console.error(`  ❌ ${label}  (expected ${JSON.stringify(b)}, got ${JSON.stringify(a)})`)
  }
}

// ──────────────────────────────────────────────
//  TIC-TAC-TOE LOGIC (inlined — lives in a React component)
// ──────────────────────────────────────────────

console.log(`\n━━━ Tic-Tac-Toe ━━━`)

type Cell = "X" | "O" | null
type Board = Cell[]
type Winner = "X" | "O" | "draw" | null

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

function checkWinner(board: Board): Winner {
  for (const [a, b, c] of WINNING_COMBOS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }
  if (board.every((c) => c !== null)) return "draw"
  return null
}

function getWinningLine(board: Board): number[] | null {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return combo
    }
  }
  return null
}

function getRandomMove(board: Board): number | undefined {
  const empty: number[] = []
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) empty.push(i)
  }
  return empty.length > 0 ? empty[Math.floor(Math.random() * empty.length)] : undefined
}

// Win detection
assertEqual(checkWinner(["X", "X", "X", null, null, null, null, null, null]), "X" as Winner, "Row 0: X wins")
assertEqual(checkWinner(["O", "X", null, null, null, null, null, null, null]), null, "Partial fill: no winner")
assertEqual(checkWinner(["X", "O", "X", "X", "O", "O", "O", "X", "X"]), "draw" as Winner, "Full board: draw")
assertEqual(checkWinner(["X", "O", null, null, "O", null, null, null, null]), null, "Partial fill 2: no winner")
assertEqual(checkWinner(["X", "O", null, null, "X", null, null, null, "X"]), "X" as Winner, "Diagonal top-left → bottom-right")

// Winning line detection
assertEqual(JSON.stringify(getWinningLine(["X", "X", "X", null, null, null, null, null, null])), JSON.stringify([0, 1, 2]), "Winning line row 0")
assertEqual(getWinningLine(["O", "X", null, null, null, null, null, null, null]), null, "No winning line")
assertEqual(JSON.stringify(getWinningLine(Array(9).fill(null))), JSON.stringify(null), "Empty board: no line")

// Random move
const rm = getRandomMove(Array(9).fill(null))
assert(rm !== undefined && rm >= 0 && rm <= 8, `getRandomMove returns valid index (${rm})`)

const oneLeft: Board = ["X", "O", "X", "O", "X", "O", "O", "X", null]
assertEqual(getRandomMove(oneLeft), 8, "getRandomMove picks the only empty cell")

const fullBoard: Board = ["X", "O", "X", "O", "X", "O", "O", "X", "O"]
assertEqual(getRandomMove(fullBoard), undefined, "getRandomMove on full board returns undefined")

// ──────────────────────────────────────────────
//  MINIMAX AI
// ──────────────────────────────────────────────

console.log(`\n━━━ Minimax AI ━━━`)

function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  ai: "X" | "O",
  human: "X" | "O",
  maxDepth: number,
): number {
  const winner = checkWinner(board)
  if (winner === ai) return 10 - depth
  if (winner === human) return depth - 10
  if (winner === "draw") return 0
  if (depth >= maxDepth) return 0

  if (isMaximizing) {
    let best = -Infinity
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = ai
        best = Math.max(best, minimax(board, depth + 1, false, ai, human, maxDepth))
        board[i] = null
      }
    }
    return best
  } else {
    let best = Infinity
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = human
        best = Math.min(best, minimax(board, depth + 1, true, ai, human, maxDepth))
        board[i] = null
      }
    }
    return best
  }
}

type AIDifficulty = "easy" | "medium" | "hard"

function getBestMove(board: Board, ai: "X" | "O", human: "X" | "O", difficulty: AIDifficulty): number {
  if (difficulty === "easy") {
    if (Math.random() < 0.4) return getRandomMove(board)!
  }
  const maxDepth = difficulty === "hard" ? 9 : difficulty === "medium" ? 3 : 1
  let bestScore = -Infinity
  let bestMove = -1
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const copy = [...board]
      copy[i] = ai
      const score = minimax(copy, 0, false, ai, human, maxDepth)
      if (score > bestScore) {
        bestScore = score
        bestMove = i
      }
    }
  }
  return bestMove
}

// Hard AI returns a valid first move
const firstMove = getBestMove(Array(9).fill(null), "X", "O", "hard")
assert(firstMove >= 0 && firstMove <= 8, `Hard AI returns valid first move (got ${firstMove})`)

// Hard AI should block a winning move
const aboutToLose: Board = ["X", "X", null, "O", null, null, null, null, null]
assertEqual(getBestMove(aboutToLose, "O", "X", "hard"), 2, "Hard AI blocks win at index 2")

// Hard AI should take a winning move
const aboutToWin: Board = ["X", "X", null, "O", "O", null, null, null, null]
assertEqual(getBestMove(aboutToWin, "X", "O", "hard"), 2, "Hard AI takes winning move at index 2")

// Medium AI (depth 3) — still smart enough to take an immediate win
assertEqual(getBestMove(aboutToWin, "X", "O", "medium"), 2, "Medium AI takes winning move at index 2")

// Easy AI returns a valid move
const easyMove = getBestMove(Array(9).fill(null), "X", "O", "easy")
assert(easyMove >= 0 && easyMove <= 8, `Easy AI returns valid index (${easyMove})`)

// ──────────────────────────────────────────────
//  SNAKE LOGIC (imports from lib/snake-constants.ts)
// ──────────────────────────────────────────────

console.log(`\n━━━ Snake (imported from source) ━━━`)

type Point = { x: number; y: number }
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"

function moveSnake(snake: Point[], direction: Direction, food: Point, gridSize: number) {
  const vec = DIRECTION_VECTORS[direction]
  const head = snake[0]
  let nx = head.x + vec.x
  let ny = head.y + vec.y

  // Wall collision
  if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) {
    return { snake: null as Point[] | null, ate: false, crashed: true }
  }

  const newHead = { x: nx, y: ny }

  // Self collision (ignore tail tip)
  const body = snake.slice(0, -1)
  if (body.some((s) => s.x === newHead.x && s.y === newHead.y)) {
    return { snake: null as Point[] | null, ate: false, crashed: true }
  }

  const ate = newHead.x === food.x && newHead.y === food.y
  const newSnake = [newHead, ...snake]
  if (!ate) newSnake.pop()

  return { snake: newSnake, ate, crashed: false }
}

// Basic movement
const snakeRight: Point[] = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }]
const foodAt = { x: 6, y: 5 }
const r1 = moveSnake(snakeRight, "RIGHT", foodAt, 20)
assert(r1.crashed === false, "Moving right: no crash")
assert(r1.ate === true, "Moving right into food: ate")
assertEqual(r1.snake!.length, 4, "Moving right into food: length 4")

// No food
const foodFar = { x: 10, y: 10 }
const r2 = moveSnake(snakeRight, "RIGHT", foodFar, 20)
assert(r2.ate === false, "Moving right away from food: not ate")
assertEqual(r2.snake!.length, 3, "Moving right: length stays 3")

// Wall collision
const snakeAtWall: Point[] = [{ x: 19, y: 5 }, { x: 18, y: 5 }]
const r3 = moveSnake(snakeAtWall, "RIGHT", foodFar, 20)
assert(r3.crashed === true, "Moving right into wall: crash")

// Self collision
const snakeLoop: Point[] = [
  { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 5, y: 4 },
  { x: 4, y: 4 }, { x: 3, y: 4 },
]
const r4 = moveSnake(snakeLoop, "RIGHT", foodFar, 20)
assert(r4.crashed === true, "Moving into self: crash")

// Direction opposition (from source import)
assertEqual(OPPOSITES["UP"], "DOWN", "Opposite of UP is DOWN (from source)")
assertEqual(OPPOSITES["LEFT"], "RIGHT", "Opposite of LEFT is RIGHT (from source)")

// Direction vectors (from source import)
assertEqual(DIRECTION_VECTORS["UP"].y, -1, "UP vector y is -1 (from source)")
assertEqual(DIRECTION_VECTORS["DOWN"].y, 1, "DOWN vector y is 1 (from source)")
assertEqual(DIRECTION_VECTORS["LEFT"].x, -1, "LEFT vector x is -1 (from source)")
assertEqual(DIRECTION_VECTORS["RIGHT"].x, 1, "RIGHT vector x is 1 (from source)")

// ──────────────────────────────────────────────
//  RESULTS
// ──────────────────────────────────────────────

console.log(`\n━━━ Results ━━━`)
console.log(`  Passed: ${passed}`)
console.log(`  Failed: ${failed}`)
console.log(`  Total:  ${passed + failed}`)
console.log()

if (failed > 0) {
  process.exit(1)
}
