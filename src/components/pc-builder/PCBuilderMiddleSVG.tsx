import styles from '@/styles/pc_builder_section.module.css'

export default function PCbuilderMiddleSVG() {
  return (
    <svg viewBox="0 0 300 100" width="100%" height="100%" className={styles.visualSvg}>
      <rect
        x="130"
        y="25"
        width="50"
        height="50"
        fill="none"
        stroke="#ffb83c"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <rect
        x="140"
        y="35"
        width="30"
        height="30"
        fill="rgba(255,184,60,0.06)"
        stroke="#ffb83c"
        strokeWidth="1"
      />

      <path d="M130 40 H70 V15" fill="none" stroke="#ffb83c" strokeWidth="1" opacity="0.3" />
      <path d="M130 60 H60 V85" fill="none" stroke="#ffb83c" strokeWidth="1" opacity="0.3" />
      <path d="M180 40 H240 V20" fill="none" stroke="#ffb83c" strokeWidth="1" opacity="0.3" />
      <path d="M180 60 H230 V80" fill="none" stroke="#ffb83c" strokeWidth="1" opacity="0.3" />

      <circle className={styles.node} cx="70" cy="15" r="2.5" fill="#ffb83c" />
      <circle className={styles.node} cx="60" cy="85" r="2.5" fill="#ffb83c" />
      <circle className={styles.node} cx="240" cy="20" r="2.5" fill="#ffb83c" />
      <circle className={styles.node} cx="230" cy="80" r="2.5" fill="#ffb83c" />
    </svg>
  )
}
