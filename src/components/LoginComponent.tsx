'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginComponent() {
  const router = useRouter()
  const params = useParams()

  // 🎯 FIX: Force it to be a plain string (extracting first item if it's an array)
  const rawLocale = params?.locale
  const locale = (Array.isArray(rawLocale) ? rawLocale[0] : rawLocale) || 'en'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isRtl = locale === 'ar' || locale === 'ckb' || locale === 'ku'
  const isRegionalLocale = ['ar', 'ku', 'ckb'].includes(locale)

  const fontFamily = isRegionalLocale
    ? '"Rudaw", "Inter", "Noto Sans Arabic", -apple-system, sans-serif'
    : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setEmail(email.trim()) // Extra safety clean
    setLoading(true)

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        const data = await res.json()
        if (data.user?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push(`/${locale}/account`)
        }
      } else {
        setError(
          locale === 'ar'
            ? 'البريد الإلكتروني أو كلمة المرور غير صالحة.'
            : locale === 'ckb'
              ? 'ئیمەیڵ یان وشەی نهێنی هەڵەیە.'
              : 'Invalid email or password.',
        )
      }
    } catch (err) {
      setError(
        locale === 'ar'
          ? 'حدث خطأ ما. يرجى المحاولة مرة أخرى.'
          : locale === 'ckb'
            ? 'کێشەیەک ڕوویدا. تکایە دووبارە تاقیبکەرەوە.'
            : 'Something went wrong. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  const strings: Record<string, any> = {
    en: {
      title: 'Sign In',
      email: 'Email Address',
      password: 'Password',
      btn: 'Login',
      loggingIn: 'Signing In...',
      noAccount: "Don't have an account?",
      signUpLink: 'Sign Up here',
    },
    ar: {
      title: 'تسجيل الدخول',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      btn: 'دخول',
      loggingIn: 'جاري الدخول...',
      noAccount: 'ليس لديك حساب؟',
      signUpLink: 'سجل هنا',
    },
    ckb: {
      title: 'چوونە ژوورەوە',
      email: 'ناونیشانی ئیمەیڵ',
      password: 'وشەی نهێنی',
      btn: 'بچۆ ژوورەوە',
      loggingIn: 'چوونەژوورەوە...',
      noAccount: 'ئەکاونتت نییە؟',
      signUpLink: 'لێرە ناونووس بکە',
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
        .login-input {
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
        .login-input:focus {
          border-color: #df8026;
          box-shadow: 0 0 0 4px rgba(223, 128, 38, 0.12);
        }
        .login-submit-btn {
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
        .login-submit-btn:hover:not(:disabled) {
          background-color: #c66f1c;
        }
        .login-submit-btn:disabled {
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
            type="email"
            className="login-input"
            placeholder={t.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <input
            type="password"
            className="login-input"
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-submit-btn" disabled={loading}>
          {loading ? t.loggingIn : t.btn}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
        {t.noAccount}{' '}
        <Link
          href={`/${locale}/sign-up`}
          style={{ color: '#df8026', fontWeight: '600', textDecoration: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >
          {t.signUpLink}
        </Link>
      </div>
    </div>
  )
}
