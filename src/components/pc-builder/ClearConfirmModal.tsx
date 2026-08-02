import {
  clearConfirmBody,
  clearConfirmCancel,
  clearConfirmTitle,
  clearConfirmYes,
  pickLocale,
} from '@/utils/pc_builder_translations'
import styles from '@/styles/pc_builder.module.css'

interface ClearConfirmModalProps {
  currentLocale: string
  isRtl: boolean
  fontFam?: string
  titleColor?: string
  bodyColor?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ClearConfirmModal({
  currentLocale,
  isRtl,
  fontFam,
  titleColor,
  bodyColor,
  onConfirm,
  onCancel,
}: ClearConfirmModalProps) {
  // Use provided colors or fallbacks
  const headingColor = titleColor || '#000000'
  const textColor = bodyColor || '#333333'

  return (
    <div
      className={styles['pc-builder-confirm-overlay']}
      onClick={onCancel}
      style={
        {
          '--confirm-heading-color': headingColor,
          '--confirm-body-color': textColor,
          '--confirm-font': fontFam || 'inherit',
        } as React.CSSProperties
      }
    >
      <div
        className={styles['pc-builder-confirm-box']}
        onClick={(e) => e.stopPropagation()}
        style={{
          fontFamily: 'var(--confirm-font)',
        }}
      >
        <h4
          className={styles['pc-builder-confirm-heading']}
          style={{
            color: 'var(--confirm-heading-color)',
          }}
        >
          {pickLocale(clearConfirmTitle, currentLocale)}
        </h4>
        <p
          className={styles['pc-builder-confirm-body']}
          style={{
            color: 'var(--confirm-body-color)',
          }}
        >
          {pickLocale(clearConfirmBody, currentLocale)}
        </p>
        <div
          className={styles['pc-builder-confirm-actions']}
          style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
        >
          <button
            type="button"
            onClick={onConfirm}
            className={`${styles['pc-builder-btn']} ${styles.clear} ${styles['pc-builder-confirm-btn']}`}
            style={{
              color: 'var(--confirm-body-color)',
            }}
          >
            {pickLocale(clearConfirmYes, currentLocale)}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={`${styles['pc-builder-btn']} ${styles.action} ${styles['pc-builder-confirm-btn']}`}
            style={{
              color: 'var(--confirm-body-color)',
            }}
          >
            {pickLocale(clearConfirmCancel, currentLocale)}
          </button>
        </div>
      </div>
    </div>
  )
}
