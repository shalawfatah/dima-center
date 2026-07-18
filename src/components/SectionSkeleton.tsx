import styles from './SectionSkeleton.module.css'

export default function SectionSkeleton({ cards = 5 }: { cards?: number }) {
  return (
    <section className={styles.wrapper}>
      <div className={styles.heading} />
      <div className={styles.row}>
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className={styles.card} />
        ))}
      </div>
    </section>
  )
}
