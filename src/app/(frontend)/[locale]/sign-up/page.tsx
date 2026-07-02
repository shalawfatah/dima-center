'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()
  const params = useParams()
  const locale = typeof params?.locale === 'string' ? params.locale : 'en'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isRtl = locale === 'ar' || locale === 'ckb' || locale === 'ku'
  const isRegionalLocale = ['ar', 'ku', 'ckb'].includes(String(locale))

  const fontFamily = isRegionalLocale
    ? '"Rudaw", "Inter", "Noto Sans Arabic", -apple-system, sans-serif'
    : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 🚀 REST execution creating user document context entries in Payload CMS
      const res = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        // Automatically perform a pass login fetch right after success
        const loginRes = await fetch('/api/users/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
          headers: { 'Content-Type': 'application/json' },
        })

        if (loginRes.ok) {
          router.push(`/${locale}/account`)
        } else {
          router.push(`/${locale}/login`)
        }
      } else {
        const data = await res.json()
        setError(data?.errors?.[0]?.message || 'Failed to construct a secure profile blueprint.')
      }
    } catch (err) {
      setError('An unexpected system networking error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const strings: Record<string, any> = {
    en: {
      title: 'Create Account',
      name: 'Full Name',
      email: 'Email Address',
      password: 'Password',
      btn: 'Register',
      registering: 'Creating Account...',
      hasAccount: 'Already have an account?',
      loginLink: 'Sign In here',
    },
    ar: {
      title: 'إنشاء حساب',
      name: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      btn: 'تسجيل',
      registering: 'جاري إنشاء الحساب...',
      hasAccount: 'لديك حساب بالفعل؟',
      loginLink: 'سجل دخولك هنا',
    },
    ckb: {
      title: 'دروستکردنی ئەکاونت',
      name: 'ناوی تەواو',
      email: 'ناونیشانی ئیمەیڵ',
      password: 'وشەی نهێنی',
      btn: 'تۆمارکردن',
      registering: 'تۆمارکردن...',
      hasAccount: 'ئەکاونتت هەیە؟',
      loginLink: 'لێرەوە بچۆ ژوورەوە',
    },
  }

  const t = strings[locale] || strings.en

  return (
    <div
      style={{
        maxWidth: '420px',
        margin: '6rem auto',
        padding: '2.5rem 2rem',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.03)',
        direction: isRtl ? 'rtl' : 'ltr',
        textAlign: isRtl ? 'right' : 'left',
        fontFamily: fontFamily,
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        .signup-input {
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 14px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
          background-color: #ffffff;
          color: #0f172a;
          transition: all 0.2s ease;
          font-family: inherit;
          box-sizing: border-box;
        }
        .signup-input:focus {
          border-color: #df8026;
          box-shadow: 0 0 0 4px rgba(223, 128, 38, 0.12);
        }
        .signup-submit-btn {
          width: 100%;
          padding: 0.75rem;
          font-size: 15px;
          font-weight: 600;
          color: #ffffff;
          background-color: #df8026;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.15s ease;
          font-family: inherit;
          margin-top: 0.5rem;
        }
        .signup-submit-btn:hover:not(:disabled) {
          background-color: #c66f1c;
        }
        .signup-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
      `}</style>

      <h2
        style={{ margin: '0 0 1.5rem 0', fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}
      >
        {t.title}
      </h2>

      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            borderRadius: '6px',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        <div>
          <input
            type="text"
            className="signup-input"
            placeholder={t.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <input
            type="email"
            className="signup-input"
            placeholder={t.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <input
            type="password"
            className="signup-input"
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="signup-submit-btn" disabled={loading}>
          {loading ? t.registering : t.btn}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
        {t.hasAccount}{' '}
        <Link
          href={`/${locale}/login`}
          style={{ color: '#df8026', fontWeight: '600', textDecoration: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >
          {t.loginLink}
        </Link>
      </div>
    </div>
  )
}
