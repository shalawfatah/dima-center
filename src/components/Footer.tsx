'use client'

interface FooterProps {
  currentLocale: string
}

interface FooterTranslations {
  aboutTitle: string
  aboutDesc: string
  contactTitle: string
  addressLine1: string
  addressLine2: string
  phoneLabel: string
  policyTitle: string
  policyDesc: string
}

export default function Footer({ currentLocale }: FooterProps) {
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  const footerDictionary: Record<'en' | 'ar' | 'ckb', FooterTranslations> = {
    en: {
      aboutTitle: 'About Dima Center',
      aboutDesc:
        'Your premium destination for advanced computer hardware setups and power systems.',
      contactTitle: 'Location & Support',
      addressLine1: '📍 Salim Street, Sulaymaniyah - Next to City Star & Ali Namali Building',
      addressLine2: 'Opposite Ramada Hotel',
      phoneLabel: '📞 Phone: 0770 141 4269',
      policyTitle: 'Order Policy',
      policyDesc: '100% Cash on Delivery (COD) or instant In-Store Pickups.',
    },
    ar: {
      aboutTitle: 'حول مركز ديما',
      aboutDesc: 'متجرك المتكامل لقطع غيار الحاسوب المتطورة وأنظمة الطاقة البديلة.',
      contactTitle: 'الموقع والدعم',
      addressLine1: '📍 السليمانية، شارع سالم - بجانب سيتي ستار وبناية علي نملي',
      addressLine2: 'مقابل فندق رامادا',
      phoneLabel: '📞 رقم الموبايل: ٠٧٧٠ ١٤١ ٤٢٦٩',
      policyTitle: 'سياسة الطلبات',
      policyDesc: 'الدفع نقداً عند الاستلام أو الاستلام المباشر من داخل المتجر.',
    },
    ckb: {
      aboutTitle: 'دەربارەی سەنتەری دیما',
      aboutDesc: 'سەنتەری دابینکردنی باشترین پارچەی کۆمپیوتەر و سیستەمی وزە.',
      contactTitle: 'ناونیشان و پەیوەندی',
      addressLine1: '📍 سلێمانی، شەقامی سالم - تەنیشت سیتی ستار و بینایی عەلی نەمەلی',
      addressLine2: 'بەرامبەر هۆتێل رامادا',
      phoneLabel: '📞 ژ.موبایل: 0770 141 4269',
      policyTitle: 'یاسای کڕین',
      policyDesc: 'پارەدان لە کاتی گەیاندن یان وەرگرتن راستەوخۆ لە ناو سەنتەر.',
    },
  }

  const activeLocale = (
    footerDictionary[currentLocale as 'en' | 'ar' | 'ckb'] ? currentLocale : 'en'
  ) as 'en' | 'ar' | 'ckb'
  const t = footerDictionary[activeLocale]

  const isRegionalLocale = currentLocale === 'ar' || currentLocale === 'ckb'
  const headingFont = isRegionalLocale ? '"Rudaw", sans-serif' : 'system-ui, sans-serif'
  const regularFont = isRegionalLocale ? '"Sarchia", sans-serif' : 'system-ui, sans-serif'

  return (
    <>
      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .social-icon-link {
          color: #64748b;
          transition: color 0.2s, transform 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .social-icon-link:hover {
          color: #0070f3;
          transform: translateY(-2px);
        }
      `}</style>

      <footer
        style={{
          fontFamily: regularFont,
          background: '#f8f9fa',
          borderTop: '1px solid #eaeaea',
          padding: '3rem 1.5rem',
          marginTop: 'auto',
          fontSize: '14px',
          color: '#475569',
          textAlign: isRtl ? 'right' : 'left',
        }}
      >
        <div className="footer-grid">
          {/* About Segment */}
          <div>
            <h4
              style={{
                fontFamily: headingFont,
                color: '#0f172a',
                marginBottom: '0.75rem',
                fontWeight: '600',
              }}
            >
              {t.aboutTitle}
            </h4>
            <p style={{ lineHeight: '1.6', margin: '0 0 1.25rem 0' }}>{t.aboutDesc}</p>

            {/* Directionally Aware Social Links Layout */}
            <div
              style={{
                display: 'flex',
                gap: '1.25rem',
                flexDirection: isRtl ? 'row-reverse' : 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}
            >
              {/* Instagram */}
              <a
                href="https://www.instagram.com/dima_center/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-link"
                aria-label="Instagram"
              >
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/dima.center1/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-link"
                aria-label="Facebook"
              >
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@dimacenter"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-link"
                aria-label="TikTok"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.63 4.15 1.13 1.22 2.69 1.95 4.31 2.07v3.91c-1.84-.08-3.62-.74-5.07-1.89-.06-.05-.1-.09-.17-.15v6.52c-.01 2.37-.8 4.67-2.3 6.45-1.76 2.04-4.4 3.25-7.1 3.23-2.92.01-5.74-1.4-7.42-3.84-1.78-2.61-2-6.02-.58-8.77 1.43-2.73 4.34-4.5 7.4-4.45v3.97c-1.5-.12-3.05.51-3.92 1.76-.89 1.28-.86 3.09.07 4.31.96 1.24 2.61 1.84 4.15 1.5 1.51-.31 2.67-1.6 2.87-3.12.06-1.57.04-3.14.05-4.71v-11.4h.02z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Location Segment */}
          <div>
            <h4
              style={{
                fontFamily: headingFont,
                color: '#0f172a',
                marginBottom: '0.75rem',
                fontWeight: '600',
              }}
            >
              {t.contactTitle}
            </h4>
            <p style={{ lineHeight: '1.6', margin: '0 0 0.35rem 0' }}>{t.addressLine1}</p>
            <p
              style={{
                lineHeight: '1.6',
                margin: '0 0 0.5rem 0',
                paddingRight: isRtl ? '1.5rem' : '0',
                paddingLeft: isRtl ? '0' : '1.5rem',
                color: '#64748b',
              }}
            >
              {t.addressLine2}
            </p>
            <p
              style={{
                lineHeight: '1.6',
                margin: 0,
                fontWeight: '600',
                color: '#0f172a',
                direction: 'ltr',
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              {t.phoneLabel}
            </p>
          </div>

          {/* Policy Segment */}
          <div>
            <h4
              style={{
                fontFamily: headingFont,
                color: '#0f172a',
                marginBottom: '0.75rem',
                fontWeight: '600',
              }}
            >
              {t.policyTitle}
            </h4>
            <p style={{ lineHeight: '1.6', margin: 0 }}>{t.policyDesc}</p>
          </div>
        </div>

        {/* Bottom Bar Elements */}
        <div
          style={{
            fontFamily: regularFont,
            textAlign: 'center',
            marginTop: '3rem',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '1.5rem',
            fontSize: '12px',
            color: '#94a3b8',
          }}
        >
          © {new Date().getFullYear()} Dima Center. All rights reserved.
        </div>
        <div>
          Powered By{' '}
          <a
            href="https://ishtarstudio.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="agency-link"
          >
            Ishtar Studio
          </a>
        </div>
      </footer>
    </>
  )
}
