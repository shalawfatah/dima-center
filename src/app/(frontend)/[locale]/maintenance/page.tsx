import Image from 'next/image'

export default function MaintenancePage() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100vh',
        width: '100vw',
        overflowY: 'auto',
        backgroundColor: '#0b0f19',
        color: '#e2e8f0',
        padding: '2rem 1rem',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Header / Logo */}
      <header
        style={{
          zIndex: 10,
          display: 'flex',
          width: '100%',
          maxWidth: '400px',
          justifyContent: 'center',
          paddingTop: '0.5rem',
        }}
      >
        <Image
          src="/media/logo.png"
          alt="Dima Logo"
          width={150}
          height={48}
          priority
          style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
        />
      </header>

      {/* Main Content */}
      <main
        style={{
          zIndex: 10,
          margin: 'auto 0',
          display: 'flex',
          width: '100%',
          maxWidth: '450px',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '1rem 0',
        }}
      >
        {/* GIF Container - Controlled ~400x280px sizing */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '480px',
            height: '400px',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '1.5rem',
          }}
        >
          <Image
            src="/media/maintenance.gif"
            alt="Maintenance Workflow"
            fill
            unoptimized
            style={{ objectFit: 'contain', borderRadius: '16px' }}
          />
        </div>

        <div style={{ width: '100%' }}>
          {/* English */}
          <div style={{ marginBottom: '1rem' }}>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#ffffff',
                margin: 0,
                letterSpacing: '-0.025em',
              }}
            >
              Under Maintenance
            </h1>
          </div>

          {/* Divider */}
          <div
            style={{
              width: '40px',
              height: '1px',
              background: 'linear-gradient(to right, transparent, #334155, transparent)',
              margin: '0.75rem auto',
            }}
          />

          {/* Kurdish (RTL) */}
          <div dir="rtl" style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.95rem', color: '#cbd5e1', margin: 0 }}>
              وێبسایتەکەمان بەمزوانە دەکەوێتە کار
            </p>
          </div>

          {/* Divider */}
          <div
            style={{
              width: '40px',
              height: '1px',
              background: 'linear-gradient(to right, transparent, #334155, transparent)',
              margin: '0.75rem auto',
            }}
          />

          {/* Arabic (RTL) */}
          <div dir="rtl">
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#60a5fa',
                margin: '0 0 0.25rem 0',
              }}
            >
              تحت الصيانة
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#cbd5e1', margin: 0 }}>
              موقعنا الإلكتروني سيكون متاحاً قريباً جداً
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          zIndex: 10,
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#64748b',
          letterSpacing: '0.025em',
        }}
      >
        &copy; {new Date().getFullYear()} Dima. All rights reserved.
      </footer>
    </div>
  )
}
