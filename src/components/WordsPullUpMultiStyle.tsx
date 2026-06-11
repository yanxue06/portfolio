import { motion, useInView } from 'framer-motion'
import { useRef, type CSSProperties } from 'react'

export interface StyledSegment {
  text: string
  className?: string
}

interface WordsPullUpMultiStyleProps {
  segments: StyledSegment[]
  className?: string
  style?: CSSProperties
}

export default function WordsPullUpMultiStyle({ segments, className = '', style }: WordsPullUpMultiStyleProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const words = segments.flatMap((segment) =>
    segment.text
      .split(' ')
      .filter(Boolean)
      .map((word) => ({ word, segClass: segment.className ?? '' })),
  )

  return (
    <div ref={ref} className={`inline-flex flex-wrap justify-center ${className}`} style={style}>
      {words.map(({ word, segClass }, i) => (
        <motion.span
          key={`${word}-${i}`}
          className={`inline-block ${segClass}`}
          initial={{ y: 20, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: i * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {word}
          {i < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </div>
  )
}
