"use client"

import Link from "next/link"
import { ArrowLeft, Gamepad2, Grid3X3, BarChart3, RotateCcw, Flame, Zap } from "lucide-react"
import { getStats, getStreak, resetStats, type GameStatsData } from "@/lib/game-stats"
import { useEffect, useState } from "react"

export default function StatsPage() {
  const [stats, setStats] = useState<GameStatsData | null>(null)
  const [streak, setStreak] = useState({ current: 0, longest: 0 })

  const refresh = () => {
    setStats(getStats())
    setStreak(getStreak())
  }

  useEffect(() => {
    refresh()
  }, [])

  if (!stats) return null

  const { snake, tictactoe, playDates } = stats
  const hasAnyData = snake.gamesPlayed > 0 || tictactoe.gamesPlayed > 0

  const totalWins = tictactoe.winsAsX + tictactoe.winsAsO
  const winRate =
    tictactoe.gamesPlayed > 0
      ? Math.round((totalWins / tictactoe.gamesPlayed) * 100)
      : 0

  return (
    <main className="relative flex min-h-dvh flex-col items-center gap-8 bg-background p-4 py-12 sm:py-16">
      <Link
        href="/"
        className="absolute left-4 top-4 flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:left-6 sm:top-6"
      >
        <ArrowLeft className="size-3" />
        Home
      </Link>

      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="text-muted-foreground">/</span>stats
        </h1>
        <p className="text-sm text-muted-foreground">All-time game statistics</p>
      </div>

      {!hasAnyData ? (
        <div className="flex flex-col items-center gap-4 pt-8 text-center">
          <BarChart3 className="size-12 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No games played yet. Go play something!
          </p>
          <Link
            href="/"
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Browse games
          </Link>
        </div>
      ) : (
        <>
          {/* Streak card */}
          <div className="flex w-full max-w-lg gap-3">
            <StreakCard
              icon={<Flame className="size-4" />}
              label="Current Streak"
              value={streak.current}
              unit="day"
            />
            <StreakCard
              icon={<Zap className="size-4" />}
              label="Longest Streak"
              value={streak.longest}
              unit="day"
            />
            <StreakCard
              label="Days Played"
              value={playDates.length}
              unit="day"
            />
          </div>

          <div className="grid w-full max-w-lg gap-5 sm:grid-cols-2">
            {/* Snake stats */}
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                  <Gamepad2 className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Snake</h2>
                  <p className="text-[11px] text-muted-foreground">
                    {snake.gamesPlayed} game{snake.gamesPlayed !== 1 ? "s" : ""} played
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="High Score" value={snake.highScore} />
                <StatCard label="Avg Score" value={snake.gamesPlayed > 0 ? Math.round(snake.totalScore / snake.gamesPlayed) : 0} />
                <StatCard label="Food Eaten" value={snake.foodEaten} />
                <StatCard label="Max Length" value={snake.maxLength} />
              </div>
            </div>

            {/* Tic-Tac-Toe stats */}
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                  <Grid3X3 className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Tic-Tac-Toe</h2>
                  <p className="text-[11px] text-muted-foreground">
                    {tictactoe.gamesPlayed} game{tictactoe.gamesPlayed !== 1 ? "s" : ""} played
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Wins as X" value={tictactoe.winsAsX} />
                <StatCard label="Wins as O" value={tictactoe.winsAsO} />
                <StatCard label="Draws" value={tictactoe.draws} />
                <StatCard label="Win Rate" value={`${winRate}%`} />
              </div>
            </div>
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={() => {
              resetStats()
              refresh()
            }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="size-3" />
            Reset all stats
          </button>
        </>
      )}
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-background px-3 py-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-lg font-bold tabular-nums text-foreground">{value}</span>
    </div>
  )
}

function StreakCard({
  icon,
  label,
  value,
  unit,
}: {
  icon?: React.ReactNode
  label: string
  value: number
  unit: string
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-4 text-center">
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <span className="text-2xl font-bold tabular-nums text-foreground">{value}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
        {label}
      </span>
    </div>
  )
}
