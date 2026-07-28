import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

/* nocturne's glow dot, morph-proof: difference blend reads on cream and navy */
export default function GlowCursor() {
  const reduce = useReducedMotion()
  const [fine, setFine] = useState(false)
  const [active, setActive] = useState(false)
  const [hot, setHot] = useState(false)
  const mx = useMotionValue(-100)
  const my = useMotionValue(-100)
  const x = useSpring(mx, { stiffness: 380, damping: 32, mass: 0.55 })
  const y = useSpring(my, { stiffness: 380, damping: 32, mass: 0.55 })
  /* the gold aura runs on lazier springs so it trails the core like a comet */
  const hx = useSpring(mx, { stiffness: 110, damping: 20, mass: 0.9 })
  const hy = useSpring(my, { stiffness: 110, damping: 20, mass: 0.9 })

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const sync = () => setFine(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!fine || reduce) return
    const move = (e: MouseEvent) => {
      mx.set(e.clientX)
      my.set(e.clientY)
      setActive(true)
      setHot(!!(e.target as HTMLElement).closest?.('a, button'))
    }
    const leave = () => setActive(false)
    window.addEventListener('mousemove', move)
    document.documentElement.addEventListener('mouseleave', leave)
    return () => {
      window.removeEventListener('mousemove', move)
      document.documentElement.removeEventListener('mouseleave', leave)
    }
  }, [fine, reduce, mx, my])

  if (!fine || reduce) return null
  return (
    <>
      {/* gold aura — reads on cream and navy alike, breathes wider on links */}
      <motion.div style={{ x: hx, y: hy }} className="pointer-events-none fixed left-0 top-0 z-[94]" aria-hidden>
        <div
          style={{
            background:
              'radial-gradient(circle, rgba(196,163,92,0.45) 0%, rgba(196,163,92,0.16) 42%, rgba(196,163,92,0) 70%)',
          }}
          className={`-translate-x-1/2 -translate-y-1/2 rounded-full transition-[width,height,opacity] duration-500 ${
            active ? 'opacity-100' : 'opacity-0'
          } ${hot ? 'h-44 w-44' : 'h-28 w-28'}`}
        />
      </motion.div>
      <motion.div style={{ x, y }} className="pointer-events-none fixed left-0 top-0 z-[95]" aria-hidden>
        <div
          style={{ mixBlendMode: 'difference' }}
          className={`-translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f0ede4] transition-[width,height,opacity] duration-300 ${
            active ? 'opacity-90' : 'opacity-0'
          } ${hot ? 'h-11 w-11' : 'h-3.5 w-3.5'}`}
        />
      </motion.div>
    </>
  )
}
