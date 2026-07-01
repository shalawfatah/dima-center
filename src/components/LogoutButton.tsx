'use client'

import { useRouter } from 'next/navigation'

interface LogoutButtonProps {
  label: string
  locale: string
}

export default function LogoutButton({ label, locale }: LogoutButtonProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Fetching the endpoint from the client safely passes session cookies
      const res = await fetch('/api/users/logout', { method: 'POST' })

      if (res.ok) {
        // Clear local router cache and redirect
        router.refresh()
        router.push(`/${locale}/login`)
      } else {
        console.error('Logout failed response')
      }
    } catch (err) {
      console.error('Error during client logout:', err)
    }
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: '#ef4444',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontWeight: '600',
        fontSize: '14px',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}
