import { motion, type MotionValue } from 'framer-motion'

interface CliffSceneProps {
  skyY?: MotionValue<number> | number
  cloudY?: MotionValue<number> | number
  farY?: MotionValue<number> | number
  midY?: MotionValue<number> | number
}

/* The whole backdrop is one hand-written SVG: sky, sun, ridges, a cliff,
   and a kid sitting off the edge. Layers are motion.g groups so the hero
   can drive scroll parallax. preserveAspectRatio keeps the kid and sun in
   frame when mobile crops the sides. Keep decorations below y≈450 and
   right of x≈950 — the hero text block owns the upper left. */
export default function CliffScene({ skyY = 0, cloudY = 0, farY = 0, midY = 0 }: CliffSceneProps) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="660" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2e1c33" />
          <stop offset="35%" stopColor="#743b44" />
          <stop offset="60%" stopColor="#b85c33" />
          <stop offset="78%" stopColor="#e89a4e" />
          <stop offset="100%" stopColor="#f9dfa4" />
        </linearGradient>
        <radialGradient id="sunGlow">
          <stop offset="0%" stopColor="#ffe9b8" stopOpacity="0.9" />
          <stop offset="45%" stopColor="#f8c87e" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f8c87e" stopOpacity="0" />
        </radialGradient>
        <filter id="soften" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* sky + sun — slowest layer, bled upward so parallax never shows a seam */}
      <motion.g style={{ y: skyY }}>
        <rect x="-20" y="-160" width="1480" height="820" fill="url(#sky)" />
        <rect x="-20" y="640" width="1480" height="420" fill="#f9dfa4" />
        <circle cx="900" cy="600" r="170" fill="url(#sunGlow)" style={{ animation: 'glow 9s ease-in-out infinite' }} />
        <circle cx="900" cy="600" r="62" fill="#fbd98e" />
        <circle cx="900" cy="600" r="62" fill="#fff3cf" opacity="0.55" />
      </motion.g>

      {/* air — clouds and birds */}
      <motion.g style={{ y: cloudY }}>
        <g filter="url(#soften)">
          <ellipse cx="300" cy="265" rx="150" ry="13" fill="#f6cf96" opacity="0.28" />
          <ellipse cx="370" cy="290" rx="90" ry="9" fill="#c97a4a" opacity="0.3" />
          <ellipse cx="850" cy="205" rx="120" ry="10" fill="#f6cf96" opacity="0.22" />
          <ellipse cx="1170" cy="320" rx="160" ry="12" fill="#f3bd7d" opacity="0.3" />
          <ellipse cx="1240" cy="345" rx="90" ry="8" fill="#a85a3c" opacity="0.32" />
        </g>
        {/* birds heading home — low right, silhouetted against the sun glow */}
        <g
          stroke="#2a160e"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
          style={{ animation: 'birds-drift 32s ease-in-out infinite' }}
        >
          <path d="M1040 500 q7 -8 14 0 q7 -8 14 0" />
          <path d="M1112 528 q6 -7 12 0 q6 -7 12 0" opacity="0.85" />
          <path d="M1000 478 q5 -6 10 0 q5 -6 10 0" opacity="0.7" />
        </g>
      </motion.g>

      {/* far range */}
      <motion.g style={{ y: farY }}>
        <path
          d="M0 655 L160 585 L330 650 L500 596 L660 648 L840 590 L1010 650 L1180 598 L1330 652 L1440 625 L1440 900 L0 900 Z"
          fill="#7a4742"
        />
        <rect y="580" width="1440" height="120" fill="#e89a4e" opacity="0.12" />
      </motion.g>

      {/* mid hills + pines */}
      <motion.g style={{ y: midY }}>
        <path
          d="M0 730 Q180 668 380 706 Q560 740 760 700 Q960 664 1140 708 Q1290 742 1440 700 L1440 900 L0 900 Z"
          fill="#4a2a22"
        />
        <g fill="#2e1a12">
          <path d="M1150 712 l11 -34 l11 34 z" />
          <path d="M1186 708 l13 -42 l13 42 z" />
          <path d="M1226 712 l10 -30 l10 30 z" />
          <path d="M1262 706 l14 -46 l14 46 z" />
          <path d="M1306 712 l11 -34 l11 34 z" />
          <path d="M1344 708 l12 -38 l12 38 z" />
        </g>
      </motion.g>

      {/* foreground cliff — anchored, no parallax */}
      <path
        d="M0 642 L120 634 L300 630 L480 633 L620 631
           L628 658 L608 690 L626 728 L598 778 L616 832 L590 900
           L0 900 Z"
        fill="#20120a"
      />
      <path d="M0 642 L120 634 L300 630 L480 633 L618 631" stroke="#e89a4e" strokeWidth="2.5" fill="none" opacity="0.35" />
      <path d="M620 631 L628 658 L608 690" stroke="#e89a4e" strokeWidth="2" fill="none" opacity="0.2" />
      <g stroke="#f4c87a" strokeWidth="1.2" fill="none" opacity="0.07">
        <path d="M520 660 q-30 40 -10 90" />
        <path d="M430 650 q20 60 -8 120" />
        <path d="M250 648 q-16 50 4 110" />
      </g>

      {/* the kid, sitting off the edge */}
      <g>
        <rect x="556" y="616" width="17" height="16" rx="5" fill="#1a0e07" />
        <path d="M560 617 q4 -6 9 0" stroke="#1a0e07" strokeWidth="2.5" fill="none" />
        <path d="M588 598 Q582 614 584 632 L608 632 Q612 612 606 598 Q597 591 588 598 Z" fill="#170c05" />
        <circle cx="600" cy="583" r="11" fill="#170c05" />
        <path d="M590 604 L566 630" stroke="#170c05" strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx="565" cy="631" r="3.5" fill="#170c05" />
        <path d="M606 606 L615 621 L623 628" stroke="#170c05" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M594 632 L624 640 L622 668 L629 671" stroke="#170c05" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M588 632 L618 644 L612 674 L618 677" stroke="#170c05" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* laptop on the lap, screen glowing */}
        <path d="M607 630 L633 636 L632 641 L606 635 Z" fill="#0e0a06" />
        <path d="M630 638 L640 615 L645 617 L635 640 Z" fill="#241509" />
        <path d="M632 636 L640 618 L643 619 L635 637 Z" fill="#ffe9b8" opacity="0.9" />
        <circle cx="638" cy="627" r="13" fill="#ffe9b8" style={{ animation: 'screen-flicker 5s ease-in-out infinite' }} />
        <circle cx="638" cy="627" r="6" fill="#ffe9b8" opacity="0.22" />
        <path d="M608 575 a11 11 0 0 1 3 12" stroke="#f6c87f" strokeWidth="2" fill="none" opacity="0.55" />
        <path d="M606 598 q6 4 6 11" stroke="#f6c87f" strokeWidth="2" fill="none" opacity="0.4" />
      </g>
    </svg>
  )
}
