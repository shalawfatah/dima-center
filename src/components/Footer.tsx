interface FooterProps {
  currentLocale: string
}

export default function Footer({ currentLocale }: FooterProps) {
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

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
      `}</style>

      <footer
        style={{
          background: '#f8f9fa',
          borderTop: '1px solid #eaeaea',
          padding: '3rem 1.5rem',
          marginTop: 'auto', // Pushes footer to bottom if page content is short
          fontSize: '14px',
          color: '#555',
          textAlign: isRtl ? 'right' : 'left',
        }}
      >
        <div className="footer-grid">
          <div>
            <h4 style={{ color: '#000', marginBottom: '0.75rem', fontWeight: '600' }}>
              {currentLocale === 'ar'
                ? 'حول المركز'
                : currentLocale === 'ckb'
                  ? 'دەربارەی سەنتەر'
                  : 'About Nima Center'}
            </h4>
            <p style={{ lineHeight: '1.6', margin: 0 }}>
              {currentLocale === 'ar'
                ? 'متجرك المتكامل لقطع غيار الحاسوب المتطورة وأنظمة الطاقة البديلة.'
                : currentLocale === 'ckb'
                  ? 'سەنتەری دابینکردنی باشترین پارچەی کۆمپیوتەر و سیستەمی وزە.'
                  : 'Your premium destination for advanced computer hardware setups and power systems.'}
            </p>
          </div>

          <div>
            <h4 style={{ color: '#000', marginBottom: '0.75rem', fontWeight: '600' }}>
              {currentLocale === 'ar'
                ? 'الموقع والدعم'
                : currentLocale === 'ckb'
                  ? 'ناونیشان و پەیوەندی'
                  : 'Location & Support'}
            </h4>
            <p style={{ lineHeight: '1.6', margin: '0 0 0.5rem 0' }}>
              📍 Sulaymaniyah, Kurdistan Region, Iraq
            </p>
            <p style={{ lineHeight: '1.6', margin: 0 }}>📞 +964 (0) 770 XXX XXXX</p>
          </div>

          <div>
            <h4 style={{ color: '#000', marginBottom: '0.75rem', fontWeight: '600' }}>
              {currentLocale === 'ar'
                ? 'سياسة الطلبات'
                : currentLocale === 'ckb'
                  ? 'یاسای کڕین'
                  : 'Order Policy'}
            </h4>
            <p style={{ lineHeight: '1.6', margin: 0 }}>
              {currentLocale === 'ar'
                ? 'الدفع نقداً عند الاستلام أو الاستلام المباشر من داخل المتجر.'
                : currentLocale === 'ckb'
                  ? 'پارەدان لە کاتی گەیاندن یان وەرگرتن راستەوخۆ لە ناو سەنتەر.'
                  : '100% Cash on Delivery (COD) or instant In-Store Pickups.'}
            </p>
          </div>
        </div>

        <div
          style={{
            textAlign: 'center',
            marginTop: '3rem',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '1.5rem',
            fontSize: '12px',
            color: '#888',
          }}
        >
          © {new Date().getFullYear()} Nima Center. All rights reserved.
        </div>
      </footer>
    </>
  )
}
