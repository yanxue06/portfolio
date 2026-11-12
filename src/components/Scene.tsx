/* The sunset cliff, drawn flat in the site's palette: cream sky, a gold sun
   sitting low over the far range, the land stepping toward the viewer in
   slate blues, and a navy sea carrying the sun's glitter. As the hero
   scrolls away the sun drops behind the range and its glitter goes out.
   The kid on the cliff keeps their laptop. */
import { m, useReducedMotion, useTransform, type MotionValue } from 'framer-motion'
import { useEffect, useState } from 'react'
import Flocks, { SUN } from './Flocks'

const GOLD = '#c4a35c'
const SUN_FILL = '#d9b56a'
const CREAM = '#f2ecde'
const NAVY = '#0f1e3a'
const KID = '#0a1526'

/* the land in planes, lightest (farthest) to darkest — solid tints, not navy
   at low opacity: navy over warm cream cancels out to flat grey */
const RANGE = '#bcc3d2'
const RIDGE = '#9ea9c0'
const SHORE = '#73829f'
const PINE = '#3d4c6c'
const SEA_TOP = '#3e5884'
const SEA_LOW = NAVY

/* the land runs on past the 1440 frame to 2880, for screens wider than
   8:5 (see useWide) */
const FAR_RANGE =
  'M0 655 L160 585 L330 650 L500 596 L660 648 L840 590 L1010 650 L1180 598 L1330 652 L1440 625 ' +
  'L1600 588 L1770 648 L1940 600 L2110 652 L2290 594 L2460 646 L2640 602 L2880 640 L2880 900 L0 900 Z'
const MID_RIDGE =
  'M0 780 Q200 742 420 768 Q640 790 860 756 Q1080 730 1260 762 Q1360 776 1440 758 ' +
  'Q1640 726 1860 760 Q2080 790 2300 754 Q2520 726 2700 760 Q2800 774 2880 756 L2880 900 L0 900 Z'
const SHORE_LINE =
  'M0 800 Q180 762 380 788 Q560 806 760 780 Q960 758 1140 786 Q1290 806 1440 778 ' +
  'Q1620 760 1820 786 Q2000 806 2200 780 Q2400 758 2580 786 Q2730 806 2880 780 L2880 900 L0 900 Z'
const WATERLINE =
  'M560 806 Q710 794 860 802 Q1010 812 1160 804 Q1260 799 1360 804 Q1405 806 1440 802 ' +
  'Q1590 794 1740 802 Q1890 812 2040 804 Q2190 796 2340 804 Q2490 812 2640 804 Q2760 798 2880 802'

const PINES = [
  'M1150 790 l11 -34 l11 34 z',
  'M1186 786 l13 -42 l13 42 z',
  'M1226 790 l10 -30 l10 30 z',
  'M1262 784 l14 -46 l14 46 z',
  'M1306 790 l11 -34 l11 34 z',
  'M1344 786 l12 -38 l12 38 z',
  'M2196 784 l12 -38 l12 38 z',
  'M2232 782 l14 -46 l14 46 z',
  'M2272 786 l10 -30 l10 30 z',
]

/* the sun's glitter path — narrow at the horizon, wider toward the viewer */
const GLITTER = [
  { y: 815, w: 34 },
  { y: 826, w: 52 },
  { y: 839, w: 40 },
  { y: 852, w: 72 },
  { y: 867, w: 58 },
  { y: 883, w: 92 },
]

/* loose cream glints across the rest of the water */
const GLINTS = [
  { x: 650, y: 832, w: 46, delay: 0 },
  { x: 1010, y: 845, w: 60, delay: 1.6 },
  { x: 1210, y: 823, w: 38, delay: 3.1 },
  { x: 720, y: 872, w: 54, delay: 2.2 },
  { x: 1130, y: 880, w: 70, delay: 0.8 },
  { x: 1330, y: 858, w: 44, delay: 3.8 },
  { x: 1560, y: 836, w: 50, delay: 2.7 },
  { x: 1820, y: 870, w: 64, delay: 1.1 },
  { x: 2100, y: 828, w: 44, delay: 3.4 },
  { x: 2380, y: 860, w: 58, delay: 0.4 },
  { x: 2650, y: 842, w: 48, delay: 2.0 },
]

/* the land always fills the bottom ~third of the hero, so the text column
   above it never runs into the cliff. up to 8:5 the scene is scaled to the
   hero's height and cropped at the sides (slice); past 8:5 slice would scale
   to the width and push the land up the screen, so the scene keeps the
   hero's height and runs on to the right instead (meet, left-anchored) */
const WIDE = '(min-aspect-ratio: 8/5)'

