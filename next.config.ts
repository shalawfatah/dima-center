// next.config.ts
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.dima.center',
        pathname: '/**',
      },
      // Supabase S3 API endpoint domain
      {
        protocol: 'https',
        hostname: 'crqqyejtyxqbehfechcg.storage.supabase.co',
        pathname: '/**',
      },
      // Supabase REST endpoint domain (for backwards compatibility)
      {
        protocol: 'https',
        hostname: 'crqqyejtyxqbehfechcg.supabase.co',
        pathname: '/**',
      },
    ],
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/categories/**',
      },
      {
        pathname: '/media/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
