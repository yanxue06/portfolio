import { m, useReducedMotion, useScroll } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
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
      <m.span
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
  return (
    <section id="work" className="relative overflow-hidden px-6 pb-24 pt-32 sm:px-10">
      <div className="relative mx-auto max-w-[1200px]">
        <Kicker>selected work</Kicker>
        <div className="hairline mt-8 border-t">
          {PROJECTS.map((project) => (
            <m.a
              key={project.title}
              href={project.href}
              target="_blank"
              rel="noreferrer"
              initial={reduce ? false : 'hidden'}
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              className="group relative block py-8 md:py-10"
            >
              <ScrubRule />

              <div className="md:grid md:grid-cols-[300px_1fr] md:items-start md:gap-8">
                {/* banner wipes open left to right */}
                <span className="hairline mb-5 block aspect-video overflow-hidden border md:mb-0">
                  <m.span
                    variants={{
                      hidden: { clipPath: 'inset(0 100% 0 0)' },
                      show: { clipPath: 'inset(0 0% 0 0)' },
                    }}
                    transition={{ duration: 0.9, ease: EASE }}
                    className="block h-full w-full"
                  >
                    {project.banner}
                  </m.span>
                </span>

                <span className="block">
                  {/* title rises out of its own clip line */}
                  <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
                    <m.span
                      variants={{ hidden: { y: '110%' }, show: { y: 0 } }}
                      transition={{ delay: 0.08, duration: 0.85, ease: EASE }}
                      className="flex items-baseline gap-4 transition-transform duration-300 group-hover:translate-x-2"
                    >
                      <h3 className="ink text-[clamp(34px,4.2vw,58px)] font-extrabold leading-[0.95] tracking-[-0.03em]">
                        {project.title}
                      </h3>
                      <span
                        className="muted text-[20px] transition-all duration-200 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-gold"
                        aria-hidden
                      >
                        ↗
                      </span>
                    </m.span>
                  </span>
                  <m.p
                    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                    transition={{ delay: 0.18, duration: 0.7, ease: EASE }}
                    className="muted mt-3 max-w-[560px] text-[13.5px] leading-[1.65]"
                  >
                    {project.description}
                  </m.p>
                  <m.p
                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                    transition={{ delay: 0.26, duration: 0.7, ease: EASE }}
                    className="muted mt-2 font-mono text-[11px] opacity-75"
                  >
                    {project.stack}
                  </m.p>
                </span>
              </div>
            </m.a>
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
    </section>
  )
}
