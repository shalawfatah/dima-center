'use client'

import Link from 'next/link'

interface PCBuilderSectionProps {
  currentLocale: string
  isRtl: boolean
}

const COPY: Record<string, { eyebrow: string; heading: string; cta: string; chips: string[] }> = {
  en: {
    eyebrow: 'CUSTOM BUILDS',
    heading: 'Build Your Dream PC',
    cta: 'Start Building',
    chips: ['Compatibility checked', 'Expert picks'],
  },
  ar: {
    eyebrow: 'تجميعات مخصصة',
    heading: 'جمّع حاسوبك الخاص',
    cta: 'ابدأ التجميع',
    chips: ['توافق مضمون', 'اختيارات الخبراء'],
  },
  ckb: {
    eyebrow: 'بەستنی تایبەت',
    heading: 'کۆمپیوتەرەکەت ببەستە',
    cta: 'دەست بکە بە بەستنەوە',
    chips: ['گونجاوی پشتڕاستکراوە', 'هەڵبژاردەی شارەزایان'],
  },
}

export default function PCBuilderSection({ currentLocale, isRtl }: PCBuilderSectionProps) {
  const isRegionalLocale = currentLocale === 'ar' || currentLocale === 'ckb'
  const titleFont = isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit'
  const textFont = isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit'
  const copy = COPY[currentLocale] || COPY.en

  return (
    <section
      className="pcb-section"
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #14213d 100%)',
        border: '1px solid rgba(255,184,60,0.25)',
        margin: '0',
      }}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <style>{`
  .pcb-section {
    width: 40%;
  }

  @media (max-width: 1000px) {
    .pcb-section {
      width: 100%;
    }
  }
        @keyframes pcb-pulse {
          0%, 100% { opacity: 0.35; r: 2.5; }
          50% { opacity: 1; r: 4.5; }
        }
        .pcb-node { animation: pcb-pulse 2.4s ease-in-out infinite; }
        .pcb-node:nth-child(2) { animation-delay: 0.4s; }
        .pcb-node:nth-child(3) { animation-delay: 0.8s; }
        .pcb-node:nth-child(4) { animation-delay: 1.2s; }

        .pcb-cta {
          transition: background 0.2s ease, transform 0.1s ease;
        }
        .pcb-cta:hover {
          background: #ffcb6b !important;
          transform: translateY(-1px);
        }

        .pcb-wrapper {
          display: flex;
          align-items: center;
          flex-direction: row;
        }
        @media (max-width: 768px) {
          .pcb-wrapper { flex-direction: column; align-items: stretch; }
          .pcb-visual { width: 100% !important; min-height: 80px !important; max-height: 80px !important; }
        }
      `}</style>

      {/* Grid Texture */}
      <svg
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.05 }}
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

      <div className="pcb-wrapper" style={{ position: 'relative', zIndex: 1 }}>
        {/* Content Side */}
        <div
          style={{
            flex: '1 1 65%',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: isRtl ? 'right' : 'left',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '6px',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontFamily: textFont,
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#ffb83c',
                background: 'rgba(255,184,60,0.1)',
                border: '1px solid rgba(255,184,60,0.25)',
                borderRadius: '0',
                padding: '2px 8px',
              }}
            >
              {copy.eyebrow}
            </span>

            {/* Inline Meta Chips */}
            {copy.chips.map((chip) => (
              <span
                key={chip}
                style={{
                  fontFamily: textFont,
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#64748b',
                }}
              >
                • {chip}
              </span>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <h2
              style={{
                fontFamily: titleFont,
                fontSize: 'clamp(18px, 2.5vw, 32px)',
                fontWeight: 800,
                color: '#fff',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {copy.heading}
            </h2>

            <Link
              href={`/${currentLocale}/pc-builder`}
              className="pcb-cta"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: textFont,
                fontSize: '13px',
                fontWeight: 700,
                color: '#0f172a',
                background: '#ffb83c',
                borderRadius: '8px', // 💎 Beautiful rounded edges button restored
                padding: '8px 18px',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              {copy.cta}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }}
              >
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Micro Visual Side */}
        <div
          className="pcb-visual"
          style={{
            flex: '1 1 35%',
            minHeight: '100px',
            maxHeight: '110px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <svg viewBox="0 0 300 100" width="100%" height="100%" style={{ display: 'block' }}>
            {/* CPU frame */}
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

            {/* Simplified trace layout */}
            <path d="M130 40 H70 V15" fill="none" stroke="#ffb83c" strokeWidth="1" opacity="0.3" />
            <path d="M130 60 H60 V85" fill="none" stroke="#ffb83c" strokeWidth="1" opacity="0.3" />
            <path d="M180 40 H240 V20" fill="none" stroke="#ffb83c" strokeWidth="1" opacity="0.3" />
            <path d="M180 60 H230 V80" fill="none" stroke="#ffb83c" strokeWidth="1" opacity="0.3" />

            <circle className="pcb-node" cx="70" cy="15" r="2.5" fill="#ffb83c" />
            <circle className="pcb-node" cx="60" cy="85" r="2.5" fill="#ffb83c" />
            <circle className="pcb-node" cx="240" cy="20" r="2.5" fill="#ffb83c" />
            <circle className="pcb-node" cx="230" cy="80" r="2.5" fill="#ffb83c" />
          </svg>
        </div>
      </div>
    </section>
  )
}
