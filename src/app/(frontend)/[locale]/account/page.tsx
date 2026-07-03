import { getPayload } from 'payload'
import config from '@/payload.config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton' // Import our client logout button
import { translations } from '@/utils/translations'

interface AccountPageProps {
  params: Promise<{ locale: string }>
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { locale } = await params
  const payload = await getPayload({ config })

  // Secure server-side identity check
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    redirect(`/${locale}/login`)
  }

  // Parallel fetch orders & builds matching the specific user's ID
  const [ordersData, buildsData] = await Promise.all([
    payload.find({
      collection: 'orders',
      where: { user: { equals: user.id } },
      sort: '-createdAt',
    }),
    payload.find({
      collection: 'pc-builds',
      where: { user: { equals: user.id } },
      sort: '-createdAt',
    }),
  ])

  const orders = ordersData.docs
  const pcBuilds = buildsData.docs
  const isRtl = locale === 'ar' || locale === 'ckb'

  const t = translations[locale as 'en' | 'ar' | 'ckb'] || translations.en
  return (
    <div
      style={{
        maxWidth: '1800px',
        margin: '2rem auto',
        padding: '0 1.5rem',
        textAlign: isRtl ? 'right' : 'left',
        direction: isRtl ? 'rtl' : 'ltr',
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

        {/* Client-Side Safe Logout button avoids standard form NaN exception */}
        <LogoutButton label={t.logout} locale={locale} />
      </header>

      {/* SECTION 1: ORDERS TABLE */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>{t.orders}</h2>

        {orders.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              borderRadius: '8px',
              border: '1px dashed #cbd5e1',
              color: '#64748b',
            }}
          >
            {t.noOrders}
          </div>
        ) : (
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', color: '#475569' }}>{t.orderId}</th>
                  <th style={{ padding: '12px 16px', color: '#475569' }}>{t.date}</th>
                  <th style={{ padding: '12px 16px', color: '#475569' }}>{t.total}</th>
                  <th style={{ padding: '12px 16px', color: '#475569' }}>{t.status}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '600' }}>
                      <span style={{ color: '#334155' }}>#{String(order.id).slice(-6)}</span>
                      {/* Sub-item display row directly below ID to keep things working out-of-the-box */}
                      {order.items && order.items.length > 0 && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#64748b',
                            fontWeight: 'normal',
                            marginTop: '4px',
                          }}
                        >
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx}>
                              • {item.product?.name || 'Product'} (x{item.quantity || 1})
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#334155' }}>
                      {new Date(order.createdAt).toLocaleDateString(
                        locale === 'en' ? 'en-US' : 'en-GB',
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '600' }}>{order.total} IQD</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: order.status === 'completed' ? '#dcfce7' : '#fef9c3',
                          color: order.status === 'completed' ? '#15803d' : '#854d0e',
                        }}
                      >
                        {order.status || 'Processing'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* SECTION 2: PC BUILDS LIST */}
      <section>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>{t.layouts}</h2>

        {pcBuilds.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px dashed #cbd5e1',
              color: '#64748b',
            }}
          >
            {t.noLayouts}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pcBuilds.map((build: any) => (
              <div
                key={build.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#fff',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                    {build.name || `Custom Workspace Build #${String(build.id).slice(-4)}`}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                    Configured on: {new Date(build.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {/* Redirects directly to pc-builder workspace route */}
                <Link
                  href={`/${locale}/pc-builder?load=${build.id}`}
                  style={{
                    padding: '8px 14px',
                    background: '#0070f3',
                    color: '#fff',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    textDecoration: 'none',
                  }}
                >
                  {t.view}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
