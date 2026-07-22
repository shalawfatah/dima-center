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
  fontFam: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ClearConfirmModal({
  currentLocale,
  isRtl,
  fontFam,
  onConfirm,
  onCancel,
}: ClearConfirmModalProps) {
  return (
    <div className={styles['pc-builder-confirm-overlay']} onClick={onCancel}>
      <div
        className={styles['pc-builder-confirm-box']}
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: fontFam }}
      >
        <h4 className={styles['pc-builder-confirm-heading']}>
          {pickLocale(clearConfirmTitle, currentLocale)}
        </h4>
        <p className={styles['pc-builder-confirm-body']}>
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
          >
            {pickLocale(clearConfirmYes, currentLocale)}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={`${styles['pc-builder-btn']} ${styles.action} ${styles['pc-builder-confirm-btn']}`}
          >
            {pickLocale(clearConfirmCancel, currentLocale)}
          </button>
        </div>
      </div>
    </div>
  )
}
