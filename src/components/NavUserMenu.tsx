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

  // If no user session is found, show standard log in route action
  if (!user) {
    return (
      <Link
        href={`/${currentLocale}/login`}
        style={{ color: '#fff', textDecoration: 'none', fontWeight: '500', fontSize: '14px' }}
      >
        Sign In
      </Link>
    )
  }

  // Generate initials from email for the placeholder fallback look
  const initials = user.email ? user.email.substring(0, 2).toUpperCase() : 'U'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <Link
        href={`/${currentLocale}/account`}
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '600',
          fontSize: '14px',
          textDecoration: 'none',
          border: '2px solid rgba(255,255,255,0.2)',
          transition: 'border-color 0.2s',
        }}
        title="Go to Account Dashboard"
      >
        {initials}
      </Link>
    </div>
  )
}
