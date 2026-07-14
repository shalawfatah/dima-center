'use client'

import React, { use, useState, useEffect } from 'react'
import Link from 'next/link'

interface BuildDetailPageProps {
  params: Promise<{ locale: string; id: string }>
}

// 1. Localization Dictionary matching your brand style
const DICT: Record<
  string,
  {
    backBtn: string
    specsTitle: string
    summaryTitle: string
    saveBlueprint: string
    addToCart: string
    discountLabel: string
    originalPriceLabel: string
    partColumn: string
    modelColumn: string
    qty: string
    toastSuccess: string
    viewCart: string
  }
> = {
  en: {
    backBtn: 'Back to Builds',
    specsTitle: 'System Configuration Specifications',
    summaryTitle: 'Build Pricing Summary',
    saveBlueprint: 'Import Configuration to Builder',
    addToCart: 'Add Complete Build to Cart',
    discountLabel: 'Special Bundle Deal',
    originalPriceLabel: 'Regular Price',
    partColumn: 'Component',
    modelColumn: 'Optimized Part Name',
    qty: 'Qty',
    toastSuccess: 'Added to cart successfully!',
    viewCart: 'View Cart ➡️',
  },
  ar: {
    backBtn: 'العودة للتجميعات',
    specsTitle: 'مواصفات تجميعة النظام الكاملة',
    summaryTitle: 'ملخص تسعير التجميعة',
    saveBlueprint: 'استيراد القطع إلى مصمم التجميعات',
    addToCart: 'إضافة التجميعة كاملة إلى السلة',
    discountLabel: 'عرض خاص على التجميعة',
    originalPriceLabel: 'السعر الأصلي',
    partColumn: 'القطعة',
    modelColumn: 'الموديل المعتمد',
    qty: 'الكمية',
    toastSuccess: 'تمت الإضافة إلى السلة بنجاح!',
    viewCart: 'عرض السلة ➡️',
  },
  ckb: {
    backBtn: 'گەڕانەوە بۆ بیڵدەکان',
    specsTitle: 'تایبەتمەندییە کانی تاقیکردنەوەی سیستەمەکە',
    summaryTitle: 'پوختەی نرخی بیڵدەکە',
    saveBlueprint: 'هێنانی پارچەکان بۆ ناو بیڵدەر',
    addToCart: 'زیادکردنی هەموو بیڵدەکە بۆ سەبەتە',
    discountLabel: 'نرخی داشکێنراوی تایبەت',
    originalPriceLabel: 'نرخی ئاسایی',
    partColumn: 'بەش و پارچە',
    modelColumn: 'مۆدێلی پارچەی گونجاو',
    qty: 'دانە',
    toastSuccess: 'بە سەرکەوتوویی زیادکرا بۆ سەبەتە!',
    viewCart: 'بینینی سەبەتە ➡️',
  },
}

// 2. Comprehensive Hardware Databases mapped to match the schema
const BUILDS_DATABASE: Record<
  string,
  {
    title: Record<string, string>
    originalPrice: number
    discountedPrice: number
    parts: Array<{ slot: string; icon: string; model: string }>
  }
