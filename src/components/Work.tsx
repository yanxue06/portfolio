import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion'
import { useRef, useState, type ReactNode } from 'react'
import { Kicker } from './About'
import { Asterisk } from './Hero'
import {
  BuildSpaceBanner,
  FlappyBanner,
  FluxBanner,
  GitSemanticBanner,
  MarillacPlaceBanner,
  ObsidianBanner,
} from './banners'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

interface Project {
  title: string
  banner: ReactNode
  description: ReactNode
  stack: string
  href: string
}

function Hi({ children }: { children: ReactNode }) {
  return <strong className="ink font-extrabold">{children}</strong>
}

/* Row divider that fills out as it rides up the viewport — scrubbed, so
   scrolling back un-draws it. */
function ScrubRule() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'start 0.55'] })
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

const PROJECTS: Project[] = [
  {
    title: 'buildspace',
    banner: <BuildSpaceBanner />,
    description: (
      <>
        open-source ci/cd framework of composable github actions blocks — cross-platform builds and
        multi-registry publishing for <Hi>200+ services</Hi> in rust, go, typescript, and swift.
      </>
    ),
    stack: 'github actions · rust · ci/cd',
    href: 'https://github.com/photon-hq/buildspace',
  },
  {
    title: 'git-semantic',
    banner: <GitSemanticBanner />,
    description: (
      <>
        natural-language search over git history. bge embeddings in rust, <Hi>&lt;100ms</Hi> across 10K+
        commits, <Hi>960+ users</Hi>, fully offline at 3KB per commit.
      </>
    ),
    stack: 'rust · bge embeddings · vector search',
    href: 'https://github.com/yanxue06/git-semantic-search',
  },
  {
    title: 'obsidian-mcp',
    banner: <ObsidianBanner />,
    description: (
      <>
        your obsidian vault as a knowledge graph any ai can query. <Hi>25 graph-aware tools</Hi> — backlinks,
        traversal, dataview — <Hi>300+ downloads</Hi> on npm.
      </>
    ),
    stack: 'typescript · mcp · npm',
    href: 'https://github.com/yanxue06/obsidian-mcp',
  },
  {
    title: 'flux',
    banner: <FluxBanner />,
    description: (
      <>
        websocket bridge tunneling local llm runtimes into imessage — <Hi>6,000+ users</Hi>,{' '}
        <Hi>#1 product of the day</Hi> on product hunt.
      </>
    ),
    stack: 'typescript · websockets',
    href: 'https://github.com/photon-hq/flux',
  },
  {
    title: 'marillac place',
    banner: <MarillacPlaceBanner />,
    description: (
      <>
        full-stack platform for marillac place — a <Hi>shelter for homeless mothers</Hi> serving 28 residents.
        graphql api with automated task + record tracking.
      </>
    ),
    stack: 'react · graphql · postgresql',
    href: 'https://github.com/uwblueprint/marillac-place',
  },
  {
    title: 'flappy code',
    banner: <FlappyBanner />,
    description: (
      <>
        flappy bird overlay for macos — flap through pipes <Hi>while the llm thinks</Hi>. one file, zero
        dependencies.
      </>
    ),
    stack: 'python · macos',
    href: 'https://github.com/yanxue06/flappycode',
  },
]

export default function Work() {
  const reduce = useReducedMotion()
  const [canHover] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  )
  const [hovered, setHovered] = useState<number | null>(null)

  /* the banner preview trails the cursor, tilting with its horizontal speed */
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 180, damping: 22, mass: 0.5 })
  const y = useSpring(my, { stiffness: 180, damping: 22, mass: 0.5 })
  const tilt = useSpring(useTransform(useVelocity(x), [-2500, 2500], [8, -8]), {
    stiffness: 300,
    damping: 40,
  })

  const preview = canHover && !reduce

  /* the spinny thing follows into the work section */
  const { scrollYProgress: pageProgress } = useScroll()
  const spin = useTransform(pageProgress, [0, 1], [0, reduce ? 0 : 220])

  return (
    <section id="work" className="relative overflow-hidden px-6 pb-24 pt-32 sm:px-10">
      <motion.div
        className="ink pointer-events-none absolute -right-[5vw] top-[36%] hidden opacity-[0.08] lg:block"
        style={{ rotate: spin }}
        aria-hidden
      >
        <Asterisk className="h-[18vw] w-[18vw]" />
      </motion.div>
      <div className="relative mx-auto max-w-[1200px]">
        <Kicker>selected work</Kicker>
        <div
          className="hairline mt-8 border-t"
          onMouseMove={
            preview
              ? (e) => {
                  mx.set(Math.min(e.clientX + 28, window.innerWidth - 372))
                  my.set(e.clientY - 96)
                }
              : undefined
          }
          onMouseLeave={preview ? () => setHovered(null) : undefined}
        >
          {PROJECTS.map((project, i) => (
            <motion.a
              key={project.title}
              href={project.href}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.65, ease: EASE }}
              onMouseEnter={preview ? () => setHovered(i) : undefined}
              className="group relative block py-8 md:py-10"
            >
              <ScrubRule />
              <span
                className="text-outline pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 select-none text-[clamp(64px,9vw,150px)] font-extrabold leading-none lg:block"
                aria-hidden
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              <span className="hairline mb-5 block aspect-video overflow-hidden border md:hidden">
                {project.banner}
              </span>

              <div className="flex items-baseline gap-4 transition-transform duration-300 group-hover:translate-x-2">
                <h3 className="ink text-[clamp(34px,4.8vw,68px)] font-extrabold leading-[0.95] tracking-[-0.03em]">
                  {project.title}
                </h3>
                <span
                  className="muted text-[20px] transition-all duration-200 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-gold"
                  aria-hidden
                >
                  ↗
                </span>
              </div>
              <p className="muted mt-3 max-w-[560px] text-[13.5px] leading-[1.65]">{project.description}</p>
              <p className="muted mt-2 font-mono text-[11px] opacity-75">{project.stack}</p>
            </motion.a>
          ))}
        </div>

        <p className="muted mt-8 font-mono text-[12px]">
          more on{' '}
          <a
            href="https://github.com/yanxue06"
            target="_blank"
            rel="noreferrer"
            className="ink underline decoration-1 underline-offset-4 transition-colors hover:text-gold"
          >
            github
          </a>{' '}
          — git-subtree-audit, helios, pr-search, and whatever this month's rabbit hole is.
        </p>
      </div>

      {preview && (
        <motion.div
          className="pointer-events-none fixed left-0 top-0 z-40"
          style={{ x, y, rotate: tilt }}
          aria-hidden
        >
          <AnimatePresence>
            {hovered !== null && (
              <motion.div
                key={hovered}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="hairline h-[192px] w-[344px] overflow-hidden border bg-navy shadow-2xl"
              >
                {PROJECTS[hovered].banner}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  )
}
