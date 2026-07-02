/* The page ends where the day does: ground rolls down from the work
   section into a campsite — tent, fire, pines — then the sign-off. */
export default function Footer() {
  return (
    <footer className="bg-[#1d1209]">
      <svg className="-mb-px block h-[110px] w-full" viewBox="0 0 1440 110" preserveAspectRatio="none" aria-hidden>
        <rect width="1440" height="110" fill="#1d1209" />
        <path d="M0 74 Q 240 46 480 66 T 960 58 T 1440 68 L1440 110 L0 110 Z" fill="#100a06" />
      </svg>
      <div className="bg-[#100a06] pb-12 text-center">
        <div className="relative mx-auto -mt-20 w-[min(660px,90vw)]">
          <svg className="block w-full" viewBox="0 0 660 190" aria-hidden>
            <defs>
              <radialGradient id="fireglow">
                <stop offset="0%" stopColor="#e89a4e" stopOpacity=".38" />
                <stop offset="55%" stopColor="#e89a4e" stopOpacity=".12" />
                <stop offset="100%" stopColor="#e89a4e" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* tent */}
            <path d="M120 168 L196 74 L272 168 Z" fill="#241509" />
            <path d="M196 74 L272 168 L232 168 Q 214 120 196 74" fill="#2e1a0c" />
            <path d="M196 74 L196 168" stroke="#170c05" strokeWidth="3" />
            <path d="M196 168 L178 128 L196 84 L214 128 Z" fill="#170c05" />
            <path d="M120 168 L98 178 M272 168 L294 178" stroke="#3a2313" strokeWidth="2" />
            {/* campfire */}
            <circle cx="430" cy="148" r="72" fill="url(#fireglow)" style={{ animation: 'glow 4s ease-in-out infinite' }} />
            <rect x="398" y="158" width="64" height="9" rx="4.5" fill="#3a2313" transform="rotate(-8 430 162)" />
            <rect x="398" y="158" width="64" height="9" rx="4.5" fill="#311d0e" transform="rotate(9 430 162)" />
            <path d="M430 112 Q 445 132 438 148 Q 434 156 430 158 Q 426 156 422 148 Q 415 132 430 112 Z" fill="#e89a4e" />
            <path d="M430 126 Q 438 138 433 149 Q 431 153 430 154 Q 429 153 427 149 Q 422 138 430 126 Z" fill="#ffe9b8" />
            {/* stones */}
            <circle cx="380" cy="169" r="5" fill="#2a1a10" />
            <circle cx="480" cy="170" r="6" fill="#2a1a10" />
            <circle cx="463" cy="174" r="4" fill="#241509" />
            <circle cx="396" cy="173" r="4" fill="#241509" />
            {/* pines far right */}
            <g fill="#1b0f08">
              <path d="M568 168 l16 -44 l16 44 z" />
              <path d="M604 168 l12 -32 l12 32 z" />
              <path d="M542 168 l10 -26 l10 26 z" />
            </g>
          </svg>
        </div>

        <a
          href="mailto:yan.xue@uwaterloo.ca"
          className="group mt-8 inline-block text-[clamp(30px,4vw,44px)] font-extrabold text-primary"
        >
          <span className="border-b-[3px] border-[#e89a4e]/50 transition-colors duration-200 group-hover:border-[#e89a4e]">
            say hello.
          </span>
        </a>

        <div className="mt-6 flex justify-center gap-6 text-[13px] text-[#a58a63]">
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

        <p className="mt-6 font-mono text-[11.5px] text-[#6f5a3e]">© {new Date().getFullYear()} yan xue</p>
      </div>
    </footer>
  )
}
