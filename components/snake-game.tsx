"use client"

import { useState, useEffect, useRef } from "react"
import { useSnakeGame } from "@/hooks/use-snake-game"
import { SnakeBoard } from "@/components/snake-board"
import { SnakeOverlay } from "@/components/snake-overlay"
import { type GameSettings } from "@/components/snake-settings"
import { Button } from "@/components/ui/button"
import { THEMES } from "@/lib/snake-constants"
import { resumeAudio } from "@/lib/snake-sound"
import {
  Pause,
  Play,
  Trophy,
  Timer,
  Volume2,
  VolumeX,
} from "lucide-react"
import { recordSnakeGame } from "@/lib/game-stats"

export function SnakeGame() {
  const [settings, setSettings] = useState<GameSettings>({
    difficulty: "normal",
    mode: "classic",
    theme: THEMES[0],
    soundEnabled: true,
  })

  const updateSettings = (next: Partial<GameSettings>) =>
    setSettings((s) => ({ ...s, ...next }))

  const {
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
  } = useSnakeGame({
    difficulty: settings.difficulty,
    mode: settings.mode,
    soundEnabled: settings.soundEnabled,
  })

  // Track game-over stats
  const prevStatusRef = useRef(status)
  useEffect(() => {
    if (prevStatusRef.current === "playing" && status === "over") {
      recordSnakeGame(score)
    }
    prevStatusRef.current = status
  }, [status, score])

  const handleStart = () => {
    resumeAudio()
    resetGame()
  }


  const toggleSound = () => updateSettings({ soundEnabled: !settings.soundEnabled })

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Score" value={score} />
        {settings.mode === "timed" ? (
          <Stat
            label="Time"
            value={timeLeft}
            accent
            icon={<Timer className="size-3 text-muted-foreground" />}
          />
        ) : (
          <Stat label="Level" value={level.level} accent />
        )}
        <Stat
          label="Best"
          value={highScore}
          icon={<Trophy className="size-3 text-muted-foreground" />}
        />
      </div>

      {/* Board with overlay */}
      <div className="relative">
        <SnakeBoard
          snake={snake}
          food={food}
          direction={direction}
          justAte={justAte}
          theme={settings.theme}
        />
        <SnakeOverlay
          status={status}
          score={score}
          highScore={highScore}
          settings={settings}
          onChangeSettings={updateSettings}
          onStart={handleStart}
          onResume={togglePause}
          onMenu={backToMenu}
        />
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-2">
        <Button
          variant="secondary"
          onClick={togglePause}
          disabled={status === "idle" || status === "over"}
          className="w-28 gap-1.5 text-sm"
        >
          {status === "paused" ? (
            <>
              <Play className="size-3.5" /> Resume
            </>
          ) : (
            <>
              <Pause className="size-3.5" /> Pause
            </>
          )}
        </Button>
        <Button
          variant="secondary"
          onClick={toggleSound}
          aria-pressed={settings.soundEnabled}
          className="w-28 gap-1.5 text-sm"
        >
          {settings.soundEnabled ? (
            <>
              <Volume2 className="size-3.5" /> Sound
            </>
          ) : (
            <>
              <VolumeX className="size-3.5" /> Muted
            </>
          )}
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Steer with arrow keys or WASD. Press Space to pause or restart.
      </p>
    </div>
  )
}

function Stat({
  label,
  value,
  accent,
  icon,
}: {
  label: string
  value: number
  accent?: boolean
  icon?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-border bg-card px-3 py-2">
      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </span>
      <span
        className={`text-lg font-bold tabular-nums ${
          accent ? "text-foreground" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  )
}
