import {
  m,
  transform,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  type MotionStyle,
} from 'framer-motion'
import { useCallback, useEffect, useRef } from 'react'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import About from './components/About'
import Work from './components/Work'
import FlowBand from './components/FlowBand'
import Footer from './components/Footer'
import GlowCursor from './components/GlowCursor'
import Terrain from './components/Terrain'
import Nav from './components/Nav'

const CREAM = '#f2ecde'
const NAVY = '#0f1e3a'

/* hero cream → about navy → work cream → footer navy */
const BG = [CREAM, CREAM, NAVY, NAVY, CREAM, CREAM, NAVY]
const INK = [NAVY, NAVY, CREAM, CREAM, NAVY, NAVY, CREAM]
const MUT = ['#5e6b85', '#5e6b85', '#8a93a9', '#8a93a9', '#5e6b85', '#5e6b85', '#8a93a9']

export default function App() {
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const stopsRef = useRef<number[]>([0, 0.2, 0.25, 0.5, 0.55, 0.8, 0.85])
  const bg = useMotionValue(CREAM)
  const ink = useMotionValue(NAVY)
  const muted = useMotionValue('#5e6b85')

  const apply = useCallback(
    (v: number) => {
      const stops = stopsRef.current
      bg.set(transform(stops, BG)(v))
      ink.set(transform(stops, INK)(v))
      muted.set(transform(stops, MUT)(v))
    },
    [bg, ink, muted],
  )

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!reduce) apply(v)
  })

  /* section boundaries move with content — remeasure on resize, font load,
     and any body growth, then re-apply at the current scroll position */
  useEffect(() => {
    if (reduce) return
    const measure = () => {
      const vh = window.innerHeight
      const span = Math.max(document.documentElement.scrollHeight - vh, 1)
      const stops = [0]
      for (const id of ['about', 'work', 'footer']) {
        const el = document.getElementById(id)
        const top = el ? el.getBoundingClientRect().top + window.scrollY : 0
        /* keep the crossfade span short — the rgb midpoint of navy↔cream is
           mud, so linger in it as little as possible */
        stops.push((top - vh * 0.55) / span, (top - vh * 0.28) / span)
      }
      for (let i = 1; i < stops.length; i++) {
        stops[i] = Math.min(Math.max(stops[i], stops[i - 1] + 0.001), 1 - (stops.length - 1 - i) * 0.001)
      }
      stopsRef.current = stops
      apply(scrollYProgress.get())
    }
    measure()
    document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    return () => {
      window.removeEventListener('resize', measure)
      ro.disconnect()
    }
  }, [reduce, apply, scrollYProgress])

  return (
    <m.main
      className={`min-h-screen ${reduce ? 'static-blocks' : ''}`}
      style={reduce ? undefined : ({ backgroundColor: bg, '--ink': ink, '--muted': muted } as unknown as MotionStyle)}
    >
      <Terrain />
      <Nav />
      <Hero />
      {/* pulls the rest of the page up over the hero's pinned second viewport
          so the marquee + about physically scroll across the ghosted name */}
      {/* smaller pull-up than the hero's extra viewport: the first ~40vh of
          scroll play the scene animation alone before content arrives */}
      <div className={reduce ? 'relative z-10' : 'relative z-10 -mt-[45vh] sm:-mt-[60vh]'}>
        <Marquee />
        <About />
        <Work />
        <FlowBand />
        <Footer />
      </div>
      <GlowCursor />
    </m.main>
  )
}
