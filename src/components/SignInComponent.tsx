'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function SignInComponent() {
  const params = useParams()
  const locale = params.locale || 'ckb'

  return (
    <form>
      {/* ... sign in fields ... */}

      <div style={{ marginTop: '1rem' }}>
        <span>Don't have an account? </span>
        {/* Make sure this link points to your localized sign-up route */}
        <Link href={`/${locale}/signup`}>Sign Up</Link>
      </div>
    </form>
  )
}
