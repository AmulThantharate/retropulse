"use client"

import { cn } from "@/lib/utils"
import {
  DIFFICULTIES,
  MODES,
  THEMES,
  type Difficulty,
  type GameMode,
  type Theme,
} from "@/lib/snake-constants"

export type GameSettings = {
  difficulty: Difficulty
  mode: GameMode
  theme: Theme
  soundEnabled: boolean
}

type Props = {
  settings: GameSettings
  onChange: (next: Partial<GameSettings>) => void
}

export function SnakeSettings({ settings, onChange }: Props) {
  const activeMode = MODES.find((m) => m.id === settings.mode)

  return (
    <div className="flex w-full max-w-xs flex-col gap-4 text-left">
      {/* Difficulty */}
      <Section label="Difficulty">
        <div className="grid grid-cols-3 gap-1.5">
          {DIFFICULTIES.map((d) => (
            <Chip
              key={d.id}
              active={settings.difficulty === d.id}
              onClick={() => onChange({ difficulty: d.id })}
            >
              {d.label}
            </Chip>
          ))}
        </div>
      </Section>

      {/* Mode */}
      <Section label="Mode">
        <div className="grid grid-cols-3 gap-1.5">
          {MODES.map((m) => (
            <Chip
              key={m.id}
              active={settings.mode === m.id}
              onClick={() => onChange({ mode: m.id })}
            >
              {m.label}
            </Chip>
          ))}
        </div>
        {activeMode && (
          <p className="mt-1.5 text-xs text-muted-foreground">{activeMode.description}</p>
        )}
      </Section>

      {/* Theme */}
      <Section label="Theme">
        <div className="flex gap-2">
          {THEMES.map((t) => {
            const active = settings.theme.id === t.id
            return (
              <button
                key={t.id}
                type="button"
                aria-label={t.name}
                aria-pressed={active}
                onClick={() => onChange({ theme: t })}
                className={cn(
                  "relative size-9 rounded-full border-2 transition-transform",
                  active
                    ? "border-foreground scale-110"
                    : "border-transparent hover:scale-105",
                )}
                style={{
                  background: `linear-gradient(135deg, ${t.snake} 0 60%, ${t.food} 60% 100%)`,
                }}
              />
            )
          })}
        </div>
      </Section>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-md border px-2 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-secondary text-secondary-foreground hover:bg-secondary/70",
      )}
    >
      {children}
    </button>
  )
}
