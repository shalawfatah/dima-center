import Link from 'next/link'

interface SingleCategoryLinkProps {
  link: string
  titleFont: string
  title: string
}

export default function SingleCategoryLink({ link, titleFont, title }: SingleCategoryLinkProps) {
  return (
    <div className="embla-slide">
      <Link href={link} style={{ textDecoration: 'none' }}>
        <div className="text-badge-container">
          <span
            style={{
              fontFamily: titleFont,
              fontSize: '14px',
              fontWeight: '600',
              color: '#1e293b',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </span>
        </div>
      </Link>
    </div>
  )
}
