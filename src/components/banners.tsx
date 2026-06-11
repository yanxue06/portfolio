/* Project banners. flux + buildspace are the real images from the old
   site; the rest are hand-coded SVG: one clean icon, one committed color
   world each. */

const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace'

export function FluxBanner() {
  return <img src="/banners/flux.webp" alt="flux banner" className="h-full w-full object-cover" loading="lazy" />
}

export function BuildSpaceBanner() {
  return (
    <img src="/banners/buildspace.webp" alt="buildspace banner" className="h-full w-full object-cover" loading="lazy" />
  )
}

export function GitSemanticBanner() {
  return (
    <svg viewBox="0 0 400 170" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <filter id="gswin" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="9" floodColor="#000000" floodOpacity="0.45" />
        </filter>
        <clipPath id="gsclip">
          <rect x="14" y="12" width="372" height="158" rx="10" />
        </clipPath>
      </defs>
      <rect width="400" height="170" fill="#0a0f0a" />
      <rect x="14" y="12" width="372" height="158" rx="10" fill="#111c11" filter="url(#gswin)" />
      <g clipPath="url(#gsclip)">
        <rect x="14" y="12" width="372" height="26" fill="#1d291d" />
        <circle cx="32" cy="25" r="4.5" fill="#e2655c" />
        <circle cx="49" cy="25" r="4.5" fill="#e2b95c" />
        <circle cx="66" cy="25" r="4.5" fill="#69c46f" />
        <text x="200" y="29" textAnchor="middle" fontFamily={MONO} fontSize="10" fill="#6e8a6e">
          git-semantic
        </text>
        <text x="374" y="30" textAnchor="end" fontFamily={MONO} fontSize="12" fill="#e2c178">
          ★
        </text>
        <text x="30" y="62" fontFamily={MONO} fontSize="13">
          <tspan fill="#69c46f">$ </tspan>
          <tspan fill="#d7e8cf">git-semantic search </tspan>
          <tspan fill="#e2c178">"race condition"</tspan>
        </text>
        <text x="30" y="90" fontFamily={MONO} fontSize="13">
          <tspan fill="#7a8f7a">abc1234 </tspan>
          <tspan fill="#aed6a0">concurrent login fix</tspan>
        </text>
        <text x="356" y="90" textAnchor="end" fontFamily={MONO} fontSize="13" fill="#e2c178">
          0.89
        </text>
        <text x="30" y="116" fontFamily={MONO} fontSize="13">
          <tspan fill="#7a8f7a">def5678 </tspan>
          <tspan fill="#aed6a0">token refresh sync</tspan>
        </text>
        <text x="356" y="116" textAnchor="end" fontFamily={MONO} fontSize="13" fill="#e2c178">
          0.84
        </text>
        <text x="30" y="142" fontFamily={MONO} fontSize="13">
          <tspan fill="#7a8f7a">9f31c2d </tspan>
          <tspan fill="#aed6a0">mutex on session store</tspan>
        </text>
        <text x="356" y="142" textAnchor="end" fontFamily={MONO} fontSize="13" fill="#e2c178">
          0.81
        </text>
        <rect x="30" y="150" width="8" height="13" fill="#d7e8cf">
          <animate attributeName="opacity" values="1;0;1" dur="1.4s" repeatCount="indefinite" />
        </rect>
      </g>
    </svg>
  )
}

export function ObsidianBanner() {
  const nodes: Array<[number, number, number]> = [
    [62, 42, 5], [132, 92, 6], [92, 132, 4.5], [212, 58, 5], [262, 122, 6],
    [330, 48, 4.5], [312, 142, 5], [180, 142, 4.5], [122, 30, 4], [356, 96, 4.5],
  ]
  const hub: [number, number] = [202, 96]
  return (
    <svg viewBox="0 0 400 170" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="obsbg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a1130" />
          <stop offset="100%" stopColor="#261845" />
        </linearGradient>
      </defs>
      <rect width="400" height="170" fill="url(#obsbg)" />
      <g stroke="#7e6ad6" strokeWidth="1.4" opacity="0.45">
        {nodes.map(([x, y], i) => (
          <line key={i} x1={hub[0]} y1={hub[1]} x2={x} y2={y} />
        ))}
        <line x1="62" y1="42" x2="122" y2="30" />
        <line x1="262" y1="122" x2="312" y2="142" />
        <line x1="330" y1="48" x2="356" y2="96" />
      </g>
      {nodes.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#b39ddb" />
      ))}
      <circle cx={hub[0]} cy={hub[1]} r="18" fill="#e6dcff" opacity="0.22" />
      <circle cx={hub[0]} cy={hub[1]} r="9" fill="#e6dcff" />
    </svg>
  )
}

