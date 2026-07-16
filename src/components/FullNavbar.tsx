import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import Image from 'next/image'
import NavUserMenu from './NavUserMenu'
import Languages from './Languages'
import Navbar from './Navbar'
import SearchBar from './SearchBar'
import logoImg from '../../public/media/logo.png'
import { search_styles } from '@/styles/search_styles'

interface FullNavbarProps {
  currentLocale: string
}

// 🎯 FIX: Turned the functional wrapper into an async component
export default async function FullNavbar({ currentLocale }: FullNavbarProps) {
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  // Initialize payload instance cleanly on the server node
  const payload = await getPayload({ config })

  const categoriesData = await payload.find({
    collection: 'categories',
    locale: currentLocale as 'en' | 'ar' | 'ckb',
    limit: 100,
  })

  return (
    <header style={{ width: '100%' }} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ⚡ Dynamic styles block injecting search rules and responsive logo bounds */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            ${search_styles()}
            
            @media (max-width: 767px) {
              .logo-link-container {
                width: 60px !important;
                max-width: 60px !important;
              }
              .logo-link-container img {
                width: 100% !important;
                height: auto !important;
              }
            }
          `,
        }}
      />

      <div className="top-nav-bar">
        {/* 🎯 Added class "logo-link-container" to target via mobile media query */}
        <Link
          href={`/${currentLocale}`}
          className="logo-link-container"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}
        >
          <Image
            src={logoImg}
            alt="Dima Logo"
            width={95}
            height={55}
            style={{ height: 'auto', maxWidth: '100%' }}
            priority
          />
        </Link>
        <SearchBar locale={currentLocale} />

        <div className="actions-cluster">
          <Navbar currentLocale={currentLocale} categories={categoriesData.docs as any} />
        </div>
      </div>
    </header>
  )
}
