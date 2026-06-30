'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale || 'en'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // ⚡ This is exactly where you implement that block of code!
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        const data = await res.json()

        // 🚀 Checks role and routes appropriately
        if (data.user?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push(`/${locale}/account`)
        }
      } else {
        setError('Invalid email or password.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '4rem auto',
        padding: '2rem',
        border: '1px solid #ccc',
        borderRadius: '8px',
      }}
    >
      <h2>Sign In</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}