function useWide() {
  const [wide, setWide] = useState(() => window.matchMedia(WIDE).matches)
  useEffect(() => {
    const mq = window.matchMedia(WIDE)
    const sync = () => setWide(mq.matches)
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return wide
}

export default function Scene({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion()
  const wide = useWide()
  const sunY = useTransform(progress, [0, 0.55], [0, reduce ? 0 : 170])
  const glitterOpacity = useTransform(progress, [0, 0.3], [1, reduce ? 1 : 0])

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio={wide ? 'xMinYMax meet' : 'xMidYMax slice'}
      aria-hidden
    >
      <defs>
        <linearGradient id="horizonWash" x1="0" y1="300" x2="0" y2="660" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={GOLD} stopOpacity="0" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id="sunHalo">
          <stop offset="0%" stopColor={GOLD} stopOpacity="0.34" />
          <stop offset="55%" stopColor={GOLD} stopOpacity="0.1" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="valleyHaze" x1="0" y1="630" x2="0" y2="790" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={CREAM} stopOpacity="0" />
          <stop offset="100%" stopColor={CREAM} stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id="seaFill" x1="0" y1="800" x2="0" y2="900" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={SEA_TOP} />
          <stop offset="100%" stopColor={SEA_LOW} />
        </linearGradient>
      </defs>

      <rect x="-20" y="280" width="2920" height="400" fill="url(#horizonWash)" />

      {/* the sun is drawn before the range, so it sets behind it */}
      <m.g style={{ y: sunY }}>
        <circle cx={SUN.x} cy={SUN.y} r="170" fill="url(#sunHalo)" />
        <circle cx={SUN.x} cy={SUN.y} r="58" fill={SUN_FILL} />
      </m.g>

      <Flocks />

      <path d={FAR_RANGE} fill={RANGE} />
      <rect x="-20" y="630" width="2920" height="170" fill="url(#valleyHaze)" />
      <path d={MID_RIDGE} fill={RIDGE} />
      <path d={SHORE_LINE} fill={SHORE} />
      <g fill={PINE}>
        {PINES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      {/* the sea — flat bands, with the sun's glitter under it and a few
          cream glints that breathe */}
      <path d={`${WATERLINE} L2880 900 L560 900 Z`} fill="url(#seaFill)" />
      <path d={WATERLINE} stroke={CREAM} strokeWidth="1.5" fill="none" opacity="0.35" />
      <m.g style={{ opacity: glitterOpacity }} stroke={SUN_FILL} strokeWidth="3" strokeLinecap="round">
        {GLITTER.map((row) => (
          <path key={row.y} d={`M${SUN.x - row.w / 2} ${row.y} h${row.w}`} />
        ))}
      </m.g>
      <g stroke={CREAM} strokeWidth="1.5" strokeLinecap="round">
        {GLINTS.map((g) => (
          <path
            key={`${g.x}-${g.y}`}
            d={`M${g.x} ${g.y} h${g.w}`}
            className="glint"
            style={{ animationDelay: `${g.delay}s` }}
          />
        ))}
      </g>

      {/* foreground cliff — anchored, no parallax */}
      <path
        d="M0 642 L120 634 L300 630 L480 633 L620 631
           L628 658 L608 690 L626 728 L598 778 L616 832 L590 900
           L0 900 Z"
        fill={NAVY}
      />
      <path d="M0 642 L120 634 L300 630 L480 633 L618 631" stroke={GOLD} strokeWidth="2.5" fill="none" opacity="0.3" />
      <path d="M620 631 L628 658 L608 690" stroke={GOLD} strokeWidth="2" fill="none" opacity="0.2" />
      <g stroke={GOLD} strokeWidth="1.2" fill="none" opacity="0.07">
        <path d="M520 660 q-30 40 -10 90" />
        <path d="M430 650 q20 60 -8 120" />
        <path d="M250 648 q-16 50 4 110" />
      </g>

      {/* the kid, sitting off the edge */}
      <g>
        <rect x="556" y="616" width="17" height="16" rx="5" fill={KID} />
        <path d="M560 617 q4 -6 9 0" stroke={KID} strokeWidth="2.5" fill="none" />
        <path d="M588 598 Q582 614 584 632 L608 632 Q612 612 606 598 Q597 591 588 598 Z" fill={KID} />
        <circle cx="600" cy="583" r="11" fill={KID} />
        <path d="M590 604 L566 630" stroke={KID} strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx="565" cy="631" r="3.5" fill={KID} />
        <path d="M606 606 L615 621 L623 628" stroke={KID} strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M594 632 L624 640 L622 668 L629 671" stroke={KID} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M588 632 L618 644 L612 674 L618 677" stroke={KID} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* laptop on the lap, screen glowing */}
        <path d="M607 630 L633 636 L632 641 L606 635 Z" fill={KID} />
        <path d="M630 638 L640 615 L645 617 L635 640 Z" fill="#16243e" />
        <path d="M632 636 L640 618 L643 619 L635 637 Z" fill="#f5efdf" opacity="0.9" />
        <circle cx="638" cy="627" r="13" fill="#f5efdf" style={reduce ? { opacity: 0.12 } : { animation: 'screen-flicker 5s ease-in-out infinite' }} />
        <circle cx="638" cy="627" r="6" fill="#f5efdf" opacity="0.22" />
        <path d="M608 575 a11 11 0 0 1 3 12" stroke={GOLD} strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M606 598 q6 4 6 11" stroke={GOLD} strokeWidth="2" fill="none" opacity="0.35" />
      </g>
    </svg>
  )
}
