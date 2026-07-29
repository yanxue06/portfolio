import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const BODY_TEXT =
  "right now i'm at photon in san francisco, building ai infrastructure — webhook delivery, buildspace, everything ci/cd. in my free time i love building at the intersection of agents and tooling. i also love frisbee, guitar, and chess."

/* the statement, split for the word-by-word scroll reveal — italics start
   where the sentence turns personal */
const STATEMENT = "i'm yan. i like building tools that help people.".split(' ')
const ITALIC_FROM = 5

const EXPERIENCE: Array<{ place: string; logo: string; seal?: boolean; what: string; when: string }> = [
  {
    place: 'photon',
    logo: '/logos/photon.png',
    what: 'webhook delivery to 10K+ devs, buildspace ci/cd, ai release pipelines',
    when: 'dec 2025 — now',
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
      <motion.span
        style={{ scaleX: scrollYProgress, backgroundColor: 'var(--ink)' }}
        className="block h-full w-full origin-left opacity-20"
      />
    </span>
  )
}

function Word({
  children,
  progress,
  range,
  italic,
}: {
  children: string
  progress: MotionValue<number>
  range: [number, number]
  italic: boolean
}) {
  const opacity = useTransform(progress, range, [0.14, 1])
  return (
    <motion.span style={{ opacity }} className={`inline-block ${italic ? 'font-semibold italic' : ''}`}>
      {children}&nbsp;
    </motion.span>
  )
}

/* words ink in one by one as the reader moves through the section */
function Statement() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLHeadingElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.92', 'start 0.3'] })

  return (
    <h2
      ref={ref}
      className="ink relative mt-6 max-w-[1080px] text-[clamp(40px,6.6vw,88px)] font-bold leading-[1.02] tracking-[-0.03em]"
    >
      {STATEMENT.map((word, i) =>
        reduce ? (
          <span key={i} className={`inline-block ${i >= ITALIC_FROM ? 'font-semibold italic' : ''}`}>
            {word}&nbsp;
          </span>
        ) : (
          <Word
            key={i}
            progress={scrollYProgress}
            range={[i / STATEMENT.length, (i + 1) / STATEMENT.length]}
            italic={i >= ITALIC_FROM}
          >
            {word}
          </Word>
        ),
      )}
    </h2>
  )
}

export default function About() {
  const reduce = useReducedMotion()
  return (
    <section id="about" className="px-6 pb-28 pt-32 sm:px-10">
      <div className="mx-auto max-w-[1200px]">
        <Kicker>about me</Kicker>
        <Statement />
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.1, duration: 0.8, ease: EASE }}
          className="muted mt-8 max-w-[560px] text-[15.5px] leading-[1.8]"
        >
          {BODY_TEXT}
        </motion.p>

        <div className="relative mt-24">
          {/* a little night life while you read — same fireflies as the camp */}
          <span className="firefly firefly-a pointer-events-none" style={{ right: '12%', top: '16%' }} aria-hidden />
          <span
            className="firefly firefly-b pointer-events-none"
            style={{ right: '5%', top: '58%', animationDelay: '2.2s' }}
            aria-hidden
          />
          <span
            className="firefly firefly-c pointer-events-none"
            style={{ left: '48%', top: '80%', animationDelay: '4.1s' }}
            aria-hidden
          />
          <Kicker>where i've been</Kicker>
          <div className="hairline mt-8 border-t">
            {EXPERIENCE.map((row) => (
              <motion.div
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
                      <motion.span
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
                      </motion.span>
                    </span>
                    <motion.span
                      variants={{ hidden: { opacity: 0, x: 26 }, show: { opacity: 1, x: 0 } }}
                      transition={{ delay: 0.14, duration: 0.7, ease: EASE }}
                      className="muted font-mono text-[12px] sm:absolute sm:bottom-0 sm:right-0"
                    >
                      {row.when}
                    </motion.span>
                  </div>
                  <motion.p
                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                    transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
                    className="muted mt-2 text-sm leading-relaxed"
                  >
                    {row.what}
                  </motion.p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
