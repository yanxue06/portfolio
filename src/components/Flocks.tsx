import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

/* Flocks of birds crossing the evening sky toward the sun at (900, 600) in
   CliffScene coordinates, shrinking and fading as they reach it. A spawner
   keeps them coming forever on a randomized timer; every flock rolls its own
   size, altitude, pace, and V-formation so no two crossings repeat. Rendered
   inside CliffScene's cloud layer so flocks ride the same parallax as the air.
   Reduced motion gets the old static trio instead. */

const SUN = { x: 900, y: 600 }

/* two wings pivoting at the body — rotation flap, never collapses the glyph */
const WING_L = 'M0 0 Q-6 -3.5 -11.5 -1.5'
const WING_R = 'M0 0 Q6 -3.5 11.5 -1.5'

interface Bird {
  dx: number
  dy: number
  scale: number
  opacity: number
  flapDur: number
  flapDelay: number
}

interface Flock {
  id: number
  birds: Bird[]
  startY: number
  midY: number
  scale: number
  duration: number
}

let flockId = 0

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function makeFlock(): Flock {
  const size = Math.round(rand(4, 8))
  const birds: Bird[] = []
  for (let i = 0; i < size; i++) {
    // loose V: a leader, then alternating sides trailing behind with jitter
    const rank = Math.ceil(i / 2)
    const side = i === 0 ? 0 : i % 2 === 1 ? -1 : 1
    birds.push({
      dx: -rank * rand(17, 25) + rand(-4, 4),
      dy: side * rank * rand(10, 15) + rand(-3, 3),
      scale: rand(0.7, 1.05),
      opacity: rand(0.6, 1),
      flapDur: rand(0.55, 0.85),
      flapDelay: rand(0, 0.5),
    })
  }
  return {
    id: flockId++,
    birds,
    startY: rand(280, 520),
    midY: rand(320, 560),
    scale: rand(0.7, 1.2),
    duration: rand(13, 22),
  }
}

function FlockGroup({ flock, onDone }: { flock: Flock; onDone: (id: number) => void }) {
  return (
    <motion.g
      initial={{ x: -100, y: flock.startY, scale: flock.scale, opacity: 0 }}
      animate={{
        x: [-100, 360, 690, SUN.x - 15],
        y: [flock.startY, flock.midY, (flock.midY + SUN.y) / 2, SUN.y - 20],
        scale: [flock.scale, flock.scale * 0.85, flock.scale * 0.55, flock.scale * 0.2],
        opacity: [0, 1, 1, 0],
      }}
      transition={{ duration: flock.duration, times: [0, 0.35, 0.7, 1], ease: 'linear' }}
      onAnimationComplete={() => onDone(flock.id)}
    >
      {flock.birds.map((bird, i) => (
        <g key={i} transform={`translate(${bird.dx} ${bird.dy}) scale(${bird.scale})`} opacity={bird.opacity}>
          <path
            d={WING_L}
            className="wing wing-l"
            style={{ animation: `flap-l ${bird.flapDur}s ease-in-out ${bird.flapDelay}s infinite` }}
          />
          <path
            d={WING_R}
            className="wing wing-r"
            style={{ animation: `flap-r ${bird.flapDur}s ease-in-out ${bird.flapDelay}s infinite` }}
          />
        </g>
      ))}
    </motion.g>
  )
}

function StaticBirds() {
  return (
    <g style={{ animation: 'birds-drift 32s ease-in-out infinite' }}>
      <path d="M1040 500 q7 -8 14 0 q7 -8 14 0" />
      <path d="M1112 528 q6 -7 12 0 q6 -7 12 0" opacity="0.85" />
      <path d="M1000 478 q5 -6 10 0 q5 -6 10 0" opacity="0.7" />
    </g>
  )
}

export default function Flocks() {
  const reduce = useReducedMotion()
  const [flocks, setFlocks] = useState<Flock[]>([])

  useEffect(() => {
    if (reduce) return
    let alive = true
    let timer: number
    const spawn = (delay: number) => {
      timer = window.setTimeout(() => {
        if (!alive) return
        setFlocks((cur) => (cur.length >= 3 ? cur : [...cur, makeFlock()]))
        spawn(rand(3500, 8000))
      }, delay)
    }
    spawn(rand(400, 1200))
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [reduce])

  return (
    <g stroke="#2a160e" strokeWidth="2.4" fill="none" strokeLinecap="round">
      {reduce ? (
        <StaticBirds />
      ) : (
        flocks.map((flock) => (
          <FlockGroup
            key={flock.id}
            flock={flock}
            onDone={(id) => setFlocks((cur) => cur.filter((f) => f.id !== id))}
          />
        ))
      )}
    </g>
  )
}
