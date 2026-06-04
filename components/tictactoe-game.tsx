"use client"

import { useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { RotateCcw, ArrowLeft, Sparkles, Brain, Cpu } from "lucide-react"
import Link from "next/link"
import { recordTicTacToeGame } from "@/lib/game-stats"

type Player = "X" | "O"
type Cell = Player | null
type Board = Cell[]
type Winner = Player | "draw" | null
type GameMode = "pvp" | "pvc"
type AIDifficulty = "easy" | "medium" | "hard"

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

function getRandomMove(board: Board): number {
  const empty = board.reduce<number[]>((acc, cell, i) => {
    if (!cell) acc.push(i)
    return acc
  }, [])
  return empty[Math.floor(Math.random() * empty.length)]
}

function minimax(board: Board, depth: number, isMaximizing: boolean, ai: Player, human: Player, maxDepth: number): number {
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

function getBestMove(board: Board, ai: Player, human: Player, difficulty: AIDifficulty): number {
  if (difficulty === "easy") {
    // Random move 40% of the time, otherwise use shallow minimax
    if (Math.random() < 0.4) return getRandomMove(board)
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

const AI_LABELS: Record<AIDifficulty, { label: string; icon: typeof Brain; description: string }> = {
  easy: { label: "Easy", icon: Sparkles, description: "Makes random mistakes" },
  medium: { label: "Medium", icon: Brain, description: "Plays decently" },
  hard: { label: "Hard", icon: Cpu, description: "Unbeatable" },
}

export function TicTacToeGame() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X")
  const [winner, setWinner] = useState<Winner>(null)
  const [winningLine, setWinningLine] = useState<number[] | null>(null)
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 })
  const [mode, setMode] = useState<GameMode>("pvp")
  const [gameStatus, setGameStatus] = useState<"idle" | "playing" | "over">("idle")
  const [playerSide, setPlayerSide] = useState<Player>("X")
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>("medium")
  const [thinking, setThinking] = useState(false)

  const human = playerSide
  const ai: Player = human === "X" ? "O" : "X"

  const resetBoard = useCallback(() => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer("X")
    setWinner(null)
    setWinningLine(null)
    setThinking(false)
    setGameStatus("playing")
  }, [])

  const handleStart = useCallback(() => {
    resetBoard()
  }, [resetBoard])

  const handleMove = useCallback(
    (index: number, isAiMove = false) => {
      if (board[index] || winner || gameStatus !== "playing") return
      // Block human clicks during AI turn, but allow AI moves through
      if (!isAiMove && mode === "pvc" && currentPlayer !== human) return

      const newBoard = [...board]
      newBoard[index] = currentPlayer
      setBoard(newBoard)

      const result = checkWinner(newBoard)
      if (result) {
        setWinner(result)
        setWinningLine(getWinningLine(newBoard))
        setGameStatus("over")
        if (result === "draw") {
          setScores((s) => ({ ...s, draw: s.draw + 1 }))
        } else {
          setScores((s) => ({ ...s, [result]: s[result] + 1 }))
        }
        recordTicTacToeGame(result)
        return
      }

      const next = currentPlayer === "X" ? "O" : "X"
      setCurrentPlayer(next)
    },
    [board, winner, gameStatus, mode, currentPlayer, human],
  )

  // AI turn
  useEffect(() => {
    if (mode !== "pvc" || gameStatus !== "playing" || currentPlayer !== ai || winner) return
    setThinking(true)
    const timer = setTimeout(() => {
      const move = getBestMove([...board], ai, human, aiDifficulty)
      if (move >= 0) {
        handleMove(move, true)
      }
      setThinking(false)
    }, mode === "pvc" ? 350 : 0)
    return () => clearTimeout(timer)
  }, [currentPlayer, mode, gameStatus, ai, board, winner, handleMove, human, aiDifficulty])

  const statusText = (() => {
    if (gameStatus === "idle") return ""
    if (winner === "draw") return "Draw"
    if (winner) return `${winner} wins`
    if (mode === "pvc" && currentPlayer === ai) return "Thinking..."
    return `${currentPlayer}'s turn`
  })()

  const statusAccent = (() => {
    if (winner === "draw") return "text-muted-foreground"
    if (winner || currentPlayer === "X") return "text-foreground"
    return "text-foreground"
  })()

  // Idle / menu screen
  if (gameStatus === "idle") {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-muted-foreground">/</span>tic-tac-toe
          </h1>
          <p className="text-balance text-sm text-muted-foreground">
            Get three in a row — horizontally, vertically, or diagonally.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          {/* Mode selection */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("pvp")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
                mode === "pvp"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:border-muted-foreground",
              )}
            >
              vs Player
            </button>
            <button
              type="button"
              onClick={() => setMode("pvc")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
                mode === "pvc"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:border-muted-foreground",
              )}
            >
              vs Computer
            </button>
          </div>

          {/* AI difficulty (only shown in PvC mode) */}
          {mode === "pvc" && (
            <div className="flex gap-2">
              {(Object.entries(AI_LABELS) as [AIDifficulty, typeof AI_LABELS["easy"]][]).map(([key, cfg]) => {
                const Icon = cfg.icon
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAiDifficulty(key)}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1 rounded-lg border px-3 py-2 text-xs transition-all",
                      aiDifficulty === key
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card text-muted-foreground hover:border-muted-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Side selection + start */}
          {mode === "pvp" ? (
            <Button size="lg" className="w-full" onClick={handleStart}>
              Start Game
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                size="lg"
                className={cn("flex-1", playerSide === "X" && "ring-2 ring-foreground ring-offset-2 ring-offset-background")}
                variant={playerSide === "X" ? "default" : "secondary"}
                onClick={() => { setPlayerSide("X"); handleStart() }}
              >
                Play as X
              </Button>
              <Button
                size="lg"
                className={cn("flex-1", playerSide === "O" && "ring-2 ring-foreground ring-offset-2 ring-offset-background")}
                variant={playerSide === "O" ? "default" : "secondary"}
                onClick={() => { setPlayerSide("O"); handleStart() }}
              >
                Play as O
              </Button>
            </div>
          )}
        </div>

        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3" />
          All games
        </Link>
      </div>
    )
  }

  // Playing screen
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5">
      {/* Score bar */}
      <div className="grid w-full grid-cols-3 gap-2">
        {(["X", "draw", "O"] as const).map((key) => (
          <div
            key={key}
            className={cn(
              "flex flex-col items-center rounded-lg border bg-card px-3 py-2 transition-all",
              !winner && key !== "draw" && currentPlayer === key && "border-foreground",
            )}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {key === "draw" ? "Draw" : key}
            </span>
            <span className="text-lg font-bold tabular-nums text-foreground">
              {scores[key]}
            </span>
          </div>
        ))}
      </div>

      {/* Status line */}
      <div className={cn("text-sm font-medium tracking-tight transition-colors", statusAccent)}>
        {statusText}
        {thinking && (
          <span className="inline-flex gap-0.5 ml-1">
            <span className="animate-bounce [animation-delay:0ms]">.</span>
            <span className="animate-bounce [animation-delay:150ms]">.</span>
            <span className="animate-bounce [animation-delay:300ms]">.</span>
          </span>
        )}
      </div>

      {/* Board */}
      <div className="grid grid-cols-3 gap-1.5 w-full max-w-[260px]">
        {board.map((cell, i) => {
          const isWinning = winningLine?.includes(i)
          return (
            <button
              key={i}
              type="button"
              disabled={!!cell || !!winner || (mode === "pvc" && currentPlayer !== human)}
              onClick={() => handleMove(i)}
              className={cn(
                "aspect-square flex items-center justify-center rounded-lg text-2xl font-bold transition-all duration-150",
                "bg-card border",
                isWinning
                  ? "border-foreground bg-foreground text-background"
                  : "border-border",
                !cell && !winner && (mode !== "pvc" || currentPlayer === human)
                  ? "hover:border-muted-foreground cursor-pointer active:scale-95"
                  : "cursor-default",
              )}
            >
              {cell && (
                <span
                  className={cn(
                    "inline-block",
                    isWinning && "animate-pulse",
                    !isWinning && "animate-in fade-in zoom-in-50 duration-150",
                  )}
                >
                  {cell === "X" ? (
                    <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="4" y1="4" x2="20" y2="20" />
                      <line x1="20" y1="4" x2="4" y2="20" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="8" />
                    </svg>
                  )}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Controls */}
      <div className="flex w-full gap-2">
        <Button size="default" className="flex-1 gap-1.5" onClick={resetBoard}>
          <RotateCcw className="size-3.5" />
          Play Again
        </Button>
        <Button
          size="default"
          variant="secondary"
          className="flex-1 gap-1.5"
          onClick={() => {
            setGameStatus("idle")
            setScores({ X: 0, O: 0, draw: 0 })
            setWinner(null)
            setWinningLine(null)
            setBoard(Array(9).fill(null))
            setCurrentPlayer("X")
          }}
        >
          <ArrowLeft className="size-3.5" />
          Menu
        </Button>
      </div>
    </div>
  )
}
