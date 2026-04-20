import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:7568'

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'icon-192.svg', 'icon-512.svg'],

        manifest: {
          name: 'Karat — Gold Portfolio Tracker',
          short_name: 'Karat',
          description: 'Track your gold investments with real-time market rates, P&L tracking, and full purchase history.',
          theme_color: '#0A0908',
          background_color: '#0A0908',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/dashboard',
          scope: '/',
          categories: ['finance', 'productivity'],
          icons: [
            {
              src: '/icon-192.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: '/icon-512.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },

        workbox: {
          // Pre-cache all built assets
          globPatterns: ['**/*.{js,css,html,svg,woff2}'],

          // Runtime caching strategies
          runtimeCaching: [
            // Gold rate API — network-first (prefer fresh, fall back to cache for offline)
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/api/gold-rate'),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'karat-gold-rate',
                networkTimeoutSeconds: 8,
                expiration: { maxAgeSeconds: 60 * 60 * 24 }, // 24 h
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            // Purchases API — network-first
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/api/purchases'),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'karat-purchases',
                networkTimeoutSeconds: 8,
                expiration: { maxAgeSeconds: 60 * 60 * 24 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            // Google Fonts stylesheets — stale-while-revalidate
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'karat-fonts-css',
                expiration: { maxAgeSeconds: 60 * 60 * 24 * 7 }, // 1 week
              },
            },
            // Google Fonts files — cache-first (font files rarely change)
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
              handler: 'CacheFirst',
              options: {
                cacheName: 'karat-fonts-files',
                expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 }, // 1 year
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },

        // Don't enable the SW in dev (avoids stale cache confusion)
        devOptions: {
          enabled: false,
        },
      }),
    ],

    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
        },
      },
    },
  }
})
