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
    when: 'apr 2024 — now',
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

        <div className="mt-24">
          <Kicker>where i've been</Kicker>
          <div className="hairline mt-8 border-t">
            {EXPERIENCE.map((row, i) => (
              <motion.div
                key={row.place}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.07, duration: 0.6, ease: EASE }}
                className="hairline group relative border-b py-6"
              >
                <span
                  className="absolute left-0 top-1/2 h-10 w-[3px] origin-center -translate-y-1/2 scale-y-0 bg-gold transition-transform duration-300 group-hover:scale-y-100"
                  aria-hidden
                />
                <div className="transition-transform duration-300 group-hover:translate-x-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <span className="ink flex items-center gap-3 text-[clamp(26px,3.8vw,52px)] font-bold leading-none tracking-[-0.02em]">
                      <img
                        src={row.logo}
                        alt={`${row.place} logo`}
                        loading="lazy"
                        className={`h-5 w-5 object-cover grayscale transition-[filter] duration-300 group-hover:grayscale-0 ${row.seal ? 'rounded-full' : 'rounded-[4px]'}`}
                      />
                      {row.place}
                    </span>
                    <span className="muted font-mono text-[12px]">{row.when}</span>
                  </div>
                  <p className="muted mt-2 text-sm leading-relaxed">{row.what}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
