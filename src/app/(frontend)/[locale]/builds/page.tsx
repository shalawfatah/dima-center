import Link from 'next/link'
import Image from 'next/image'
import { fallbackCatalog } from '@/utils/fallback_catalog'
import BringPartsButton from '@/components/BringPartsButton' // 👈 Import your new button

interface BuildsPageProps {
  params: Promise<{ locale: string }>
}

// 1. Fully Localized Copy Dictionary
const DICT: Record<
  string,
  {
    title: string
    subtitle: string
    specs: string
    viewBuild: string
    emptyState: string
    priceLabel: string
    badgePre: string
    bringParts: string // 👈 Added localized key for button fallback if needed
  }
> = {
  en: {
    title: 'Pre-configured Masterpieces',
    subtitle:
      'Explore elite battle-tested gaming rigs and workstations assembled by our hardware experts.',
    specs: 'Specifications',
    viewBuild: 'View Configuration Blueprint',
    emptyState: 'No custom builds available in this segment yet.',
    priceLabel: 'Estimated Value',
    badgePre: 'Expert Build',
    bringParts: 'Customize in Builder',
  },
  ar: {
    title: 'تحف فنية مسبقة الصنع',
    subtitle:
      'استكشف أجهزة الألعاب ومحطات العمل النخبوية المجربة والمعتمدة من قبل خبراء العتاد لدينا.',
    specs: 'المواصفات والقطع',
    viewBuild: 'عرض مخطط التجميعة',
    emptyState: 'لا توجد تجميعات مخصصة متاحة حاليًا.',
    priceLabel: 'القيمة التقديرية',
    badgePre: 'تجميعة خبراء',
    bringParts: 'تعديل التجميعة',
  },
  ckb: {
    title: 'ڕێکخستنە ئامادەکراوە بێهاوتاکان',
    subtitle:
      'تەماشای بەهێزترین کیسەکانی یاریکردن و کارکردن بکە کە لەلایەن شارەزایانمانەوە تاقیکراونەتەوە.',
    specs: 'مۆدیل و پارچەکان',
    viewBuild: 'سەیرکردنی پلانی بیڵدەکە',
    emptyState: 'هیچ بیڵدێکی ئامادەکراو لە ئێستادا بەردەست نییە.',
    priceLabel: 'نرخی خەمڵێندراو',
    badgePre: 'بیڵدی تایبەت',
    bringParts: 'دەستکاری بیڵد بکە',
  },
}

// 2. Structured Mock Source containing actual Database/Payload Product IDs
const MOCK_BUILDS = [
  {
    id: 'apex-dominator-v4',
    title: {
      en: 'Apex Dominator V4 Extreme',
      ar: 'أبيكس دومينيتور V4 الخارقة',
      ckb: 'ئەپێکس دۆمینیتۆر V4',
    },
    price: 3499,
    image: '/builds/apex-dominator.png',
    category: 'extreme',
    isHot: true,
    specs: {
      cpu: { name: 'AMD Ryzen 9 9950X', id: 'prod_cpu_9950x' }, // 👈 Added structural IDs
      gpu: { name: 'NVIDIA RTX 5090 32GB', id: 'prod_gpu_5090' },
      ram: { name: '64GB DDR5 6400MHz', id: 'prod_ram_64gb' },
      storage: { name: '4TB NVMe PCIe Gen 5', id: 'prod_storage_4tb' },
    },
  },
  {
    id: 'valkyrie-stream-pro',
    title: {
      en: 'Valkyrie Stream Pro',
      ar: 'فالكيري ستريم برو',
      ckb: 'ڤالکیری ستریم پرۆ',
    },
    price: 1899,
    image: '/builds/valkyrie-pro.png',
    category: 'gaming',
    isHot: false,
    specs: {
      cpu: { name: 'Intel Core i7-14700K', id: 'prod_cpu_14700k' },
      gpu: { name: 'NVIDIA RTX 4070 Ti Super', id: 'prod_gpu_4070tis' },
      ram: { name: '32GB DDR5 6000MHz', id: 'prod_ram_32gb' },
      storage: { name: '2TB NVMe SSD', id: 'prod_storage_2tb' },
    },
  },
  {
    id: 'cyberpunk-neon-mini',
    title: {
      en: 'Cyberpunk Neon Mini-ITX',
      ar: 'سايبربانك نيون ميني',
      ckb: 'سایبەرپانک نیۆن مینی',
    },
    price: 1450,
    image: '/builds/cyberpunk-mini.png',
    category: 'compact',
    isHot: false,
    specs: {
      cpu: { name: 'AMD Ryzen 7 7800X3D', id: 'prod_cpu_7800x3d' },
      gpu: { name: 'NVIDIA RTX 4070 Super', id: 'prod_gpu_4070s' },
      ram: { name: '32GB DDR5 5600MHz', id: 'prod_ram_32gb_5600' },
      storage: { name: '1TB NVMe SSD', id: 'prod_storage_1tb' },
    },
  },
]

