export default function AnalyticsPage() {
  return (
    <div style={{ padding: '2rem', height: '100vh', width: '100%', boxSizing: 'border-box' }}>
      <div
        style={{
          height: 'calc(100vh - 100px)',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h2
          style={{
            marginBottom: '1.5rem',
            fontSize: '1.75rem',
            fontWeight: 600,
            color: 'var(--theme-elevation-800)',
          }}
        >
          Website Analytics
        </h2>
        <iframe
          src="https://analytics.dima.center/share/jd2bcJljYwUbB9g1"
          style={{
            width: '100%',
            flex: 1,
            border: 'none',
            borderRadius: '8px',
            background: 'var(--theme-elevation-50)',
          }}
          title="Umami Analytics"
        />
      </div>
    </div>
  )
}
