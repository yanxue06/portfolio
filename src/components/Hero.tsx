import {
  m,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import Scene from './Scene'
import { addLike, counts } from '../lib/hits'

/* the mesh ships in its own chunk, off the critical path — until it lands,
   the circle is a flat gradient in the same palette */
const MeshGradient = lazy(() =>
  import('@paper-design/shaders-react').then((mod) => ({ default: mod.MeshGradient })),
)

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
    <m.div
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
    </m.div>
  )
}

/* the water heart ships in the same lazy chunk as the mesh sun */
const Water = lazy(() =>
  import('@paper-design/shaders-react').then((mod) => ({ default: mod.Water })),
)

const HEART_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z'/%3E%3C/svg%3E")`

/* the like heart — water rippling inside a heart mask, bare count beside
   it. spammable on purpose, every mash counts: the spring squish sits on
   the visual only (a shrinking hit target makes rapid mashing miss), and
   the burst ships batched from lib/hits. */
function LikeButton({ reduce }: { reduce: boolean }) {
  const [base, setBase] = useState<number | null>(null)
  const [mine, setMine] = useState(0)
  const squish = useSpring(1, { stiffness: 560, damping: 14 })
  useEffect(() => {
    counts.then((c) => c && setBase(c.likes))
  }, [])
  const total = (base ?? 0) + mine

  return (
    <button
      type="button"
      onClick={() => {
        setMine((m) => m + 1)
        addLike()
        if (!reduce) {
          squish.jump(1.35)
          squish.set(1)
        }
      }}
      aria-label="like this site — mash away"
      title="mash away"
      className="-mx-2 -my-1.5 flex w-fit cursor-pointer items-center gap-2 px-2 py-1.5"
    >
      <m.span className="relative h-[26px] w-[26px]" style={{ scale: squish }} aria-hidden>
        <span
          className="absolute inset-0"
          style={{
            WebkitMaskImage: HEART_MASK,
            maskImage: HEART_MASK,
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
          }}
        >
          <Suspense
            fallback={
              <span
                className="block h-full w-full"
                style={{ background: 'radial-gradient(circle at 35% 30%, #bfe3f7 0%, #58a8db 55%, #2f7cb4 100%)' }}
              />
            }
          >
            <Water
              colorBack="#3f97cf"
              colorHighlight="#f2fbff"
              highlights={0.35}
              layering={0.6}
              edges={0.5}
              waves={0.4}
              caustic={0.35}
              size={2}
              speed={reduce ? 0 : 1.2}
              style={{ width: '100%', height: '100%' }}
            />
          </Suspense>
        </span>
      </m.span>
      <span className="ink font-mono text-[14px] tabular-nums">
        <m.span
          key={mine}
          className="inline-block"
          initial={reduce || mine === 0 ? false : { scale: 1.3 }}
          animate={{ scale: 1 }}
        >
          {total.toLocaleString()}
        </m.span>
      </span>
    </button>
  )
}

/* One line of the load choreography: clipped, slides up into place.
   The wrapper's pb/-mb keeps descenders inside the clip box — leading
   0.9 alone cuts the tail off the y. */
function MaskLine({ children, delay, className }: { children: ReactNode; delay: number; className?: string }) {
  return (
    <span className={`block overflow-hidden pb-[0.12em] -mb-[0.12em] ${className ?? ''}`}>
      <m.span
        className="block"
        initial={{ y: '112%' }}
        animate={{ y: 0 }}
        transition={{ delay, duration: 1, ease: EASE }}
      >
        {children}
      </m.span>
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
      <m.div
        className="pointer-events-none absolute -inset-5"
        style={{ x: driftX, y: driftY, opacity: sceneOpacity }}
        aria-hidden
      >
        <m.div
          style={{ x: meshX, y: meshY }}
          className="absolute left-[62%] top-[34%] h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full opacity-90"
        >
          <Suspense
            fallback={
              <div
                className="h-full w-full"
                style={{ background: 'radial-gradient(circle at 38% 35%, #f5edd8 0%, #e6d5a6 48%, #c4a35c 100%)' }}
              />
            }
          >
            <MeshGradient
              colors={['#f5edd8', '#e6d5a6', '#c4a35c', '#efe3c0']}
              speed={reduce ? 0 : 0.7}
              style={{ width: '100%', height: '100%' }}
            />
          </Suspense>
        </m.div>
        <Scene progress={heroProgress} />
      </m.div>

      <div className="relative z-10 flex flex-1 flex-col justify-start px-6 pb-16 pt-[16vh] sm:px-10">
        <m.h1
          style={{ opacity: nameOpacity, scale: nameScale }}
          className="ink origin-left select-none text-[clamp(58px,9.5vw,150px)] font-extrabold leading-[0.9] tracking-[-0.04em]"
        >
          <MaskLine delay={0.1}>yan xue</MaskLine>
        </m.h1>

        <m.div style={{ opacity: chromeOpacity }} className="mt-5 max-w-[680px]">
          <m.p
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
          </m.p>
          <m.p
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.68, duration: 0.8, ease: EASE }}
            className="muted mt-1.5 font-mono text-[12px]"
          >
            {TAGLINE}
          </m.p>
          <m.div
            initial={reduce ? false : { y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.82, duration: 0.8, ease: EASE }}
            className="mt-6"
          >
            <LikeButton reduce={!!reduce} />
          </m.div>
        </m.div>

        {/* same 24px step as tagline → heart, so the column reads as one rhythm */}
        <m.div style={{ opacity: chromeOpacity }} className="mt-6">
        <m.div
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.95, duration: 0.8, ease: EASE }}
        >
          <Magnetic>
            <a
              href="mailto:yan.xue@uwaterloo.ca"
              data-cursor-capture
              className="group flex w-fit items-center gap-2 rounded-full bg-navy py-1.5 pl-5 pr-1.5 text-sm font-medium text-cream transition-all duration-300 hover:gap-3"
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
        </m.div>
        </m.div>
      </div>

      <m.p
        style={{ opacity: scrollHintOpacity }}
        className="muted absolute bottom-5 left-6 z-10 font-mono text-[11px] sm:left-10"
        aria-hidden
      >
        (scroll)
      </m.p>
      </div>
    </section>
  )
}
