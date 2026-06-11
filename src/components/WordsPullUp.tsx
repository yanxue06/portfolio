import { motion, useInView } from 'framer-motion'
import { useRef, type CSSProperties } from 'react'

interface WordsPullUpProps {
  text: string
  className?: string
  style?: CSSProperties
  showAsterisk?: boolean
}

export default function WordsPullUp({ text, className = '', style, showAsterisk = false }: WordsPullUpProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const words = text.split(' ')

  return (
    <div ref={ref} className={className} style={style}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="relative inline-block"
          initial={{ y: 20, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: i * 0.08, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {word}
          {showAsterisk && i === words.length - 1 && (
            <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em] leading-none">*</span>
          )}
          {i < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </div>
  )
}
