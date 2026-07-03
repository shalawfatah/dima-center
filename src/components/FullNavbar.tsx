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

export default function FullNavbar({ currentLocale }: FullNavbarProps) {
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  return (
    <header style={{ width: '100%' }} dir={isRtl ? 'rtl' : 'ltr'}>
      <style dangerouslySetInnerHTML={{ __html: search_styles() }} />

      <div className="top-nav-bar">
        <Link
          href={`/${currentLocale}`}
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
          <Navbar currentLocale={currentLocale} />
          <NavUserMenu currentLocale={currentLocale} />
          <Languages currentLocale={currentLocale} />
        </div>
      </div>
    </header>
  )
}
