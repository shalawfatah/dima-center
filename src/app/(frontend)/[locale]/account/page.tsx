import { getPayload } from 'payload'
import config from '@/payload.config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getStorefrontMetadata } from '@/utils/seo'
import LogoutButton from '@/components/LogoutButton'
import { translations } from '@/utils/translations'

interface AccountPageProps {
  params: Promise<{ locale: string }>
}

// 🎯 DYNAMIC LOCALIZED ACCOUNT DASHBOARD METADATA
export async function generateMetadata({ params }: AccountPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const locale = resolvedParams.locale || 'en'

  // 1. Fetch default base storefront metadata configuration
  const baseMeta = await getStorefrontMetadata({ locale })

  // 2. Type-safe extraction of the absolute site title string fallback
  const baseSiteTitle =
    baseMeta?.title && typeof baseMeta.title === 'object' && 'absolute' in baseMeta.title
      ? baseMeta.title.absolute
      : typeof baseMeta?.title === 'string'
        ? baseMeta.title
        : 'Storefront'

  // 3. Localized titles matching user workspace dashboard headers
  const titles: Record<string, string> = {
    en: 'My Account Dashboard',
    ar: 'لوحة التحكم بحسابي',
    ckb: 'داشبۆردی ئەکاونتەکەم',
  }

  const finalTitle = titles[locale] || titles.en

  return {
    ...baseMeta,
    title: `${finalTitle} | ${baseSiteTitle}`,
    robots: {
      index: false, // Security Guardrail: Explicitly prevent user profile layouts from entering public indexing matrix
      follow: false,
    },
    openGraph: {
      ...baseMeta?.openGraph,
      title: finalTitle,
    },
  }
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { locale } = await params
  const payload = await getPayload({ config })

  // Secure server-side identity check execution
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    redirect(`/${locale}/login`)
  }

  const isRtl = locale === 'ar' || locale === 'ckb'
  const t = translations[locale as 'en' | 'ar' | 'ckb'] || translations.en

  // Local region font typography sets matching the UI stack
  const isRegionalLocale = locale === 'ar' || locale === 'ckb'
  const appFont = isRegionalLocale
    ? '"Rudaw", "Inter", "Noto Sans Arabic", sans-serif'
    : 'system-ui, -apple-system, sans-serif'

  return (
    <div
      style={{
        maxWidth: '1800px',
        margin: '2rem auto',
        padding: '0 1.5rem',
        textAlign: isRtl ? 'right' : 'left',
        direction: isRtl ? 'rtl' : 'ltr',
        fontFamily: appFont,
      }}
    >
      <header
        style={{
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>
            {t.title}
          </h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem', margin: 0 }}>
            {t.loggedIn} <strong>{user.email}</strong>
          </p>
        </div>

        {/* Client-Side Safe Logout button */}
        <LogoutButton label={t.logout} locale={locale} />
      </header>
    </div>
  )
}
