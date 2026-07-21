import styles from '@/styles/product_carousel.module.css'

interface PrevBtnProps {
  scrollPrev: () => void
  isRtl: boolean
}

export default function PrevBtn({ scrollPrev, isRtl }: PrevBtnProps) {
  return (
    <button
      className={`${styles['pc-arrow']} ${styles['pc-arrow-prev']}`}
      onClick={scrollPrev}
      aria-label="Previous slides"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={isRtl ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
        />
      </svg>
    </button>
  )
}
