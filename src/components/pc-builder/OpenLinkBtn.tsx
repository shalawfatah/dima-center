import styles from '@/styles/pc_builder.module.css'
import Link from 'next/link'

interface OpenLinkBtnProps {
  link: string
}

export default function OpenLinkBtn({ link }: OpenLinkBtnProps) {
  return (
    <div className={styles['pc-builder-inline-icons-group']}>
      <Link
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        title="Open Page"
        onClick={(e) => e.stopPropagation()}
        className={styles['pc-builder-icon-btn']}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#475569"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </Link>
    </div>
  )
}