export function IMessageKitBanner() {
  return (
    <svg viewBox="0 0 400 170" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="imkbg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d2440" />
          <stop offset="100%" stopColor="#143a66" />
        </linearGradient>
      </defs>
      <rect width="400" height="170" fill="url(#imkbg)" />
      <rect x="262" y="32" width="84" height="32" rx="15" fill="#3787f7" />
      <path d="M340 58 q6 6 12 7 q-9 2 -16 -2 z" fill="#3787f7" />
      <text x="304" y="53" textAnchor="middle" fontFamily={MONO} fontSize="13" fill="#ffffff">
        1.3K ★
      </text>
      <rect x="138" y="62" width="124" height="56" rx="20" stroke="#ffffff" strokeWidth="4.5" fill="#ffffff" fillOpacity="0.05" />
      <path d="M150 114 Q146 127 136 131" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={178 + i * 22} cy="90" r="5.5" fill="#ffffff">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin={`${i * 0.25}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  )
}

export function FlappyBanner() {
  return (
    <svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="flapsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7cc4ed" />
          <stop offset="100%" stopColor="#c2e8fa" />
        </linearGradient>
        <linearGradient id="pipe" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5cc276" />
          <stop offset="55%" stopColor="#3da45c" />
          <stop offset="100%" stopColor="#2f8a4b" />
        </linearGradient>
        <radialGradient id="birdbody" cx="0.4" cy="0.35">
          <stop offset="0%" stopColor="#fbe27a" />
          <stop offset="100%" stopColor="#f0bb3f" />
        </radialGradient>
        <clipPath id="flapwin">
          <rect x="22" y="20" width="556" height="260" rx="16" />
        </clipPath>
        <filter id="flapshadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>
      <rect width="600" height="300" fill="#171c22" />
      <rect x="22" y="20" width="556" height="260" rx="16" fill="#1d232b" filter="url(#flapshadow)" />
      <g clipPath="url(#flapwin)">
        <rect x="22" y="52" width="556" height="228" fill="url(#flapsky)" />
        {/* titlebar */}
        <rect x="22" y="20" width="556" height="32" fill="#2b323b" />
        <circle cx="46" cy="36" r="5.5" fill="#e2655c" />
        <circle cx="68" cy="36" r="5.5" fill="#e2b95c" />
        <circle cx="90" cy="36" r="5.5" fill="#69c46f" />
        <text x="300" y="41" textAnchor="middle" fontFamily={MONO} fontSize="13" fill="#8b949e">
          flappy.py
        </text>
        {/* soft sun */}
        <circle cx="520" cy="92" r="40" fill="#fff6cf" opacity="0.55" />
        {/* clouds */}
        <g fill="#ffffff" opacity="0.9">
          <ellipse cx="285" cy="100" rx="30" ry="12" />
          <ellipse cx="308" cy="106" rx="22" ry="10" />
          <ellipse cx="265" cy="106" rx="18" ry="9" />
        </g>
        <g fill="#ffffff" opacity="0.7">
          <ellipse cx="480" cy="200" rx="26" ry="10" />
          <ellipse cx="500" cy="206" rx="18" ry="8" />
        </g>
        {/* pipes */}
        <g>
          <rect x="188" y="52" width="52" height="74" fill="url(#pipe)" />
          <rect x="180" y="118" width="68" height="22" rx="4" fill="#2f8a4b" />
          <rect x="180" y="118" width="68" height="8" rx="4" fill="#46b25e" />
          <rect x="188" y="196" width="52" height="84" fill="url(#pipe)" />
          <rect x="180" y="176" width="68" height="22" rx="4" fill="#2f8a4b" />
          <rect x="180" y="176" width="68" height="8" rx="4" fill="#46b25e" />
          <rect x="388" y="52" width="52" height="40" fill="url(#pipe)" />
          <rect x="380" y="84" width="68" height="22" rx="4" fill="#2f8a4b" />
          <rect x="380" y="84" width="68" height="8" rx="4" fill="#46b25e" />
          <rect x="388" y="162" width="52" height="118" fill="url(#pipe)" />
          <rect x="380" y="142" width="68" height="22" rx="4" fill="#2f8a4b" />
          <rect x="380" y="142" width="68" height="8" rx="4" fill="#46b25e" />
        </g>
        {/* the bird */}
        <g>
          <path d="M86 158 q-14 -3 -24 2" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.5" fill="none" />
          <path d="M84 170 q-12 -2 -20 3" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.35" fill="none" />
          <circle cx="112" cy="162" r="19" fill="url(#birdbody)" stroke="#d9a73c" strokeWidth="2" />
          <ellipse cx="103" cy="167" rx="9" ry="6.5" fill="#e8b545" />
          <circle cx="119" cy="155" r="6" fill="#ffffff" />
          <circle cx="121" cy="155" r="2.8" fill="#20262e" />
          <path d="M129 161 q9 1.5 11 5 q-4 3.5 -12 2.5 z" fill="#f0883e" />
        </g>
        {/* score */}
        <text x="302" y="92" textAnchor="middle" fontFamily={MONO} fontSize="34" fontWeight="bold" fill="#1d232b" opacity="0.25">
          12
        </text>
        <text x="300" y="90" textAnchor="middle" fontFamily={MONO} fontSize="34" fontWeight="bold" fill="#ffffff">
          12
        </text>
      </g>
    </svg>
  )
}
