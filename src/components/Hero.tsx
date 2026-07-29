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
import Scene from './Scene'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const NAV_LINKS = [
  { label: 'about', href: '#about' },
  { label: 'work', href: '#work' },
  { label: 'github', href: 'https://github.com/yanxue06' },
  { label: 'linkedin', href: 'https://linkedin.com/in/yanxue-ce' },
  { label: 'email', href: 'mailto:yan.xue@uwaterloo.ca' },
]

const META_COLUMNS = [
  'computer engineering @ uwaterloo',
  'swe intern @ photon (google, vercel + sequoia backed) · prev @ bitgo',
  'i build infra and dev tools, mostly in rust and typescript.',
]

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
        mx.set((e.clientX - r.left - r.width / 2) * 0.3)
        my.set((e.clientY - r.top - r.height / 2) * 0.4)
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
  const navOpacity = useTransform(heroProgress, [0.22, 0.38], [1, 0])
  const nameOpacity = useTransform(heroProgress, [0.3, 0.55], [1, reduce ? 1 : 0])
  const nameScale = useTransform(heroProgress, [0, 0.55], [1, reduce ? 1 : 0.96])
  const sceneOpacity = useTransform(heroProgress, [0.45, 0.75], [1, reduce ? 1 : 0])

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
        <Scene progress={heroProgress} />
      </motion.div>

      <motion.nav
        style={{ opacity: navOpacity }}
        className="relative z-20 flex items-center justify-between px-6 py-5 sm:px-10"
      >
        <a href="#top" className="ink font-mono text-sm font-bold">
          yan<span className="text-gold">*</span>
        </a>
        <div className="flex items-center gap-4 sm:gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
              className="muted after:bg-gold relative whitespace-nowrap font-mono text-[11px] transition-colors duration-200 hover:text-gold sm:text-[13px] after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:transition-[width] after:duration-300 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </div>
        {/* masthead rule draws in on load */}
        <motion.span
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 1.1, ease: EASE }}
          className="hairline absolute inset-x-0 bottom-0 origin-left border-b"
          aria-hidden
        />
      </motion.nav>

      <div className="relative z-10 flex flex-1 flex-col justify-start px-6 pb-16 pt-[10vh] sm:px-10">
        <motion.h1
          style={{ opacity: nameOpacity, scale: nameScale }}
          className="ink origin-left select-none text-[clamp(58px,9.5vw,150px)] font-extrabold leading-[0.9] tracking-[-0.04em]"
        >
          <MaskLine delay={0.1}>
            yan xue<span className="align-top text-[0.5em] leading-none text-gold">*</span>
          </MaskLine>
        </motion.h1>

        <motion.div
          style={{ opacity: chromeOpacity }}
          className="hairline mt-8 grid max-w-[760px] gap-4 border-t pt-6 sm:mt-10 sm:grid-cols-3 sm:gap-0"
        >
          {META_COLUMNS.map((text, i) => (
            <motion.p
              key={i}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55 + i * 0.12, duration: 0.8, ease: EASE }}
              className={`muted font-mono text-[12px] leading-relaxed ${i > 0 ? 'hairline sm:border-l sm:pl-5' : ''} sm:pr-5`}
            >
              {text}
            </motion.p>
          ))}
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
              className="group inline-flex items-center gap-2 rounded-full bg-navy py-1.5 pl-5 pr-1.5 text-sm font-medium text-cream transition-all duration-300 hover:gap-3"
            >
              say hello
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream transition-transform duration-300 group-hover:scale-110">
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
