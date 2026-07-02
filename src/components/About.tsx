import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

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

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-[13px] font-bold text-[#e89a4e]">
      <span className="inline-block h-0.5 w-[34px] bg-[#e89a4e]/60" aria-hidden />
      {children}
    </p>
  )
}

/* Ink doodles in the right margin, one per section — the scene's own
   vocabulary (pine, birds, setting sun) drawn small. Hidden when the
   margin gets tight. */
export function PineDoodle() {
  return (
    <svg
      className="absolute -right-[120px] top-16 hidden text-[#e89a4e] opacity-[.34] min-[1180px]:block"
      width="34"
      height="52"
      viewBox="0 0 34 52"
      aria-hidden
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M17 4 L7 20 L13 19 L5 34 L12 33 L4 47 L30 47 L22 33 L29 34 L21 19 L27 20 Z" strokeLinejoin="round" />
        <path d="M17 47 L17 51" />
      </g>
    </svg>
  )
}

export function BirdDoodle() {
  return (
    <svg
      className="absolute -right-[128px] top-2 hidden text-[#e89a4e] opacity-[.34] min-[1180px]:block"
      width="40"
      height="24"
      viewBox="0 0 40 24"
      aria-hidden
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M4 14 Q 12 4 20 13 Q 28 4 36 14" />
        <path d="M12 20 Q 17 14 22 19" opacity=".7" />
      </g>
    </svg>
  )
}

export default function About() {
  return (
    <section id="about" className="bg-[#1d1209] px-6 pt-24 sm:px-8">
      <div className="relative mx-auto max-w-[880px]">
        <PineDoodle />

        <Kicker>about me</Kicker>
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mt-4 max-w-[640px] text-[clamp(34px,4.4vw,52px)] font-normal leading-[1.14] tracking-tight text-primary"
        >
          i'm yan. i like building{' '}
          <span className="relative whitespace-nowrap font-serif italic">
            tools that help people.
            <svg
              className="absolute -bottom-1.5 left-[2%] h-2.5 w-[96%]"
              viewBox="0 0 300 10"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path
                d="M2 6 Q 45 2 90 6 T 180 5 T 298 6"
                fill="none"
                stroke="#e89a4e"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity=".7"
              />
            </svg>
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.12, duration: 0.8, ease: EASE }}
          className="mt-5 max-w-[560px] text-[15.5px] leading-[1.8] text-[#c9b18c]"
        >
          {BODY_TEXT}
        </motion.p>

        <div className="relative mt-20">
          <BirdDoodle />
          <Kicker>where i've been</Kicker>
          <div className="mt-6 border-t-2 border-[#e89a4e]/[.55]">
            {EXPERIENCE.map((row, i) => (
              <motion.div
                key={row.place}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.07, duration: 0.6, ease: EASE }}
                className="grid grid-cols-[40px_1fr] items-center gap-x-4 border-b border-[#e89a4e]/[.14] px-2 py-[17px] transition-colors duration-200 hover:bg-[#251609] sm:grid-cols-[150px_40px_130px_1fr] sm:gap-x-[18px]"
              >
                <span className="col-span-full font-mono text-xs text-[#e89a4e] sm:col-span-1">{row.when}</span>
                <img
                  src={row.logo}
                  alt={`${row.place} logo`}
                  loading="lazy"
                  className={`h-7 w-7 border border-[#e89a4e]/25 object-cover ${row.seal ? 'rounded-full' : 'rounded-[7px]'}`}
                />
                <span className="text-[15px] font-extrabold text-primary">{row.place}</span>
                <span className="col-span-full mt-1 text-sm leading-relaxed text-[#c9b18c] sm:col-span-1 sm:mt-0">
                  {row.what}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
