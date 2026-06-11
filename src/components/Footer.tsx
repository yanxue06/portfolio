export default function Footer() {
  return (
    <footer className="border-t border-[#241a2e] bg-[#0d0a16] px-4 py-8 md:px-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-[11px] text-[#8a7a9c] sm:flex-row sm:text-xs">
        <p>© {new Date().getFullYear()} yan xue</p>
        <div className="flex gap-5">
          <a
            href="https://github.com/yanxue06"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-primary"
          >
            github
          </a>
          <a
            href="https://linkedin.com/in/yanxue-ce"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-primary"
          >
            linkedin
          </a>
          <a href="mailto:yan.xue@uwaterloo.ca" className="transition-colors hover:text-primary">
            email
          </a>
        </div>
      </div>
    </footer>
  )
}
