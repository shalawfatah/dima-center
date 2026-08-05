import type { GlobalConfig } from 'payload'

export const AnalyticsGlobal: GlobalConfig = {
  slug: 'analytics',
  label: {
    en: 'Analytics',
    ckb: 'ئانالیز',
    ar: 'التحليلات',
  },
  admin: {
    group: 'Admin',
    components: {
      views: {
        edit: {
          default: {
            Component: {
              path: '@/components/AnalyticsDashboard',
            },
          },
        },
      },
    },
  },
  fields: [],
}
