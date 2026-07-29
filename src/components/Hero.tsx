import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useRef, type MouseEvent, type ReactNode } from 'react'
import { MeshGradient } from '@paper-design/shaders-react'
import Scene from './Scene'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const ROLES = [
  'computer engineering @ uwaterloo',
  'swe intern @ photon (google, vercel + sequoia backed)',
  'prev @ bitgo',
]
const TAGLINE = 'i build infra and dev tools, mostly in rust and typescript.'

/* The "say hello" pill leans toward the cursor. */
export function Magnetic({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 220, damping: 18 })
  const y = useSpring(my, { stiffness: 220, damping: 18 })

  if (reduce) return <>{children}</>

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      className="w-fit"
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect()
        if (!r) return
        /* pull scales with element size — uncapped, the giant footer type
           travels ~110px and crosses the viewport clip edge */
        mx.set(Math.max(-24, Math.min(24, (e.clientX - r.left - r.width / 2) * 0.3)))
        my.set(Math.max(-16, Math.min(16, (e.clientY - r.top - r.height / 2) * 0.4)))
      }}
      onMouseLeave={() => {
        mx.set(0)
        my.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}

/* One line of the load choreography: clipped, slides up into place.
   The wrapper's pb/-mb keeps descenders inside the clip box — leading
   0.9 alone cuts the tail off the y. */
function MaskLine({ children, delay, className }: { children: ReactNode; delay: number; className?: string }) {
  return (
    <span className={`block overflow-hidden pb-[0.12em] -mb-[0.12em] ${className ?? ''}`}>
      <motion.span
        className="block"
        initial={{ y: '112%' }}
        animate={{ y: 0 }}
        transition={{ delay, duration: 1, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  )
}

export default function Hero() {
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const driftX = useSpring(useTransform(mouseX, [-0.5, 0.5], [16, -16]), { stiffness: 50, damping: 16 })
  const driftY = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), { stiffness: 50, damping: 16 })

  /* darcy-style pin: the section is 2 viewports tall, the inner block sticks
     for the first one while the marquee + about scroll over it. Everything
     hands off in sequence — hint, pill, meta, nav, asterisk — and the name
     fades out fully before the incoming content reaches it, so it never
     reads as cut. */
  const { scrollYProgress: heroProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const scrollHintOpacity = useTransform(heroProgress, [0, 0.06], [1, 0])
  const chromeOpacity = useTransform(heroProgress, [0.15, 0.32], [1, 0])
  const nameOpacity = useTransform(heroProgress, [0.3, 0.55], [1, reduce ? 1 : 0])
  const nameScale = useTransform(heroProgress, [0, 0.55], [1, reduce ? 1 : 0.96])
  const sceneOpacity = useTransform(heroProgress, [0.45, 0.75], [1, reduce ? 1 : 0])
  const meshY = useTransform(heroProgress, [0.05, 0.3, 0.5], [0, reduce ? 0 : 110, reduce ? 0 : 290])
  const meshX = useTransform(heroProgress, [0.05, 0.5], [0, reduce ? 0 : 85])

  const handleMouse = (e: MouseEvent<HTMLElement>) => {
    mouseX.set(e.clientX / window.innerWidth - 0.5)
    mouseY.set(e.clientY / window.innerHeight - 0.5)
  }

  return (
    <section
      id="top"
      ref={sectionRef}
      onMouseMove={reduce ? undefined : handleMouse}
      className={reduce ? 'relative h-screen' : 'relative h-[170vh] sm:h-[200vh]'}
    >
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
      {/* the cliff scene fills the hero behind the type, drifting gently
          against the cursor; it fades away during the pin handoff */}
      <motion.div
        className="pointer-events-none absolute -inset-5"
        style={{ x: driftX, y: driftY, opacity: sceneOpacity }}
        aria-hidden
      >
        <motion.div
          style={{ x: meshX, y: meshY }}
          className="absolute left-[62%] top-[34%] h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full opacity-90"
        >
          <MeshGradient
            colors={['#f5edd8', '#e6d5a6', '#c4a35c', '#efe3c0']}
            speed={reduce ? 0 : 0.7}
            style={{ width: '100%', height: '100%' }}
          />
        </motion.div>
        <Scene progress={heroProgress} />
      </motion.div>

      <div className="relative z-10 flex flex-1 flex-col justify-start px-6 pb-16 pt-[16vh] sm:px-10">
        <motion.h1
          style={{ opacity: nameOpacity, scale: nameScale }}
          className="ink origin-left select-none text-[clamp(58px,9.5vw,150px)] font-extrabold leading-[0.9] tracking-[-0.04em]"
        >
          <MaskLine delay={0.1}>yan xue</MaskLine>
        </motion.h1>

        <motion.div style={{ opacity: chromeOpacity }} className="mt-5 max-w-[680px]">
          <motion.p
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.8, ease: EASE }}
            className="ink text-[14px] leading-relaxed opacity-90 sm:text-[15px]"
          >
            {/* each role is one unbreakable chunk — lines only split at the dots */}
            {ROLES.map((role, i) => (
              <span key={role} className="whitespace-nowrap">
                {role}
                {i < ROLES.length - 1 && <span className="mx-1.5">·</span>}
              </span>
            ))}
          </motion.p>
          <motion.p
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.68, duration: 0.8, ease: EASE }}
            className="muted mt-1.5 font-mono text-[12px]"
          >
            {TAGLINE}
          </motion.p>
        </motion.div>

        <motion.div style={{ opacity: chromeOpacity }} className="mt-10">
        <motion.div
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.95, duration: 0.8, ease: EASE }}
        >
          <Magnetic>
            <a
              href="mailto:yan.xue@uwaterloo.ca"
              data-cursor-capture
              className="group inline-flex items-center gap-2 rounded-full bg-navy py-1.5 pl-5 pr-1.5 text-sm font-medium text-cream transition-all duration-300 hover:gap-3"
            >
              say hello
              <span
                data-capture-point
                className="flex h-9 w-9 items-center justify-center rounded-full bg-cream transition-transform duration-300 group-hover:scale-110"
              >
                <ArrowRight className="h-4 w-4 text-navy transition-colors duration-200 group-hover:text-gold" />
              </span>
            </a>
          </Magnetic>
        </motion.div>
        </motion.div>
      </div>

      <motion.p
        style={{ opacity: scrollHintOpacity }}
        className="muted absolute bottom-5 left-6 z-10 font-mono text-[11px] sm:left-10"
        aria-hidden
      >
        (scroll)
      </motion.p>
      </div>
    </section>
  )
}
