import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useRef } from 'react'
import WordsPullUpMultiStyle from './WordsPullUpMultiStyle'

const BODY_TEXT =
  "right now i'm at photon in san francisco, building ai infrastructure — webhook delivery, buildspace, everything ci/cd. and honestly, i just like building internal tools."

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

export default function About() {
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: bodyRef,
    offset: ['start 0.8', 'end 0.2'],
  })
  const chars = BODY_TEXT.split('')

  return (
    <section id="about" className="bg-[#140d09] px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#332014] bg-[#1d120b] px-6 py-14 sm:px-10 sm:py-16 md:px-14 md:py-20">
        <p className="mb-8 text-center text-[10px] uppercase tracking-[0.25em] text-[#e89a4e] sm:text-xs">
          the short version
        </p>
        <h2 className="mx-auto max-w-2xl text-center text-3xl leading-[1.02] text-primary sm:text-4xl md:text-5xl lg:text-6xl">
          <WordsPullUpMultiStyle
            segments={[
              { text: "i'm yan.", className: 'font-normal' },
              { text: 'i like building things.', className: 'font-serif italic' },
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

        <div className="mx-auto mt-12 max-w-2xl sm:mt-16">
          <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#e89a4e]/80">where i've been</p>
          {EXPERIENCE.map((row) => (
            <div
              key={row.place}
              className="group flex items-center gap-3 border-t border-[#332014] py-3 transition-colors duration-300 hover:bg-[#21140c] sm:gap-4"
            >
              <img
                src={row.logo}
                alt={`${row.place} logo`}
                loading="lazy"
                className={`h-9 w-9 shrink-0 object-cover transition-transform duration-300 group-hover:scale-110 ${
                  row.seal ? 'rounded-full' : 'rounded-lg border border-[#332014]'
                }`}
              />
              <div className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <span className="shrink-0 text-sm font-bold text-primary sm:w-24">{row.place}</span>
                <span className="flex-1 text-xs text-[#c9b18c] sm:text-sm">{row.what}</span>
                <span className="shrink-0 text-[11px] text-[#8a6f4d] sm:text-xs">{row.when}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
