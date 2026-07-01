import { getPayload } from 'payload'
import config from '@/payload.config'
import { headers } from 'next/headers'
import Link from 'next/link'

interface NavUserMenuProps {
  currentLocale: string
}

export default async function NavUserMenu({ currentLocale }: NavUserMenuProps) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  // Translation fallbacks purely for fallback HTML titles/tooltips
  const tooltips = {
    en: { login: 'Sign In', account: 'Account' },
    ar: { login: 'تسجيل الدخول', account: 'الحساب' },
    ckb: { login: 'تێپەڕین', account: 'ئەکاونت' },
  }[currentLocale as 'en' | 'ar' | 'ckb'] || { login: 'Sign In', account: 'Account' }

  // Shared responsive circular button styles
  const baseCircleStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(255, 255, 255, 0.1)',
    transition: 'all 0.2s ease',
    overflow: 'hidden',
  }

  // 1. GUEST VIEW: Universal User Silhouette Icon
  if (!user) {
    return (
      <Link href={`/${currentLocale}/login`} style={baseCircleStyle} title={tooltips.login}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: '16px', height: '16px', color: '#cbd5e1' }}
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </Link>
    )
  }

  // 2. LOGGED-IN USER: Dynamic Avatar Image or Initials Text Fallback
  // Checking if your Payload user schema contains a name or email field
  const userImageUrl = (user as any).avatar?.url || null
  const userInitials = (user.name || user.email || 'U').substring(0, 2).toUpperCase()

  return (
    <Link href={`/${currentLocale}/account`} style={baseCircleStyle} title={tooltips.account}>
      {userImageUrl ? (
        <img
          src={userImageUrl}
          alt={user.name || 'User Avatar'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span
          style={{
            fontSize: '11px',
            fontWeight: '700',
            color: '#3b82f6',
            letterSpacing: '-0.5px',
          }}
        >
          {userInitials}
        </span>
      )}
    </Link>
  )
}
