/* The old sunset cliff scene, redrawn in the site's ink: navy ranges on
   cream paper, and the sun is the asterisk — gold, spinning slowly, and
   sinking behind the far ridge as the pinned hero is scrolled. The kid on
   the cliff keeps their laptop. Layers scrub at different rates for depth. */
import { motion, useReducedMotion, type MotionValue, useTransform } from 'framer-motion'
import Flocks from './Flocks'

export default function Scene({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion()
  const sunY = useTransform(progress, [0.05, 0.5], [0, reduce ? 0 : 135])
  const sunRotate = useTransform(progress, [0, 0.6], [0, reduce ? 0 : 130])
  const glowOpacity = useTransform(progress, [0.05, 0.5], [1, reduce ? 1 : 0.4])
  const skyY = useTransform(progress, [0, 0.6], [0, reduce ? 0 : 46])
  const cloudY = useTransform(progress, [0, 0.6], [0, reduce ? 0 : 34])
  const farY = useTransform(progress, [0, 0.6], [0, reduce ? 0 : 26])
  const midY = useTransform(progress, [0, 0.6], [0, reduce ? 0 : 14])

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
          <stop offset="0%" stopColor="#c4a35c" stopOpacity="0.5" />
          <stop offset="45%" stopColor="#c4a35c" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#c4a35c" stopOpacity="0" />
        </radialGradient>
        <filter id="soften" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* sky wash + the asterisk-sun — slowest layer */}
      <motion.g style={{ y: skyY }}>
        <rect x="-20" y="240" width="1480" height="430" fill="url(#horizonWash)" />
        <motion.circle cx="900" cy="600" r="170" fill="url(#sunGlow)" style={{ y: sunY, opacity: glowOpacity }} />
        <motion.g style={{ y: sunY }}>
          <motion.g style={{ rotate: sunRotate, transformBox: 'fill-box', transformOrigin: 'center' } as never}>
            <g stroke="#c4a35c" strokeWidth="7" strokeLinecap="round">
              <line x1="830" y1="600" x2="970" y2="600" />
              <line x1="865" y1="539.5" x2="935" y2="660.5" />
              <line x1="865" y1="660.5" x2="935" y2="539.5" />
            </g>
            <circle cx="900" cy="600" r="11" fill="#c4a35c" />
          </motion.g>
        </motion.g>
      </motion.g>

      {/* air — clouds and birds */}
      <motion.g style={{ y: cloudY }}>
        {/* clouds stay right of the text block — blurred navy on cream
            reads as smudges when they sit under the name */}
        <g filter="url(#soften)" fill="#16243e">
          <ellipse cx="850" cy="205" rx="120" ry="10" opacity="0.06" />
          <ellipse cx="1170" cy="320" rx="160" ry="12" opacity="0.08" />
          <ellipse cx="1240" cy="345" rx="90" ry="8" opacity="0.09" />
        </g>
        <Flocks />
      </motion.g>

      {/* far range */}
      <motion.g style={{ y: farY }}>
        <path
          d="M0 655 L160 585 L330 650 L500 596 L660 648 L840 590 L1010 650 L1180 598 L1330 652 L1440 625 L1440 900 L0 900 Z"
          fill="#16243e"
          opacity="0.3"
        />
        <rect y="580" width="1440" height="120" fill="#c4a35c" opacity="0.05" />
      </motion.g>

      {/* mid hills + pines */}
      <motion.g style={{ y: midY }}>
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
      </motion.g>

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
