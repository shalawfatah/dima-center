import { getPayload } from 'payload'
import config from '@/payload.config'
import Navbar from './Navbar'
import SearchBar from './SearchBar'
import logoImgFallback from '../../public/media/logo.png'
import { search_styles } from '@/styles/search_styles'
import LogoComponent, { MediaItem } from './LogoComponent'

interface FullNavbarProps {
  currentLocale: string
}

export default async function FullNavbar({ currentLocale }: FullNavbarProps) {
  const payload = await getPayload({ config })

  // Fetch categories and general settings concurrently
  const [categoriesData, generalSettings] = await Promise.all([
    payload.find({
      collection: 'categories',
      locale: currentLocale as 'en' | 'ar' | 'ckb',
      limit: 100,
    }),
    payload
      .findGlobal({
        slug: 'general-settings',
        depth: 1, // Resolves relationship IDs into full Media objects
      })
      .catch((err) => {
        console.error('Failed to fetch general-settings global:', err)
        return null
      }),
  ])

  // Explicitly cast to MediaItem to satisfy Payload's generated union types
  const dynamicLogo = (generalSettings?.logo || logoImgFallback) as MediaItem
  const eventLogoSticker = generalSettings?.header?.eventLogoSticker as MediaItem
  const headerBgColor = generalSettings?.header?.backgroundColor

  return (
    <header
      style={{
        width: '100%',
        position: 'relative',
        zIndex: 1000,
      }}
    >
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

      <div
        className="top-nav-bar"
        style={{
          ...(headerBgColor ? { backgroundColor: headerBgColor } : {}),
        }}
      >
        {/* Dynamic Logo & Sticker */}
        <LogoComponent
          currentLocale={currentLocale}
          logoImg={dynamicLogo}
          eventLogoSticker={eventLogoSticker}
        />

        {/* Search Bar */}
        <SearchBar locale={currentLocale} />

        {/* Navigation & Actions */}
        <div className="actions-cluster">
          <Navbar currentLocale={currentLocale} categories={categoriesData.docs as any} />
        </div>
      </div>
    </header>
  )
}
