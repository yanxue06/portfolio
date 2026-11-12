import { m, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Fragment, lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import Nav from './Nav'
import Scene from './Scene'
import { addLike, counts, peekLikes, rememberLikes } from '../lib/hits'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const ROLES = ['computer engineering @ uwaterloo', 'core platform @ live time', 'incoming @ vercel (v0)']

/* the water heart is the only shader left on the page — its own lazy chunk */
const Water = lazy(() =>
  import('@paper-design/shaders-react').then((mod) => ({ default: mod.Water })),
)

const HEART_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z'/%3E%3C/svg%3E")`

/* the like heart — water rippling inside a heart mask, bare count beside
   it. spammable on purpose, every mash counts: the spring squish sits on
   the visual only (a shrinking hit target makes rapid mashing miss), and
   the burst ships batched from lib/hits. */
function LikeButton({ reduce }: { reduce: boolean }) {
  /* last painted total from localStorage — first paint shouldn't wait on /api */
  const [base, setBase] = useState<number | null>(peekLikes)
  const [mine, setMine] = useState(0)
  const squish = useSpring(1, { stiffness: 560, damping: 14 })
  useEffect(() => {
    counts.then((c) => {
      if (!c) return
      setBase((prev) => Math.max(prev ?? 0, c.likes))
    })
  }, [])
  const total = (base ?? 0) + mine

  return (
    <button
      type="button"
      onClick={() => {
        setMine((m) => {
          const next = m + 1
          rememberLikes((base ?? 0) + next)
          return next
        })
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
                style={{ background: 'radial-gradient(circle at 35% 30%, #a9b9d4 0%, #3e5884 55%, #1d3156 100%)' }}
              />
            }
          >
            {/* a drop of the hero's sea */}
            <Water
              colorBack="#3e5884"
              colorHighlight="#f2ecde"
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
          {base != null || mine > 0 ? total.toLocaleString() : '\u00a0'}
        </m.span>
      </span>
    </button>
  )
}

/* One line of the load choreography: clipped, slides up into place.
   The wrapper's pb/-mb keeps descenders inside the clip box — leading
   0.9 alone cuts the tail off the y. */
function MaskLine({ children, delay, className }: { children: ReactNode; delay: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <span className={`block overflow-hidden pb-[0.12em] -mb-[0.12em] ${className ?? ''}`}>
      <m.span
        className="block"
        initial={reduce ? false : { y: '112%' }}
        animate={{ y: 0 }}
        transition={{ delay, duration: 1, ease: EASE }}
      >
        {children}
      </m.span>
    </span>
  )
}

/* one line of the hero after the name: rises in on load */
function Rise({ children, delay, className }: { children: ReactNode; delay: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <m.div
      initial={reduce ? false : { y: 14, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.8, ease: EASE }}
      className={className}
    >
      {children}
    </m.div>
  )
}

export default function Hero() {
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)

  /* 0 at the top of the page, 1 once the hero has scrolled fully away —
     the sun sets on it */
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })

  return (
    /* the hero paints its own cream sky and pins its own ink, so the page
       can turn navy underneath while the scene is still on screen. the land
       is navy at the bottom edge and runs straight into the about section */
    <section
      id="top"
      ref={sectionRef}
      className="relative flex h-svh min-h-[620px] flex-col overflow-hidden bg-cream"
      style={{ '--ink': '#0f1e3a', '--muted': '#5e6b85' } as CSSProperties}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Scene progress={scrollYProgress} />
      </div>
      <Nav />

      {/* sizes follow the shorter of width and height, so a wide, short
          laptop window keeps the whole column above the cliff */}
      <div className="relative z-10 px-6 pt-[clamp(88px,14vh,150px)] sm:px-10">
        <h1 className="ink select-none text-[clamp(56px,min(9.5vw,17vh),150px)] font-extrabold leading-[0.9] tracking-[-0.04em]">
          <MaskLine delay={0.1}>yan xue</MaskLine>
        </h1>

        <Rise delay={0.5} className="mt-5 sm:mt-6">
          <p className="ink text-[clamp(24px,min(2.9vw,4.7vh),42px)] font-semibold leading-[1.08] tracking-[-0.025em]">
            building tools that give
            <br />
            <span className="italic">time back to people.</span>
          </p>
        </Rise>

        <Rise delay={0.62} className="mt-4 sm:mt-5">
          <p className="muted max-w-[680px] text-[14px] leading-relaxed sm:text-[15px]">
            {/* one role per line on a phone; from sm up they share a line and
                only ever break at a dot — the space after each chunk is the
                break point, the chunk itself never splits */}
            {ROLES.map((role, i) => (
              <Fragment key={role}>
                <span className="block whitespace-nowrap sm:inline">
                  {role}
                  {i < ROLES.length - 1 && <span className="mx-1.5 hidden sm:inline">·</span>}
                </span>{' '}
              </Fragment>
            ))}
          </p>
        </Rise>

        <Rise delay={0.76} className="mt-7 flex items-center gap-6">
          <a
            href="mailto:yan.xue@uwaterloo.ca"
            className="group flex w-fit items-center gap-2 rounded-full bg-navy py-1.5 pl-5 pr-1.5 text-sm font-medium text-cream transition-all duration-300 hover:gap-3"
          >
            say hello
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream transition-transform duration-300 group-hover:scale-110">
              <ArrowRight className="h-4 w-4 text-navy transition-colors duration-200 group-hover:text-gold" />
            </span>
          </a>
          <LikeButton reduce={!!reduce} />
        </Rise>
      </div>
    </section>
  )
}
