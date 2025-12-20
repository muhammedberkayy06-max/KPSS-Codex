import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/KPSS-Codex/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false
      },
      includeAssets: ['icons/icon-192.svg', 'icons/icon-512.svg'],
      manifest: {
        name: 'KPSS Deneme Atölyesi',
        short_name: 'KPSS Deneme',
        description: 'KPSS için deneme üretimi ve çözüm ekranı',
        theme_color: '#ffffff',
        background_color: '#f7f7f9',
        display: 'standalone',
        start_url: '/KPSS-Codex/',
        icons: [
          {
            src: '/KPSS-Codex/icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/KPSS-Codex/icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,webmanifest}'],
        runtimeCaching: []
      }
    })
  ],
  server: {
    port: 5173
  }
});
