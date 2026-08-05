import Link from 'next/link'

export default function AnalyticsNavLink() {
  return (
    <nav className="nav-group">
      <div className="nav-group__content">
        <ul className="nav-list">
          <li>
            <Link href="/admin/analytics" className="nav__link">
              <span className="nav__link-label">Analytics</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
