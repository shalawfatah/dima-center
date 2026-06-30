import Link from 'next/link'
import SearchBar from './SearchBar'

interface NavbarProps {
  currentLocale: string
  activeCategory?: string
}

export default function Navbar({ currentLocale, activeCategory }: NavbarProps) {
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  // Nested Multi-Level Category Mapping
  const navTree = [
    {
      parent: { en: 'Computer Parts', ar: 'قطع الكمبيوتر', ckb: 'پارچەکانی کۆمپیوتەر' },
      children: [
        { slug: 'cpu', en: 'CPU', ar: 'المعالجات', ckb: 'پڕۆسێسەر' },
        { slug: 'gpu', en: 'GPU / Graphics Cards', ar: 'کارت الشاشة', ckb: 'کارتی شاشە' },
        { slug: 'ram', en: 'RAM', ar: 'الرامات', ckb: 'ڕام' },
        { slug: 'storage', en: 'Storage', ar: 'وحدات التخزين', ckb: 'خەزن' },
        { slug: 'case', en: 'Case', ar: 'الكيسات', ckb: 'کەیس' },
        { slug: 'psu', en: 'PSU / Power Supply', ar: 'مزود الطاقة', ckb: 'پاوەر سەپڵای' },
        { slug: 'motherboard', en: 'Motherboard', ar: 'اللوحات الأم', ckb: 'مەزەربۆرد' },
        { slug: 'case-fan', en: 'Case Fan', ar: 'مراوح التبريد', ckb: 'پان' },
      ],
    },
    {
      parent: { en: 'Accessories', ar: 'الملحقات', ckb: 'تەواوکەرەکان' },
      children: [
        { slug: 'mouse', en: 'Mouse', ar: 'الماوس', ckb: 'ماوس' },
        { slug: 'keyboard', en: 'Keyboard', ar: 'لوحة المفاتيح', ckb: 'کیبۆرد' },
        { slug: 'headphone', en: 'Headphones', ar: 'سماعات الرأس', ckb: 'سەماعە' },
        { slug: 'monitor', en: 'Monitors', ar: 'الشاشات', ckb: 'شاشە' },
        { slug: 'mousepad', en: 'Mousepad', ar: 'ماوس باد', ckb: 'ماوس پاد' },
        { slug: 'speaker', en: 'Speakers', ar: 'السبيكرات', ckb: 'سپیكەر' },
        { slug: 'webcam', en: 'Webcam', ar: 'الكاميرات', ckb: 'وێبکام' },
        { slug: 'microphone', en: 'Microphone', ar: 'المايكروفونات', ckb: 'مایکرۆفۆن' },
        { slug: 'printer', en: 'Printer', ar: 'الطابعات', ckb: 'پرینتەر' },
      ],
    },
    {
      parent: { en: 'Apple', ar: 'آبل', ckb: 'ئایپاد و ماک' },
      children: [
        { slug: 'macbook-pro', en: 'Macbook Pro', ar: 'ماك بوك برو', ckb: 'ماکبووک پرۆ' },
        { slug: 'macbook-air', en: 'Macbook Air', ar: 'ماك بوك إير', ckb: 'ماکبووک ئێر' },
        { slug: 'iphone', en: 'iPhone', ar: 'آيفون', ckb: 'ئایفۆن' },
        { slug: 'ipad', en: 'iPad', ar: 'آيباد', ckb: 'ئایپاد' },
        { slug: 'imac', en: 'iMac', ar: 'آي ماك', ckb: 'ئایماک' },
        { slug: 'mac-mini', en: 'Mac Mini', ar: 'ماك ميني', ckb: 'ماک مینی' },
      ],
    },
    {
      parent: { en: 'Computers', ar: 'الأجهزة الكاملة', ckb: 'کۆمپیوتەری تەواو' },
      children: [
        { slug: 'laptop', en: 'Laptops', ar: 'لاب توب', ckb: 'لاپتۆپ' },
        { slug: 'desktop', en: 'Desktops', ar: 'كمبيوتر مكتبي', ckb: 'دێسکتۆپ' },
      ],
    },
    {
      parent: { en: 'Power Systems', ar: 'أنظمة الطاقة', ckb: 'سیستمی وزە' },
      children: [
        { slug: 'ups', en: 'UPS', ar: 'یو پی اس', ckb: 'یو پی ئێس' },
        { slug: 'solar-panels', en: 'Solar Panels', ar: 'ألواح شمسية', ckb: 'سۆلار پەنێڵ' },
        { slug: 'power-bank', en: 'Power Banks', ar: 'خازن طاقة', ckb: 'پاوەربانک' },
        { slug: 'avr', en: 'AVR Stabilizer', ar: 'منظم جهد', ckb: 'مەنزەم' },
      ],
    },
    {
      parent: { en: 'Other', ar: 'أخرى', ckb: 'هیتر' },
      children: [
        { slug: 'desk', en: 'Desk', ar: 'المكاتب', ckb: 'مێز' },
        { slug: 'chair', en: 'Chair', ar: 'الكراسي', ckb: 'کورسی' },
        { slug: 'capture-card', en: 'Capture Card', ar: 'كرت كابتشر', ckb: 'کاپچەر کارت' },
        { slug: 'network', en: 'Network Equipment', ar: 'الشبكات', ckb: 'نێتۆرک' },
        {
          slug: 'cables-and-adapters',
          en: 'Cables & Adapters',
          ar: 'الكابلات والمحولات',
          ckb: 'کێبڵ و ئاداپتەر',
        },
      ],
    },
  ]

  return (
    <>
      <style>{`
        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: #fff;
          border-bottom: 1px solid #eaeaea;
          position: relative;
          z-index: 100;
        }
        .nav-links {
          display: flex;
          gap: 1.25rem;
          align-items: center;
        }
        
        /* 💡 CSS DROP-DOWN STRUCTURES */
        .nav-dropdown {
          position: relative;
          display: inline-block;
        }
        .dropdown-trigger {
          background: none;
          border: none;
          font-size: 14px;
          font-weight: 600;
          color: #333;
          padding: 0.5rem 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .dropdown-content {
          display: none;
          position: absolute;
          top: 100%;
          ${isRtl ? 'right: 0;' : 'left: 0;'}
          background-color: #fff;
          min-width: 210px;
          box-shadow: 0px 8px 24px rgba(0,0,0,0.08);
          border: 1px solid #eef0f2;
          border-radius: 8px;
          padding: 0.5rem 0;
          z-index: 1000;
        }
        .dropdown-content a {
          color: #444;
          padding: 0.6rem 1.2rem;
          text-decoration: none;
          display: block;
          font-size: 14px;
          text-align: ${isRtl ? 'right' : 'left'};
          transition: background 0.15s ease;
        }
        .dropdown-content a:hover {
          background-color: #f5f7fa;
          color: #0070f3;
        }
        /* Reveal items on hover */
        .nav-dropdown:hover .dropdown-content {
          display: block;
        }

        .burger-menu {
          display: none;
          cursor: pointer;
          font-size: 1.5rem;
          user-select: none;
        }
        #menu-toggle {
          display: none;
        }
        
        @media (max-width: 992px) {
          .burger-menu { display: block; }
          .nav-links {
            display: none;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #fff;
            padding: 1.5rem;
            border-bottom: 1px solid #eaeaea;
            gap: 1rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            align-items: flex-start;
          }
          #menu-toggle:checked ~ .nav-links { display: flex; }
          .nav-dropdown { width: 100%; }
          .dropdown-trigger { width: 100%; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #fafafa; }
          .dropdown-content {
            position: relative;
            box-shadow: none;
            border: none;
            background: #fdfdfd;
            padding-left: ${isRtl ? '0' : '1rem'};
            padding-right: ${isRtl ? '1rem' : '0'};
            width: 100%;
            display: block; /* Expand naturally on mobile layout devices */
          }
          .pc-builder-btn { width: 100%; text-align: center; box-sizing: border-box; margin-top: 1rem; }
        }
      `}</style>

      <div className="nav-container">
        {/* Brand Logo */}
        <Link
          href={`/${currentLocale}`}
          style={{ fontSize: '1.4rem', fontWeight: 'bold', textDecoration: 'none', color: '#000' }}
        >
          NIMA
        </Link>

        <SearchBar locale={currentLocale} />

        <input type="checkbox" id="menu-toggle" />
        <label htmlFor="menu-toggle" className="burger-menu">
          ☰
        </label>

        {/* Links Navigation Layer */}
        <div className="nav-links">
          {navTree.map((group, index) => {
            const parentLabel =
              currentLocale === 'ar'
                ? group.parent.ar
                : currentLocale === 'ckb'
                  ? group.parent.ckb
                  : group.parent.en

            return (
              <div key={index} className="nav-dropdown">
                <button className="dropdown-trigger">{parentLabel} ▾</button>
                <div className="dropdown-content">
                  {group.children.map((child) => {
                    const childLabel =
                      currentLocale === 'ar'
                        ? child.ar
                        : currentLocale === 'ckb'
                          ? child.ckb
                          : child.en
                    const isActive = activeCategory === child.slug

                    return (
                      <Link
                        key={child.slug}
                        href={`/${currentLocale}?category=${child.slug}`}
                        style={{
                          color: isActive ? '#0070f3' : undefined,
                          fontWeight: isActive ? '700' : undefined,
                        }}
                      >
                        {childLabel}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}

          <Link
            href={`/${currentLocale}/pc-builder`}
            className="pc-builder-btn"
            style={{
              background: '#0070f3',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              display: 'inline-block',
            }}
          >
            {currentLocale === 'ar'
              ? 'تجميع جهازك'
              : currentLocale === 'ckb'
                ? 'کۆمپیوتەرەکەت ببەستە'
                : 'PC Builder'}
          </Link>
        </div>
      </div>
    </>
  )
}
