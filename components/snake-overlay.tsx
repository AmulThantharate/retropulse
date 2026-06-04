"use client"

import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Trophy, Home } from "lucide-react"
import { SnakeSettings, type GameSettings } from "@/components/snake-settings"

type Props = {
  status: "idle" | "playing" | "paused" | "over"
  score: number
  highScore: number
  settings: GameSettings
  onChangeSettings: (next: Partial<GameSettings>) => void
  onStart: () => void
  onResume: () => void
  onMenu: () => void
}

export function SnakeOverlay({
  status,
  score,
  highScore,
  settings,
  onChangeSettings,
  onStart,
  onResume,
  onMenu,
}: Props) {
  if (status === "playing") return null

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-5 overflow-y-auto rounded-xl bg-background/85 p-6 text-center backdrop-blur-sm">
      {status === "idle" && (
        <>
          <div className="space-y-1">
            <h2 className="text-balance text-3xl font-bold tracking-tight">
              Snake <span className="text-xl font-normal text-muted-foreground">v1.0</span>
            </h2>
            <p className="max-w-xs text-pretty text-sm text-muted-foreground">
              Eat the food to grow. Steer with arrow keys or WASD.
            </p>
          </div>
          <SnakeSettings settings={settings} onChange={onChangeSettings} />
          <Button size="lg" onClick={onStart} className="w-full max-w-xs gap-2">
            <Play className="size-4" />
            Start Game
          </Button>
        </>
      )}

      {status === "paused" && (
        <>
          <h2 className="text-3xl font-bold tracking-tight">Paused</h2>
          <Button size="lg" onClick={onResume} className="gap-2">
            <Play className="size-4" />
            Resume
          </Button>
          <p className="text-xs text-muted-foreground">Press Space to resume</p>
        </>
      )}

      {status === "over" && (
        <>
          <h2 className="text-3xl font-bold tracking-tight text-destructive">
            Game Over
          </h2>
          <div className="flex items-center gap-6">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Score
              </div>
              <div className="text-2xl font-bold tabular-nums">{score}</div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                <Trophy className="size-3 text-accent" />
                Best
              </div>
              <div className="text-2xl font-bold tabular-nums">{highScore}</div>
            </div>
          </div>
          {score >= highScore && score > 0 && (
            <p className="text-sm font-medium text-accent">New high score!</p>
          )}
          <div className="flex w-full max-w-xs flex-col gap-2">
            <Button size="lg" onClick={onStart} className="gap-2">
              <RotateCcw className="size-4" />
              Play Again
            </Button>
            <Button size="lg" variant="secondary" onClick={onMenu} className="gap-2">
              <Home className="size-4" />
              Menu
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
