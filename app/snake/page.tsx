"use client"

import { SnakeGame } from "@/components/snake-game"
import Link from "next/link"
import { ArrowLeft, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function SnakePage() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark")

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-6 bg-background p-4">
      <Link
        href="/"
        className="absolute left-4 top-4 flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:left-6 sm:top-6"
      >
        <ArrowLeft className="size-3" />
        All games
      </Link>

      {mounted && (
        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:bg-secondary hover:text-foreground sm:right-6 sm:top-6"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      )}

      <SnakeGame />
    </main>
  )
}
