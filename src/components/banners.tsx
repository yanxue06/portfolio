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
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <filter id="gswin" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="9" floodColor="#000000" floodOpacity="0.45" />
        </filter>
        <clipPath id="gsclip">
          <rect x="12" y="14" width="296" height="172" rx="10" />
        </clipPath>
      </defs>
      <rect width="320" height="200" fill="#0a0f0a" />
      <rect x="12" y="14" width="296" height="172" rx="10" fill="#111c11" filter="url(#gswin)" />
      <g clipPath="url(#gsclip)">
        <rect x="12" y="14" width="296" height="24" fill="#1d291d" />
        <circle cx="28" cy="26" r="4" fill="#e2655c" />
        <circle cx="43" cy="26" r="4" fill="#e2b95c" />
        <circle cx="58" cy="26" r="4" fill="#69c46f" />
        <text x="160" y="30" textAnchor="middle" fontFamily={MONO} fontSize="9.5" fill="#6e8a6e">
          git-semantic
        </text>
        <text x="296" y="31" textAnchor="end" fontFamily={MONO} fontSize="11" fill="#e2c178">
          ★
        </text>
        <text x="26" y="66" fontFamily={MONO} fontSize="12">
          <tspan fill="#69c46f">$ </tspan>
          <tspan fill="#d7e8cf">search </tspan>
          <tspan fill="#e2c178">"race condition"</tspan>
        </text>
        <text x="26" y="94" fontFamily={MONO} fontSize="12">
          <tspan fill="#7a8f7a">abc1234 </tspan>
          <tspan fill="#aed6a0">concurrent login fix</tspan>
        </text>
        <text x="294" y="94" textAnchor="end" fontFamily={MONO} fontSize="12" fill="#e2c178">
          0.89
        </text>
        <text x="26" y="120" fontFamily={MONO} fontSize="12">
          <tspan fill="#7a8f7a">def5678 </tspan>
          <tspan fill="#aed6a0">token refresh sync</tspan>
        </text>
        <text x="294" y="120" textAnchor="end" fontFamily={MONO} fontSize="12" fill="#e2c178">
          0.84
        </text>
        <text x="26" y="146" fontFamily={MONO} fontSize="12">
          <tspan fill="#7a8f7a">9f31c2d </tspan>
          <tspan fill="#aed6a0">mutex on session</tspan>
        </text>
        <text x="294" y="146" textAnchor="end" fontFamily={MONO} fontSize="12" fill="#e2c178">
          0.81
        </text>
        <rect x="26" y="158" width="7" height="12" fill="#d7e8cf">
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
  /* a small care dashboard — each resident's task ticks complete on a loop */
  const rows = [
    { y: 96, label: 'intake form', begin: '0s' },
    { y: 126, label: 'room assignment', begin: '0.5s' },
    { y: 156, label: 'daily check-in', begin: '1s' },
  ]
  return (
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <filter id="mpwin" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="9" floodColor="#000000" floodOpacity="0.45" />
        </filter>
        <clipPath id="mpclip">
          <rect x="12" y="14" width="296" height="172" rx="10" />
        </clipPath>
        <linearGradient id="mpbg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#220f1b" />
          <stop offset="100%" stopColor="#34182a" />
        </linearGradient>
        <radialGradient id="mphearth" cx="0.5" cy="0.1" r="0.9">
          <stop offset="0%" stopColor="#f3a4b5" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#f3a4b5" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="200" fill="url(#mpbg)" />
      <rect x="12" y="14" width="296" height="172" rx="10" fill="#3d1f30" filter="url(#mpwin)" />
      <g clipPath="url(#mpclip)">
        {/* warm hearth glow from the top */}
        <rect x="12" y="14" width="296" height="172" fill="url(#mphearth)" />
        {/* window titlebar */}
        <rect x="12" y="14" width="296" height="24" fill="#4a2740" />
        <circle cx="28" cy="26" r="4" fill="#e2655c" />
        <circle cx="43" cy="26" r="4" fill="#e2b95c" />
        <circle cx="58" cy="26" r="4" fill="#69c46f" />
        <text x="160" y="30" textAnchor="middle" fontFamily={MONO} fontSize="9.5" fill="#cf94a8">
          marillac place
        </text>
        {/* a heart — care — where git-semantic puts its star */}
        <path
          d="M291 32 C284.6 27.8 281.3 23.6 284.5 20.8 C286.8 18.8 289.6 20.4 291 22.5 C292.4 20.4 295.2 18.8 297.5 20.8 C300.7 23.6 297.4 27.8 291 32 Z"
          fill="#f3a4b5"
        >
          <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
        </path>
        {/* section header */}
        <text x="26" y="62" fontFamily={MONO} fontSize="10.5" fill="#b3788d">
          resident tasks
        </text>
        <line x1="22" y1="72" x2="298" y2="72" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1" />
        {rows.map(({ y, label, begin }) => (
          <g key={label}>
            <circle cx="30" cy={y} r="3.2" fill="#d98aa0" />
            <text x="44" y={y + 4} fontFamily={MONO} fontSize="11.5" fill="#ead0d9">
              {label}
            </text>
            {/* empty checkbox */}
            <rect x="272" y={y - 8.5} width="17" height="17" rx="5" fill="none" stroke="#90586c" strokeWidth="1.6" />
            {/* checked state — fades in, staggered per row */}
            <g opacity="0">
              <rect x="272" y={y - 8.5} width="17" height="17" rx="5" fill="#f3a4b5" />
              <path
                d={`M276 ${y} l3.2 3.8 l6.6 -8`}
                fill="none"
                stroke="#3a1622"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.15;0.82;1"
                dur="3.6s"
                begin={begin}
                repeatCount="indefinite"
              />
            </g>
          </g>
        ))}
      </g>
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
