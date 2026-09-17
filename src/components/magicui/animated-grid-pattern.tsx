"use client"

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

export interface AnimatedGridPatternProps extends ComponentPropsWithoutRef<"svg"> {
  width?: number
  height?: number
  x?: number
  y?: number
  strokeDasharray?: number
  numSquares?: number
  maxOpacity?: number
  duration?: number
  repeatDelay?: number
}

type Square = {
  id: number
  pos: [number, number]
  iteration: number
}

function hashString(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function AnimatedGridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 50,
  className,
  maxOpacity = 0.5,
  duration = 4,
  repeatDelay = 0.5,
  ...props
}: AnimatedGridPatternProps) {
  const id = useId()
  const containerRef = useRef<SVGSVGElement | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [repositions, setRepositions] = useState<Record<number, Square>>({})

  const getPos = useCallback(
    (squareId: number, iteration: number): [number, number] => {
      const cols = Math.max(1, Math.floor(dimensions.width / width))
      const rows = Math.max(1, Math.floor(dimensions.height / height))
      const hash = hashString(`${id}-${squareId}-${iteration}-${cols}x${rows}`)
      return [hash % cols, Math.floor(hash / cols) % rows]
    },
    [dimensions.height, dimensions.width, height, width, id]
  )

  const baseSquares = useMemo<Square[]>(() => {
    if (!dimensions.width || !dimensions.height) return []
    return Array.from({ length: numSquares }, (_, i) => ({
      id: i,
      pos: getPos(i, 0),
      iteration: 0,
    }))
  }, [dimensions.height, dimensions.width, getPos, numSquares])

  const squares = useMemo(
    () => baseSquares.map((square) => repositions[square.id] ?? square),
    [baseSquares, repositions]
  )

  const updateSquarePosition = useCallback(
    (squareId: number) => {
      setRepositions((current) => {
        const square = squares.find((s) => s.id === squareId)
        if (!square) return current
        const nextIteration = square.iteration + 1
        return {
          ...current,
          [squareId]: {
            ...square,
            pos: getPos(squareId, nextIteration),
            iteration: nextIteration,
          },
        }
      })
    },
    [getPos, squares]
  )

  useEffect(() => {
    const element = containerRef.current
    let resizeObserver: ResizeObserver | null = null

    if (element) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setDimensions((currentDimensions) => {
            const nextWidth = entry.contentRect.width
            const nextHeight = entry.contentRect.height
            if (
              currentDimensions.width === nextWidth &&
              currentDimensions.height === nextHeight
            ) {
              return currentDimensions
            }
            return { width: nextWidth, height: nextHeight }
          })
        }
      })

      resizeObserver.observe(element)
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [])

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg x={x} y={y} className="overflow-visible">
        {squares.map(({ pos: [squareX, squareY], id, iteration }, index) => (
          <motion.rect
            initial={{ opacity: 0 }}
            animate={{ opacity: maxOpacity }}
            transition={{
              duration,
              repeat: 1,
              delay: index * 0.1,
              repeatType: "reverse",
              repeatDelay,
            }}
            onAnimationComplete={() => updateSquarePosition(id)}
            key={`${id}-${iteration}`}
            width={width - 1}
            height={height - 1}
            x={squareX * width + 1}
            y={squareY * height + 1}
            fill="currentColor"
            strokeWidth="0"
          />
        ))}
      </svg>
    </svg>
  )
}
