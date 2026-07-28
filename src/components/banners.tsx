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
  /* a commit graph swept by a semantic search — matching commits flare gold */
  const quiet: Array<[number, number]> = [
    [36, 150], [62, 150], [140, 150], [190, 150], [246, 150],
    [150, 108], [178, 108], [262, 108], [236, 66],
  ]
  const hits: Array<{ x: number; y: number; score: string; begin: string }> = [
    { x: 98, y: 150, score: '0.89', begin: '1.9s' },
    { x: 204, y: 108, score: '0.84', begin: '3.0s' },
    { x: 288, y: 66, score: '0.81', begin: '3.9s' },
  ]
  return (
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="gsbg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a120c" />
          <stop offset="100%" stopColor="#101d12" />
        </linearGradient>
        <linearGradient id="gssweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e2c178" stopOpacity="0" />
          <stop offset="50%" stopColor="#e2c178" stopOpacity="0.13" />
          <stop offset="100%" stopColor="#e2c178" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#gsbg)" />
      <text x="20" y="34" fontFamily={MONO} fontSize="11">
        <tspan fill="#69c46f">$ </tspan>
        <tspan fill="#d7e8cf">search </tspan>
        <tspan fill="#e2c178">"race condition"</tspan>
      </text>
      {/* branching lanes, git log --graph style */}
      <g fill="none" stroke="#2e4632" strokeWidth="1.6">
        <path d="M 16 150 H 304" />
        <path d="M 86 150 C 104 150 104 108 122 108 H 304" />
        <path d="M 168 108 C 186 108 186 66 204 66 H 304" />
      </g>
      {quiet.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3.4" fill="#3f6247" />
      ))}
      {/* the sweep */}
      <rect x="-80" y="46" width="80" height="140" fill="url(#gssweep)">
        <animateTransform attributeName="transform" type="translate" values="0 0; 420 0" dur="4.5s" repeatCount="indefinite" />
      </rect>
      {hits.map(({ x, y, score, begin }) => (
        <g key={score}>
          <circle cx={x} cy={y} r="3.4" fill="#3f6247" />
          <g opacity="0">
            <animate attributeName="opacity" values="0;1;0.55;0.55;0" keyTimes="0;0.04;0.2;0.85;1" dur="4.5s" begin={begin} repeatCount="indefinite" />
            <circle cx={x} cy={y} r="4.6" fill="#e2c178" />
            <circle cx={x} cy={y} r="9" fill="none" stroke="#e2c178" strokeOpacity="0.5" strokeWidth="1" />
            <text x={x} y={y - 14} textAnchor="middle" fontFamily={MONO} fontSize="10" fill="#e2c178">
              {score}
            </text>
          </g>
        </g>
      ))}
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
        <animate attributeName="opacity" values="0.45;0.28;0.45" dur="4.5s" repeatCount="indefinite" />
      </g>
      {nodes.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#b39ddb">
          <animate
            attributeName="r"
            values={`${r};${r * 1.45};${r}`}
            dur="3.2s"
            begin={`${i * 0.4}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
      {/* radar ping out of the hub */}
      <circle cx={hub[0]} cy={hub[1]} r="14" fill="none" stroke="#e6dcff" strokeWidth="1.5">
        <animate attributeName="r" values="11;30" dur="2.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0" dur="2.8s" repeatCount="indefinite" />
      </circle>
      <circle cx={hub[0]} cy={hub[1]} r="18" fill="#e6dcff" opacity="0.22" />
      <circle cx={hub[0]} cy={hub[1]} r="9" fill="#e6dcff" />
    </svg>
  )
}

export function MarillacPlaceBanner() {
  /* a home at dusk — a window lights up for each resident, the hearth stays warm */
  const windows = [
    { x: 110, begin: '0.4s' },
    { x: 132, begin: '1.6s' },
    { x: 182, begin: '2.8s' },
  ]
  return (
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="mpdusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#241019" />
          <stop offset="70%" stopColor="#3a1c2c" />
          <stop offset="100%" stopColor="#452334" />
        </linearGradient>
        <radialGradient id="mpglow" cx="0.5" cy="0.62" r="0.55">
          <stop offset="0%" stopColor="#f3c98a" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#f3c98a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="200" fill="url(#mpdusk)" />
      <rect width="320" height="200" fill="url(#mpglow)" />
      <line x1="0" y1="164" x2="320" y2="164" stroke="#cf94a8" strokeOpacity="0.3" />
      {/* bushes */}
      <path d="M 52 164 Q 66 148 82 164 Z" fill="#2a1420" stroke="#cf94a8" strokeOpacity="0.35" strokeWidth="1.2" />
      <path d="M 238 164 Q 252 150 268 164 Z" fill="#2a1420" stroke="#cf94a8" strokeOpacity="0.35" strokeWidth="1.2" />
      {/* house */}
      <g stroke="#cf94a8" strokeWidth="1.6" fill="#2a1420">
        <rect x="100" y="112" width="112" height="52" />
        <path d="M 92 112 L 156 74 L 220 112 Z" />
        <rect x="188" y="82" width="12" height="22" />
      </g>
      <rect x="150" y="136" width="14" height="28" fill="#1d0c14" stroke="#cf94a8" strokeOpacity="0.7" strokeWidth="1.2" />
      {/* a window lights for each resident */}
      {windows.map(({ x, begin }) => (
        <g key={x}>
          <rect x={x} y="124" width="16" height="14" fill="#1d0c14" stroke="#cf94a8" strokeOpacity="0.7" strokeWidth="1.2" />
          <rect x={x} y="124" width="16" height="14" fill="#f3c98a" opacity="0">
            <animate attributeName="opacity" values="0;0.95;0.95;0" keyTimes="0;0.08;0.85;1" dur="6s" begin={begin} repeatCount="indefinite" />
          </rect>
        </g>
      ))}
      {/* chimney smoke */}
      <path
        d="M 194 78 C 190 68 200 64 196 54 C 192 46 200 42 198 34"
        fill="none"
        stroke="#cf94a8"
        strokeOpacity="0.45"
        strokeWidth="1.4"
        strokeLinecap="round"
      >
        <animate attributeName="stroke-opacity" values="0.2;0.5;0.2" dur="5s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -4; 0 0" dur="5s" repeatCount="indefinite" />
      </path>
      {/* once a loop, a heart drifts up from the hearth */}
      <path
        d="M 197 60 C 193.5 57.5 191.5 55 193.4 53.3 C 194.8 52.1 196.3 53 197 54.2 C 197.7 53 199.2 52.1 200.6 53.3 C 202.5 55 200.5 57.5 197 60 Z"
        fill="#f3a4b5"
        opacity="0"
      >
        <animate attributeName="opacity" values="0;0.9;0" keyTimes="0;0.3;1" dur="6s" begin="3.2s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -30" dur="6s" begin="3.2s" repeatCount="indefinite" />
      </path>
    </svg>
  )
}

export function FlappyBanner() {
  return (
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
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
          <rect x="12" y="14" width="296" height="172" rx="12" />
        </clipPath>
        <filter id="flapshadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>
      <rect width="320" height="200" fill="#171c22" />
      <rect x="12" y="14" width="296" height="172" rx="12" fill="#1d232b" filter="url(#flapshadow)" />
      <g clipPath="url(#flapwin)">
        <rect x="12" y="38" width="296" height="148" fill="url(#flapsky)" />
        {/* titlebar */}
        <rect x="12" y="14" width="296" height="24" fill="#2b323b" />
        <circle cx="28" cy="26" r="4" fill="#e2655c" />
        <circle cx="43" cy="26" r="4" fill="#e2b95c" />
        <circle cx="58" cy="26" r="4" fill="#69c46f" />
        <text x="160" y="30" textAnchor="middle" fontFamily={MONO} fontSize="9.5" fill="#8b949e">
          flappy.py
        </text>
        {/* soft sun */}
        <circle cx="272" cy="66" r="24" fill="#fff6cf" opacity="0.55" />
        {/* clouds, drifting like the pipes are coming at you */}
        <g fill="#ffffff" opacity="0.9">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; -20 0; 0 0"
            dur="14s"
            repeatCount="indefinite"
          />
          <ellipse cx="150" cy="66" rx="18" ry="7" />
          <ellipse cx="164" cy="70" rx="13" ry="6" />
          <ellipse cx="138" cy="70" rx="11" ry="5.5" />
        </g>
        <g fill="#ffffff" opacity="0.7">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; -28 0; 0 0"
            dur="11s"
            repeatCount="indefinite"
          />
          <ellipse cx="250" cy="150" rx="15" ry="6" />
          <ellipse cx="262" cy="154" rx="10" ry="5" />
        </g>
        {/* pipes */}
        <g>
          <rect x="106" y="38" width="30" height="48" fill="url(#pipe)" />
          <rect x="101" y="80" width="40" height="13" rx="3" fill="#2f8a4b" />
          <rect x="101" y="80" width="40" height="5" rx="3" fill="#46b25e" />
          <rect x="106" y="130" width="30" height="56" fill="url(#pipe)" />
          <rect x="101" y="118" width="40" height="13" rx="3" fill="#2f8a4b" />
          <rect x="101" y="118" width="40" height="5" rx="3" fill="#46b25e" />
          <rect x="216" y="38" width="30" height="26" fill="url(#pipe)" />
          <rect x="211" y="58" width="40" height="13" rx="3" fill="#2f8a4b" />
          <rect x="211" y="58" width="40" height="5" rx="3" fill="#46b25e" />
          <rect x="216" y="108" width="30" height="78" fill="url(#pipe)" />
          <rect x="211" y="96" width="40" height="13" rx="3" fill="#2f8a4b" />
          <rect x="211" y="96" width="40" height="5" rx="3" fill="#46b25e" />
        </g>
        {/* the bird — forever mid-flap */}
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 -6; 0 2; 0 0"
            keyTimes="0; 0.4; 0.8; 1"
            dur="1.9s"
            repeatCount="indefinite"
          />
          <path d="M46 104 q-9 -2 -15 1.5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" fill="none" />
          <path d="M45 112 q-8 -1.5 -13 2" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" fill="none" />
          <circle cx="62" cy="107" r="12.5" fill="url(#birdbody)" stroke="#d9a73c" strokeWidth="1.6" />
          <ellipse cx="56" cy="110" rx="6" ry="4.3" fill="#e8b545" />
          <circle cx="66.5" cy="102.5" r="4" fill="#ffffff" />
          <circle cx="67.8" cy="102.5" r="1.9" fill="#20262e" />
          <path d="M73 106 q6 1 7.3 3.3 q-2.6 2.3 -7.9 1.6 z" fill="#f0883e" />
        </g>
        {/* score */}
        <text x="161.5" y="64" textAnchor="middle" fontFamily={MONO} fontSize="22" fontWeight="bold" fill="#1d232b" opacity="0.25">
          12
        </text>
        <text x="160" y="62.5" textAnchor="middle" fontFamily={MONO} fontSize="22" fontWeight="bold" fill="#ffffff">
          12
        </text>
      </g>
    </svg>
  )
}
