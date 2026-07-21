import styles from '@/styles/product_carousel.module.css'

interface NextBtnProps {
  scrollNext: () => void
  isRtl: boolean
}

export default function NextBtn({ scrollNext, isRtl }: NextBtnProps) {
  return (
    <button
      className={`${styles['pc-arrow']} ${styles['pc-arrow-next']}`}
      onClick={scrollNext}
      aria-label="Next slides"
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
          d={isRtl ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
        />
      </svg>
    </button>
  )
}
