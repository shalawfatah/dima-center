export default function AnalyticsDashboard() {
  return (
    <div style={{ padding: 'calc(var(--base) * 2)', height: 'calc(100vh - 80px)', width: '100%' }}>
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
        <iframe
          src="https://analytics.dima.center/share/jd2bcJljYwUbB9g1"
          style={{
            width: '100%',
            flex: 1,
            border: 'none',
            borderRadius: '8px',
            background: 'var(--theme-elevation-50)',
          }}
          title="Dima Analytics"
        />
      </div>
    </div>
  )
}
