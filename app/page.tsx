"use client"

import Link from "next/link"
import {
  Gamepad2,
  Grid3X3,
  BarChart3,
  Moon,
  Sun,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { SeasonalParticles, getSeasonLabel } from "@/components/seasonal-particles"
import { Snowflake } from "lucide-react"
import { playToggleSound } from "@/lib/particle-sound"

const games = [
  {
    title: "Snake",
    tagline: "Eat. Grow. Survive.",
    description:
      "Classic arcade action with multiple modes, power-ups, and a modern twist.",
    href: "/snake",
    icon: Gamepad2,
    accentColor: "oklch(0.65 0.18 150)",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/12",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderGlow: "group-hover:border-emerald-500/30 dark:group-hover:border-emerald-500/25",
    shadow: "shadow-emerald-500/5 dark:shadow-emerald-500/10",
  },
  {
    title: "Tic-Tac-Toe",
    tagline: "Three in a row.",
    description:
      "Play a friend or challenge the AI. Three difficulty levels from casual to unbeatable.",
    href: "/tictactoe",
    icon: Grid3X3,
    accentColor: "oklch(0.6 0.18 250)",
    iconBg: "bg-blue-500/10 dark:bg-blue-500/12",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderGlow: "group-hover:border-blue-500/30 dark:group-hover:border-blue-500/25",
    shadow: "shadow-blue-500/5 dark:shadow-blue-500/10",
  },
]

export default function HomePage() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark")
  const [particlesOn, setParticlesOn] = useState(true)

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background p-4 sm:p-8">
      {/* ── Animated background mesh ── */}
      <div
        className="pointer-events-none absolute inset-0 animate-gradient opacity-[0.08] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% 50%, oklch(0.7 0.15 150) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, oklch(0.65 0.15 250) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, oklch(0.75 0.12 80) 0%, transparent 50%)",
        }}
      />

      {/* ── Subtle dot pattern overlay ── */}
      <div className="pointer-events-none absolute inset-0 dot-pattern text-border/40 dark:text-border/20" />

      {/* ── Seasonal particles ── */}
      <SeasonalParticles enabled={particlesOn} />

      {/* ── Floating orbs ── */}
      <div
        className="pointer-events-none absolute -left-32 -top-32 size-96 animate-float rounded-full opacity-[0.04] dark:opacity-[0.03]"
        style={{
          background:
            "radial-gradient(circle, oklch(0.7 0.15 150) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 size-[30rem] animate-float rounded-full opacity-[0.04] dark:opacity-[0.03]"
        style={{
          background:
            "radial-gradient(circle, oklch(0.65 0.15 250) 0%, transparent 70%)",
          animationDelay: "-3s",
        }}
      />

      {/* ── Top bar controls ── */}
      <div className="animate-slide-up-fade absolute right-4 top-4 flex items-center gap-2 sm:right-8 sm:top-8">
        {/* Seasonal particles toggle */}
        {mounted && (
          <button
            type="button"
            onClick={() => {
              const next = !particlesOn
              setParticlesOn(next)
              playToggleSound(next)
            }}
            className={`group relative flex size-10 items-center justify-center rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md active:scale-95 ${
              particlesOn
                ? "text-foreground hover:bg-secondary"
                : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-secondary"
            }`}
            aria-label={particlesOn ? `Disable ${getSeasonLabel()}` : `Enable ${getSeasonLabel()}`}
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/5" />
            <Snowflake
              className={`relative size-[16px] transition-all duration-300 ${
                particlesOn ? "opacity-100" : "opacity-40"
              }`}
            />
          </button>
        )}

        {/* Theme toggle */}
        {mounted && (
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="group relative flex size-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-all duration-300 hover:bg-secondary hover:text-foreground hover:shadow-md active:scale-95"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/5" />
            <span className="relative transition-transform duration-500">
              {isDark ? (
                <Sun className="size-[18px] animate-in zoom-in duration-300" />
              ) : (
                <Moon className="size-[18px] animate-in zoom-in duration-300" />
              )}
            </span>
          </button>
        )}
      </div>

      {/* ── Header ── */}
      <div className="relative z-10 mb-12 space-y-4 text-center sm:mb-16">
        <div className="animate-slide-up-fade inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground shadow-sm">
          <Sparkles className="size-3" />
          <span>Classic Games Reimagined</span>
        </div>

        <h1 className="animate-slide-up-fade animate-slide-up-fade-delay-1 text-5xl font-bold tracking-tight sm:text-7xl">
          <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            GameHub
          </span>
        </h1>

        <p className="animate-slide-up-fade animate-slide-up-fade-delay-2 mx-auto max-w-md text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
          Two classic games, beautifully reimagined. Pick one and play.
        </p>
      </div>

      {/* ── Game cards ── */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col gap-5 sm:flex-row sm:gap-6">
        {games.map((game, i) => {
          const Icon = game.icon
          const delay = `animate-slide-up-fade-delay-${i + 3}`
          const cardId = `game-card-${i}`

          return (
            <Link
              key={game.title}
              id={cardId}
              href={game.href}
              className={`card-glow group relative flex flex-1 flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition-all duration-500 hover:shadow-xl ${game.shadow} ${game.borderGlow} ${delay} animate-slide-up-fade`}
              style={
                {
                  "--glow-color": game.accentColor,
                  transition:
                    "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease, opacity 0.6s ease, translate 0.6s ease",
                } as React.CSSProperties
              }
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = (e.clientX - rect.left) / rect.width - 0.5
                const y = (e.clientY - rect.top) / rect.height - 0.5
                e.currentTarget.style.transform = `perspective(800px) rotateX(${y * -6}deg) rotateY(${x * 6}deg)`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  "perspective(800px) rotateX(0deg) rotateY(0deg)"
              }}
            >
              {/* Shimmer overlay on hover */}
              <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-2xl">
                <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-[100%] dark:via-white/5" />
              </div>

              {/* Icon */}
              <div
                className={`relative flex size-16 items-center justify-center rounded-2xl ${game.iconBg} ${game.iconColor} transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg ${game.shadow}`}
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-40"
                  style={{ backgroundColor: game.accentColor }}
                />
                <Icon className="relative size-7" />
              </div>

              {/* Text */}
              <div className="space-y-2">
                <h2 className="text-xl font-bold tracking-tight">{game.title}</h2>
                <p className="text-xs font-medium text-muted-foreground/80">
                  {game.tagline}
                </p>
                <p className="text-balance text-xs leading-relaxed text-muted-foreground">
                  {game.description}
                </p>
              </div>

              {/* CTA */}
              <span className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-all duration-300 group-hover:text-foreground group-hover:gap-2.5">
                Play
                <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </Link>
          )
        })}
      </div>

      {/* ── Footer / Stats link ── */}
      <div className="animate-slide-up-fade animate-slide-up-fade-delay-5 relative z-10 mt-14 flex items-center gap-6 sm:mt-16">
        <Link
          href="/stats"
          className="group flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/50 px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-card hover:text-foreground hover:shadow-md active:scale-[0.97]"
        >
          <BarChart3 className="size-3.5 transition-transform duration-300 group-hover:scale-110" />
          View statistics
        </Link>
      </div>
    </main>
  )
}
