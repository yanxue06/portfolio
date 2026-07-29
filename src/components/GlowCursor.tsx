import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

/* a soft ink aura trailing the pointer — no dot, native cursor hidden.
   elements marked data-cursor-capture pull the aura onto their
   data-capture-point (the say-hello arrow circle), like it gets caught.
   small controls lock the aura instead: it snaps into a pill hugging the
   target, since a soft blob alone can't tell you you're on the button. */
export default function GlowCursor() {
  const reduce = useReducedMotion()
  const [fine, setFine] = useState(false)
  const [active, setActive] = useState(false)
  const [hot, setHot] = useState(false)
  const [captured, setCaptured] = useState(false)
  const [lock, setLock] = useState<{ w: number; h: number } | null>(null)
  /* remembered so the pill fades out at its last size instead of collapsing */
  const lastLock = useRef({ w: 80, h: 36 })
  const mx = useMotionValue(-200)
  const my = useMotionValue(-200)
  const x = useSpring(mx, { stiffness: 130, damping: 20, mass: 0.8 })
  const y = useSpring(my, { stiffness: 130, damping: 20, mass: 0.8 })

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
      const t = e.target as HTMLElement
      const cap = t.closest?.('[data-cursor-capture]') as HTMLElement | null
      const btn = cap ? null : (t.closest?.('a, button') as HTMLElement | null)
      if (cap) {
        const pt = (cap.querySelector('[data-capture-point]') as HTMLElement) ?? cap
        const r = pt.getBoundingClientRect()
        mx.set(r.left + r.width / 2)
        my.set(r.top + r.height / 2)
        setCaptured(true)
        setHot(true)
        setLock(null)
      } else if (btn && btn.offsetWidth <= 260 && btn.offsetHeight <= 90) {
        /* small control — lock on: snap to its center, hug its box */
        const r = btn.getBoundingClientRect()
        mx.set(r.left + r.width / 2)
        my.set(r.top + r.height / 2)
        const l = { w: r.width + 12, h: r.height + 12 }
        lastLock.current = l
        setLock(l)
        setCaptured(false)
        setHot(false)
      } else {
        mx.set(e.clientX)
        my.set(e.clientY)
        setCaptured(false)
        setHot(!!btn)
        setLock(null)
      }
      setActive(true)
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
    <motion.div style={{ x, y }} className="pointer-events-none fixed left-0 top-0 z-[94]" aria-hidden>
      <div
        style={{
          /* ink rides the page morph — navy aura on cream, cream on navy */
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--ink, #0f1e3a) 50%, transparent) 0%, color-mix(in srgb, var(--ink, #0f1e3a) 18%, transparent) 42%, transparent 70%)',
        }}
        className={`-translate-x-1/2 -translate-y-1/2 rounded-full transition-[width,height,opacity] duration-500 ${
          active && !lock ? 'opacity-100' : 'opacity-0'
        } ${captured ? 'h-16 w-16' : hot ? 'h-44 w-44' : 'h-28 w-28'}`}
      />
      <div
        style={{
          width: (lock ?? lastLock.current).w,
          height: (lock ?? lastLock.current).h,
          background: 'color-mix(in srgb, var(--ink, #0f1e3a) 12%, transparent)',
        }}
        className={`absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[width,height,opacity] duration-200 ${
          active && lock ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </motion.div>
  )
}
