/* The old sunset cliff scene, redrawn in the site's ink: navy ranges on
   cream paper, and the sun is the asterisk — gold, spinning slowly, and
   sinking behind the far ridge as the pinned hero is scrolled. The kid on
   the cliff keeps their laptop. Layers scrub at different rates for depth. */
import { m, useReducedMotion, type MotionValue, useTransform } from 'framer-motion'
import { lazy, Suspense } from 'react'
import Flocks from './Flocks'

/* same lazy chunk as the heart and the mesh sun — the sea below the cliff */
const Water = lazy(() =>
  import('@paper-design/shaders-react').then((mod) => ({ default: mod.Water })),
)

/* drawn twice: once opaque cream, once as the navy wash */
const FAR_RANGE =
  'M0 655 L160 585 L330 650 L500 596 L660 648 L840 590 L1010 650 L1180 598 L1330 652 L1440 625 L1440 900 L0 900 Z'

export default function Scene({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion()
  /* the sun sets on an arc — drifting right while the drop accelerates —
     instead of falling in a straight line */
  const sunY = useTransform(progress, [0.05, 0.3, 0.5], [0, reduce ? 0 : 110, reduce ? 0 : 290])
  const sunX = useTransform(progress, [0.05, 0.5], [0, reduce ? 0 : 85])
  const glowOpacity = useTransform(progress, [0.05, 0.5], [1, reduce ? 1 : 0.4])

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="horizonWash" x1="0" y1="260" x2="0" y2="660" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c4a35c" stopOpacity="0" />
          <stop offset="100%" stopColor="#c4a35c" stopOpacity="0.16" />
        </linearGradient>
        <radialGradient id="sunGlow">
          <stop offset="0%" stopColor="#c4a35c" stopOpacity="0.3" />
          <stop offset="45%" stopColor="#c4a35c" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#c4a35c" stopOpacity="0" />
        </radialGradient>
        <filter id="soften" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* sky wash + the asterisk-sun — slowest layer */}
      <g>
        <rect x="-20" y="240" width="1480" height="430" fill="url(#horizonWash)" />
        <m.circle cx="900" cy="400" r="170" fill="url(#sunGlow)" style={{ x: sunX, y: sunY, opacity: glowOpacity }} />
      </g>

      {/* air — clouds and birds */}
      <g>
        {/* clouds stay right of the text block — blurred navy on cream
            reads as smudges when they sit under the name */}
        <g filter="url(#soften)" fill="#16243e">
          <ellipse cx="850" cy="205" rx="120" ry="10" opacity="0.06" />
          <ellipse cx="1170" cy="320" rx="160" ry="12" opacity="0.08" />
          <ellipse cx="1240" cy="345" rx="90" ry="8" opacity="0.09" />
        </g>
        <Flocks />
      </g>

      {/* far range — the ranges are translucent washes, and the mesh sun is a
          sibling div painted underneath this svg. Without an opaque base the
          setting sun ghosts through the ridges instead of dropping behind
          them; this backing runs to the bottom edge, so it makes the whole
          landmass occlude while the washes above composite unchanged */}
      <g>
        <path d={FAR_RANGE} fill="#f2ecde" />
        <path d={FAR_RANGE} fill="#16243e" opacity="0.3" />
        <rect y="580" width="1440" height="120" fill="#c4a35c" opacity="0.05" />
      </g>

      {/* mid hills + pines */}
      <g>
        <path
          d="M0 730 Q180 668 380 706 Q560 740 760 700 Q960 664 1140 708 Q1290 742 1440 700 L1440 900 L0 900 Z"
          fill="#16243e"
          opacity="0.52"
        />
        <g fill="#0f1e3a" opacity="0.75">
          <path d="M1150 712 l11 -34 l11 34 z" />
          <path d="M1186 708 l13 -42 l13 42 z" />
          <path d="M1226 712 l10 -30 l10 30 z" />
          <path d="M1262 706 l14 -46 l14 46 z" />
          <path d="M1306 712 l11 -34 l11 34 z" />
          <path d="M1344 708 l12 -38 l12 38 z" />
        </g>
      </g>

      {/* the sea the cliff drops into — the heart's water shader, riding a
          foreignObject so it scales with the scene. the wavy shoreline is
          CSS clip-path on the inner div: safari ignores svg clipPaths on
          foreignObject but honors clip-path on the html child. left edge
          tucks under the cliff, top edge stays below the pine bases */}
      <foreignObject x="560" y="780" width="880" height="120">
        <div
          style={{
            width: '100%',
            height: '100%',
            clipPath:
              "path('M0 26 Q150 14 300 22 Q450 32 600 24 Q700 19 800 24 Q845 26 880 22 L880 120 L0 120 Z')",
          }}
        >
          <Suspense
            fallback={
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle at 35% 30%, #bfe3f7 0%, #58a8db 55%, #2f7cb4 100%)',
                }}
              />
            }
          >
            <Water
              colorBack="#3f97cf"
              colorHighlight="#f2fbff"
              highlights={0.35}
              layering={0.6}
              edges={0.5}
              waves={0.4}
              caustic={0.35}
              size={2}
              speed={reduce ? 0 : 1.2}
              style={{ width: '100%', height: '100%' }}
            />
          </Suspense>
        </div>
      </foreignObject>
      {/* gold glint along the waterline, same language as the cliff edges */}
      <path
        d="M560 806 Q710 794 860 802 Q1010 812 1160 804 Q1260 799 1360 804 Q1405 806 1440 802"
        stroke="#c4a35c"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />

      {/* foreground cliff — anchored, no parallax */}
      <path
        d="M0 642 L120 634 L300 630 L480 633 L620 631
           L628 658 L608 690 L626 728 L598 778 L616 832 L590 900
           L0 900 Z"
        fill="#0f1e3a"
      />
      <path d="M0 642 L120 634 L300 630 L480 633 L618 631" stroke="#c4a35c" strokeWidth="2.5" fill="none" opacity="0.3" />
      <path d="M620 631 L628 658 L608 690" stroke="#c4a35c" strokeWidth="2" fill="none" opacity="0.2" />
      <g stroke="#c4a35c" strokeWidth="1.2" fill="none" opacity="0.07">
        <path d="M520 660 q-30 40 -10 90" />
        <path d="M430 650 q20 60 -8 120" />
        <path d="M250 648 q-16 50 4 110" />
      </g>

      {/* the kid, sitting off the edge */}
      <g>
        <rect x="556" y="616" width="17" height="16" rx="5" fill="#0a1526" />
        <path d="M560 617 q4 -6 9 0" stroke="#0a1526" strokeWidth="2.5" fill="none" />
        <path d="M588 598 Q582 614 584 632 L608 632 Q612 612 606 598 Q597 591 588 598 Z" fill="#0a1526" />
        <circle cx="600" cy="583" r="11" fill="#0a1526" />
        <path d="M590 604 L566 630" stroke="#0a1526" strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx="565" cy="631" r="3.5" fill="#0a1526" />
        <path d="M606 606 L615 621 L623 628" stroke="#0a1526" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M594 632 L624 640 L622 668 L629 671" stroke="#0a1526" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M588 632 L618 644 L612 674 L618 677" stroke="#0a1526" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* laptop on the lap, screen glowing */}
        <path d="M607 630 L633 636 L632 641 L606 635 Z" fill="#0a1526" />
        <path d="M630 638 L640 615 L645 617 L635 640 Z" fill="#16243e" />
        <path d="M632 636 L640 618 L643 619 L635 637 Z" fill="#f5efdf" opacity="0.9" />
        <circle cx="638" cy="627" r="13" fill="#f5efdf" style={{ animation: 'screen-flicker 5s ease-in-out infinite' }} />
        <circle cx="638" cy="627" r="6" fill="#f5efdf" opacity="0.22" />
        <path d="M608 575 a11 11 0 0 1 3 12" stroke="#c4a35c" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M606 598 q6 4 6 11" stroke="#c4a35c" strokeWidth="2" fill="none" opacity="0.35" />
      </g>
    </svg>
  )
}
