import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Asterisk, Magnetic } from './Hero'

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

export default function Footer() {
  const reduce = useReducedMotion()
  const footRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll()
  const rotate = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 240])

  /* the gold line under "say hello." draws itself as the footer scrolls in */
  const { scrollYProgress: footProgress } = useScroll({
    target: footRef,
    offset: ['start 0.85', 'start 0.15'],
  })
  const underline = useTransform(footProgress, [0.15, 1], [0, 1])
  const wave = useTransform(footProgress, [0.45, 1], [0, 1])

  return (
    <footer
      id="footer"
      ref={footRef}
      className="relative flex min-h-[72vh] flex-col justify-center overflow-hidden px-6 py-24 sm:px-10"
    >
      <motion.div
        className="ink pointer-events-none absolute -bottom-[16vw] -right-[14vw] opacity-[0.12]"
        style={{ rotate }}
        aria-hidden
      >
        <Asterisk className="h-[42vw] w-[42vw]" />
      </motion.div>

      <div className="mx-auto w-full max-w-[1200px]">
        {/* observe the un-clipped wrapper — a child translated below an
            overflow-hidden parent never intersects, so whileInView on it
            would deadlock */}
        <motion.span
          className="block overflow-hidden"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.span
            className="block"
            variants={{ hidden: { y: '108%' }, show: { y: 0 } }}
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
                className="muted font-mono text-[13px] transition-colors hover:text-gold"
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="muted font-mono text-[11.5px]">
            © {new Date().getFullYear()} yan xue<span className="text-gold">*</span>
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
