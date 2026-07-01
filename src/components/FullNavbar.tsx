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
    // 🎯 Setting dir structure once globally across your layout blocks handles 90% of structural mirroring
    <header style={{ width: '100%' }} dir={isRtl ? 'rtl' : 'ltr'}>
      <style>{search_styles()}</style>
      <div className="top-nav-bar">
        <Link
          href={`/${currentLocale}`}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
        >
          <Image
            src={logoImg}
            alt="Dima Logo"
            width={100}
            height={60}
            style={{ height: 'auto' }}
            priority
          />
        </Link>

        {/* 🎯 Fix: Replaced raw duplicate HTML code with your comprehensive SearchBar component */}
        <SearchBar locale={currentLocale} />

        <div className="actions-cluster">
          <NavUserMenu currentLocale={currentLocale} />
          <Languages currentLocale={currentLocale} />
        </div>
      </div>

      <div className="independent-nav-row">
        <Navbar currentLocale={currentLocale} />
      </div>
    </header>
  )
}
