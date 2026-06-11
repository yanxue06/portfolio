import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { useRef } from 'react'
import WordsPullUpMultiStyle from './WordsPullUpMultiStyle'
import { Embers, GlowBlobs, Stars } from './ambient'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const BODY_TEXT =
  "right now i'm at photon in san francisco, building ai infrastructure — webhook delivery, buildspace, everything ci/cd. in my free time i love building internal tools. i also love frisbee, guitar, and chess."

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

interface AnimatedLetterProps {
  char: string
  index: number
  total: number
  progress: MotionValue<number>
}

function AnimatedLetter({ char, index, total, progress }: AnimatedLetterProps) {
  const charProgress = index / total
  const opacity = useTransform(progress, [charProgress - 0.1, charProgress + 0.05], [0.2, 1])
  return <motion.span style={{ opacity }}>{char}</motion.span>
}

/* The experience list as a timeline: a dim rail, a quiet line that draws in
   with scroll, and rows that slide in one by one. */
function Timeline() {
  const listRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 0.82', 'end 0.45'] })
  const lineScale = useSpring(scrollYProgress, { stiffness: 90, damping: 24 })

  return (
    <div className="mx-auto mt-14 max-w-2xl sm:mt-20">
      <p className="mb-5 text-[10px] uppercase tracking-[0.25em] text-[#e89a4e]/80">where i've been</p>
      <div ref={listRef} className="relative">
        {/* rail + draw-in line */}
        <div className="absolute bottom-3 left-[17px] top-3 w-px bg-[#2a1a0e]" />
        <motion.div
          className="absolute bottom-3 left-[17px] top-3 w-px origin-top bg-[#e89a4e]/55"
          style={{ scaleY: lineScale }}
        />

        {EXPERIENCE.map((row, i) => (
          <motion.div
            key={row.place}
            initial={{ opacity: 0, x: -26 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.09, duration: 0.7, ease: EASE }}
            className="group relative flex items-center gap-3 rounded-xl py-4 pl-11 pr-3 transition-colors duration-300 hover:bg-[#21140c]/80 sm:gap-4"
          >
            {/* node on the rail */}
            <span
              className="absolute left-[17px] top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6b4527] transition-colors duration-300 group-hover:bg-[#e89a4e]"
            />
            <img
              src={row.logo}
              alt={`${row.place} logo`}
              loading="lazy"
              className={`h-9 w-9 shrink-0 object-cover transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${
                row.seal ? 'rounded-full' : 'rounded-lg border border-[#332014]'
              }`}
            />
            <div className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <span className="shrink-0 text-sm font-bold text-primary sm:w-24">{row.place}</span>
              <span className="flex-1 text-xs text-[#c9b18c] sm:text-sm">{row.what}</span>
              <span className="shrink-0 text-[11px] text-[#8a6f4d] sm:text-xs">{row.when}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function About() {
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: bodyRef,
    offset: ['start 0.8', 'end 0.2'],
  })
  const chars = BODY_TEXT.split('')

  return (
    <section
      id="about"
      className="relative overflow-hidden px-4 py-20 md:px-6 md:py-28"
      style={{ background: 'linear-gradient(180deg, #140d09 0%, #1c1117 55%, #140d09 100%)' }}
    >
      {/* dusk settling in — last warmth low, first cold purple high, embers, early stars */}
      <GlowBlobs
        blobs={[
          { x: '-6%', y: '18%', size: 460, color: 'rgba(232,154,78,0.1)', dur: 21 },
          { x: '62%', y: '50%', size: 540, color: 'rgba(184,92,51,0.09)', dur: 26, delay: 4 },
          { x: '30%', y: '-12%', size: 480, color: 'rgba(124,98,184,0.09)', dur: 23, delay: 9 },
        ]}
      />
      <Stars count={46} topBias />
      <Embers count={13} />

      <div className="relative z-10 mx-auto max-w-5xl">
        <p className="mb-8 text-center text-[10px] uppercase tracking-[0.25em] text-[#e89a4e] sm:text-xs">
          about me
        </p>
        <h2 className="mx-auto max-w-2xl text-center text-3xl leading-[1.02] text-primary sm:text-4xl md:text-5xl lg:text-6xl">
          <WordsPullUpMultiStyle
            segments={[
              { text: "i'm yan.", className: 'font-normal' },
              { text: 'i like building', className: 'font-normal' },
              { text: 'tools that help people.', className: 'font-serif italic' },
            ]}
          />
        </h2>
        <p
          ref={bodyRef}
          className="mx-auto mt-8 max-w-xl text-center text-xs leading-relaxed text-[#e8d6b0] sm:mt-10 sm:text-sm md:text-base"
        >
          {chars.map((char, i) => (
            <AnimatedLetter key={i} char={char} index={i} total={chars.length} progress={scrollYProgress} />
          ))}
        </p>

        <Timeline />
      </div>
    </section>
  )
}
