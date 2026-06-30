import { getPayload } from 'payload'
import config from '@/payload.config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '2rem auto',
        padding: '0 1.5rem',
        textAlign: isRtl ? 'right' : 'left',
        direction: isRtl ? 'rtl' : 'ltr',
      }}
    >
      <header
        style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem', marginBottom: '2rem' }}
      >
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b' }}>Account Dashboard</h1>
        <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
          Logged in as: <strong>{user.email}</strong>
        </p>
      </header>

      {/* SECTION 1: ORDERS TABLE */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
          Order History
        </h2>

        {orders.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              borderRadius: '8px',
              border: '1px dashed #cbd5e1',
              color: '#64748b',
            }}
          >
            No orders found yet.
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
                  <th style={{ padding: '12px 16px', color: '#475569' }}>Order ID</th>
                  <th style={{ padding: '12px 16px', color: '#475569' }}>Date</th>
                  <th style={{ padding: '12px 16px', color: '#475569' }}>Total Price</th>
                  <th style={{ padding: '12px 16px', color: '#475569' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '600' }}>
                      #{order.id.slice(-6)}
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
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
          Saved PC Layouts
        </h2>

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
            You haven't configured any custom PC configurations yet.
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
                    {build.name || `Custom Workspace Build #${build.id.slice(-4)}`}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                    Configured on: {new Date(build.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href={`/${locale}/pc-builder/view/${build.id}`}
                  style={{
                    padding: '8px 14px',
                    color: '#fff',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    textDecoration: 'none',
                  }}
                >
                  View Blueprint
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
