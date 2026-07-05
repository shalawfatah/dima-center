import SignUpComponent from '@/components/SignUpComponent'
import { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

// 1. Dynamic localized metadata generator runs on the server
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  const metaStrings: Record<string, { title: string; description: string }> = {
    en: {
      title: 'Create Account | Join Us Today',
      description: 'Sign up to create a secure personal profile blueprint and start building.',
    },
    ar: {
      title: 'إنشاء حساب | انضم إلينا اليوم',
      description: 'سجل الآن لإنشاء ملف تعريف شخصي آمن وابدأ العمل.',
    },
    ckb: {
      title: 'دروستکردنی ئەکاونت | ئێستا بەشداربە',
      description: 'تۆماربە بۆ دروستکردنی پڕۆفایلی پارێزراوی تایبەتی خۆت.',
    },
  }

  const meta = metaStrings[locale] || metaStrings.en

  return {
    title: meta.title,
    description: meta.description,
    // Optional: Add OpenGraph rules for rich media embeds
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
    },
  }
}

// 2. The Server Component simply renders your Client Component
export default async function Page({ params }: Props) {
  return <SignUpComponent />
}