> = {
  'apex-dominator-v4': {
    title: {
      en: 'Apex Dominator V4 Extreme',
      ar: 'أبيكس دومينيتور V4 الخارقة',
      ckb: 'ئەپێکس دۆمینیتۆر V4',
    },
    originalPrice: 3899,
    discountedPrice: 3499,
    parts: [
      { slot: 'Processor (CPU)', icon: '💻', model: 'AMD Ryzen 9 9950X (16 Cores, 5.7GHz)' },
      { slot: 'Graphics Card (GPU)', icon: '🎮', model: 'NVIDIA GeForce RTX 5090 32GB GDDR7' },
      { slot: 'CPU Cooler', icon: '❄️', model: 'ASUS ROG RYUJIN III 360 ARGB Liquid Cooler' },
      { slot: 'Motherboard', icon: '🔌', model: 'MSI MEG X870E GODLIKE AM5' },
      { slot: 'Memory (RAM)', icon: '⚡', model: '64GB G.Skill Trident Z5 Neo DDR5 6400MHz CL32' },
      { slot: 'Storage (SSD)', icon: '🗄️', model: '4TB Crucial T705 PCIe Gen5 NVMe M.2 SSD' },
      { slot: 'Power Supply (PSU)', icon: '🔋', model: 'Seasonic Vertex GX-1200W ATX 3.0 Gold' },
      { slot: 'PC Chassis (Case)', icon: '📦', model: 'Lian Li O11 Dynamic EVO RGB Black' },
      { slot: 'System Fans', icon: '🌀', model: '7x Lian Li Uni Fan TL120 Reverse Blade' },
    ],
  },
  'valkyrie-stream-pro': {
    title: {
      en: 'Valkyrie Stream Pro',
      ar: 'فالكيري ستريم برو',
      ckb: 'ڤالکیری ستریم پرۆ',
    },
    originalPrice: 2099,
    discountedPrice: 1899,
    parts: [
      { slot: 'Processor (CPU)', icon: '💻', model: 'Intel Core i7-14700K (20 Cores, 5.6GHz)' },
      { slot: 'Graphics Card (GPU)', icon: '🎮', model: 'NVIDIA GeForce RTX 4070 Ti Super 16GB' },
      { slot: 'CPU Cooler', icon: '❄️', model: 'DeepCool LS720 SE 360mm AIO Liquid Cooler' },
      { slot: 'Motherboard', icon: '🔌', model: 'GIGABYTE Z790 AORUS ELITE AX' },
      { slot: 'Memory (RAM)', icon: '⚡', model: '32GB Corsair Vengeance RGB DDR5 6000MHz CL30' },
      { slot: 'Storage (SSD)', icon: '🗄️', model: '2TB Kingston KC3000 PCIe 4.0 NVMe M.2' },
      { slot: 'Power Supply (PSU)', icon: '🔋', model: 'Corsair RM850e 850W ATX 3.0 Gold' },
      { slot: 'PC Chassis (Case)', icon: '📦', model: 'NZXT H9 Flow Dual-Chamber Mid-Tower' },
      { slot: 'System Fans', icon: '🌀', model: '4x NZXT F120 RGB Core Fans' },
    ],
  },
  'cyberpunk-neon-mini': {
    title: {
      en: 'Cyberpunk Neon Mini-ITX',
      ar: 'سايبربانك نيون ميني',
      ckb: 'سایبەرپانک نیۆن مینی',
    },
    originalPrice: 1599,
    discountedPrice: 1450,
    parts: [
      { slot: 'Processor (CPU)', icon: '💻', model: 'AMD Ryzen 7 7800X3D (8 Cores, 5.0GHz)' },
      { slot: 'Graphics Card (GPU)', icon: '🎮', model: 'NVIDIA GeForce RTX 4070 Super 12GB' },
      { slot: 'CPU Cooler', icon: '❄️', model: 'Thermalright AXP90-X47 Low Profile' },
      { slot: 'Motherboard', icon: '🔌', model: 'ASUS ROG STRIX B650E-I GAMING WIFI ITX' },
      { slot: 'Memory (RAM)', icon: '⚡', model: '32GB G.Skill Flare X5 DDR5 5600MHz CL36' },
      { slot: 'Storage (SSD)', icon: '🗄️', model: '1TB Samsung 990 PRO PCIe 4.0 NVMe M.2' },
      { slot: 'Power Supply (PSU)', icon: '🔋', model: 'Corsair SF750 750W SFX Platinum' },
      { slot: 'PC Chassis (Case)', icon: '📦', model: 'Fractal Design Terra Jade Mini-ITX' },
      { slot: 'System Fans', icon: '🌀', model: '1x Noctua NF-A12x15 Slim 120mm Fan' },
    ],
  },
}

