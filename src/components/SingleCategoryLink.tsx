import Link from 'next/link'

interface SingleCategoryLinkProps {
  link: string
  titleFont: string
  title: string
}

export default function SingleCategoryLink({ link, titleFont, title }: SingleCategoryLinkProps) {
  return (
    <div className="embla-slide" style={{ borderLeft: '1px solid #f3f3f3' }}>
      <Link href={link} style={{ textDecoration: 'none' }}>
        <div className="text-badge-container">
          <span
            style={{
              fontFamily: titleFont,
              fontSize: '14px',
              fontWeight: '600',
              color: '#1e293b',
              whiteSpace: 'nowrap',
              marginLeft: '2rem',
            }}
          >
            {title}
          </span>
        </div>
      </Link>
    </div>
  )
}
