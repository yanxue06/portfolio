import { useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'

/* Ambient sky layers shared by the sections below the hero. All of them are
   pointer-events-none absolute overlays; randomness rolls once per mount via
   useMemo and feeds CSS keyframes through inline vars (see index.css).
   Everything respects prefers-reduced-motion: stars go static, the rest
   render nothing. */

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

const OVERLAY = 'pointer-events-none absolute inset-0 overflow-hidden'

interface StarsProps {
  count?: number
  /* push stars toward the top of the section — dusk has stars overhead, not at your feet */
  topBias?: boolean
  className?: string
}

export function Stars({ count = 60, topBias = false, className = '' }: StarsProps) {
  const reduce = useReducedMotion()
  const stars = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: rand(0, 100),
        y: topBias ? Math.pow(Math.random(), 1.8) * 88 : rand(0, 100),
        size: rand(1, 2.4),
        dur: rand(2.2, 6),
        delay: rand(0, 7),
        peak: rand(0.45, 0.95),
      })),
    [count, topBias],
  )

  return (
    <div className={`${OVERLAY} ${className}`} aria-hidden>
      {stars.map((s, i) => (
        <span
          key={i}
          className="ambient-anim absolute rounded-full bg-[#f2e3c2]"
          style={
            {
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              opacity: reduce ? s.peak * 0.5 : undefined,
              '--peak': s.peak,
              animation: reduce ? 'none' : `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

export function Embers({ count = 14, className = '' }: { count?: number; className?: string }) {
  const reduce = useReducedMotion()
  const embers = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: rand(2, 98),
        size: rand(2, 4),
        rise: rand(300, 560),
        sway: rand(-34, 34),
        riseDur: rand(9, 17),
        swayDur: rand(3.5, 6.5),
        delay: rand(0, 14),
        glow: rand(0.35, 0.8),
        warm: Math.random() > 0.45,
      })),
    [count],
  )

  if (reduce) return null

  return (
    <div className={`${OVERLAY} ${className}`} aria-hidden>
      {embers.map((e, i) => (
        <span
          key={i}
          className="ambient-anim absolute bottom-[-8px]"
          style={
            {
              left: `${e.x}%`,
              '--rise': `${-e.rise}px`,
              '--glow': e.glow,
              animation: `ember-rise ${e.riseDur}s linear ${e.delay}s infinite`,
            } as CSSProperties
          }
        >
          <span
            className="ambient-anim block rounded-full"
            style={
              {
                width: e.size,
                height: e.size,
                background: e.warm ? '#f6a85c' : '#e8c27a',
                boxShadow: `0 0 ${e.size * 2.5}px ${e.size * 0.7}px ${e.warm ? 'rgba(246,168,92,0.45)' : 'rgba(232,194,122,0.4)'}`,
                '--sway': `${e.sway}px`,
                animation: `ember-sway ${e.swayDur}s ease-in-out ${-rand(0, 6)}s infinite`,
              } as CSSProperties
            }
          />
        </span>
      ))}
    </div>
  )
}

interface Streak {
  id: number
  x: number
  y: number
  angle: number
  length: number
  dur: number
}

let streakId = 0

export function ShootingStars({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion()
  const [streaks, setStreaks] = useState<Streak[]>([])

  useEffect(() => {
    if (reduce) return
    let alive = true
    let timer: number
    const spawn = (delay: number) => {
      timer = window.setTimeout(() => {
        if (!alive) return
        const streak: Streak = {
          id: streakId++,
          x: rand(5, 70),
          y: rand(4, 45),
          angle: rand(18, 38),
          length: rand(80, 150),
          dur: rand(0.9, 1.5),
        }
        setStreaks((cur) => [...cur, streak])
        window.setTimeout(() => {
          if (alive) setStreaks((cur) => cur.filter((s) => s.id !== streak.id))
        }, streak.dur * 1000 + 150)
        spawn(rand(3000, 8500))
      }, delay)
    }
    spawn(rand(1200, 3200))
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [reduce])

  if (reduce) return null

  return (
    <div className={`${OVERLAY} ${className}`} aria-hidden>
      {streaks.map((s) => (
        <span
          key={s.id}
          className="absolute"
          style={{ left: `${s.x}%`, top: `${s.y}%`, transform: `rotate(${s.angle}deg)` }}
        >
          <span
            className="ambient-anim block h-px rounded-full"
            style={
              {
                width: s.length,
                background: 'linear-gradient(90deg, transparent, #ffe9b8)',
                boxShadow: '0 0 6px rgba(255,233,184,0.55)',
                '--travel': `${s.length * 2.4}px`,
                animation: `shoot ${s.dur}s ease-out forwards`,
              } as CSSProperties
            }
          />
        </span>
      ))}
    </div>
  )
}

interface Blob {
  x: string
  y: string
  size: number
  color: string
  dur: number
  delay?: number
}

export function GlowBlobs({ blobs, className = '' }: { blobs: Blob[]; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <div className={`${OVERLAY} ${className}`} aria-hidden>
      {blobs.map((b, i) => (
        <span
          key={i}
          className="ambient-anim absolute rounded-full"
          style={{
            left: b.x,
            top: b.y,
            width: b.size,
            height: b.size,
            background: `radial-gradient(circle, ${b.color}, transparent 65%)`,
            filter: 'blur(46px)',
            animation: reduce ? 'none' : `blob-drift ${b.dur}s ease-in-out ${b.delay ?? 0}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
