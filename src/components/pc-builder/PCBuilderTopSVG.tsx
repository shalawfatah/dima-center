import styles from '@/styles/pc_builder_section.module.css'

export default function PCBuilderTopSVG() {
  return (
    <svg
      aria-hidden="true"
      className={styles.grid}
      viewBox="0 0 800 120"
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id="pcb-grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M30 0 L0 0 0 30" fill="none" stroke="#ffb83c" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="800" height="120" fill="url(#pcb-grid)" />
    </svg>
  )
}
