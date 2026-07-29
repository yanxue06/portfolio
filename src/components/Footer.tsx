import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useRef } from 'react'
import { Magnetic } from './Hero'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const LINKS = [
  { label: 'github', href: 'https://github.com/yanxue06' },
  { label: 'linkedin', href: 'https://linkedin.com/in/yanxue-ce' },
  { label: 'email', href: 'mailto:yan.xue@uwaterloo.ca' },
]

const SINE_D = (() => {
  let d = 'M 0 20'
  for (let x = 20; x <= 1200; x += 20) d += ` L ${x} ${(20 + Math.sin(x / 90) * 12).toFixed(1)}`
  return d
})()

/* the campsite from the old sunset site — pines, tent, ember — as the
   page's closing scene. the smoke curl is drawn by the footer's scroll. */
function Campsite({ reduce, smoke }: { reduce: boolean; smoke: MotionValue<number> }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden>
      {/* a short wisp above the fire — full-height it crossed the whole
          footer and read as a stray line */}
      <svg
        className="absolute bottom-[128px] left-[42%] hidden h-[150px] w-[80px] sm:block"
        viewBox="0 0 220 460"
        preserveAspectRatio="xMidYMax meet"
        fill="none"
      >
        <motion.path
          d="M150 456 C 158 420 132 392 142 352 C 152 316 118 296 128 252 C 138 214 102 190 112 148 C 120 112 88 92 96 52 C 100 30 92 16 82 4"
          stroke="rgba(242, 236, 222, 0.18)"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={reduce ? undefined : { pathLength: smoke }}
        />
      </svg>
      <svg className="block h-[150px] w-full sm:h-[180px]" viewBox="0 0 1440 180" preserveAspectRatio="xMidYMax slice">
        <defs>
          <radialGradient id="ember">
            <stop offset="0%" stopColor="#D8B36A" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#D8B36A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M0 118 Q 220 92 470 108 T 900 96 T 1440 110 L1440 180 L0 180 Z" fill="#0A1729" />
        <path d="M0 150 Q 320 132 640 144 T 1440 140 L1440 180 L0 180 Z" fill="#060F1D" />
        <g fill="#060F1D">
          <path d="M150 148 l22 -64 l22 64 z" />
          <path d="M196 150 l16 -44 l16 44 z" />
          <path d="M118 150 l13 -34 l13 34 z" />
          <path d="M1180 146 l24 -70 l24 70 z" />
          <path d="M1232 148 l17 -48 l17 48 z" />
          <path d="M1286 150 l13 -36 l13 36 z" />
        </g>
        <g>
          <path d="M560 152 L588 114 L616 152 Z" fill="#0D1B30" />
          <path d="M588 114 L616 152 L602 152 Q 595 130 588 114" fill="#13233D" />
          <path d="M588 118 L588 152" stroke="#081120" strokeWidth="2" />
          <circle cx="652" cy="150" r="20" fill="url(#ember)" style={{ animation: 'glow 4s ease-in-out infinite' }} />
          <circle cx="652" cy="150" r="3.2" fill="#D8B36A" />
        </g>
      </svg>
      <span className="firefly firefly-a" style={{ left: '45%', bottom: '42px' }} />
      <span className="firefly firefly-b" style={{ left: '46.5%', bottom: '64px', animationDelay: '1.8s' }} />
      <span className="firefly firefly-c" style={{ left: '44%', bottom: '82px', animationDelay: '3.1s' }} />
    </div>
  )
}

export default function Footer() {
  const reduce = useReducedMotion()
  const footRef = useRef<HTMLElement>(null)

  /* the gold line under "say hello." draws itself as the footer scrolls in */
  const { scrollYProgress: footProgress } = useScroll({
    target: footRef,
    offset: ['start 0.85', 'start 0.15'],
  })
  const underline = useTransform(footProgress, [0.15, 1], [0, 1])
  const wave = useTransform(footProgress, [0.45, 1], [0, 1])
  const smoke = useTransform(footProgress, [0.2, 1], [0.15, 1])

  return (
    <footer
      id="footer"
      ref={footRef}
      className="relative flex min-h-[78vh] flex-col justify-center overflow-hidden px-6 pb-[210px] pt-24 sm:px-10"
    >
      <Campsite reduce={!!reduce} smoke={smoke} />

      <div className="relative z-10 mx-auto w-full max-w-[1200px]">
        {/* observe the un-clipped wrapper — a child translated below an
            overflow-hidden parent never intersects, so whileInView on it
            would deadlock */}
        <motion.span
          className="block"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.span
            className="block"
            variants={{ hidden: { opacity: 0, y: 48 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 1, ease: EASE }}
          >
            <Magnetic>
              <a
                href="mailto:yan.xue@uwaterloo.ca"
                className="ink group relative inline-block text-[clamp(56px,11vw,180px)] font-extrabold leading-[0.95] tracking-[-0.04em]"
              >
                say hello.
                <motion.span
                  style={{ scaleX: reduce ? 1 : underline }}
                  className="absolute -bottom-2 left-0 h-[5px] w-full origin-left bg-gold"
                  aria-hidden
                />
              </a>
            </Magnetic>
          </motion.span>
        </motion.span>

        {/* a gold sine draws in under the sign-off */}
        <div className="pointer-events-none mt-14 overflow-hidden" aria-hidden>
          <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="h-7 w-full">
            {reduce ? (
              <path d={SINE_D} fill="none" stroke="#c4a35c" strokeOpacity="0.5" strokeWidth="1.5" />
            ) : (
              <motion.path
                d={SINE_D}
                fill="none"
                stroke="#c4a35c"
                strokeOpacity="0.5"
                strokeWidth="1.5"
                style={{ pathLength: wave }}
              />
            )}
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ delay: 0.15, duration: 0.7, ease: EASE }}
          className="hairline mt-6 flex flex-wrap items-center justify-between gap-6 border-t pt-6"
        >
          <div className="flex gap-6">
            {LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="muted relative font-mono text-[13px] transition-colors hover:text-gold before:absolute before:-inset-2 before:content-['']"
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="muted font-mono text-[11.5px]">
            © {new Date().getFullYear()} yan xue
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