export default function BuildDetailPage({ params }: BuildDetailPageProps) {
  // Unwrap parameters safely using React.use
  const { locale, id } = use(params)
  const currentLocale = ['en', 'ar', 'ckb'].includes(locale) ? locale : 'en'
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'
  const t = DICT[currentLocale]

  const buildData = BUILDS_DATABASE[id] || BUILDS_DATABASE['apex-dominator-v4']
  const localizedTitle = buildData.title[currentLocale] || buildData.title.en

  // Local state to display action confirmation toast
  const [showToast, setShowToast] = useState(false)

  // Auto-dismiss the toast after 4 seconds
  useEffect(() => {
    if (!showToast) return
    const timer = setTimeout(() => {
      setShowToast(false)
    }, 4000)
    return () => clearTimeout(timer)
  }, [showToast])

  // Handles adding the entire custom setup structure directly to the cart array matching your carousel schemas
  const handleAddBuildToCart = () => {
    try {
      const storedCart = localStorage.getItem('cart')
      const cart = storedCart ? JSON.parse(storedCart) : []

      // Look up if this full build package exists in cart already
      const existingIndex = cart.findIndex((item: any) => item.id === id)

      if (existingIndex > -1) {
        cart[existingIndex].quantity += 1
      } else {
        cart.push({
          id: id,
          title: localizedTitle,
          price: buildData.discountedPrice,
          quantity: 1,
          imageUrl: null, // Custom configurations do not have individual generic product thumbnails
        })
      }

      // Save to device memory and dispatch global context signal
      localStorage.setItem('cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cart-updated'))
      setShowToast(true)
    } catch (err) {
      console.error('Failed pushing build structure to localStorage cart array:', err)
    }
  }

  const fontFam = isRtl
    ? '"Rudaw", "Inter", "Noto Sans Arabic", -apple-system, sans-serif'
    : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

  return (
    <main
      className="detail-container"
      style={
        {
          '--font-family': fontFam,
          direction: isRtl ? 'rtl' : 'ltr',
          textAlign: isRtl ? 'right' : 'left',
        } as React.CSSProperties
      }
    >
      <style>{`
        .detail-container {
          min-height: 100vh;
          background-color: #0f172a;
          color: #f1f5f9;
          padding: 3rem 1.5rem;
          font-family: var(--font-family);
        }

        .back-nav {
          max-width: 1200px;
          margin: 0 auto 2rem auto;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #94a3b8;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .back-link:hover {
          color: #ffb83c;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 968px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Parts Card styling */
        .parts-card {
          background: #1e293b;
          border: 1px solid rgba(241, 245, 249, 0.08);
          border-radius: 12px;
          padding: 2rem;
        }

        .build-headline {
          font-size: clamp(1.5rem, 3vw, 2.2rem);
          font-weight: 850;
          color: #fff;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .specs-header {
          font-size: 1rem;
          font-weight: 700;
          color: #ffb83c;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid rgba(255, 184, 60, 0.2);
          padding-bottom: 8px;
        }

        .parts-table {
          width: 100%;
          border-collapse: collapse;
        }

        .parts-table th {
          text-align: inherit;
          padding: 10px 12px;
          color: #64748b;
          font-size: 12px;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(241, 245, 249, 0.1);
        }

        .parts-table td {
          padding: 14px 12px;
          border-bottom: 1px solid rgba(241, 245, 249, 0.05);
          font-size: 14px;
        }

        .part-icon-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .part-icon {
          font-size: 1.25rem;
          opacity: 0.8;
        }

        .part-slot-label {
          font-weight: 700;
          color: #e2e8f0;
        }

        .part-model-value {
          color: #cbd5e1;
        }

        .qty-badge {
          background: rgba(241, 245, 249, 0.05);
          color: #94a3b8;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 700;
        }

        /* Sidebar Configurations */
        .sidebar-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .pricing-sticky-card {
          position: sticky;
          top: 2rem;
          background: #1e293b;
          border: 1px solid rgba(241, 245, 249, 0.08);
          border-radius: 12px;
          padding: 2rem;
        }

        .sidebar-title {
          font-size: 18px;
          font-weight: 850;
          color: #fff;
          margin-bottom: 1.25rem;
        }

        .pricing-tier-wrapper {
          background: rgba(15, 23, 42, 0.4);
          border-radius: 8px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .deal-tag {
          display: inline-block;
          font-size: 10px;
          font-weight: 900;
          background: #ef4444;
          color: #fff;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: 4px;
          margin-bottom: 10px;
          letter-spacing: 0.05em;
        }

        .discounted-price-huge {
          font-size: 2.5rem;
          font-weight: 900;
          color: #ffb83c;
          line-height: 1;
        }

        .original-price-strikethrough {
          font-size: 14px;
          color: #64748b;
          text-decoration: line-through;
          margin-top: 6px;
          display: block;
        }

        .action-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .btn-primary {
          background: #ffb83c;
          color: #0f172a;
          border: none;
          border-radius: 8px;
          padding: 12px 16px;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-primary:hover {
          background: #f59e0b;
        }

        .btn-secondary {
          background: transparent;
          color: #ffb83c;
          border: 1px solid rgba(255, 184, 60, 0.3);
          border-radius: 8px;
          padding: 12px 16px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-secondary:hover {
          background: rgba(255, 184, 60, 0.05);
          border-color: #ffb83c;
        }
      `}</style>

      {/* Navigation Return Hook */}
      <nav className="back-nav">
        <Link href={`/${currentLocale}/builds`} className="back-link">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }}
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          {t.backBtn}
        </Link>
      </nav>

      {/* Primary Visual Breakdown Panel */}
      <div className="detail-grid">
        <div className="parts-card">
          <h1 className="build-headline">{localizedTitle}</h1>
          <h2 className="specs-header">{t.specsTitle}</h2>

          <table className="parts-table">
            <thead>
              <tr>
                <th style={{ width: '35%' }}>{t.partColumn}</th>
                <th style={{ width: '55%' }}>{t.modelColumn}</th>
                <th style={{ width: '10%', textAlign: 'center' }}>{t.qty}</th>
              </tr>
            </thead>
            <tbody>
              {buildData.parts.map((part) => (
                <tr key={part.slot}>
                  <td>
                    <div className="part-icon-group">
                      <span className="part-icon">{part.icon}</span>
                      <span className="part-slot-label">{part.slot}</span>
                    </div>
                  </td>
                  <td>
                    <span className="part-model-value">{part.model}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="qty-badge">x1</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Sidebar Widget */}
        <div className="sidebar-panel">
          <div className="pricing-sticky-card">
            <h3 className="sidebar-title">{t.summaryTitle}</h3>

            <div className="pricing-tier-wrapper">
              <span className="deal-tag">{t.discountLabel}</span>
              <div className="discounted-price-huge">
                ${buildData.discountedPrice.toLocaleString()}
              </div>
              <span className="original-price-strikethrough">
                {t.originalPriceLabel}: ${buildData.originalPrice.toLocaleString()}
              </span>
            </div>

            <div className="action-stack">
              <button className="btn-primary" onClick={handleAddBuildToCart}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="8" cy="21" r="1"></circle>
                  <circle cx="19" cy="21" r="1"></circle>
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                </svg>
                {t.addToCart}
              </button>

              {/* Resolved Builder Endpoint to direct dynamically to localized /pc-builder */}
              <Link href={`/${currentLocale}/pc-builder`} className="btn-secondary">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
                {t.saveBlueprint}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized Action Success Toast Alert */}
      {showToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: isRtl ? 'auto' : '24px',
            left: isRtl ? '24px' : 'auto',
            zIndex: 10000,
            backgroundColor: '#ffffff',
            borderLeft: isRtl ? 'transparent' : '4px solid #000000',
            borderRight: isRtl ? '4px solid #000000' : 'transparent',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            maxWidth: '380px',
            color: '#000000',
            border: '1px solid #e2e8f0',
            animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            direction: isRtl ? 'rtl' : 'ltr',
          }}
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `
                @keyframes slideIn {
                  from { transform: translateY(15px); opacity: 0; }
                  to { transform: translateY(0); opacity: 1; }
                }
              `,
            }}
          />

          <div style={{ fontSize: '20px', color: '#000000' }}>✓</div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '240px',
              }}
            >
              {localizedTitle}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{t.toastSuccess}</div>
          </div>

          <Link
            href={`/${currentLocale}/cart`}
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#ffffff',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              background: '#000000',
              padding: '6px 10px',
              borderRadius: '6px',
            }}
          >
            {t.viewCart}
          </Link>
        </div>
      )}
    </main>
  )
}
