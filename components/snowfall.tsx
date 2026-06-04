"use client"

import { useEffect, useRef } from "react"

interface Snowflake {
  x: number
  y: number
  r: number
  speed: number
  wind: number
  opacity: number
}

export function Snowfall() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let flakes: Snowflake[] = []
    let animationId: number
    let width = 0
    let height = 0
    let prevTime = 0

    const FLAKE_COUNT = 80
    const MAX_SPEED = 1.2
    const MAX_WIND = 0.4

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      canvas!.width = width
      canvas!.height = height
    }

    function createFlake(): Snowflake {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.5 + 1,
        speed: Math.random() * MAX_SPEED + 0.3,
        wind: (Math.random() - 0.5) * MAX_WIND * 2,
        opacity: Math.random() * 0.5 + 0.2,
      }
    }

    function init() {
      resize()
      flakes = Array.from({ length: FLAKE_COUNT }, createFlake)
    }

    function draw(timestamp: number) {
      const dt = Math.min((timestamp - prevTime) / 16, 3) // normalize to ~60fps
      prevTime = timestamp

      ctx!.clearRect(0, 0, width, height)

      for (const f of flakes) {
        // Update
        f.y += f.speed * dt
        f.x += f.wind * dt + Math.sin(f.y * 0.01 + timestamp * 0.001) * 0.15 * dt

        // Wrap around
        if (f.y > height + f.r) {
          f.y = -f.r
          f.x = Math.random() * width
        }
        if (f.x > width + f.r) f.x = -f.r
        if (f.x < -f.r) f.x = width + f.r

        // Draw
        ctx!.beginPath()
        ctx!.arc(f.x, f.y, f.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(255, 255, 255, ${f.opacity})`
        ctx!.fill()
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
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    />
  )
}
