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
    { y: 92, label: 'intake form', begin: '0s' },
    { y: 120, label: 'room assignment', begin: '0.5s' },
    { y: 148, label: 'daily check-in', begin: '1s' },
  ]
  return (
    <svg viewBox="0 0 400 170" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <filter id="mpwin" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="9" floodColor="#000000" floodOpacity="0.45" />
        </filter>
        <clipPath id="mpclip">
          <rect x="14" y="12" width="372" height="158" rx="10" />
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
      <rect width="400" height="170" fill="url(#mpbg)" />
      <rect x="14" y="12" width="372" height="158" rx="10" fill="#3d1f30" filter="url(#mpwin)" />
      <g clipPath="url(#mpclip)">
        {/* warm hearth glow from the top */}
        <rect x="14" y="12" width="372" height="158" fill="url(#mphearth)" />
        {/* window titlebar */}
        <rect x="14" y="12" width="372" height="26" fill="#4a2740" />
        <circle cx="32" cy="25" r="4.5" fill="#e2655c" />
        <circle cx="49" cy="25" r="4.5" fill="#e2b95c" />
        <circle cx="66" cy="25" r="4.5" fill="#69c46f" />
        <text x="200" y="29" textAnchor="middle" fontFamily={MONO} fontSize="10" fill="#cf94a8">
          marillac place
        </text>
        {/* a heart — care — where git-semantic puts its star */}
        <path
          d="M367 31 C360 26.5 356.5 22 360 19 C362.5 16.8 365.5 18.5 367 20.8 C368.5 18.5 371.5 16.8 374 19 C377.5 22 374 26.5 367 31 Z"
          fill="#f3a4b5"
        >
          <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
        </path>
        {/* section header */}
        <text x="30" y="60" fontFamily={MONO} fontSize="11" fill="#b3788d">
          resident tasks
        </text>
        <line x1="26" y1="70" x2="374" y2="70" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1" />
        {rows.map(({ y, label, begin }) => (
          <g key={label}>
            <circle cx="33" cy={y} r="3.5" fill="#d98aa0" />
            <text x="48" y={y + 4} fontFamily={MONO} fontSize="12.5" fill="#ead0d9">
              {label}
            </text>
            {/* empty checkbox */}
            <rect x="338" y={y - 9} width="18" height="18" rx="5" fill="none" stroke="#90586c" strokeWidth="1.6" />
            {/* checked state — fades in, staggered per row */}
            <g opacity="0">
              <rect x="338" y={y - 9} width="18" height="18" rx="5" fill="#f3a4b5" />
              <path
                d={`M342 ${y} l3.4 4 l7 -8.4`}
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
        {/* clouds, drifting like the pipes are coming at you */}
        <g fill="#ffffff" opacity="0.9">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; -36 0; 0 0"
            dur="14s"
            repeatCount="indefinite"
          />
          <ellipse cx="285" cy="100" rx="30" ry="12" />
          <ellipse cx="308" cy="106" rx="22" ry="10" />
          <ellipse cx="265" cy="106" rx="18" ry="9" />
        </g>
        <g fill="#ffffff" opacity="0.7">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; -52 0; 0 0"
            dur="11s"
            repeatCount="indefinite"
          />
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
        {/* the bird — forever mid-flap */}
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 -9; 0 3; 0 0"
            keyTimes="0; 0.4; 0.8; 1"
            dur="1.9s"
            repeatCount="indefinite"
          />
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
