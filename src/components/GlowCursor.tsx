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
    <motion.div style={{ x, y }} className="pointer-events-none fixed left-0 top-0 z-[95]" aria-hidden>
      <div
        style={{ mixBlendMode: 'difference' }}
        className={`-translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f0ede4] transition-[width,height,opacity] duration-300 ${
          active ? 'opacity-90' : 'opacity-0'
        } ${hot ? 'h-11 w-11' : 'h-4 w-4'}`}
      />
    </motion.div>
  )
}
