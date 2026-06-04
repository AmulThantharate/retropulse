"use client"

import { useEffect, useRef } from "react"

type Season = "winter" | "spring" | "summer" | "fall"

interface Particle {
  x: number
  y: number
  size: number
  speedY: number
  speedX: number
  rotation: number
  rotationSpeed: number
  opacity: number
  phase: number // for twinkle / sway
}

function getSeason(): Season {
  const m = new Date().getMonth()
  if (m >= 2 && m <= 4) return "spring"
  if (m >= 5 && m <= 7) return "summer"
  if (m >= 8 && m <= 10) return "fall"
  return "winter"
}

const SEASON_LABELS: Record<Season, string> = {
  winter: "Snowflakes",
  spring: "Petals",
  summer: "Fireflies",
  fall: "Leaves",
}

const PARTICLE_COUNTS: Record<Season, number> = {
  winter: 80,
  spring: 60,
  summer: 50,
  fall: 55,
}

type Props = {
  enabled: boolean
}

export function SeasonalParticles({ enabled }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!enabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let particles: Particle[] = []
    let animationId: number
    let width = 0
    let height = 0
    let prevTime = 0
    const season = getSeason()

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      canvas!.width = width
      canvas!.height = height
    }

    function createParticle(): Particle {
      const base: Particle = {
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0,
        speedY: 0,
        speedX: 0,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: 0,
        opacity: 0,
        phase: Math.random() * Math.PI * 2,
      }

      switch (season) {
        case "winter":
          return {
            ...base,
            size: Math.random() * 2.5 + 1,
            speedY: Math.random() * 0.9 + 0.3,
            speedX: (Math.random() - 0.5) * 0.6,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            opacity: Math.random() * 0.5 + 0.2,
          }
        case "spring":
          return {
            ...base,
            size: Math.random() * 3 + 2,
            speedY: Math.random() * 0.6 + 0.2,
            speedX: (Math.random() - 0.5) * 0.8,
            rotationSpeed: (Math.random() - 0.5) * 0.04,
            opacity: Math.random() * 0.4 + 0.3,
          }
        case "summer":
          return {
            ...base,
            size: Math.random() * 1.5 + 0.8,
            speedY: Math.random() * -0.3 - 0.1, // float upward
            speedX: (Math.random() - 0.5) * 0.3,
            rotationSpeed: 0,
            opacity: Math.random() * 0.6 + 0.3,
          }
        case "fall":
          return {
            ...base,
            size: Math.random() * 3 + 2.5,
            speedY: Math.random() * 0.7 + 0.3,
            speedX: (Math.random() - 0.5) * 1.2,
            rotationSpeed: (Math.random() - 0.5) * 0.06,
            opacity: Math.random() * 0.4 + 0.35,
          }
      }
    }

    function init() {
      resize()
      particles = Array.from({ length: PARTICLE_COUNTS[season] }, createParticle)
    }

    function drawSnowflake(ctx: CanvasRenderingContext2D, p: Particle) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`
      ctx.fill()
    }

    function drawPetal(ctx: CanvasRenderingContext2D, p: Particle) {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.beginPath()
      ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 182, 193, ${p.opacity})` // light pink
      ctx.fill()
      ctx.restore()
    }

    function drawFirefly(ctx: CanvasRenderingContext2D, p: Particle, time: number) {
      const glow = 0.4 + Math.sin(time * 0.003 + p.phase) * 0.4
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * (1 + glow * 1.5), 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 220, 100, ${p.opacity * glow})`
      ctx.fill()
      // Inner bright core
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 240, 180, ${p.opacity * glow * 1.2})`
      ctx.fill()
    }

    function drawLeaf(ctx: CanvasRenderingContext2D, p: Particle) {
      const colors = [
        `rgba(200, 80, 40, ${p.opacity})`,
        `rgba(220, 130, 50, ${p.opacity})`,
        `rgba(180, 100, 30, ${p.opacity})`,
        `rgba(160, 60, 20, ${p.opacity})`,
      ]
      const ci = Math.floor((p.phase / (Math.PI * 2)) * colors.length) % colors.length
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.beginPath()
      ctx.ellipse(0, 0, p.size * 0.6, p.size * 0.4, 0, 0, Math.PI * 2)
      ctx.fillStyle = colors[ci]
      ctx.fill()
      ctx.restore()
    }

    function draw(timestamp: number) {
      const dt = Math.min((timestamp - prevTime) / 16, 3)
      prevTime = timestamp

      ctx!.clearRect(0, 0, width, height)

      for (const p of particles) {
        const sway = Math.sin(p.y * 0.008 + timestamp * 0.001 + p.phase) * 0.5

        p.y += p.speedY * dt
        p.x += (p.speedX + sway * 0.15) * dt
        p.rotation += p.rotationSpeed * dt

        // Wrap around
        if (p.y > height + p.size) {
          p.y = -p.size
          p.x = Math.random() * width
        }
        if (p.y < -p.size) {
          p.y = height + p.size
          p.x = Math.random() * width
        }
        if (p.x > width + p.size) p.x = -p.size
        if (p.x < -p.size) p.x = width + p.size

        switch (season) {
          case "winter":
            drawSnowflake(ctx!, p)
            break
          case "spring":
            drawPetal(ctx!, p)
            break
          case "summer":
            drawFirefly(ctx!, p, timestamp)
            break
          case "fall":
            drawLeaf(ctx!, p)
            break
        }
      }

      animationId = requestAnimationFrame(draw)
    }

    init()
    prevTime = performance.now()
    animationId = requestAnimationFrame(draw)

    window.addEventListener("resize", resize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    />
  )
}

export function getSeasonLabel(): string {
  return SEASON_LABELS[getSeason()]
}
