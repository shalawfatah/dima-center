'use client'

import Link from 'next/link'

interface FullBuildsSectionProps {
  currentLocale: string
  isRtl: boolean
}

const COPY: Record<string, { eyebrow: string; heading: string; cta: string; chips: string[] }> = {
  en: {
    eyebrow: 'PRE-MADE BUILDS',
    heading: 'Explore Full Builds',
    cta: 'View Builds',
    chips: ['Curated setups', 'Battle-tested'],
  },
  ar: {
    eyebrow: 'تجميعات كاملة',
    heading: 'استكشف التجميعات الجاهزة',
    cta: 'تصفح التجميعات',
    chips: ['تجهيزات منسقة', 'مجرّبة ومعتمدة'],
  },
  ckb: {
    eyebrow: 'بیڵدی تەواو',
    heading: 'بیڵدە ئامادەکراوەکان ببینە',
    cta: 'بیڵدەکان ببینە',
    chips: ['ڕێکخستنی تایبەت', 'تاقیکراوەتەوە'],
  },
}

export default function FullBuildsSection({ currentLocale, isRtl }: FullBuildsSectionProps) {
  const isRegionalLocale = currentLocale === 'ar' || currentLocale === 'ckb'
  const titleFont = isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit'
  const textFont = isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit'
  const copy = COPY[currentLocale] || COPY.en

  return (
    <section
      className="fb-section"
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #ffb83c 0%, #f59e0b 100%)',
        border: '1px solid rgba(15, 23, 42, 0.1)',
        borderRadius: '.4rem',
        height: '100%', // Crucial for matching height of sibling
      }}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <style>{`
        .fb-section {
          width: 100%;
        }

        @keyframes fb-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.9; }
        }
        .fb-indicator { animation: fb-pulse 2s ease-in-out infinite; }

        .fb-cta {
          transition: background 0.2s ease, transform 0.1s ease;
        }
        .fb-cta:hover {
          background: #1e293b !important;
          transform: translateY(-1px);
        }

        .fb-wrapper {
          display: flex;
          align-items: center;
          flex-direction: row;
          width: 100%;
          height: 100%;
        }
        @media (max-width: 768px) {
          .fb-wrapper { flex-direction: column; align-items: stretch; }
          .fb-visual { width: 100% !important; min-height: 60px !important; max-height: 60px !important; }
        }
      `}</style>

      {/* Subtle Grid Pattern */}
      <svg
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.08 }}
        viewBox="0 0 800 120"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="fb-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M30 0 L0 0 0 30" fill="none" stroke="#0f172a" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="800" height="120" fill="url(#fb-grid)" />
      </svg>

      <div className="fb-wrapper" style={{ position: 'relative', zIndex: 1 }}>
        {/* Content Side */}
        <div
          style={{
            flex: '1 1 75%',
            padding: '0.75rem 1.5rem',
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
              marginBottom: '4px',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontFamily: textFont,
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#0f172a',
                background: 'rgba(15, 23, 42, 0.08)',
                border: '1px solid rgba(15, 23, 42, 0.15)',
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
                  fontWeight: 600,
                  color: 'rgba(15, 23, 42, 0.6)',
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
                fontSize: 'clamp(18px, 2vw, 24px)',
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {copy.heading}
            </h2>

            <Link
              href={`/${currentLocale}/builds`}
              className="fb-cta"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: textFont,
                fontSize: '13px',
                fontWeight: 700,
                color: '#ffb83c',
                background: '#0f172a',
                borderRadius: '8px',
                padding: '6px 16px',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
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

        {/* Chassis Tower Visual (Darker Stroked for contrast) */}
        <div
          className="fb-visual"
          style={{
            flex: '1 1 25%',
            minHeight: '65px',
            maxHeight: '75px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <svg viewBox="0 0 300 100" width="100%" height="100%" style={{ display: 'block' }}>
            <g opacity="0.9">
              {/* Box 1 (Left Case) */}
              <rect
                x="110"
                y="20"
                width="32"
                height="60"
                rx="3"
                fill="none"
                stroke="#0f172a"
                strokeWidth="1.5"
              />
              <line
                x1="116"
                y1="28"
                x2="136"
                y2="28"
                stroke="#0f172a"
                strokeWidth="1.2"
                opacity="0.4"
              />
              <line
                x1="116"
                y1="36"
                x2="136"
                y2="36"
                stroke="#0f172a"
                strokeWidth="1.2"
                opacity="0.4"
              />
              <rect
                x="116"
                y="48"
                width="20"
                height="24"
                rx="1.5"
                fill="rgba(15, 23, 42, 0.08)"
                stroke="#0f172a"
                strokeWidth="1.2"
              />

              {/* Box 2 (Right Case) */}
              <rect
                x="158"
                y="20"
                width="32"
                height="60"
                rx="3"
                fill="none"
                stroke="#0f172a"
                strokeWidth="1.5"
              />
              <line
                x1="164"
                y1="28"
                x2="184"
                y2="28"
                stroke="#0f172a"
                strokeWidth="1.2"
                opacity="0.4"
              />
              <line
                x1="164"
                y1="36"
                x2="184"
                y2="36"
                stroke="#0f172a"
                strokeWidth="1.2"
                opacity="0.4"
              />
              <rect
                x="164"
                y="48"
                width="20"
                height="24"
                rx="1.5"
                fill="rgba(15, 23, 42, 0.08)"
                stroke="#0f172a"
                strokeWidth="1.2"
              />

              {/* Status Indicators */}
              <circle className="fb-indicator" cx="126" cy="60" r="1.5" fill="#0f172a" />
              <circle className="fb-indicator" cx="174" cy="60" r="1.5" fill="#0f172a" />
            </g>

            {/* Connecting depth lines */}
            <path
              d="M142 30 H158"
              stroke="#0f172a"
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.3"
            />
            <path
              d="M142 70 H158"
              stroke="#0f172a"
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.3"
            />
          </svg>
        </div>
      </div>
    </section>
  )
}
