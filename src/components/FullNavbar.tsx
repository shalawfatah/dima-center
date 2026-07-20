import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from './Navbar'
import SearchBar from './SearchBar'
import logoImg from '../../public/media/logo.png'
import { search_styles } from '@/styles/search_styles'

interface FullNavbarProps {
  currentLocale: string
}

export default async function FullNavbar({ currentLocale }: FullNavbarProps) {
  const payload = await getPayload({ config })

  const categoriesData = await payload.find({
    collection: 'categories',
    locale: currentLocale as 'en' | 'ar' | 'ckb',
    limit: 100,
  })

  return (
    <header style={{ width: '100%', position: 'relative', zIndex: 1000 }}>
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
        {/* Logo Link Container */}
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

        {/* Search Bar Component */}
        <SearchBar locale={currentLocale} />

        {/* Right side Actions / Cart / Menu */}
        <div className="actions-cluster">
          <Navbar currentLocale={currentLocale} categories={categoriesData.docs as any} />
        </div>
      </div>
    </header>
  )
}
