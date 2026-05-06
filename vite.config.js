import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'logo.webp', 'favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        id: 'com.maglinktv.app',
        name: 'MagLink TV',
        short_name: 'MagLink TV',
        description: 'Toda la TV en vivo en tu mano',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        categories: ['entertainment', 'lifestyle', 'video'],
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'logo.webp',
            sizes: '1024x1024',
            type: 'image/webp',
            purpose: 'any'
          }
        ],
        screenshots: [
          {
            src: 'logo.webp',
            sizes: '1024x1024',
            type: 'image/webp',
            form_factor: 'wide'
          },
          {
            src: 'logo.webp',
            sizes: '1024x1024',
            type: 'image/webp',
            form_factor: 'narrow'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/bestleague\.world\/img\//,
            handler: 'CacheFirst',
            options: { 
              cacheName: 'channel-logos', 
              expiration: { maxEntries: 500, maxAgeSeconds: 604800 } 
            }
          }
        ]
      }
    })
  ]
})