export default async function BuildsPage({ params }: BuildsPageProps) {
  const { locale } = await params
  const currentLocale = ['en', 'ar', 'ckb'].includes(locale) ? locale : 'en'

  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'
  const t = DICT[currentLocale]

  const fontFam = isRtl
    ? '"Rudaw", "Inter", "Noto Sans Arabic", -apple-system, sans-serif'
    : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

  return (
    <main
      className="builds-container"
      style={
        {
          '--font-family': fontFam,
          direction: isRtl ? 'rtl' : 'ltr',
          textAlign: isRtl ? 'right' : 'left',
        } as React.CSSProperties
      }
    >
      <style>{`
        .builds-container {
          min-height: 100vh;
          background-color: #0f172a;
          color: #f1f5f9;
          padding: 3rem 1.5rem;
          font-family: var(--font-family);
        }

        .builds-header {
          max-width: 1200px;
          margin: 0 auto 3rem auto;
          border-bottom: 1px solid rgba(241, 245, 249, 0.1);
          padding-bottom: 2rem;
        }

        .builds-title {
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 800;
          color: #ffb83c;
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }

        .builds-subtitle {
          font-size: clamp(0.95rem, 1.5vw, 1.15rem);
          color: #94a3b8;
          max-width: 700px;
          line-height: 1.6;
        }

        .builds-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .build-card {
          background: #1e293b;
          border: 1px solid rgba(241, 245, 249, 0.08);
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          color: inherit;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), 
                      box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), 
                      border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .build-card:hover {
          transform: translateY(-6px);
          border-color: rgba(255, 184, 60, 0.4);
          box-shadow: 0 12px 24px -10px rgba(255, 184, 60, 0.15);
        }

        .card-visual-wrapper {
          position: relative;
          width: 100%;
          height: 220px;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid rgba(241, 245, 249, 0.05);
        }

        .fallback-visual-svg {
          width: 60%;
          height: 60%;
          opacity: 0.15;
          color: #ffb83c;
          transition: transform 0.3s ease;
        }

        .build-card:hover .fallback-visual-svg {
          transform: scale(1.05) rotate(1deg);
          opacity: 0.25;
        }

        .card-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: #ffb83c;
          color: #0f172a;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 4px 8px;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }

        .card-content {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .card-title-link {
          text-decoration: none;
          color: #fff;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 750;
          margin-bottom: 1rem;
          line-height: 1.3;
          transition: color 0.2s ease;
        }

        .card-title:hover {
          color: #ffb83c;
        }

        .spec-list {
          list-style: none;
          padding: 0;
          margin: 0 0 1.5rem 0;
          font-size: 13px;
          color: #94a3b8;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .spec-item {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px dashed rgba(241, 245, 249, 0.05);
          padding-bottom: 4px;
        }

        .spec-label {
          color: #64748b;
        }

        .spec-value {
          font-weight: 600;
          color: #cbd5e1;
        }

        .card-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(241, 245, 249, 0.05);
          padding-top: 1rem;
          gap: 12px;
        }

        .price-box {
          display: flex;
          flex-direction: column;
          min-width: 80px;
        }

        .price-text {
          font-size: 10px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .price-num {
          font-size: 1.35rem;
          font-weight: 850;
          color: #ffb83c;
        }

        .actions-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .action-arrow-btn {
          background: rgba(255, 184, 60, 0.08);
          border: 1px solid rgba(255, 184, 60, 0.2);
          border-radius: 50%;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffb83c;
          transition: all 0.2s ease;
        }

        .action-arrow-btn:hover {
          background: #ffb83c;
          color: #0f172a;
          transform: scale(1.05);
        }

        .empty-state-box {
          text-align: center;
          padding: 5rem 2rem;
          background: #1e293b;
          border-radius: 12px;
          max-width: 600px;
          margin: 0 auto;
        }
      `}</style>

      {/* Header Panel */}
      <header className="builds-header">
        <h1 className="builds-title">{t.title}</h1>
        <p className="builds-subtitle">{t.subtitle}</p>
      </header>

      {/* Grid of Custom Prebuilds */}
      {MOCK_BUILDS.length > 0 ? (
        <div className="builds-grid">
          {MOCK_BUILDS.map((build) => {
            const localizedTitle =
              build.title[currentLocale as 'en' | 'ar' | 'ckb'] || build.title.en

            // 🛠️ Map our specs structured format into the array for the BringPartsButton
            const partsArray = [
              { slotKey: 'cpu', productId: build.specs.cpu.id },
              { slotKey: 'gpu', productId: build.specs.gpu.id },
              { slotKey: 'ram', productId: build.specs.ram.id },
              { slotKey: 'storage', productId: build.specs.storage.id },
            ]

            return (
              <div key={build.id} className="build-card">
                <div className="card-visual-wrapper">
                  {build.isHot && <span className="card-badge">{t.badgePre}</span>}

                  <svg
                    className="fallback-visual-svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>

                <div className="card-content">
                  <Link href={`/${currentLocale}/builds/${build.id}`} className="card-title-link">
                    <h3 className="card-title">{localizedTitle}</h3>
                  </Link>

                  <ul className="spec-list">
                    <li className="spec-item">
                      <span className="spec-label">CPU</span>
                      <span className="spec-value">{build.specs.cpu.name}</span>
                    </li>
                    <li className="spec-item">
                      <span className="spec-label">GPU</span>
                      <span className="spec-value">{build.specs.gpu.name}</span>
                    </li>
                    <li className="spec-item">
                      <span className="spec-label">RAM</span>
                      <span className="spec-value">{build.specs.ram.name}</span>
                    </li>
                    <li className="spec-item">
                      <span className="spec-label">STORAGE</span>
                      <span className="spec-value">{build.specs.storage.name}</span>
                    </li>
                  </ul>

                  <div className="card-footer">
                    <div className="price-box">
                      <span className="price-text">{t.priceLabel}</span>
                      <span className="price-num">${build.price.toLocaleString()}</span>
                    </div>

                    <div className="actions-wrapper">
                      {/* 🔥 Bring parts dynamically to builder */}
                      <BringPartsButton components={partsArray} locale={currentLocale} />

                      {/* Go to blueprint details */}
                      <Link
                        href={`/${currentLocale}/builds/${build.id}`}
                        className="action-arrow-btn"
                        title={t.viewBuild}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }}
                        >
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="empty-state-box">
          <p>{t.emptyState}</p>
        </div>
      )}
    </main>
  )
}
