import { motion, useInView, useReducedMotion, useSpring } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useRef, type MouseEvent, type ReactNode } from 'react'
import WordsPullUpMultiStyle from './WordsPullUpMultiStyle'
import { ShootingStars, Stars } from './ambient'
import {
  BuildSpaceBanner,
  FlappyBanner,
  FluxBanner,
  GitSemanticBanner,
  IMessageKitBanner,
  ObsidianBanner,
} from './banners'

const CARD_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

interface Project {
  title: string
  banner: ReactNode
  accent: string
  description: ReactNode
  chips: string[]
  href: string
}

function Hi({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className="font-bold" style={{ color }}>
      {children}
    </span>
  )
}

/* the three that carry the section — wide + tall slots */
const MAIN_PROJECTS: Project[] = [
  {
    title: 'buildspace',
    banner: <BuildSpaceBanner />,
    accent: '#b9a6e8',
    description: (
      <>
        open-source ci/cd framework of composable github actions blocks — cross-platform builds and
        multi-registry publishing for <Hi color="#b9a6e8">200+ services</Hi> in rust, go, typescript, and
        swift.
      </>
    ),
    chips: ['GitHub Actions', 'Rust', 'CI/CD'],
    href: 'https://github.com/photon-hq/buildspace',
  },
  {
    title: 'git-semantic',
    banner: <GitSemanticBanner />,
    accent: '#8fd18f',
    description: (
      <>
        natural-language search over git history. bge embeddings in rust, <Hi color="#8fd18f">&lt;100ms</Hi>{' '}
        across 10K+ commits, <Hi color="#8fd18f">960+ users</Hi>, fully offline at 3KB per commit.
      </>
    ),
    chips: ['Rust', 'BGE embeddings', 'Vector search'],
    href: 'https://github.com/yanxue06/git-semantic-search',
  },
  {
    title: 'obsidian-mcp',
    banner: <ObsidianBanner />,
    accent: '#b39ddb',
    description: (
      <>
        your obsidian vault as a knowledge graph any ai can query. <Hi color="#b39ddb">25 graph-aware tools</Hi>{' '}
        — backlinks, traversal, dataview — <Hi color="#b39ddb">300+ downloads</Hi> on npm.
      </>
    ),
    chips: ['TypeScript', 'MCP', 'npm'],
    href: 'https://github.com/yanxue06/obsidian-mcp',
  },
]

const MINI_PROJECTS: Project[] = [
  {
    title: 'flux',
    banner: <FluxBanner />,
    accent: '#93a7f5',
    description: (
      <>
        websocket bridge tunneling local llm runtimes into imessage — <Hi color="#93a7f5">6,000+ users</Hi>,{' '}
        <Hi color="#93a7f5">#1 product of the day</Hi> on product hunt.
      </>
    ),
    chips: ['TypeScript', 'WebSockets'],
    href: 'https://github.com/photon-hq/flux',
  },
  {
    title: 'imessage-kit',
    banner: <IMessageKitBanner />,
    accent: '#6fa8ff',
    description: (
      <>
        co-built type-safe typescript sdk for native imessage. <Hi color="#6fa8ff">1.3K+ stars</Hi> on github.
      </>
    ),
    chips: ['TypeScript', 'Zod'],
    href: 'https://github.com/photon-hq/imessage-kit',
  },
  {
    title: 'flappy code',
    banner: <FlappyBanner />,
    accent: '#f7d154',
    description: (
      <>
        flappy bird overlay for macos — flap through pipes <Hi color="#f7d154">while the llm thinks</Hi>. one
        file, zero dependencies.
      </>
    ),
    chips: ['Python', 'macOS'],
    href: 'https://github.com/yanxue06/flappycode',
  },
]

