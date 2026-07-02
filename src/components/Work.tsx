import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Kicker } from './About'
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
  return <strong className="font-extrabold text-[#f6c87f]">{children}</strong>
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

/* Setting-sun doodle for the work section's margin. */
function SunDoodle() {
  return (
    <svg
      className="absolute -right-[120px] top-6 hidden text-[#e89a4e] opacity-[.34] min-[1180px]:block"
      width="46"
      height="46"
      viewBox="0 0 46 46"
      aria-hidden
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M8 30 A 15 15 0 0 1 38 30" />
        <line x1="2" y1="30" x2="44" y2="30" />
        <line x1="23" y1="8" x2="23" y2="3" />
        <line x1="11" y1="13" x2="8" y2="9" />
        <line x1="35" y1="13" x2="38" y2="9" />
      </g>
    </svg>
  )
}

export default function Work() {
  return (
    <section id="work" className="bg-[#1d1209] px-6 pb-14 pt-20 sm:px-8">
      <div className="relative mx-auto max-w-[880px]">
        <SunDoodle />

        <Kicker>selected work</Kicker>
        <div className="mt-6 border-t-2 border-[#e89a4e]/[.55]">
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
              className="group grid grid-cols-1 items-start gap-x-[26px] border-b border-[#e89a4e]/[.14] px-2 py-[26px] transition-colors duration-200 hover:bg-[#251609] sm:grid-cols-[40px_240px_1fr]"
            >
              <span className="hidden pt-1 font-mono text-[13px] font-bold text-[#e89a4e] sm:block">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="mb-4 block aspect-video overflow-hidden rounded-[10px] border border-[#e89a4e]/[.22] bg-[#0d0805] transition-colors duration-200 group-hover:border-[#e89a4e]/50 sm:mb-0 sm:aspect-auto sm:h-[150px]">
                {project.banner}
              </span>
              <span className="min-w-0">
                <span className="flex items-baseline justify-between gap-4">
                  <span className="text-[clamp(20px,2.4vw,26px)] font-extrabold leading-[1.1] tracking-tight text-primary">
                    {project.title}
                  </span>
                  <span
                    className="text-[17px] text-[#e89a4e] transition-transform duration-200 group-hover:translate-x-[3px] group-hover:-translate-y-[3px]"
                    aria-hidden
                  >
                    ↗
                  </span>
                </span>
                <p className="mt-2 text-[13.5px] leading-[1.65] text-[#c9b18c]">{project.description}</p>
                <p className="mt-[11px] font-mono text-[11px] text-[#8a6f4d]">{project.stack}</p>
              </span>
            </motion.a>
          ))}
        </div>

        <p className="mt-6 text-[13.5px] text-[#8a6f4d]">
          more on{' '}
          <a
            href="https://github.com/yanxue06"
            target="_blank"
            rel="noreferrer"
            className="border-b border-[#e89a4e]/45 text-[#e89a4e] transition-colors hover:text-[#f6c87f]"
          >
            github
          </a>{' '}
          — git-subtree-audit, helios, pr-search, and whatever this month's rabbit hole is.
        </p>
      </div>
    </section>
  )
}
