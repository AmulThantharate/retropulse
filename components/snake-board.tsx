"use client"

import { GRID_SIZE, type Direction, type Point, type Theme } from "@/lib/snake-constants"
import { cn } from "@/lib/utils"

type Props = {
  snake: Point[]
  food: Point
  direction: Direction
  justAte: boolean
  theme: Theme
}

// Eye offsets per direction, expressed as fractions of a cell.
const EYES: Record<Direction, { a: Point; b: Point }> = {
  UP: { a: { x: 0.28, y: 0.28 }, b: { x: 0.72, y: 0.28 } },
  DOWN: { a: { x: 0.28, y: 0.72 }, b: { x: 0.72, y: 0.72 } },
  LEFT: { a: { x: 0.28, y: 0.28 }, b: { x: 0.28, y: 0.72 } },
  RIGHT: { a: { x: 0.72, y: 0.28 }, b: { x: 0.72, y: 0.72 } },
}

export function SnakeBoard({ snake, food, direction, justAte, theme }: Props) {
  const cell = 100 / GRID_SIZE // percentage size of one cell
  const eyes = EYES[direction]

  return (
    <div
      className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
      role="img"
      aria-label={`Snake game board. Snake length ${snake.length}.`}
      style={
        {
          "--primary": theme.snake,
          "--accent": theme.food,
        } as React.CSSProperties
      }
    >
      {/* Checkerboard grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: `${cell}% ${cell}%`,
        }}
      />

      {/* Food */}
      <div
        className="absolute transition-all duration-150 ease-out"
        style={{
          width: `${cell}%`,
          height: `${cell}%`,
          left: `${food.x * cell}%`,
          top: `${food.y * cell}%`,
        }}
      >
        <div className="absolute inset-[18%] animate-pulse rounded-full bg-accent shadow-[0_0_12px_2px] shadow-accent/60" />
      </div>

      {/* Snake */}
      {snake.map((seg, i) => {
        const isHead = i === 0
        const t = i / Math.max(snake.length - 1, 1)
        return (
          <div
            key={`${seg.x}-${seg.y}-${i}`}
            className="absolute transition-all duration-100 ease-linear"
            style={{
              width: `${cell}%`,
              height: `${cell}%`,
              left: `${seg.x * cell}%`,
              top: `${seg.y * cell}%`,
              zIndex: snake.length - i,
            }}
          >
            <div
              className={cn(
                "absolute rounded-[30%] bg-primary",
                isHead ? "inset-0" : "inset-[8%]",
                isHead && justAte && "scale-110",
              )}
              style={{
                transition: "transform 120ms ease-out",
                opacity: isHead ? 1 : 0.9 - t * 0.35,
                boxShadow: isHead
                  ? "0 0 14px 1px var(--primary)"
                  : undefined,
              }}
            >
              {isHead && (
                <>
                  <span
                    className="absolute rounded-full bg-primary-foreground"
                    style={{
                      width: "20%",
                      height: "20%",
                      left: `${eyes.a.x * 100}%`,
                      top: `${eyes.a.y * 100}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                  <span
                    className="absolute rounded-full bg-primary-foreground"
                    style={{
                      width: "20%",
                      height: "20%",
                      left: `${eyes.b.x * 100}%`,
                      top: `${eyes.b.y * 100}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
