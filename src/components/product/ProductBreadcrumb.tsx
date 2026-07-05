import Link from 'next/link'

interface ProductBreadcrumbProps {
  currentLocale: string
  categoryName?: string
}

const homeLabel: Record<string, string> = {
  ar: 'الرئيسية',
  ckb: 'سەرەکی',
  en: 'Home',
}

export default function ProductBreadcrumb({ currentLocale, categoryName }: ProductBreadcrumbProps) {
  return (
    <div style={{ marginBottom: '1.5rem', fontSize: '13px', color: '#666' }}>
      <Link href={`/${currentLocale}`} style={{ color: 'inherit', textDecoration: 'none' }}>
        {homeLabel[currentLocale] || homeLabel.en}
      </Link>
      {' / '}
      <span style={{ textTransform: 'uppercase' }}>{categoryName || 'Hardware'}</span>
    </div>
  )
}
