import { m, useReducedMotion, useScroll } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const BODY_TEXT =
  "right now i'm on core platform at live time in san francisco, building event creation and payments, and the router that ships orders for 40+ brands. this winter i'm joining vercel to work on v0. before that i built ai infrastructure at photon: webhook delivery, buildspace, everything ci/cd. i also love frisbee, guitar, and chess."

const EXPERIENCE: Array<{ place: string; logo: string; seal?: boolean; what: string; when: string }> = [
  {
    place: 'vercel',
    logo: '/logos/vercel.svg',
    what: 'incoming swe intern, v0 team',
    when: 'jan — apr 2027',
  },
  {
    place: 'live time',
    logo: '/logos/livetime.png',
    what: 'core platform — event creation + payments at 110+ campuses, waterfall shipping router for 40+ brands',
    when: 'aug 2026 — now',
  },
  {
    place: 'photon',
    logo: '/logos/photon.png',
    what: 'webhook delivery to 100k+ devs, buildspace ci/cd, ai release pipelines',
    when: 'jan — aug 2026',
  },
  {
    place: 'bitgo',
    logo: '/logos/bitgo.jpg',
    what: 'devex — rust linter for 3,200+ api operations, tree-sitter graphql diffing',
    when: 'sep — dec 2025',
  },
  {
    place: 'hongmall',
    logo: '/logos/hongmall.png',
    what: 'intent classifiers at 95%+ accuracy for 1M+ users. python, rasa, react',
    when: 'jan — apr 2025',
  },
  {
    place: 'uwaterloo',
    logo: '/logos/uwaterloo.png',
    seal: true,
    what: "computer engineering, co-op. dean's honours 2x",
    when: 'sep 2024 — now',
  },
]

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-3 font-mono text-[12px] text-gold">
      <span className="inline-block h-px w-[34px] bg-gold/60" aria-hidden />
      {children}
    </p>
  )
}

/* row divider that fills out scrubbed to scroll, same language as work */
function RowRule() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'start 0.6'] })
  if (reduce) return <span className="hairline absolute inset-x-0 bottom-0 border-b" aria-hidden />
  return (
    <span ref={ref} className="absolute inset-x-0 bottom-0 h-px" aria-hidden>
      <m.span
        style={{ scaleX: scrollYProgress, backgroundColor: 'var(--ink)' }}
        className="block h-full w-full origin-left opacity-20"
      />
    </span>
  )
}

export default function About() {
  const reduce = useReducedMotion()
  return (
    <section id="about" className="px-6 pb-28 pt-32 sm:px-10">
      <div className="mx-auto max-w-[1200px]">
        <Kicker>about me</Kicker>
        <m.p
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.1, duration: 0.8, ease: EASE }}
          className="ink mt-8 max-w-[860px] text-[clamp(20px,2.1vw,28px)] font-medium leading-[1.45] tracking-[-0.01em]"
        >
          {BODY_TEXT}
        </m.p>

        <div className="mt-24">
          <Kicker>where i've been</Kicker>
          <div className="hairline mt-8 border-t">
            {EXPERIENCE.map((row) => (
              <m.div
                key={row.place}
                initial={reduce ? false : 'hidden'}
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                className="group relative py-6"
              >
                <RowRule />
                <span
                  className="absolute bottom-6 left-3 top-6 w-[3px] origin-center scale-y-0 bg-gold transition-transform duration-300 group-hover:scale-y-100"
                  aria-hidden
                />
                <div className="relative transition-transform duration-300 group-hover:translate-x-10">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
                      <m.span
                        variants={{ hidden: { y: '110%' }, show: { y: 0 } }}
                        transition={{ duration: 0.85, ease: EASE }}
                        className="ink flex items-center gap-3 text-[clamp(26px,3.8vw,52px)] font-bold leading-none tracking-[-0.02em]"
                      >
                        <img
                          src={row.logo}
                          alt={`${row.place} logo`}
                          loading="lazy"
                          className={`h-[1.15em] w-[1.15em] object-cover ${row.seal ? 'rounded-full' : 'rounded-[8px]'}`}
                        />
                        {row.place}
                      </m.span>
                    </span>
                    <m.span
                      variants={{ hidden: { opacity: 0, x: 26 }, show: { opacity: 1, x: 0 } }}
                      transition={{ delay: 0.14, duration: 0.7, ease: EASE }}
                      className="muted font-mono text-[12px] sm:absolute sm:bottom-0 sm:right-0"
                    >
                      {row.when}
                    </m.span>
                  </div>
                  <m.p
                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                    transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
                    className="muted mt-2 text-sm leading-relaxed"
                  >
                    {row.what}
                  </m.p>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