function CardLink({ project, small }: { project: Project; small?: boolean }) {
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex w-fit items-center gap-1.5 ${small ? 'text-xs' : 'text-sm'}`}
      style={{ color: project.accent }}
    >
      view code
      <ArrowRight className={`${small ? 'h-3.5 w-3.5' : 'h-4 w-4'} -rotate-45 transition-transform duration-300 group-hover:rotate-0`} />
    </a>
  )
}

function Chips({ project, small }: { project: Project; small?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {project.chips.map((chip) => (
        <span
          key={chip}
          className={`rounded-full border bg-[#140d09]/70 text-[#d9c6a3] ${
            small ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-[11px]'
          }`}
          style={{ borderColor: `${project.accent}2e` }}
        >
          {chip}
        </span>
      ))}
    </div>
  )
}

const CARD_SHELL =
  'group flex h-full flex-col overflow-hidden rounded-2xl border border-[#2c2138] bg-[#1d120b] transition-[border-color,box-shadow] duration-300 hover:border-[#4a3a62] hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)]'

/* Cards tilt a few degrees toward the cursor, springing flat on leave. */
function Tilt({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const rx = useSpring(0, { stiffness: 180, damping: 22 })
  const ry = useSpring(0, { stiffness: 180, damping: 22 })

  if (reduce) return <div className={className}>{children}</div>

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      onMouseMove={(e: MouseEvent<HTMLDivElement>) => {
        const r = ref.current?.getBoundingClientRect()
        if (!r) return
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * 6)
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 6)
      }}
      onMouseLeave={() => {
        rx.set(0)
        ry.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}

function WideCard({ project }: { project: Project }) {
  return (
    <Tilt className={`${CARD_SHELL} sm:flex-row`}>
      <div className="relative h-56 shrink-0 overflow-hidden sm:h-auto sm:w-[55%]">
        <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]">
          {project.banner}
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-4 p-6 sm:p-8">
        <h3 className="text-xl font-bold text-primary sm:text-2xl">{project.title}</h3>
        <p className="text-sm leading-relaxed text-[#c9b18c]">{project.description}</p>
        <Chips project={project} />
        <CardLink project={project} />
      </div>
    </Tilt>
  )
}

function TallCard({ project }: { project: Project }) {
  return (
    <Tilt className={CARD_SHELL}>
      <div className="h-52 shrink-0 overflow-hidden sm:h-60">
        <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.045]">
          {project.banner}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-xl font-bold text-primary">{project.title}</h3>
        <p className="mt-2 text-xs leading-relaxed text-[#c9b18c] sm:text-sm">{project.description}</p>
        <div className="mt-4">
          <Chips project={project} />
        </div>
        <div className="mt-5 lg:mt-auto lg:pt-5">
          <CardLink project={project} />
        </div>
      </div>
    </Tilt>
  )
}

function CompactCard({ project }: { project: Project }) {
  return (
    <Tilt className={CARD_SHELL}>
      <div className="h-32 shrink-0 overflow-hidden sm:h-36">
        <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.05]">
          {project.banner}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-bold text-primary">{project.title}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-[#c9b18c]">{project.description}</p>
        <div className="mt-3">
          <Chips project={project} small />
        </div>
        <div className="mt-4 lg:mt-auto lg:pt-4">
          <CardLink project={project} small />
        </div>
      </div>
    </Tilt>
  )
}

export default function Work() {
  const gridRef = useRef<HTMLDivElement>(null)
  const gridInView = useInView(gridRef, { once: true, margin: '-100px' })

  const enter = (i: number) => ({
    initial: { opacity: 0, scale: 0.96 },
    animate: gridInView ? { opacity: 1, scale: 1 } : {},
    whileHover: { y: -6, transition: { type: 'spring' as const, stiffness: 320, damping: 22, delay: 0 } },
    transition: { delay: i * 0.12, duration: 0.8, ease: CARD_EASE },
  })

  return (
    <section
      id="work"
      className="relative overflow-hidden px-4 pb-24 pt-14 md:px-6 md:pb-32"
      style={{ background: 'linear-gradient(180deg, #140d09 0%, #171126 45%, #0d0a18 100%)' }}
    >
      {/* a pool of dusk light behind the grid — no objects, just glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-32 h-[520px] w-[900px] -translate-x-1/2"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(124,98,184,0.13), transparent 65%)',
          filter: 'blur(40px)',
        }}
      />
      {/* night fully arrived — stars out, the odd one falling, moon up */}
      <Stars count={120} />
      <ShootingStars />
      <div
        className="pointer-events-none absolute right-[7%] top-20 hidden sm:block"
        style={{ animation: 'glow 11s ease-in-out infinite' }}
      >
        <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden>
          <defs>
            <radialGradient id="moonglow">
              <stop offset="0%" stopColor="#f2e3c2" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#f2e3c2" stopOpacity="0" />
            </radialGradient>
            <mask id="crescent">
              <rect width="64" height="64" fill="white" />
              <circle cx="38" cy="27" r="11" fill="black" />
            </mask>
          </defs>
          <circle cx="32" cy="32" r="30" fill="url(#moonglow)" />
          <circle cx="32" cy="32" r="12" fill="#e8dcc0" mask="url(#crescent)" opacity="0.9" />
        </svg>
      </div>
      <div className="relative mx-auto max-w-5xl" ref={gridRef}>
        <div className="mb-10 text-center sm:mb-14">
          <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-[#9a86b8] sm:text-xs">selected work</p>
          <WordsPullUpMultiStyle
            className="mx-auto max-w-2xl text-2xl sm:text-3xl md:text-4xl"
            segments={[
              { text: 'things', className: 'font-normal text-primary' },
              { text: "i've built.", className: 'font-serif italic text-primary' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <motion.div className="sm:col-span-2" {...enter(0)}>
            <WideCard project={MAIN_PROJECTS[0]} />
          </motion.div>
          {MAIN_PROJECTS.slice(1).map((project, i) => (
            <motion.div key={project.title} {...enter(i + 1)}>
              <TallCard project={project} />
            </motion.div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3">
          {MINI_PROJECTS.map((project, i) => (
            <motion.div
              key={project.title}
              className={i === 2 ? 'sm:col-span-2 md:col-span-1' : ''}
              {...enter(i + 3)}
            >
              <CompactCard project={project} />
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-[#8a7a9c]">
          more on{' '}
          <a
            href="https://github.com/yanxue06"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-[#8a7a9c]/40 underline-offset-2 transition-colors hover:text-primary"
          >
            github
          </a>{' '}
          — git-subtree-audit, helios, pr-search, and whatever this month's rabbit hole is.
        </p>
      </div>
    </section>
  )
}
