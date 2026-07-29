/* Fixed backdrop behind the whole page — contour lines of the land the
   footer campsite sits on, drawn by scroll itself. Scrolling back un-draws
   them. Stroked with the theme var so the cream/navy morph carries them. */
import { m, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'

const TAU = Math.PI * 2

/* wobbly closed loop — 8 anchors around an ellipse, quadratic-smoothed */
function blob(cx: number, cy: number, r: number, mult: number[]) {
  const pts = mult.map((m, i) => {
    const a = (i / mult.length) * TAU
    return [cx + Math.cos(a) * r * m, cy + Math.sin(a) * r * 0.52 * mult[(i + 3) % mult.length]]
  })
  const n = pts.length
  const mid = (a: number[], b: number[]) => `${((a[0] + b[0]) / 2).toFixed(1)} ${((a[1] + b[1]) / 2).toFixed(1)}`
  let d = `M ${mid(pts[0], pts[1])}`
  for (let i = 1; i <= n; i++) {
    const p = pts[i % n]
    d += ` Q ${p[0].toFixed(1)} ${p[1].toFixed(1)} ${mid(p, pts[(i + 1) % n])}`
  }
  return d + ' Z'
}

/* two nested clusters, centers drifting like real elevation rings */
const RINGS = [
  { cx: 1020, cy: 430, r: 520, o: 0.14, m: [1.06, 0.94, 1.1, 0.9, 1.04, 0.96, 1.08, 0.92], range: [0.02, 0.5] },
  { cx: 1032, cy: 420, r: 420, o: 0.15, m: [0.95, 1.08, 0.92, 1.05, 0.9, 1.1, 0.94, 1.02], range: [0.06, 0.56] },
  { cx: 1046, cy: 412, r: 322, o: 0.17, m: [1.1, 0.9, 1.06, 0.95, 1.08, 0.9, 1.02, 0.97], range: [0.1, 0.62] },
  { cx: 1058, cy: 406, r: 232, o: 0.18, m: [0.92, 1.06, 0.96, 1.1, 0.9, 1.04, 0.95, 1.08], range: [0.14, 0.68] },
  { cx: 1068, cy: 402, r: 150, o: 0.2, m: [1.04, 0.95, 1.09, 0.9, 1.06, 0.94, 1.1, 0.92], range: [0.18, 0.74] },
  { cx: 240, cy: 310, r: 300, o: 0.14, m: [1.07, 0.93, 1.05, 0.96, 1.1, 0.9, 1.03, 0.95], range: [0.3, 0.78] },
  { cx: 252, cy: 302, r: 205, o: 0.17, m: [0.94, 1.08, 0.9, 1.06, 0.95, 1.1, 0.92, 1.05], range: [0.36, 0.84] },
  { cx: 262, cy: 296, r: 122, o: 0.18, m: [1.05, 0.92, 1.08, 0.94, 1.02, 0.96, 1.09, 0.9], range: [0.42, 0.9] },
]

function Ring({
  ring,
  progress,
  reduce,
}: {
  ring: (typeof RINGS)[number]
  progress: MotionValue<number>
  reduce: boolean
}) {
  /* 0.3 floor: rings are a third drawn at load so the page is never blank,
     scroll completes them. No non-scaling-stroke — it flips dasharray into
     screen px and framer's normalized pathLength dashes become dust. */
  const draw = useTransform(progress, ring.range, [0.3, 1])
  return (
    <m.path
      d={blob(ring.cx, ring.cy, ring.r, ring.m)}
      stroke="var(--ink, #0f1e3a)"
      strokeOpacity={ring.o}
      strokeWidth="1.25"
      style={reduce ? undefined : { pathLength: draw }}
    />
  )
}

export default function Terrain() {
  const reduce = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 22 })
  /* the hero belongs to the asterisk — the whole layer only fades in after
     it has left, so the two never share the stage */
  const layerOpacity = useTransform(scrollYProgress, [0.12, 0.24], [0, 1])

  return (
    <m.div
      className="fixed inset-0 z-0"
      style={reduce ? undefined : { opacity: layerOpacity }}
      aria-hidden
    >
      <svg className="relative h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="contourfade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="78%" stopColor="#fff" />
            <stop offset="100%" stopColor="#000" />
          </linearGradient>
          <mask id="contourmask">
            <rect width="1440" height="900" fill="url(#contourfade)" />
          </mask>
        </defs>
        <g mask="url(#contourmask)" fill="none">
          {RINGS.map((ring, i) => (
            <Ring key={i} ring={ring} progress={progress} reduce={reduce} />
          ))}
        </g>
      </svg>
    </m.div>
  )
}
