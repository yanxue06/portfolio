import { m } from 'framer-motion'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const NAV_LINKS = [
  { label: 'about', href: '#about' },
  { label: 'work', href: '#work' },
  { label: 'github', href: 'https://github.com/yanxue06' },
  { label: 'linkedin', href: 'https://linkedin.com/in/yanxue-ce' },
  { label: 'email', href: 'mailto:yan.xue@uwaterloo.ca' },
]

/* fixed masthead — rides the whole page, colors follow the theme morph */
export default function Nav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 sm:px-10">
      <a href="#top" className="ink font-mono text-sm font-bold">
        yan<span className="text-gold">*</span>
      </a>
      <div className="flex items-center gap-4 sm:gap-7">
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
            className="muted after:bg-gold relative whitespace-nowrap font-mono text-[11px] transition-colors duration-200 hover:text-gold sm:text-[13px] after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:transition-[width] after:duration-300 hover:after:w-full before:absolute before:-inset-2 before:content-['']"
          >
            {link.label}
          </a>
        ))}
      </div>
      <m.span
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.4, duration: 1.1, ease: EASE }}
        className="hairline absolute inset-x-0 bottom-0 origin-left border-b"
        aria-hidden
      />
    </nav>
  )
}
