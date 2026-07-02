export const dynamic = 'force-dynamic'
import Footer from '@/components/Footer'
import FullNavbar from '@/components/FullNavbar'

export default async function LocalizedLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <div>
      <FullNavbar currentLocale={locale} />

      {children}

      <Footer currentLocale={locale} />
    </div>
  )
}
