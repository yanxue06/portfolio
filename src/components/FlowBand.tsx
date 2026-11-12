import { m, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { useRef } from 'react'

const LINES = 14

function wave(y: number, amp: number, phase: number) {
  let d = `M 0 ${y.toFixed(1)}`
  for (let x = 24; x <= 1200; x += 24) {
    d += ` L ${x} ${(y + Math.sin(x / 130 + phase) * amp).toFixed(1)}`
  }
  return d
}

function FlowLine({
  d,
  progress,
  delay,
  reduce,
}: {
  d: string
  progress: MotionValue<number>
  delay: number
  reduce: boolean
}) {
  const pathLength = useTransform(progress, [delay, 0.75 + delay * 0.3], [0, 1])
  if (reduce) return <path d={d} fill="none" stroke="var(--ink)" strokeOpacity="0.2" strokeWidth="1" />
  return (
    <m.path
      d={d}
      fill="none"
      stroke="var(--ink)"
      strokeOpacity="0.2"
      strokeWidth="1"
      style={{ pathLength }}
    />
  )
}

/* plotter language on the light draft — parallel lines that draw left to
   right as the band rides up the viewport, un-drawing on the way back */
export default function FlowBand() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'start 0.3'] })
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 })

  return (
    <div ref={ref} className="relative overflow-hidden px-6 py-8 sm:px-10" aria-hidden>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-[80px] w-full sm:h-[110px]">
        {Array.from({ length: LINES }, (_, i) => (
          <FlowLine
            key={i}
            /* amplitude stays under half the 8px line spacing — anything
               bigger lets neighbours cross and the band reads as a tangle */
            d={wave(8 + (104 / (LINES - 1)) * i, 2 + (i % 3) * 0.7, i * 0.9)}
            progress={progress}
            delay={(i / LINES) * 0.25}
            reduce={!!reduce}
          />
        ))}
      </svg>
    </div>
  )
}
