// app/analytics/AnalyticsClient.tsx
'use client'

import { useState, useEffect, useRef } from 'react'

const UMAMI_SHARE_URL = 'https://analytics.dima.center/share/jd2bcJljYwUbB9g1'

export default function AnalyticsClient() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Check if iframe loads successfully
    const timeout = setTimeout(() => {
      if (!iframeLoaded) {
        setLoading(false)
        setError('Connection refused. The server is blocking embeds.')
      }
    }, 8000)

    return () => clearTimeout(timeout)
  }, [iframeLoaded])

  const handleIframeLoad = () => {
    setIframeLoaded(true)
    setLoading(false)
    setError(null)
  }

  const handleIframeError = () => {
    setIframeLoaded(false)
    setLoading(false)
    setError('Failed to load the analytics dashboard. The server refused the connection.')
  }

  const openInNewTab = () => {
    window.open(UMAMI_SHARE_URL, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              📊 Analytics Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real-time traffic data for Dima Center
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                loading
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : error
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              }`}
            >
              {loading ? '● Loading...' : error ? '⚠ Blocked' : '● Live'}
            </span>
            <button
              onClick={openInNewTab}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline-offset-2 hover:underline"
            >
              Open in new tab ↗
            </button>
          </div>
        </div>

        {/* Dashboard Embed */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-50/80 dark:bg-gray-900/80">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">
                  Connecting to analytics server...
                </p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white dark:bg-gray-800">
              <div className="text-center max-w-md p-6">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {error.includes('blocked') ? 'Embed Blocked by Server' : 'Connection Failed'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
                <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400 text-left">
                  <p className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                    <strong>To fix this:</strong>
                    <br />
                    1. Set{' '}
                    <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                      ALLOWED_FRAME_URLS
                    </code>{' '}
                    in Coolify to:
                    <br />
                    <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded block mt-1 text-xs">
                      https://dima.center http://localhost:3000
                    </code>
                    2. Redeploy your Umami service
                  </p>
                </div>
                <button
                  onClick={openInNewTab}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Open Dashboard in New Tab
                </button>
              </div>
            </div>
          )}
          <div
            className="relative w-full"
            style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}
          >
            <iframe
              ref={iframeRef}
              src={UMAMI_SHARE_URL}
              className="absolute inset-0 w-full h-full"
              style={{ border: 0 }}
              allow="fullscreen"
              loading="lazy"
              title="Dima Center Analytics Dashboard"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
          Data updates every 5 minutes • Powered by Umami Analytics
        </div>
      </div>
    </div>
  )
}
