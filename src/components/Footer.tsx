import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Asterisk, Magnetic } from './Hero'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const LINKS = [
  { label: 'github', href: 'https://github.com/yanxue06' },
  { label: 'linkedin', href: 'https://linkedin.com/in/yanxue-ce' },
  { label: 'email', href: 'mailto:yan.xue@uwaterloo.ca' },
]

export default function Footer() {
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const rotate = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 240])

  return (
    <footer id="footer" className="relative flex min-h-[72vh] flex-col justify-center overflow-hidden px-6 py-24 sm:px-10">
      <motion.div
        className="ink pointer-events-none absolute -bottom-[16vw] -right-[14vw] opacity-[0.12]"
        style={{ rotate }}
        aria-hidden
      >
        <Asterisk className="h-[42vw] w-[42vw]" />
      </motion.div>

      <div className="mx-auto w-full max-w-[1200px]">
        <span className="block overflow-hidden">
          <motion.span
            className="block"
            initial={{ y: '108%' }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1, ease: EASE }}
          >
            <Magnetic>
              <a
                href="mailto:yan.xue@uwaterloo.ca"
                className="ink group relative inline-block text-[clamp(56px,11vw,180px)] font-extrabold leading-[0.95] tracking-[-0.04em]"
              >
                say hello.
                <span
                  className="absolute -bottom-2 left-0 h-[5px] w-full origin-left scale-x-0 bg-gold transition-transform duration-500 ease-out group-hover:scale-x-100"
                  aria-hidden
                />
              </a>
            </Magnetic>
          </motion.span>
        </span>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ delay: 0.15, duration: 0.7, ease: EASE }}
          className="hairline mt-16 flex flex-wrap items-center justify-between gap-6 border-t pt-6"
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
