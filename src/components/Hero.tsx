import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useRef, type MouseEvent, type ReactNode } from 'react'
import CliffScene from './CliffScene'
import WordsPullUp from './WordsPullUp'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const NAV_LINKS = [
  { label: 'about', href: '#about' },
  { label: 'work', href: '#work' },
  { label: 'github', href: 'https://github.com/yanxue06' },
  { label: 'linkedin', href: 'https://linkedin.com/in/yanxue-ce' },
  { label: 'email', href: 'mailto:yan.xue@uwaterloo.ca' },
]

const NAV_LINK_CLASS =
  'relative whitespace-nowrap text-[11px] text-primary/75 transition-colors duration-200 hover:text-primary sm:text-sm ' +
  'after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-[width] after:duration-300 hover:after:w-full'

/* The "say hello" pill leans toward the cursor. */
function Magnetic({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 220, damping: 18 })
  const y = useSpring(my, { stiffness: 220, damping: 18 })

  if (reduce) return <>{children}</>

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      className="w-fit"
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect()
        if (!r) return
        mx.set((e.clientX - r.left - r.width / 2) * 0.3)
        my.set((e.clientY - r.top - r.height / 2) * 0.4)
      }}
      onMouseLeave={() => {
        mx.set(0)
        my.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}

export default function Hero() {
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })

  // scroll parallax — background layers fall behind as the page leaves
  const skyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 95])
  const cloudY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 60])
  const farY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 50])
  const midY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 26])
  const contentY = useTransform(scrollYProgress, [0, 0.6], [0, reduce ? 0 : -70])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, reduce ? 1 : 0])
  const chevronOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])

  // mouse parallax — the scene visibly drifts against the cursor
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const sceneX = useSpring(useTransform(mouseX, [-0.5, 0.5], [22, -22]), { stiffness: 60, damping: 17 })
  const sceneY = useSpring(useTransform(mouseY, [-0.5, 0.5], [14, -14]), { stiffness: 60, damping: 17 })

  const handleMouse = (e: MouseEvent<HTMLElement>) => {
    mouseX.set(e.clientX / window.innerWidth - 0.5)
    mouseY.set(e.clientY / window.innerHeight - 0.5)
  }

  return (
    <section
      id="top"
      ref={sectionRef}
      onMouseMove={reduce ? undefined : handleMouse}
      className="relative h-screen w-full overflow-hidden"
    >
      <motion.div className="absolute -inset-7" style={{ x: sceneX, y: sceneY }}>
        <CliffScene skyY={skyY} cloudY={cloudY} farY={farY} midY={midY} />
      </motion.div>
      {/* readability dusk at the top, grain over everything */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-[#140a14]/70 via-[#140a14]/25 to-transparent" />
      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.5] mix-blend-overlay" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-b from-transparent to-[#140d09]" />

      <nav className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 sm:px-10">
        <a href="#top" className="text-sm font-bold text-primary">
          yan<span className="text-[#f6c87f]">*</span>
        </a>
        <div className="flex items-center gap-4 sm:gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
              className={NAV_LINK_CLASS}
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>

      <motion.div
        className="absolute inset-x-0 top-[16%] z-10 px-6 sm:top-[18%] sm:px-10 lg:px-16"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <WordsPullUp
          text="yan xue"
          showAsterisk
          className="whitespace-nowrap text-6xl font-bold leading-none tracking-tight text-primary sm:text-7xl lg:text-8xl xl:text-[7.5rem]"
        />
        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.9, ease: EASE }}
          className="mt-4 text-sm text-primary/90 sm:text-base lg:text-lg"
        >
          computer engineering @ uwaterloo <span className="mx-1 text-[#f6c87f]">·</span> swe intern @{' '}
          <span className="font-serif italic">photon</span> (google, vercel + sequoia backed){' '}
          <span className="mx-1 text-[#f6c87f]">·</span> prev @ bitgo
        </motion.p>
        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.9, ease: EASE }}
          className="mt-2 max-w-md text-xs text-primary/70 sm:text-sm"
        >
          i build infra and dev tools, mostly in rust and typescript.
        </motion.p>
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.9, ease: EASE }}
          className="mt-6"
        >
          <Magnetic>
            <a
              href="mailto:yan.xue@uwaterloo.ca"
              className="group inline-flex items-center gap-2 rounded-full bg-primary py-1.5 pl-5 pr-1.5 text-sm font-medium text-[#2a1410] transition-all duration-300 hover:gap-3"
            >
              say hello
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2a1410] transition-transform duration-300 group-hover:scale-110">
                <ArrowRight className="h-4 w-4 text-primary" />
              </span>
            </a>
          </Magnetic>
        </motion.div>
      </motion.div>

      <motion.a
        href="#about"
        style={{ opacity: chevronOpacity }}
        className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 text-primary/70 transition-colors hover:text-primary"
        aria-label="scroll to about"
      >
        <ChevronDown className="animate-bob h-6 w-6" />
      </motion.a>
    </section>
  )
}
