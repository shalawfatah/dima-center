import type { Metadata } from 'next'
import { getStorefrontMetadata } from '@/utils/seo'
import LoginComponent from '@/components/LoginComponent'

interface LoginPageProps {
  params: Promise<{ locale: string }>
}

// 🎯 DYNAMIC LOCALIZED AUTH METADATA
// 🎯 DYNAMIC LOCALIZED AUTH METADATA
export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const locale = resolvedParams.locale || 'en'

  // 1. Fetch default storefront layout metadata context
  const baseMeta = await getStorefrontMetadata({ locale })

  // 2. Safe extraction of the fallback absolute site title string
  const baseSiteTitle =
    baseMeta?.title && typeof baseMeta.title === 'object' && 'absolute' in baseMeta.title
      ? baseMeta.title.absolute
      : typeof baseMeta?.title === 'string'
        ? baseMeta.title
        : 'Storefront'

  // 3. Localized static targets
  const titles: Record<string, string> = {
    en: 'Sign In to Your Account',
    ar: 'تسجيل الدخول إلى حسابك',
    ckb: 'چوونە ژوورەوە بۆ ئەکاونتەکەت',
  }

  const descriptions: Record<string, string> = {
    en: 'Access your profile, track your orders, and manage your custom builds securely.',
    ar: 'الوصول إلى ملفك الشخصي، وتتبع طلباتك، وإدارة تجميعاتك المخصصة بأمان.',
    ckb: 'بچۆ ناو پرۆفایلەکەت، شوێنی داواکارییەکانت بکەوە، و بەشەکانت بە پارێزراوی بەڕێوەبەرە.',
  }

  const finalTitle = titles[locale] || titles.en
  const finalDescription = descriptions[locale] || descriptions.en

  return {
    ...baseMeta,
    title: `${finalTitle} | ${baseSiteTitle}`,
    description: finalDescription,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      ...baseMeta?.openGraph,
      title: finalTitle,
      description: finalDescription,
    },
  }
}

export default function LoginPage() {
  return <LoginComponent />
}
